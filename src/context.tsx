import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, TreeNode } from './types';

// Actions
export type Action =
  | { type: 'LOAD_ZIP'; fileName: string; tree: TreeNode[] }
  | { type: 'SELECT_FILE'; path: string }
  | { type: 'TOGGLE_EXPAND'; path: string }
  | { type: 'UPDATE_CONTENT'; path: string; content: string }
  | { type: 'RESET' };

// 初始状态
const initialState: AppState = {
  fileName: null,
  tree: null,
  expandedPaths: new Set(),
  selectedPath: null,
};

// 在树中查找并更新节点
function updateNodeContent(nodes: TreeNode[], path: string, content: string): TreeNode[] {
  return nodes.map(node => {
    if (node.type === 'file' && node.path === path) {
      return { ...node, content };
    }
    if (node.type === 'dir') {
      return { ...node, children: updateNodeContent(node.children, path, content) };
    }
    return node;
  });
}

// Reducer
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_ZIP':
      return {
        ...state,
        fileName: action.fileName,
        tree: action.tree,
        expandedPaths: new Set(),
        selectedPath: null,
      };

    case 'SELECT_FILE':
      return {
        ...state,
        selectedPath: action.path,
      };

    case 'TOGGLE_EXPAND': {
      const newExpanded = new Set(state.expandedPaths);
      if (newExpanded.has(action.path)) {
        newExpanded.delete(action.path);
      } else {
        newExpanded.add(action.path);
      }
      return {
        ...state,
        expandedPaths: newExpanded,
      };
    }

    case 'UPDATE_CONTENT':
      if (!state.tree) return state;
      return {
        ...state,
        tree: updateNodeContent(state.tree, action.path, action.content),
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}

// 工具函数：在树中查找节点
export function findNode(nodes: TreeNode[] | null, path: string | null): TreeNode | null {
  if (!nodes || !path) return null;
  
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.type === 'dir') {
      const found = findNode(node.children, path);
      if (found) return found;
    }
  }
  return null;
}
