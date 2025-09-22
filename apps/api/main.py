# ==============================================================================
#  Imports
# ==============================================================================
import os
import logging
import requests
import csv
import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from contextlib import contextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, ValidationError, ConfigDict
from typing import Dict, List, Any, Optional
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
#  CSV Caching System
# ==============================================================================
CSV_CACHE_DIR = Path("csv_cache")
CSV_CACHE_DIR.mkdir(exist_ok=True)

# Cache expiry time (7 days)
CACHE_EXPIRY_DAYS = 7

def get_csv_cache_path(data_type: str, symbol: str) -> Path:
    """Generate CSV cache file path for given data type and symbol."""
    return CSV_CACHE_DIR / f"{data_type}_{symbol.upper()}.csv"

def is_cache_valid(file_path: Path) -> bool:
    """Check if CSV cache file exists and is not expired."""
    if not file_path.exists():
        return False

    file_age = datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)
    return file_age < timedelta(days=CACHE_EXPIRY_DAYS)

def save_to_csv_cache(data_type: str, symbol: str, data: Dict[str, Any]) -> None:
    """Save API response data to CSV cache."""
    file_path = get_csv_cache_path(data_type, symbol)

    try:
        if data_type == "overview":
            # Save overview data
            with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['timestamp', 'symbol', 'name', 'market_cap', 'pe_ratio', 'ebitda', 'raw_data']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerow({
                    'timestamp': datetime.now().isoformat(),
                    'symbol': data.get('Symbol', ''),
                    'name': data.get('Name', ''),
                    'market_cap': data.get('MarketCapitalization', ''),
                    'pe_ratio': data.get('PERatio', ''),
                    'ebitda': data.get('EBITDA', ''),
                    'raw_data': json.dumps(data)
                })

        elif data_type == "income_statement":
            # Save income statement data
            with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['timestamp', 'symbol', 'annual_reports_data', 'raw_data']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerow({
                    'timestamp': datetime.now().isoformat(),
                    'symbol': data.get('symbol', symbol),
                    'annual_reports_data': json.dumps(data.get('annualReports', [])),
                    'raw_data': json.dumps(data)
                })

        elif data_type == "daily_series":
            # Save daily series data
            with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['timestamp', 'symbol', 'time_series_data', 'raw_data']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                time_series = data.get('Time Series (Daily)', {})
                writer.writerow({
                    'timestamp': datetime.now().isoformat(),
                    'symbol': data.get('Meta Data', {}).get('2. Symbol', symbol),
                    'time_series_data': json.dumps(time_series),
                    'raw_data': json.dumps(data)
                })

        logger.info(f"Saved {data_type} data for {symbol} to CSV cache: {file_path}")

    except Exception as e:
        logger.error(f"Failed to save {data_type} data for {symbol} to CSV cache: {e}")

def load_from_csv_cache(data_type: str, symbol: str) -> Optional[Dict[str, Any]]:
    """Load API response data from CSV cache."""
    file_path = get_csv_cache_path(data_type, symbol)

    if not is_cache_valid(file_path):
        return None

    try:
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            row = next(reader, None)
            if row and row.get('raw_data'):
                cached_data = json.loads(row['raw_data'])
                logger.info(f"Loaded {data_type} data for {symbol} from CSV cache: {file_path}")
                return cached_data

    except Exception as e:
        logger.error(f"Failed to load {data_type} data for {symbol} from CSV cache: {e}")

    return None

# ==============================================================================
#  SQLite Caching System
# ==============================================================================
SQLITE_DB_PATH = Path("cache.db")

