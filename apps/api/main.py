# ==============================================================================
#  Imports
# ==============================================================================
import os
import logging
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, ValidationError, ConfigDict
from typing import Dict, List, Any
from dotenv import load_dotenv
from cachetools import cached, TTLCache

# ==============================================================================
#  Configuration & Initial Setup
# ==============================================================================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# LOAD API KEY FROM .ENV FILE
def load_environment():
    """Load environment variables from .env file"""
    load_dotenv(override=True)  # override=True ensures new values override existing ones
    return os.getenv("ALPHA_VANTAGE_API_KEY")
ALPHA_VANTAGE_API_KEY = load_environment()
if not ALPHA_VANTAGE_API_KEY or ALPHA_VANTAGE_API_KEY == "demo":
    raise RuntimeError("A valid ALPHA_VANTAGE_API_KEY must be set in the .env file.")

ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

app = FastAPI(
    title="WindBorne Vendor API",
    description="An API to fetch and analyze financial data for potential vendors.",
    version="1.1.0", # Version bump for new features
)

# A single cache for all our endpoints
cache = TTLCache(maxsize=200, ttl=3600) # Increased size for more endpoints

# ==============================================================================
#  CORS Middleware
# ==============================================================================
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    # Add your deployed frontend URL here later
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

# --- Helper functions for robust data cleaning ---
def to_float(value: Any) -> float:
    if value is None or value in {"None", "", "N/A", "-"}: return 0.0
    try: return float(value)
    except (ValueError, TypeError): 
        logger.warning(f"Could not convert to float: {value}")
        return 0.0

def to_int(value: Any) -> int:
    if value is None or value in {"None", "", "N/A", "-"}: return 0
    try: return int(float(value))
    except (ValueError, TypeError): 
        logger.warning(f"Could not convert to int: {value}")
        return 0

# --- Models for Vendor Overview ---
class VendorOverview(BaseModel):
    symbol: str = Field(alias="Symbol")
    name: str = Field(alias="Name")
    market_cap: int = Field(alias="MarketCapitalization")
    pe_ratio: float = Field(alias="PERatio")
    ebitda: int = Field(alias="EBITDA")

    @field_validator('symbol', 'name', mode='before')
    def clean_string_fields(cls, v):
        if v is None or v in {"None", "", "N/A", "-"}:
            return "Unknown"
        return str(v).strip()

    @field_validator('market_cap', 'ebitda', mode='before')
    def clean_int_fields(cls, v): 
        return to_int(v)

    @field_validator('pe_ratio', mode='before')
    def clean_float_fields(cls, v): 
        return to_float(v)


# --- Models for Income Statement (Deep Dive) ---
class IncomeReport(BaseModel):
    fiscal_date_ending: str = Field(alias="fiscalDateEnding")
    total_revenue: int = Field(alias="totalRevenue")
    net_income: int = Field(alias="netIncome")

    @field_validator('total_revenue', 'net_income', mode='before')
    def clean_income_fields(cls, v): return to_int(v)

class VendorIncomeStatement(BaseModel):
    symbol: str
    annual_reports: List[IncomeReport]

# --- Models for Daily Series (Stock Chart) ---
class TimeSeriesData(BaseModel):
    date: str
    close: float

    @field_validator('close', mode='before')
    def clean_close_field(cls, v): return to_float(v)

class VendorDailySeries(BaseModel):
    symbol: str
    time_series: List[TimeSeriesData]

# --- Models for Symbol Search ---
class SearchResult(BaseModel):
    symbol: str = Field(alias="1. symbol")
    name: str = Field(alias="2. name")
    type: str = Field(alias="3. type")
    region: str = Field(alias="4. region")
    market_open: str = Field(alias="5. marketOpen")
    market_close: str = Field(alias="6. marketClose")
    timezone: str = Field(alias="7. timezone")
    currency: str = Field(alias="8. currency")
    match_score: float = Field(alias="9. matchScore")

class VendorSearchResponse(BaseModel):
    results: List[SearchResult]

