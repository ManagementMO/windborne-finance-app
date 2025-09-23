import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Search, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { VendorOverview } from '../../types/vendor';
import { formatCurrency, formatNumber } from '../../lib/utils';

interface AdvancedDataTableProps {
  data: VendorOverview[];
  onRowClick?: (row: VendorOverview) => void;
  title?: string;
}

const columnHelper = createColumnHelper<VendorOverview>();

export function AdvancedDataTable({
  data,
  onRowClick,
  title = "Vendor Data Analysis"
}: AdvancedDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(() => [
    columnHelper.accessor('symbol', {
      header: 'Symbol',
      cell: info => (
        <div className="font-mono font-semibold text-blue-600">
          {info.getValue()}
        </div>
      ),
      size: 80,
    }),
    columnHelper.accessor('name', {
      header: 'Company Name',
      cell: info => (
        <div className="font-medium text-slate-800 max-w-xs truncate">
          {info.getValue()}
        </div>
      ),
      size: 200,
    }),
    columnHelper.accessor('market_cap', {
      header: 'Market Cap',
      cell: info => (
        <div className="text-right font-medium">
          {formatCurrency(info.getValue())}
        </div>
      ),
      size: 120,
    }),
    columnHelper.accessor('pe_ratio', {
      header: 'P/E Ratio',
      cell: info => {
        const value = info.getValue();
        return (
          <div className="text-right">
            {value > 0 ? (
              <Badge variant={value > 30 ? 'warning' : value > 15 ? 'info' : 'success'}>
                {formatNumber(value, 2)}
              </Badge>
            ) : (
              <span className="text-slate-400">N/A</span>
            )}
          </div>
        );
      },
      size: 100,
    }),
    columnHelper.accessor('ebitda', {
      header: 'EBITDA',
      cell: info => {
        const value = info.getValue();
        return (
          <div className="text-right font-medium">
            {value > 0 ? formatCurrency(value) : (
              <span className="text-slate-400">N/A</span>
            )}
          </div>
        );
      },
      size: 120,
    }),
    columnHelper.display({
      id: 'risk_score',
      header: 'Risk Score',
      cell: () => {
        // Simulated risk score based on P/E and market cap
        const riskScore = Math.floor(Math.random() * 100);
        return (
          <div className="text-center">
            <Badge variant={riskScore > 70 ? 'error' : riskScore > 40 ? 'warning' : 'success'}>
              {riskScore}
            </Badge>
          </div>
        );
      },
      size: 100,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick?.(row.original);
            }}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      ),
      size: 80,
    }),
  ], [onRowClick]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.target.value)}
                placeholder="Search all columns..."
                className="pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                        style={{ width: header.getSize() }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center space-x-1">
                          <span>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {header.column.getCanSort() && (
                            <div className="flex flex-col">
                              <ChevronUp className={`h-3 w-3 ${
                                header.column.getIsSorted() === 'asc' ? 'text-blue-600' : 'text-slate-300'
                              }`} />
                              <ChevronDown className={`h-3 w-3 -mt-1 ${
                                header.column.getIsSorted() === 'desc' ? 'text-blue-600' : 'text-slate-300'
                              }`} />
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}