@contextmanager
def get_sqlite_connection():
    """Context manager for SQLite database connections."""
    conn = sqlite3.connect(str(SQLITE_DB_PATH))
    conn.row_factory = sqlite3.Row  # Enable column access by name
    try:
        yield conn
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_sqlite_database():
    """Initialize SQLite database with required tables."""
    with get_sqlite_connection() as conn:
        # Create cache table for all data types
        conn.execute('''
            CREATE TABLE IF NOT EXISTS cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data_type TEXT NOT NULL,
                symbol TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                raw_data TEXT NOT NULL,
                processed_data TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(data_type, symbol)
            )
        ''')

        # Create index for faster lookups
        conn.execute('''
            CREATE INDEX IF NOT EXISTS idx_cache_lookup
            ON cache(data_type, symbol, expires_at)
        ''')

        # Create overview table for structured data
        conn.execute('''
            CREATE TABLE IF NOT EXISTS overview_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT UNIQUE NOT NULL,
                name TEXT,
                market_cap INTEGER,
                pe_ratio REAL,
                ebitda INTEGER,
                timestamp TEXT NOT NULL,
                expires_at TEXT NOT NULL
            )
        ''')

        # Create income statement table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS income_statements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                fiscal_date_ending TEXT NOT NULL,
                total_revenue INTEGER,
                net_income INTEGER,
                timestamp TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                UNIQUE(symbol, fiscal_date_ending)
            )
        ''')

        # Create daily series table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS daily_series (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                date TEXT NOT NULL,
                close_price REAL NOT NULL,
                timestamp TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                UNIQUE(symbol, date)
            )
        ''')

        conn.commit()
        logger.info("SQLite database initialized successfully")

def save_to_sqlite_cache(data_type: str, symbol: str, data: Dict[str, Any]) -> None:
    """Save API response data to SQLite cache."""
    try:
        expires_at = (datetime.now() + timedelta(days=CACHE_EXPIRY_DAYS)).isoformat()
        timestamp = datetime.now().isoformat()

        with get_sqlite_connection() as conn:
            # Save raw data to cache table
            conn.execute('''
                REPLACE INTO cache (data_type, symbol, timestamp, expires_at, raw_data, processed_data)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data_type,
                symbol.upper(),
                timestamp,
                expires_at,
                json.dumps(data),
                json.dumps(data)  # Can be customized for processed data
            ))

            # Save structured data to specific tables
            if data_type == "overview":
                conn.execute('''
                    REPLACE INTO overview_data (symbol, name, market_cap, pe_ratio, ebitda, timestamp, expires_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    symbol.upper(),
                    data.get('Name', ''),
                    int(data.get('MarketCapitalization', 0) or 0),
                    float(data.get('PERatio', 0) or 0),
                    int(data.get('EBITDA', 0) or 0),
                    timestamp,
                    expires_at
                ))

            elif data_type == "income_statement":
                # Save each annual report
                for report in data.get('annualReports', []):
                    conn.execute('''
                        REPLACE INTO income_statements (symbol, fiscal_date_ending, total_revenue, net_income, timestamp, expires_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        symbol.upper(),
                        report.get('fiscalDateEnding', ''),
                        int(report.get('totalRevenue', 0) or 0),
                        int(report.get('netIncome', 0) or 0),
                        timestamp,
                        expires_at
                    ))

            elif data_type == "daily_series":
                # Save time series data
                time_series = data.get('Time Series (Daily)', {})
                for date, values in time_series.items():
                    conn.execute('''
                        REPLACE INTO daily_series (symbol, date, close_price, timestamp, expires_at)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (
                        symbol.upper(),
                        date,
                        float(values.get('4. close', 0) or 0),
                        timestamp,
                        expires_at
                    ))

            conn.commit()
            logger.info(f"Saved {data_type} data for {symbol} to SQLite cache")

    except Exception as e:
        logger.error(f"Failed to save {data_type} data for {symbol} to SQLite cache: {e}")

def load_from_sqlite_cache(data_type: str, symbol: str) -> Optional[Dict[str, Any]]:
    """Load API response data from SQLite cache."""
    try:
        with get_sqlite_connection() as conn:
            cursor = conn.execute('''
                SELECT raw_data, expires_at FROM cache
                WHERE data_type = ? AND symbol = ? AND expires_at > ?
            ''', (data_type, symbol.upper(), datetime.now().isoformat()))

            row = cursor.fetchone()
            if row:
                cached_data = json.loads(row['raw_data'])
                logger.info(f"Loaded {data_type} data for {symbol} from SQLite cache")
                return cached_data

    except Exception as e:
        logger.error(f"Failed to load {data_type} data for {symbol} from SQLite cache: {e}")

    return None

