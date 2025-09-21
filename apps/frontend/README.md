# WindBorne Vendor Dashboard

A modern, responsive React application for analyzing financial data of potential vendors in the weather balloon industry.

## Features

- **Vendor Overview Table**: View key financial metrics (Market Cap, P/E Ratio, EBITDA) for active vendors
- **Interactive Charts**: Compare vendors across different financial metrics with responsive bar charts
- **Deep Dive Modal**: Detailed analysis including income statements and stock price trends
- **Vendor Search**: Search and add new vendors using real-time search functionality
- **CSV Export**: Export vendor data for external analysis
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for modern, utility-first styling
- **TanStack Query** for efficient data fetching and caching
- **Recharts** for beautiful, responsive charts
- **Lucide React** for consistent icons
- **Axios** for API communication

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd apps/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## API Integration

The application connects to the WindBorne API running at `http://127.0.0.1:8000`. Make sure the backend API is running before starting the frontend application.

### Available API Endpoints

- `GET /api/vendor/{ticker}/overview` - Get vendor overview data
- `GET /api/vendor/{ticker}/income-statement` - Get detailed income statement
- `GET /api/vendor/{ticker}/daily-series` - Get stock price data
- `GET /api/search/{keywords}` - Search for vendors

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   └── dashboard/       # Dashboard-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and API client
├── types/               # TypeScript type definitions
├── App.tsx              # Main application component
└── main.tsx            # Application entry point
```

## Design System

The application follows a consistent design system:

- **Colors**: Professional blue (#2563eb) for primary actions, slate grays for text and backgrounds
- **Typography**: Inter font family for clean, modern readability
- **Spacing**: Consistent spacing scale using Tailwind CSS
- **Components**: Reusable UI components following modern design patterns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request