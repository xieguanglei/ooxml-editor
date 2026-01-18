import { useState, useCallback } from 'react';
import { useAppState } from '../context';
import { packZip, downloadBlob } from '../services/zip';

interface ToolbarProps {
  onSearchChange?: (keyword: string) => void;
}

export function Toolbar({ onSearchChange }: ToolbarProps) {
  const { state, dispatch } = useAppState();
  const [keyword, setKeyword] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    onSearchChange?.(value);
  }, [onSearchChange]);

  const handleDownload = useCallback(async () => {
    if (!state.tree) return;
    
    setIsDownloading(true);
    try {
      const blob = await packZip(state.tree);
      downloadBlob(blob, state.fileName);
    } catch (error) {
      console.error('Pack failed:', error);
      alert('Failed to download');
    } finally {
      setIsDownloading(false);
    }
  }, [state.tree, state.fileName]);

  const handleClose = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return (
    <div className="h-9 bg-neutral-800 border-b border-neutral-700 flex items-center px-2 gap-2 flex-shrink-0">
      <div className="text-neutral-300 font-medium truncate max-w-48">
        {state.fileName || 'OOXML Editor'}
      </div>

      <div className="flex-1" />

      <div className="relative">
        <input
          type="text"
          value={keyword}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="
            w-40 h-6 px-2
            bg-neutral-700 border border-neutral-600 rounded
            text-neutral-200 placeholder-neutral-500
            focus:outline-none focus:border-neutral-500
          "
        />
        {keyword && (
          <button
            onClick={() => {
              setKeyword('');
              onSearchChange?.('');
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
          >
            ✕
          </button>
        )}
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading || !state.tree}
        className="
          h-6 px-3 rounded
          bg-neutral-600 hover:bg-neutral-500 text-neutral-200
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        {isDownloading ? 'Packing...' : 'Download'}
      </button>

      <button
        onClick={handleClose}
        className="
          h-6 px-3 rounded
          bg-neutral-700 hover:bg-neutral-600 text-neutral-400
          transition-colors
        "
      >
        Close
      </button>
    </div>
  );
}