# Initialize SQLite database on startup
init_sqlite_database()

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

@app.get("/csv-cache/status", tags=["Cache Management"])
def get_csv_cache_status():
    """Get status of CSV cache files."""
    cache_files = []

    if CSV_CACHE_DIR.exists():
        for file_path in CSV_CACHE_DIR.glob("*.csv"):
            try:
                file_stats = file_path.stat()
                cache_files.append({
                    "filename": file_path.name,
                    "data_type": file_path.stem.split('_')[0],
                    "symbol": '_'.join(file_path.stem.split('_')[1:]),
                    "size_bytes": file_stats.st_size,
                    "created": datetime.fromtimestamp(file_stats.st_ctime).isoformat(),
                    "modified": datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
                    "is_valid": is_cache_valid(file_path),
                    "expires_in_days": CACHE_EXPIRY_DAYS - (datetime.now() - datetime.fromtimestamp(file_stats.st_mtime)).days
                })
            except Exception as e:
                logger.error(f"Error reading cache file {file_path}: {e}")

    return {
        "cache_directory": str(CSV_CACHE_DIR.absolute()),
        "cache_expiry_days": CACHE_EXPIRY_DAYS,
        "total_files": len(cache_files),
        "files": cache_files
    }

@app.delete("/csv-cache/clear", tags=["Cache Management"])
def clear_csv_cache():
    """Clear all CSV cache files."""
    deleted_files = []

    if CSV_CACHE_DIR.exists():
        for file_path in CSV_CACHE_DIR.glob("*.csv"):
            try:
                file_path.unlink()
                deleted_files.append(file_path.name)
            except Exception as e:
                logger.error(f"Error deleting cache file {file_path}: {e}")

    return {
        "message": f"Cleared {len(deleted_files)} cache files",
        "deleted_files": deleted_files
    }

@app.get("/sqlite-cache/status", tags=["Cache Management"])
def get_sqlite_cache_status():
    """Get status of SQLite cache database."""
    try:
        with get_sqlite_connection() as conn:
            # Get cache table stats
            cache_stats = conn.execute('''
                SELECT
                    data_type,
                    COUNT(*) as count,
                    MIN(timestamp) as oldest_entry,
                    MAX(timestamp) as newest_entry,
                    COUNT(CASE WHEN expires_at > ? THEN 1 END) as valid_entries,
                    COUNT(CASE WHEN expires_at <= ? THEN 1 END) as expired_entries
                FROM cache
                GROUP BY data_type
            ''', (datetime.now().isoformat(), datetime.now().isoformat())).fetchall()

            # Get overview data stats
            overview_count = conn.execute('SELECT COUNT(*) FROM overview_data').fetchone()[0]
            income_count = conn.execute('SELECT COUNT(*) FROM income_statements').fetchone()[0]
            series_count = conn.execute('SELECT COUNT(*) FROM daily_series').fetchone()[0]

            # Get database file size
            db_size = SQLITE_DB_PATH.stat().st_size if SQLITE_DB_PATH.exists() else 0

            return {
                "database_path": str(SQLITE_DB_PATH.absolute()),
                "database_size_bytes": db_size,
                "cache_expiry_days": CACHE_EXPIRY_DAYS,
                "cache_stats": [dict(row) for row in cache_stats],
                "structured_data": {
                    "overview_records": overview_count,
                    "income_statement_records": income_count,
                    "daily_series_records": series_count
                }
            }

    except Exception as e:
        logger.error(f"Error getting SQLite cache status: {e}")
        return {"error": str(e)}

