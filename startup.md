# WindBorne Vendor Dashboard - Startup Guide

## 🚀 Quick Start

### 1. Start the Backend API

```bash
cd /root/windborne/apps/api
python start.py
```

You should see:
```
🚀 Starting WindBorne Vendor API...
📡 API will be available at: http://127.0.0.1:8000
📖 API docs will be available at: http://127.0.0.1:8000/docs
🔍 Test endpoint available at: http://127.0.0.1:8000/test/AAPL
```

### 2. Start the Frontend

In a new terminal:
```bash
cd /root/windborne/apps/frontend
npm run dev
```

You should see:
```
VITE v5.4.20  ready in 276 ms
➜  Local:   http://localhost:5173/
```

## 🔧 Troubleshooting

### If you see "No vendors added yet"

1. **Check API Status**: Look at the header - you should see "✅ API Connected"
   - If you see "❌ API Offline", the backend isn't running
   - If you see "⏳ Checking API...", there might be a connection issue

2. **Check Browser Console**: Open DevTools and look for errors in the console
   - API errors will show detailed information
   - Look for CORS errors or network timeouts

3. **Test Backend Directly**:
   - Visit http://127.0.0.1:8000 - should show `{"status": "API is running"}`
   - Visit http://127.0.0.1:8000/test/AAPL - should show test data
   - Visit http://127.0.0.1:8000/docs - shows interactive API docs

4. **Check Alpha Vantage API**:
   - The backend requires a valid Alpha Vantage API key
   - Check `/root/windborne/apps/api/.env` has `ALPHA_VANTAGE_API_KEY=...`
   - Test with: http://127.0.0.1:8000/test/AAPL

### If you see API errors

1. **Rate Limiting**: Alpha Vantage has rate limits (5 calls/minute for free tier)
   - Wait a few minutes and try again
   - The backend uses caching to reduce API calls

2. **Invalid Symbols**: Some stock symbols might not exist
   - The app should handle this gracefully with error messages

3. **Network Issues**: Check your internet connection

## 📊 Expected Behavior

### Successful Startup
1. Backend starts without errors
2. Frontend connects (shows "API Connected")
3. Initial vendor data loads (TEL, ST, DD, CE, LYB)
4. Table shows company data with no "NaN" values
5. Clicking rows opens detailed modal
6. Search functionality works

### Default Vendors
The application loads these vendors by default:
- **TEL** - TE Connectivity Ltd
- **ST** - STMicroelectronics N.V.
- **DD** - DuPont de Nemours Inc
- **CE** - Celanese Corporation  
- **LYB** - LyondellBasell Industries N.V.

## 🛠 Debug Mode

The application includes extensive logging:

### Backend Logs
- Shows API calls to Alpha Vantage
- Data validation details
- Error messages with context

### Frontend Logs
- Browser console shows API calls
- Query status for each vendor
- Validation failures

## 📁 Project Structure

```
windborne/
├── apps/
│   ├── api/                 # FastAPI Backend
│   │   ├── main.py         # Main API server
│   │   ├── start.py        # Startup script
│   │   ├── .env            # API keys
│   │   └── requirements.txt # Python deps
│   └── frontend/           # React Frontend
│       ├── src/
│       │   ├── components/ # UI components
│       │   ├── lib/        # API client
│       │   └── types/      # TypeScript types
│       └── package.json    # Node deps
└── STARTUP_GUIDE.md        # This file
```

## 🔑 Environment Variables

### Backend (.env)
```
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
```

### Frontend (built-in)
- API URL: http://127.0.0.1:8000/api
- Development port: 5173

## 🆘 Getting Help

If something isn't working:

1. Check both terminal outputs for error messages
2. Check browser DevTools console
3. Visit http://127.0.0.1:8000/docs for API documentation
4. Test individual endpoints manually
5. Verify .env file has valid API key