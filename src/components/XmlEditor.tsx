import { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle, foldGutter, foldKeymap, bracketMatching } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { xml } from '@codemirror/lang-xml';
import { search, searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { useAppState } from '../context';
import { FileNode } from '../types';

interface XmlEditorProps {
  node: FileNode;
  searchKeyword?: string;
}

// 素雅的主题配置
const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '13px',
    backgroundColor: '#1a1a1a',
  },
  '.cm-content': {
    fontFamily: '"JetBrains Mono", monospace',
    caretColor: '#c0c0c0',
  },
  '.cm-cursor': {
    borderLeftColor: '#c0c0c0',
  },
  '.cm-activeLine': {
    backgroundColor: '#222222',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#222222',
  },
  '.cm-gutters': {
    backgroundColor: '#1a1a1a',
    color: '#555',
    border: 'none',
    borderRight: '1px solid #2a2a2a',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 4px',
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: '0 4px',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: '#3a4a5a !important',
  },
  '.cm-searchMatch': {
    backgroundColor: '#4a4535',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#5a5545',
  },
});

// 低饱和度语法高亮主题
const lowSaturationHighlight = HighlightStyle.define([
  { tag: tags.comment, color: '#6a6a6a', fontStyle: 'italic' },
  { tag: tags.keyword, color: '#9a8a7a' },
  { tag: tags.string, color: '#8a9a7a' },
  { tag: tags.number, color: '#9a8a8a' },
  { tag: tags.operator, color: '#8a8a8a' },
  { tag: tags.punctuation, color: '#7a7a7a' },
  { tag: tags.bracket, color: '#7a7a7a' },
  { tag: tags.tagName, color: '#7a9a9a' },
  { tag: tags.attributeName, color: '#9a9a7a' },
  { tag: tags.attributeValue, color: '#8a9a8a' },
  { tag: tags.angleBracket, color: '#6a7a7a' },
  { tag: tags.content, color: '#b0b0b0' },
  { tag: tags.name, color: '#8a9a9a' },
]);

export function XmlEditor({ node, searchKeyword }: XmlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { dispatch } = useAppState();

  // 内容变化回调
  const handleChange = useCallback((content: string) => {
    dispatch({ type: 'UPDATE_CONTENT', path: node.path, content });
  }, [dispatch, node.path]);

  // 初始化编辑器
  useEffect(() => {
    if (!containerRef.current) return;

    const content = typeof node.content === 'string' ? node.content : '';

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        handleChange(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        syntaxHighlighting(lowSaturationHighlight),
        bracketMatching(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...searchKeymap,
        ]),
        xml(),
        search(),
        EditorView.lineWrapping, // 启用自动换行
        editorTheme,
        updateListener,
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: containerRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [node.path]); // 只在文件路径变化时重新创建

  // 搜索关键词变化时执行搜索
  useEffect(() => {
    if (!viewRef.current || !searchKeyword) return;
    
    // 使用 CodeMirror 的搜索功能
    // 这里可以通过 openSearchPanel 或手动设置搜索查询
  }, [searchKeyword]);

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full overflow-hidden"
    />
  );
}
