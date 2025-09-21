# ==============================================================================
#  Imports
# ==============================================================================
import os
import logging
import requests
from typing import Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError, field_validator
from dotenv import load_dotenv
from cachetools import cached, TTLCache

# ==============================================================================
#  Configuration & Initial Setup
# ==============================================================================
# Configure structured logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from the .env file in the same directory
load_dotenv()

# Get the API key from environment variables for security
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
if not ALPHA_VANTAGE_API_KEY or ALPHA_VANTAGE_API_KEY == "demo":
    raise RuntimeError("A valid ALPHA_VANTAGE_API_KEY must be set in the .env file.")

# Define constants
ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

# Initialize the FastAPI application
app = FastAPI(
    title="WindBorne Vendor API",
    description="An API to fetch and analyze financial data for potential vendors.",
    version="1.0.0",
)

# Create a cache that stores up to 100 items for 1 hour (3600 seconds)
# This prevents us from hitting the Alpha Vantage API rate limit too quickly
cache = TTLCache(maxsize=100, ttl=3600)


# ==============================================================================
#  CORS (Cross-Origin Resource Sharing) Middleware
# ==============================================================================
# This allows our frontend application (running on localhost:5173) to
# communicate with this backend server.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    # You can add the URL of your deployed frontend here later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
#  Pydantic Data Models (API Contract)
# ==============================================================================
# Helper functions to gracefully handle messy data from the external API.
# Alpha Vantage can return "None" or other non-numeric values for numeric fields.
def to_float(value: Any) -> float:
    """Safely convert a value to float, defaulting to 0.0 on failure."""
    if value is None or value in {"None", ""}:
        return 0.0
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0

def to_int(value: Any) -> int:
    """Safely convert a value to int, defaulting to 0 on failure."""
    if value is None or value in {"None", ""}:
        return 0
    try:
        # Convert to float first to handle string numbers like "123.45"
        return int(float(value))
    except (ValueError, TypeError):
        return 0

# This defines the exact structure and data types of the response we will send.
# FastAPI uses this for automatic validation and documentation.
# The `Field(alias=...)` is crucial for mapping the PascalCase from the API
# to our preferred snake_case.
class VendorOverview(BaseModel):
    symbol: str = Field(alias="Symbol")
    name: str = Field(alias="Name")
    description: str = Field(alias="Description", default="")
    market_cap: int = Field(alias="MarketCapitalization")
    pe_ratio: float = Field(alias="PERatio")
    dividend_yield: float = Field(alias="DividendYield")
    ebitda: int = Field(alias="EBITDA")

    # These validators run *before* Pydantic tries to enforce the type hints.
    # This allows us to clean up the messy data from the API first.
    @field_validator('market_cap', 'ebitda', mode='before')
    @classmethod
    def validate_int_fields(cls, v: Any) -> int:
        return to_int(v)

    @field_validator('pe_ratio', 'dividend_yield', mode='before')
    @classmethod
    def validate_float_fields(cls, v: Any) -> float:
        return to_float(v)
    
    class Config:
        # Allows the model to be created from arbitrary class instances
        from_attributes = True

# Custom exception for our service layer to keep it decoupled from HTTP
class APIError(Exception):
    def __init__(self, message: str, status_code: int):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

# ==============================================================================
#  Core Service Logic (with Caching)
# ==============================================================================
# This function does the actual work of fetching data. The @cached decorator
# automatically handles storing and retrieving results from our cache.
@cached(cache)
def fetch_vendor_overview_data(ticker: str) -> dict:
    """
    Fetches raw overview data from Alpha Vantage for a given ticker.
    Raises APIError for known issues.
    """
    logger.info(f"CACHE MISS: Fetching fresh data for {ticker} from Alpha Vantage...")
    params = {
        "function": "OVERVIEW",
        "symbol": ticker,
        "apikey": ALPHA_VANTAGE_API_KEY,
    }
    try:
        response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params, timeout=10)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)
        data = response.json()

        # Handle specific API messages
        if "Information" in data:
            raise APIError(f"API rate limit reached or invalid key. Info: {data['Information']}", 429)
        if not data or "Symbol" not in data:
            raise APIError(f"No data found for ticker '{ticker}'. It may be an invalid symbol.", 404)
        
        return data
        
    except requests.exceptions.RequestException as e:
        # This catches network errors (e.g., DNS failure, refused connection)
        logger.error(f"External API communication error for {ticker}: {e}")
        raise APIError(f"Error communicating with external API: {e}", 503)

# ==============================================================================
#  API Endpoints
# ==============================================================================
@app.get("/", tags=["Status"])
def read_root():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "API is running", "docs_url": "/docs"}


@app.get("/api/vendor/{ticker}/overview", response_model=VendorOverview, tags=["Vendors"])
def get_vendor_overview(ticker: str):
    """
    Fetches, validates, and returns curated overview data for a given stock ticker.
    The response is validated against the `VendorOverview` model.
    """
    try:
        # Make the ticker input case-insensitive for a better user experience
        raw_data = fetch_vendor_overview_data(ticker.upper())
        # Pydantic automatically validates the raw_data against the VendorOverview model.
        # If it fails, it will raise a ValidationError.
        return VendorOverview.model_validate(raw_data)
    except APIError as e:
        # Translate our custom service-layer error into an HTTP exception
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except ValidationError as e:
        # This happens if the data from the API is structured unexpectedly
        logger.error(f"Pydantic validation failed for {ticker}: {e}")
        raise HTTPException(status_code=422, detail="Data validation failed: received unexpected data format from external API.")
    except Exception as e:
        # Catch-all for any other unexpected errors
        logger.critical(f"An unexpected server error occurred for ticker {ticker}: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")