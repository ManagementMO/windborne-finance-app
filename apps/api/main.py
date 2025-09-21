# main.py
import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from cachetools import cached, TTLCache

# Load environment variables from .env file
load_dotenv()
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

# Define the data shape we want for our response with correct aliases
class VendorOverview(BaseModel):
    symbol: str = Field(alias="Symbol")
    name: str = Field(alias="Name")
    description: str = Field(alias="Description")
    market_cap: int = Field(alias="MarketCapitalization")
    pe_ratio: float = Field(alias="PERatio")
    dividend_yield: float = Field(alias="DividendYield")
    ebitda: int = Field(alias="EBITDA")

# Create a cache that stores items for up to 1 hour (3600 seconds)
cache = TTLCache(maxsize=100, ttl=3600)

app = FastAPI()

# Setup CORS
origins = [
    "http://localhost:5173", # The default Vite dev server port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "API is running"}

@cached(cache)
def fetch_vendor_overview_data(ticker: str):
    print(f"Fetching fresh data for {ticker}...")
    params = {
        "function": "OVERVIEW",
        "symbol": ticker,
        "apikey": ALPHA_VANTAGE_API_KEY,
    }
    try:
        response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        if "Name" not in data or not data["Name"]:
            raise HTTPException(status_code=404, detail=f"No data found for ticker {ticker}")
        return data
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Error communicating with external API: {e}")

@app.get("/api/vendor/{ticker}/overview", response_model=VendorOverview)
def get_vendor_overview(ticker: str):
    """
    Fetches, validates, and returns curated overview data for a given stock ticker.
    """
    data = fetch_vendor_overview_data(ticker.upper())
    return data