# Custom exception for our service layer to keep it decoupled from HTTP
class APIError(Exception):
    def __init__(self, message: str, status_code: int):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

# ==============================================================================
#  Core Service Logic (with Caching)
# ==============================================================================
# Generic function to call the API and handle common errors
@cached(cache)
def fetch_alpha_vantage_data(params: frozenset) -> dict:
    """A cached, generic function to fetch data from Alpha Vantage."""
    # Convert frozenset back to dict for requests
    params_dict = dict(params)
    func = params_dict.get('function', 'UNKNOWN')
    symbol = params_dict.get('symbol', '')
    logger.info(f"CACHE MISS: Fetching fresh data for function '{func}' symbol '{symbol}'...")
    
    # Add the API key to every request
    params_dict["apikey"] = ALPHA_VANTAGE_API_KEY
    
    try:
        response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params_dict, timeout=10)
        response.raise_for_status()
        data = response.json()

        if not data:
            raise APIError("No data returned from API.", 404)
        if "Information" in data:
            raise APIError(f"API rate limit reached or invalid key. Info: {data['Information']}", 429)
        if "Error Message" in data:
            raise APIError(f"Invalid API call. Error: {data['Error Message']}", 400)

        return data
    except requests.exceptions.RequestException as e:
        logger.error(f"External API communication error for {func} {symbol}: {e}")
        raise APIError(f"Error communicating with external API: {e}", 503)

# ==============================================================================
#  API Endpoints
# ==============================================================================

# --- Main Dashboard Endpoint ---
@app.get("/", tags=["Status"])
def read_root():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "API is running", "docs_url": "/docs"}

@app.post("/reload-env", tags=["Status"])
def reload_environment_variables():
    """Reload environment variables from .env file without restarting the server."""
    global ALPHA_VANTAGE_API_KEY
    try:
        ALPHA_VANTAGE_API_KEY = load_environment()
        if not ALPHA_VANTAGE_API_KEY or ALPHA_VANTAGE_API_KEY == "demo":
            return {"status": "error", "message": "Invalid API key after reload"}
        return {"status": "success", "message": "Environment variables reloaded successfully"}
    except Exception as e:
        return {"status": "error", "message": f"Failed to reload environment variables: {str(e)}"}

@app.get("/test/{ticker}", tags=["Status"])
def test_api_connection(ticker: str):
    """Test endpoint to debug Alpha Vantage connection."""
    try:
        params = frozenset({"function": "OVERVIEW", "symbol": ticker.upper()}.items())
        raw_data = fetch_alpha_vantage_data(params)
        return {
            "status": "success",
            "ticker": ticker,
            "data_keys": list(raw_data.keys()),
            "symbol_field": raw_data.get("Symbol"),
            "name_field": raw_data.get("Name"),
            "sample_data": {k: v for k, v in list(raw_data.items())[:5]}
        }
    except Exception as e:
        return {
            "status": "error",
            "ticker": ticker,
            "error": str(e),
            "error_type": type(e).__name__
        }

# --- Main Dashboard Endpoint ---
@app.get("/api/vendor/{ticker}/overview", tags=["Vendors"])
def get_vendor_overview(ticker: str):
    """Fetches curated overview data for the main dashboard table."""
    try:
        params = frozenset({"function": "OVERVIEW", "symbol": ticker.upper()}.items())
        raw_data = fetch_alpha_vantage_data(params)

        # Add debug logging
        logger.info(f"Raw data keys for {ticker}: {list(raw_data.keys())}")

        # Validate and convert to our format
        validated_data = VendorOverview.model_validate(raw_data)

        # Return with snake_case field names (matching frontend expectations)
        return {
            "symbol": validated_data.symbol,
            "name": validated_data.name,
            "market_cap": validated_data.market_cap,
            "pe_ratio": validated_data.pe_ratio,
            "ebitda": validated_data.ebitda
        }
    except APIError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except ValidationError as e:
        logger.error(f"Validation failed for {ticker} overview: {e}")
        logger.error(f"Raw data was: {raw_data}")
        raise HTTPException(status_code=422, detail=f"Unexpected data format from external API: {str(e)}")
    except Exception as e:
        logger.critical(f"Unexpected error for {ticker} overview: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")

