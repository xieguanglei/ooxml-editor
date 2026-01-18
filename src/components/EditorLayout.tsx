import { useState, useCallback } from 'react';
import { Toolbar } from './Toolbar';
import { FileTree } from './FileTree';
import { ContentPanel } from './ContentPanel';
import { Resizer } from './Resizer';

export function EditorLayout() {
  const [leftWidth, setLeftWidth] = useState(240);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleResize = useCallback((width: number) => {
    setLeftWidth(width);
  }, []);

  const handleSearchChange = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-900 overflow-hidden">
      {/* 工具栏 */}
      <Toolbar onSearchChange={handleSearchChange} />

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧目录树 */}
        <FileTree style={{ width: leftWidth, flexShrink: 0 }} />

        {/* 拖拽调整条 */}
        <Resizer onResize={handleResize} />

        {/* 右侧内容面板 */}
        <div className="flex-1 overflow-hidden">
          <ContentPanel searchKeyword={searchKeyword} />
        </div>
      </div>

      {/* 状态栏 */}
      <StatusBar />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="h-5 bg-neutral-800 border-t border-neutral-700 flex items-center px-2 text-xs text-neutral-500 flex-shrink-0">
      <span>OOXML Editor</span>
      <div className="flex-1" />
      <span>UTF-8</span>
    </div>
  );
}
