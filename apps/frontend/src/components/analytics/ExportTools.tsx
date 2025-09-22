import React, { useState, useCallback } from 'react';
import { FileText, Image, Share2, Printer, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { VendorOverview } from '../../types/vendor';
import { formatCurrency, formatNumber } from '../../lib/utils';

interface ExportToolsProps {
  data: VendorOverview[];
  chartRef?: React.RefObject<HTMLDivElement>;
  title?: string;
}

type ExportFormat = 'csv' | 'json' | 'pdf' | 'png' | 'print';

export function ExportTools({ data, chartRef, title = "Financial Data" }: ExportToolsProps) {
  const [isExporting, setIsExporting] = useState(false);
  // const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');

  const generateCSV = useCallback(() => {
    const headers = ['Symbol', 'Company Name', 'Market Cap', 'P/E Ratio', 'EBITDA'];
    const rows = data.map(vendor => [
      vendor.symbol,
      vendor.name,
      formatCurrency(vendor.market_cap),
      vendor.pe_ratio > 0 ? formatNumber(vendor.pe_ratio, 2) : 'N/A',
      formatCurrency(vendor.ebitda),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }, [data]);

  const generateJSON = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const downloadFile = useCallback((content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const exportAsImage = useCallback(async () => {
    if (!chartRef?.current) return;

    try {
      // Use html2canvas or similar library in a real implementation
      // For now, we'll simulate the export
      setIsExporting(true);

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, you would:
      // const canvas = await html2canvas(chartRef.current);
      // const dataUrl = canvas.toDataURL('image/png');
      // downloadFile(dataUrl, `${title.replace(/\s+/g, '_')}_chart.png`, 'image/png');

      alert('Image export would be implemented with html2canvas library');

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [chartRef, title]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = `${title.replace(/\s+/g, '_')}_${timestamp}`;

      switch (format) {
        case 'csv':
          const csvContent = generateCSV();
          downloadFile(csvContent, `${baseFilename}.csv`, 'text/csv');
          break;

        case 'json':
          const jsonContent = generateJSON();
          downloadFile(jsonContent, `${baseFilename}.json`, 'application/json');
          break;

        case 'png':
          await exportAsImage();
          break;

        case 'pdf':
          // In a real implementation, use jsPDF or similar
          alert('PDF export would be implemented with jsPDF library');
          break;

        case 'print':
          window.print();
          break;

        default:
          console.warn('Unsupported export format:', format);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [generateCSV, generateJSON, exportAsImage, title, downloadFile]);

  const shareData = useCallback(() => {
    const summary = `${title}\n\nTotal Companies: ${data.length}\nTotal Market Cap: ${formatCurrency(
      data.reduce((sum, vendor) => sum + vendor.market_cap, 0)
    )}`;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: summary,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(summary).then(() => {
        alert('Data summary copied to clipboard!');
      }).catch(() => {
        alert('Sharing not supported in this browser');
      });
    }
  }, [data, title]);

  const sendEmail = useCallback(() => {
    const subject = encodeURIComponent(`${title} - Financial Data Report`);
    const body = encodeURIComponent(`
Please find the financial data report:

Total Companies: ${data.length}
Total Market Cap: ${formatCurrency(data.reduce((sum, vendor) => sum + vendor.market_cap, 0))}

Generated on: ${new Date().toLocaleDateString()}
    `);

    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [data, title]);

  const exportButtons = [
    {
      format: 'csv' as ExportFormat,
      icon: FileText,
      label: 'CSV',
      description: 'Export as spreadsheet',
    },
    {
      format: 'json' as ExportFormat,
      icon: FileText,
      label: 'JSON',
      description: 'Export raw data',
    },
    {
      format: 'png' as ExportFormat,
      icon: Image,
      label: 'PNG',
      description: 'Export chart image',
    },
    {
      format: 'print' as ExportFormat,
      icon: Printer,
      label: 'Print',
      description: 'Print current view',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Export & Share</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick Export Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {exportButtons.map(({ format, icon: Icon, label, description }) => (
            <Button
              key={format}
              variant="outline"
              size="sm"
              onClick={() => handleExport(format)}
              disabled={isExporting}
              className="h-auto p-2 flex flex-col items-center space-y-1"
              title={description}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>

        {/* Share Options */}
        <div className="border-t pt-3 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={shareData}
            className="w-full justify-start"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Summary
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={sendEmail}
            className="w-full justify-start"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Report
          </Button>
        </div>

        {/* Export Status */}
        {isExporting && (
          <div className="text-center py-2">
            <div className="inline-flex items-center space-x-2 text-sm text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>Exporting...</span>
            </div>
          </div>
        )}

        {/* Data Summary */}
        <div className="bg-slate-50 rounded-lg p-3 space-y-1">
          <div className="text-xs font-medium text-slate-600">Export Summary</div>
          <div className="space-y-1 text-xs text-slate-500">
            <div>Companies: {data.length}</div>
            <div>
              Total Market Cap: {formatCurrency(data.reduce((sum, vendor) => sum + vendor.market_cap, 0))}
            </div>
            <div>Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}