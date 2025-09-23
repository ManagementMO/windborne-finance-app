# WindBorne Vendor Dashboard

A financial vendor assessment platform built for WindBorne Systems to evaluate potential business partners using real market data and weather exposure analysis.

## Overview

This application combines live financial data from Alpha Vantage with custom algorithms to help sales teams identify and prioritize vendor opportunities. The dashboard provides both traditional financial metrics and WindBorne-specific assessments based on weather sensitivity and contract readiness.

![Alt text](https://raw.githubusercontent.com/ManagementMO/windborne-finance-app/main/platform.png)

## Features

### Core Dashboard
- Real-time financial data from Alpha Vantage API
- Interactive vendor comparison charts
- Comprehensive vendor table with filtering and search
- CSV data export functionality
- SQLite caching with 7-day refresh cycle

### Sales Intelligence
- Contract readiness scoring (A+ to C grades)
- Weather exposure assessment for each industry
- Sales priority ranking with detailed reasoning
- Dynamic risk calculations based on real financial metrics

### Analytics Platform
- Advanced data visualization with Recharts
- Multi-metric comparison tools
- Weather-finance risk assessment algorithms
- Customizable chart types and color schemes

## Technology Stack

### Backend (FastAPI)
- Python 3.13 with FastAPI framework
- Alpha Vantage API integration
- SQLite database with CSV backup caching
- Docker containerization for deployment

### Frontend (React + TypeScript)
- React 18 with TypeScript
- Vite for build tooling
- React Query for data management
- Tailwind CSS for styling
- Recharts for data visualization

## Deployment

The application is configured for production deployment:
- Backend: Render with Docker
- Frontend: Vercel
- Environment variables configured for cross-origin requests

## Data Sources

**Real API Data**: Market capitalization, EBITDA, P/E ratios sourced from Alpha Vantage

**Proof-of-Concept**: WindBorne sales assessments, weather risk algorithms, and advanced analytics (time constraints but using real API data where possible)

## Project Structure

```
apps/
├── api/           # FastAPI backend
├── frontend/      # React TypeScript frontend
```
