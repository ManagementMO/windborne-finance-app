import { useState } from "react";
import styled from "styled-components";
import { VENDORS_MOCK_DATA } from "@/data/mockData";
import type { Vendor } from "@/data/mockData";
import {
  ArrowDown,
  ArrowUp,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";

type SortKey = keyof Vendor;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  min-width: 100%;
`;

const TableHead = styled.thead``;

const TableHeader = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #94A3B8; /* slate-400 */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #FFFFFF;
  }
`;

const TableBody = styled.tbody`
  divide-y: 1px solid rgba(255, 255, 255, 0.1);
`;

const TableRow = styled.tr`
  &:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  white-space: nowrap;
  font-size: 0.875rem;
  color: #CBD5E1; /* slate-300 */
`;

const VendorName = styled.div`
  font-weight: 600;
  color: #FFFFFF;
`;

const VendorSymbol = styled.div`
  font-size: 0.75rem;
  color: #94A3B8; /* slate-400 */
`;

const RevenueGrowth = styled.div<{ positive: boolean }>`
  font-weight: 600;
  color: ${({ positive }) => (positive ? '#34D399' : '#F87171')}; /* emerald-400 or red-400 */
`;

const formatMarketCap = (value: number) => {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toString();
};

const SentimentIndicator = ({
  sentiment,
}: {
  sentiment: Vendor["sentiment"];
}) => {
  const sentimentMap = {
    positive: {
      icon: <TrendingUp size={16} color="#34D399" />,
      text: "Positive",
    },
    neutral: {
      icon: <Minus size={16} color="#94A3B8" />,
      text: "Neutral",
    },
    negative: {
      icon: <TrendingDown size={16} color="#F87171" />,
      text: "Negative",
    },
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {sentimentMap[sentiment].icon}
      <span>{sentimentMap[sentiment].text}</span>
    </div>
  );
};

const VendorTable = () => {
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedData = [...VENDORS_MOCK_DATA].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * (sortOrder === "asc" ? 1 : -1);
    }
    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * (sortOrder === "asc" ? 1 : -1);
    }
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const headers = [
    { key: "name", label: "Vendor" },
    { key: "marketCap", label: "Market Cap" },
    { key: "peRatio", label: "P/E Ratio" },
    { key: "revenueGrowth", label: "Revenue Growth" },
    { key: "sentiment", label: "Sentiment" },
  ] as const;

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <tr>
            {headers.map((header) => (
              <TableHeader
                key={header.key}
                onClick={() => handleSort(header.key)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {header.label}
                  {sortKey === header.key && (
                    <span>
                      {sortOrder === "asc" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )}
                    </span>
                  )}
                </div>
              </TableHeader>
            ))}
          </tr>
        </TableHead>
        <TableBody>
          {sortedData.map((vendor) => (
            <TableRow key={vendor.symbol}>
              <TableCell>
                <VendorName>{vendor.name}</VendorName>
                <VendorSymbol>{vendor.symbol}</VendorSymbol>
              </TableCell>
              <TableCell>
                {formatMarketCap(vendor.marketCap)}
              </TableCell>
              <TableCell>
                {vendor.peRatio.toFixed(2)}
              </TableCell>
              <TableCell>
                <RevenueGrowth positive={vendor.revenueGrowth >= 0}>
                  {vendor.revenueGrowth.toFixed(1)}%
                </RevenueGrowth>
              </TableCell>
              <TableCell>
                <SentimentIndicator sentiment={vendor.sentiment} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VendorTable; 
