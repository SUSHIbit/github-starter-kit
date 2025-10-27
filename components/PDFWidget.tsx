"use client";

import { useState } from "react";

interface PDFWidgetProps {
  pdfUrl: string;
  paragraphText: string;
  filename: string;
}

export default function PDFWidget({
  pdfUrl,
  paragraphText,
  filename,
}: PDFWidgetProps) {
  const [loading, setLoading] = useState<boolean>(true);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {filename}
        </span>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Open in New Tab
        </a>
      </div>

      {/* Paragraph Text */}
      {paragraphText && (
        <div className="mb-4">
          <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed">
            {paragraphText}
          </p>
        </div>
      )}

      {/* PDF Viewer */}
      <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: "600px" }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading PDF...</p>
          </div>
        )}

        <iframe
          src={pdfUrl}
          className="w-full h-full"
          style={{ minHeight: "600px", border: "none" }}
          title={filename}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>

      {/* Download Link */}
      <div className="mt-4 text-center">
        <a
          href={pdfUrl}
          download={filename}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download PDF
        </a>
      </div>
    </div>
  );
}