# --- Deep Dive Modal Endpoints ---
@app.get("/api/vendor/{ticker}/income-statement", tags=["Vendors"])
def get_income_statement(ticker: str):
    """Fetches annual income statement data for the deep-dive modal."""
    try:
        params = frozenset({"function": "INCOME_STATEMENT", "symbol": ticker.upper()}.items())
        raw_data = fetch_alpha_vantage_data(params)

        # Manually construct the response while validating the nested list
        validated_reports = [IncomeReport.model_validate(report) for report in raw_data.get("annualReports", [])]

        # Return with snake_case field names
        return {
            "symbol": raw_data.get("symbol", ticker.upper()),
            "annual_reports": [
                {
                    "fiscal_date_ending": report.fiscal_date_ending,
                    "total_revenue": report.total_revenue,
                    "net_income": report.net_income
                }
                for report in validated_reports
            ]
        }
    except APIError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except ValidationError as e:
        logger.error(f"Validation failed for {ticker} income statement: {e}")
        raise HTTPException(status_code=422, detail="Unexpected data format for income statement.")
    except Exception as e:
        logger.critical(f"Unexpected error for {ticker} income statement: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")

@app.get("/api/vendor/{ticker}/daily-series", tags=["Vendors"])
def get_daily_series(ticker: str):
    """Fetches the last 100 days of stock data for the deep-dive chart."""
    try:
        params = frozenset({"function": "TIME_SERIES_DAILY", "symbol": ticker.upper(), "outputsize": "compact"}.items())
        raw_data = fetch_alpha_vantage_data(params)

        time_series_raw = raw_data.get("Time Series (Daily)", {})
        # Transform the data from a dict of dates to a list of objects, with validation
        time_series_list = [
            TimeSeriesData.model_validate({"date": date, "close": details["4. close"]})
            for date, details in time_series_raw.items()
        ]

        # Return with snake_case field names
        return {
            "symbol": raw_data.get("Meta Data", {}).get("2. Symbol", ticker.upper()),
            "time_series": [
                {
                    "date": item.date,
                    "close": item.close
                }
                for item in time_series_list
            ]
        }
    except (APIError, ValidationError) as e:
        status = e.status_code if isinstance(e, APIError) else 422
        detail = e.message if isinstance(e, APIError) else "Unexpected data format for daily series."
        logger.error(f"Failed to get daily series for {ticker}: {detail}")
        raise HTTPException(status_code=status, detail=detail)
    except Exception as e:
        logger.critical(f"Unexpected error for {ticker} daily series: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")


# --- Dynamic Search Endpoint ---
@app.get("/api/search/{keywords}", tags=["Search"])
def search_vendors(keywords: str):
    """Searches for stock symbols and names matching the given keywords."""
    try:
        params = frozenset({"function": "SYMBOL_SEARCH", "keywords": keywords}.items())
        raw_data = fetch_alpha_vantage_data(params)

        # Filter for US markets and validate each result
        us_results = [
            SearchResult.model_validate(item) for item in raw_data.get("bestMatches", [])
            if item.get("4. region") == "United States"
        ]

        # Return with snake_case field names
        return {
            "results": [
                {
                    "symbol": result.symbol,
                    "name": result.name,
                    "type": result.type,
                    "region": result.region,
                    "market_open": result.market_open,
                    "market_close": result.market_close,
                    "timezone": result.timezone,
                    "currency": result.currency,
                    "match_score": result.match_score
                }
                for result in us_results
            ]
        }
    except (APIError, ValidationError) as e:
        status = e.status_code if isinstance(e, APIError) else 422
        detail = e.message if isinstance(e, APIError) else "Unexpected data format for search results."
        logger.error(f"Failed to search for {keywords}: {detail}")
        raise HTTPException(status_code=status, detail=detail)
    except Exception as e:
        logger.critical(f"Unexpected error during search for {keywords}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")

# ==============================================================================
#  Server Startup
# ==============================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info", reload=True)