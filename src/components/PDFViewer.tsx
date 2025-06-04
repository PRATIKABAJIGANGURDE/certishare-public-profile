
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
  className?: string;
}

const PDFViewer = ({ fileUrl, fileName, className = "" }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF document');
    setLoading(false);
    toast({
      title: "Error",
      description: "Failed to load PDF document",
      variant: "destructive",
    });
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages || 1, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadPDF = () => {
    window.open(fileUrl, '_blank');
  };

  if (error) {
    return (
      <Card className={`${className} bg-gray-900/50 backdrop-blur border-gray-700`}>
        <CardContent className="p-8 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white">{error}</p>
          </div>
          <Button onClick={downloadPDF} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Download PDF Instead
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <Card className={`${isFullscreen ? 'h-full' : ''} bg-gray-900/50 backdrop-blur border-gray-700`}>
        {/* PDF Viewer Controls */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-white text-sm">
              Page {pageNumber} of {numPages || '?'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages || 1)}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-white text-sm min-w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 3.0}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PDF Document */}
        <CardContent className={`p-4 ${isFullscreen ? 'h-full overflow-auto' : ''}`}>
          <div className="flex justify-center">
            {loading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <span className="ml-3 text-white">Loading PDF...</span>
              </div>
            )}
            
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              className="max-w-full"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                className="border border-gray-600 shadow-lg"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFViewer;
