// 基础节点
export interface BaseNode {
  name: string;
  path: string;
}

// 文件节点
export interface FileNode extends BaseNode {
  type: 'file';
  content: string | Uint8Array;
}

// 目录节点
export interface DirNode extends BaseNode {
  type: 'dir';
  children: TreeNode[];
}

// 联合类型
export type TreeNode = FileNode | DirNode;

// 应用状态
export interface AppState {
  fileName: string | null;
  tree: TreeNode[] | null;
  expandedPaths: Set<string>;
  selectedPath: string | null;
}
