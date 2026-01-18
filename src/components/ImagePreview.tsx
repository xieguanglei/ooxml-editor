import { useMemo, useEffect } from 'react';
import { FileNode } from '../types';
import { getImageMimeType } from '../services/zip';

interface ImagePreviewProps {
  node: FileNode;
}

export function ImagePreview({ node }: ImagePreviewProps) {
  const url = useMemo(() => {
    if (typeof node.content === 'string') return null;
    
    const mimeType = getImageMimeType(node.path);
    if (!mimeType) return null;
    
    const blob = new Blob([node.content as BlobPart], { type: mimeType });
    return URL.createObjectURL(blob);
  }, [node.content, node.path]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  if (!url) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-neutral-900">
        <p className="text-neutral-500">Cannot preview this image</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-neutral-900 p-4">
      <img 
        src={url} 
        alt={node.name}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}
