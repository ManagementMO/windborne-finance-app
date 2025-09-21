import styled from "styled-components";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { VENDORS_MOCK_DATA, INCOME_STATEMENT_MOCK_DATA } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const vendorColors = {
  TEL: "#38bdf8", // sky-400
  ST: "#fb923c",   // orange-400
  DD: "#a78bfa",   // violet-400
  APH: "#4ade80",  // green-400
  ROK: "#f472b6",  // pink-400
};

const TooltipContainer = styled.div`
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(15, 23, 42, 0.6); /* slate-900 */
  padding: 0.75rem;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <TooltipContainer>
        <p style={{ fontWeight: 600, color: '#FFFFFF' }}>{`Year: ${label}`}</p>
        {payload.map((pld: any) => (
          <div key={pld.dataKey} style={{ color: pld.color }}>
            {`${pld.name}: $${pld.value.toFixed(2)}B`}
          </div>
        ))}
      </TooltipContainer>
    );
  }
  return null;
};

const RevenueChart = () => {
  const chartData = INCOME_STATEMENT_MOCK_DATA.TEL.map((entry, i) => {
    const dataPoint: { year: string; [key: string]: number | string } = {
      year: entry.year.toString(),
    };
    VENDORS_MOCK_DATA.forEach((vendor) => {
      dataPoint[vendor.symbol] = INCOME_STATEMENT_MOCK_DATA[vendor.symbol][i].revenue / 1e9;
    });
    return dataPoint;
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Annual Revenue Comparison</CardTitle>
        <CardDescription>Total revenue in billions USD</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              {Object.entries(vendorColors).map(([symbol, color]) => (
                <linearGradient key={symbol} id={`color${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="year"
              stroke="rgba(255, 255, 255, 0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}B`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px', color: '#CBD5E1' }}/>
            {VENDORS_MOCK_DATA.map((vendor) => (
              <Area
                key={vendor.symbol}
                type="monotone"
                dataKey={vendor.symbol}
                name={vendor.name}
                stroke={vendorColors[vendor.symbol as keyof typeof vendorColors]}
                fillOpacity={1} 
                fill={`url(#color${vendor.symbol})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart; 