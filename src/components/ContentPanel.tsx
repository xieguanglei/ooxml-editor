import { useAppState, findNode } from '../context';
import { isTextFile, isImageFile } from '../services/zip';
import { XmlEditor } from './XmlEditor';
import { ImagePreview } from './ImagePreview';
import { UnsupportedFile } from './UnsupportedFile';
import { FileNode } from '../types';

interface ContentPanelProps {
  searchKeyword?: string;
}

export function ContentPanel({ searchKeyword }: ContentPanelProps) {
  const { state } = useAppState();
  const node = findNode(state.tree, state.selectedPath);

  if (!node) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-neutral-900">
        <p className="text-neutral-500">Select a file to view</p>
      </div>
    );
  }

  if (node.type === 'dir') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-neutral-900 gap-2">
        <div className="text-3xl">📁</div>
        <p className="text-neutral-300">{node.name}</p>
        <p className="text-neutral-500 text-sm">
          {node.children.length} items
        </p>
      </div>
    );
  }

  // 文件节点
  const fileNode = node as FileNode;

  if (isTextFile(fileNode.path)) {
    return <XmlEditor node={fileNode} searchKeyword={searchKeyword} />;
  }

  if (isImageFile(fileNode.path)) {
    return <ImagePreview node={fileNode} />;
  }

  return <UnsupportedFile path={fileNode.path} />;
}