@app.delete("/sqlite-cache/clear", tags=["Cache Management"])
def clear_sqlite_cache():
    """Clear all SQLite cache data."""
    try:
        with get_sqlite_connection() as conn:
            # Get counts before deletion
            cache_count = conn.execute('SELECT COUNT(*) FROM cache').fetchone()[0]
            overview_count = conn.execute('SELECT COUNT(*) FROM overview_data').fetchone()[0]
            income_count = conn.execute('SELECT COUNT(*) FROM income_statements').fetchone()[0]
            series_count = conn.execute('SELECT COUNT(*) FROM daily_series').fetchone()[0]

            # Clear all tables
            conn.execute('DELETE FROM cache')
            conn.execute('DELETE FROM overview_data')
            conn.execute('DELETE FROM income_statements')
            conn.execute('DELETE FROM daily_series')
            conn.commit()

            return {
                "message": "SQLite cache cleared successfully",
                "deleted_records": {
                    "cache_entries": cache_count,
                    "overview_records": overview_count,
                    "income_statement_records": income_count,
                    "daily_series_records": series_count,
                    "total": cache_count + overview_count + income_count + series_count
                }
            }

    except Exception as e:
        logger.error(f"Error clearing SQLite cache: {e}")
        return {"error": str(e)}

@app.get("/sqlite-cache/query", tags=["Cache Management"])
def query_sqlite_cache(
    data_type: Optional[str] = None,
    symbol: Optional[str] = None,
    limit: int = 100
):
    """Query SQLite cache with optional filters."""
    try:
        with get_sqlite_connection() as conn:
            query = "SELECT * FROM cache WHERE 1=1"
            params = []

            if data_type:
                query += " AND data_type = ?"
                params.append(data_type)

            if symbol:
                query += " AND symbol = ?"
                params.append(symbol.upper())

            query += " ORDER BY timestamp DESC LIMIT ?"
            params.append(limit)

            results = conn.execute(query, params).fetchall()

            return {
                "query_params": {"data_type": data_type, "symbol": symbol, "limit": limit},
                "results": [dict(row) for row in results]
            }

    except Exception as e:
        logger.error(f"Error querying SQLite cache: {e}")
        return {"error": str(e)}

# --- Main Dashboard Endpoint ---
@app.get("/api/vendor/{ticker}/overview", tags=["Vendors"])
def get_vendor_overview(ticker: str):
    """Fetches curated overview data for the main dashboard table."""
    try:
        # Try to load from SQLite cache first, then CSV cache
        cached_data = load_from_sqlite_cache("overview", ticker)
        if not cached_data:
            cached_data = load_from_csv_cache("overview", ticker)

        if cached_data:
            logger.info(f"Using cached overview data for {ticker}")
            raw_data = cached_data
        else:
            # Fetch from API if not in cache
            params = frozenset({"function": "OVERVIEW", "symbol": ticker.upper()}.items())
            raw_data = fetch_alpha_vantage_data(params)

            # Save to both CSV and SQLite cache for future use
            save_to_csv_cache("overview", ticker, raw_data)
            save_to_sqlite_cache("overview", ticker, raw_data)

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
        # Try to load from SQLite cache first, then CSV cache
        cached_data = load_from_sqlite_cache("income_statement", ticker)
        if not cached_data:
            cached_data = load_from_csv_cache("income_statement", ticker)

        if cached_data:
            logger.info(f"Using cached income statement data for {ticker}")
            raw_data = cached_data
        else:
            # Fetch from API if not in cache
            params = frozenset({"function": "INCOME_STATEMENT", "symbol": ticker.upper()}.items())
            raw_data = fetch_alpha_vantage_data(params)

            # Save to both CSV and SQLite cache for future use
            save_to_csv_cache("income_statement", ticker, raw_data)
            save_to_sqlite_cache("income_statement", ticker, raw_data)

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
        # Try to load from SQLite cache first, then CSV cache
        cached_data = load_from_sqlite_cache("daily_series", ticker)
        if not cached_data:
            cached_data = load_from_csv_cache("daily_series", ticker)

        if cached_data:
            logger.info(f"Using cached daily series data for {ticker}")
            raw_data = cached_data
        else:
            # Fetch from API if not in cache
            params = frozenset({"function": "TIME_SERIES_DAILY", "symbol": ticker.upper(), "outputsize": "compact"}.items())
            raw_data = fetch_alpha_vantage_data(params)

            # Save to both CSV and SQLite cache for future use
            save_to_csv_cache("daily_series", ticker, raw_data)
            save_to_sqlite_cache("daily_series", ticker, raw_data)

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