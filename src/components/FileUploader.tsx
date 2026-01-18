import { useCallback, useRef, useState, useEffect } from 'react';
import { useAppState } from '../context';
import { parseZip } from '../services/zip';

export function FileUploader() {
  const { dispatch } = useAppState();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prevent default browser behavior for drag and drop globally
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('dragover', preventDefaults);
    window.addEventListener('drop', preventDefaults);

    return () => {
      window.removeEventListener('dragover', preventDefaults);
      window.removeEventListener('drop', preventDefaults);
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    
    const validTypes = ['.docx', '.xlsx', '.pptx', '.zip'];
    const isValid = validTypes.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!isValid) {
      alert('Please upload an OOXML file (.docx, .xlsx, .pptx)');
      return;
    }

    setIsLoading(true);
    try {
      const tree = await parseZip(file);
      dispatch({ type: 'LOAD_ZIP', fileName: file.name, tree });
    } catch (error) {
      console.error('Failed to parse file:', error);
      alert('Failed to parse file. Please ensure the file format is correct.');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-neutral-900">
      <div
        className={`
          w-96 h-64 border-2 border-dashed rounded-lg
          flex flex-col items-center justify-center gap-4
          cursor-pointer transition-colors
          ${isDragging 
            ? 'border-blue-400 bg-blue-400/10' 
            : 'border-neutral-600 hover:border-neutral-500 hover:bg-neutral-800/50'}
          ${isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".docx,.xlsx,.pptx,.zip"
          className="hidden"
          onChange={handleInputChange}
        />
        
        <svg 
          className="w-12 h-12 text-neutral-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        
        <div className="text-center">
          <p className="text-neutral-300">
            {isLoading ? 'Parsing...' : 'Drop file here or click to upload'}
          </p>
          <p className="text-neutral-500 text-sm mt-1">
            Supports .docx, .xlsx, .pptx
          </p>
        </div>
      </div>
    </div>
  );
}
