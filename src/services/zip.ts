import JSZip from 'jszip';
import { TreeNode, FileNode, DirNode } from '../types';

// 文本文件扩展名
const TEXT_EXTENSIONS = ['.xml', '.rels', '.txt', '.json'];

// 图片文件扩展名
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

// 判断是否为文本文件
export function isTextFile(path: string): boolean {
  const lower = path.toLowerCase();
  return TEXT_EXTENSIONS.some(ext => lower.endsWith(ext));
}

// 判断是否为图片文件
export function isImageFile(path: string): boolean {
  const lower = path.toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext));
}

// 获取图片 MIME 类型
export function getImageMimeType(path: string): string | null {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  return null;
}

// 判断是否为 XML 文件
function isXmlFile(path: string): boolean {
  const lower = path.toLowerCase();
  return lower.endsWith('.xml') || lower.endsWith('.rels');
}

// 格式化 XML（仅在标签之间添加换行和缩进，不影响文本内容）
function formatXml(xml: string): string {
  // 只在 >< 之间添加换行（不影响 <tag>text</tag> 中的 text）
  let formatted = xml.replace(/>\s*</g, '>\n<');
  
  const lines = formatted.split('\n');
  const result: string[] = [];
  let indent = 0;
  const indentStr = '  ';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 判断标签类型
    const isClosing = trimmed.startsWith('</');
    const isSelfClosing = trimmed.endsWith('/>');
    const isDeclaration = trimmed.startsWith('<?') || trimmed.startsWith('<!');
    
    // 检查是否是开始标签（不是闭合、不是自闭合、不是声明）
    // 并且不包含对应的闭合标签（如 <tag>text</tag>）
    const hasMatchingClose = /<[^/][^>]*>[^<]*<\/[^>]+>/.test(trimmed);
    const isOpening = trimmed.startsWith('<') && !isClosing && !isSelfClosing && !isDeclaration && !hasMatchingClose;

    if (isClosing) {
      indent = Math.max(0, indent - 1);
    }

    result.push(indentStr.repeat(indent) + trimmed);

    if (isOpening) {
      indent++;
    }
  }

  return result.join('\n');
}

// 压缩 XML（移除标签之间的换行和缩进，恢复为紧凑格式）
function minifyXml(xml: string): string {
  // 移除标签之间的空白（但保留标签内的文本内容）
  return xml.replace(/>\s+</g, '><');
}

// 解析 ZIP 文件，返回目录树
export async function parseZip(file: File): Promise<TreeNode[]> {
  const zip = await JSZip.loadAsync(file);
  const root: Map<string, TreeNode> = new Map();
  
  // 收集所有文件路径
  const paths: string[] = [];
  zip.forEach((relativePath) => {
    if (!relativePath.endsWith('/')) {
      paths.push(relativePath);
    }
  });

  // 按路径排序
  paths.sort();

  // 构建目录树
  for (const filePath of paths) {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    
    // 读取文件内容
    const zipEntry = zip.file(filePath);
    if (!zipEntry) continue;

    let content: string | Uint8Array;
    if (isTextFile(filePath)) {
      let text = await zipEntry.async('string');
      // 对 XML 文件进行格式化（便于阅读和编辑）
      if (isXmlFile(filePath)) {
        text = formatXml(text);
      }
      content = text;
    } else {
      content = await zipEntry.async('uint8array');
    }

    // 创建文件节点
    const fileNode: FileNode = {
      type: 'file',
      name: fileName,
      path: filePath,
      content,
    };

    // 确保父目录存在
    let currentPath = '';
    let parentChildren: TreeNode[] | null = null;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const dirName = parts[i];
      const dirPath = currentPath ? `${currentPath}/${dirName}` : dirName;
      
      if (!root.has(dirPath)) {
        const dirNode: DirNode = {
          type: 'dir',
          name: dirName,
          path: dirPath,
          children: [],
        };
        root.set(dirPath, dirNode);
        
        // 添加到父目录
        if (parentChildren) {
          parentChildren.push(dirNode);
        }
      }
      
      const dir = root.get(dirPath) as DirNode;
      parentChildren = dir.children;
      currentPath = dirPath;
    }

    // 将文件添加到父目录
    if (parentChildren) {
      parentChildren.push(fileNode);
    } else {
      // 根级文件
      root.set(filePath, fileNode);
    }
  }

  // 返回根级节点
  const result: TreeNode[] = [];
  root.forEach((node, path) => {
    // 只返回根级节点（路径不包含 /）
    if (!path.includes('/')) {
      result.push(node);
    }
  });

  // 排序：目录在前，文件在后
  return sortNodes(result);
}

// 递归排序节点
function sortNodes(nodes: TreeNode[]): TreeNode[] {
  const sorted = [...nodes].sort((a, b) => {
    // 目录在前
    if (a.type === 'dir' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'dir') return 1;
    // 按名称排序
    return a.name.localeCompare(b.name);
  });

  // 递归排序子目录
  return sorted.map(node => {
    if (node.type === 'dir') {
      return { ...node, children: sortNodes(node.children) };
    }
    return node;
  });
}

// 将目录树打包为 ZIP
export async function packZip(tree: TreeNode[]): Promise<Blob> {
  const zip = new JSZip();

  function addToZip(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (node.type === 'file') {
        let content = node.content;
        // 对 XML 文件进行压缩（恢复为紧凑格式，确保 Word 兼容）
        if (typeof content === 'string' && isXmlFile(node.path)) {
          content = minifyXml(content);
        }
        zip.file(node.path, content);
      } else {
        addToZip(node.children);
      }
    }
  }

  addToZip(tree);
  return await zip.generateAsync({ type: 'blob' });
}

// 触发文件下载
export function downloadBlob(blob: Blob, fileName: string | null) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'document.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
