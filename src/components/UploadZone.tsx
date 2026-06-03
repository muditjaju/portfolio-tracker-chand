import { useState, useCallback } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import clsx from "clsx";
import { parsePortfolioSheet } from "@/lib/parseXlsx";
import { PortfolioRow } from "@/lib/types";

interface UploadZoneProps {
  onDataLoaded: (data: PortfolioRow[]) => void;
}

export default function UploadZone({ onDataLoaded }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    console.log("File selected:", file.name, file.size, "bytes");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const rows = parsePortfolioSheet(arrayBuffer);
      console.log("Parsed rows returned to UploadZone:", rows.length);
      if (rows.length === 0) {
        console.warn("WARNING: 0 rows were parsed. The UI will not proceed.");
      }
      onDataLoaded(rows);
    } catch (error) {
      console.error("Error during file parsing:", error);
      alert("Invalid file format. Please upload the correct portfolio sheet.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    []
  );

  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div
        className={clsx(
          "w-full max-w-lg glass border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 transform",
          isDragging
            ? "border-blue-500 bg-blue-50/50 scale-105 shadow-xl dark:bg-blue-900/20"
            : "border-slate-300 hover:border-blue-400 hover:shadow-lg dark:border-slate-700",
          isLoading && "opacity-70 pointer-events-none"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex justify-center mb-6">
          {isLoading ? (
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          ) : (
            <UploadCloud
              className={clsx(
                "w-16 h-16 transition-colors duration-300",
                isDragging ? "text-blue-500" : "text-slate-400 dark:text-slate-500"
              )}
            />
          )}
        </div>
        <h3 className="text-2xl font-bold mb-2">Upload your Portfolio</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Drag and drop your .xlsx file here, or click to browse
        </p>
        <label className="cursor-pointer inline-flex items-center justify-center px-8 py-3 font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 active:scale-95">
          <span>Browse Files</span>
          <input
            type="file"
            className="hidden"
            accept=".xlsx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>
    </div>
  );
}
