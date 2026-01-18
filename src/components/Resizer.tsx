import { useCallback, useRef } from 'react';

interface ResizerProps {
  onResize: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export function Resizer({ onResize, minWidth = 150, maxWidth = 500 }: ResizerProps) {
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX));
      onResize(newWidth);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [onResize, minWidth, maxWidth]);

  return (
    <div
      className="w-1 bg-neutral-700 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-colors"
      onMouseDown={handleMouseDown}
    />
  );
}
