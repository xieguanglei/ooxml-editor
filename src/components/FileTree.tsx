import { useAppState } from '../context';
import { TreeNode } from '../types';
import { isTextFile, isImageFile } from '../services/zip';

interface FileTreeProps {
  style?: React.CSSProperties;
}

export function FileTree({ style }: FileTreeProps) {
  const { state } = useAppState();

  if (!state.tree) return null;

  return (
    <div 
      className="h-full overflow-auto bg-neutral-900 border-r border-neutral-700 select-none"
      style={style}
    >
      <div className="py-1">
        {state.tree.map(node => (
          <TreeNodeItem key={node.path} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}

interface TreeNodeItemProps {
  node: TreeNode;
  depth: number;
}

function TreeNodeItem({ node, depth }: TreeNodeItemProps) {
  const { state, dispatch } = useAppState();
  const isExpanded = state.expandedPaths.has(node.path);
  const isSelected = state.selectedPath === node.path;
  const paddingLeft = 8 + depth * 12;

  if (node.type === 'dir') {
    return (
      <div>
        <div
          className={`
            flex items-center gap-1 py-0.5 px-1 cursor-pointer text-sm
            hover:bg-neutral-800 text-neutral-300
          `}
          style={{ paddingLeft }}
          onClick={() => dispatch({ type: 'TOGGLE_EXPAND', path: node.path })}
        >
          <span className="w-3 text-neutral-500 flex-shrink-0 text-xs">
            {isExpanded ? '▼' : '▶'}
          </span>
          <span className="truncate">{node.name}</span>
        </div>
        {isExpanded && node.children.map(child => (
          <TreeNodeItem key={child.path} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  const icon = getFileIcon(node.path);
  
  return (
    <div
      className={`
        flex items-center gap-1 py-0.5 px-1 cursor-pointer text-sm
        ${isSelected 
          ? 'bg-neutral-700 text-neutral-100' 
          : 'hover:bg-neutral-800 text-neutral-400'}
      `}
      style={{ paddingLeft: paddingLeft + 12 }}
      onClick={() => dispatch({ type: 'SELECT_FILE', path: node.path })}
    >
      <span className="flex-shrink-0 text-xs">{icon}</span>
      <span className="truncate">{node.name}</span>
    </div>
  );
}

function getFileIcon(path: string): string {
  if (isTextFile(path)) {
    if (path.endsWith('.xml')) return '📄';
    if (path.endsWith('.rels')) return '🔗';
    return '📝';
  }
  if (isImageFile(path)) return '🖼️';
  return '📦';
}
