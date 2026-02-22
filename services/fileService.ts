
import { FileNode, Snapshot } from '../types';
import { DEFAULT_FILES } from '../constants';
import JSZip from 'jszip';

const getStorageKey = (projectId: string) => `aether_project_${projectId}_files`;
const getSnapshotKey = (projectId: string) => `aether_project_${projectId}_snapshots`;

export const getFiles = async (projectId: string): Promise<FileNode[]> => {
  if (!projectId) return [];
  const key = getStorageKey(projectId);
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  
  const initialFiles = DEFAULT_FILES.map(f => ({
    ...f,
    id: `${f.id}_${projectId}_${Date.now()}`,
    lastModified: Date.now()
  }));
  localStorage.setItem(key, JSON.stringify(initialFiles));
  return initialFiles;
};

export const saveFile = async (projectId: string, file: FileNode): Promise<void> => {
  if (!projectId) return;
  const files = await getFiles(projectId);
  const index = files.findIndex(f => f.id === file.id);
  if (index >= 0) {
    files[index] = { ...file, lastModified: Date.now() };
  } else {
    files.push({ ...file, lastModified: Date.now() });
  }
  localStorage.setItem(getStorageKey(projectId), JSON.stringify(files));
};

export const deleteFile = async (projectId: string, fileId: string): Promise<void> => {
  if (!projectId) return;
  const files = await getFiles(projectId);
  const filtered = files.filter(f => f.id !== fileId);
  localStorage.setItem(getStorageKey(projectId), JSON.stringify(filtered));
};

const readFileContent = (file: File): Promise<{ content: string, isBinary: boolean }> => {
  return new Promise((resolve) => {
    const isBinary = file.type.startsWith('image/') || file.name.endsWith('.glb') || file.name.endsWith('.obj');
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({ content: e.target?.result as string, isBinary });
    };
    if (isBinary) reader.readAsDataURL(file);
    else reader.readAsText(file);
  });
};

export const processDroppedFiles = async (projectId: string, items: DataTransferItemList): Promise<FileNode[]> => {
    const newFiles: FileNode[] = [];
    const traverseFileTree = async (item: any, path: string = '') => {
        if (item.isFile) {
            const file = await new Promise<File>((resolve) => item.file(resolve));
            const { content, isBinary } = await readFileContent(file);
            const ext = file.name.split('.').pop() || 'txt';
            let lang = isBinary ? 'image' : (['js', 'ts', 'tsx'].includes(ext) ? 'javascript' : ext);
            
            newFiles.push({
                id: `${Date.now()}_${Math.random()}`,
                name: path + file.name,
                content,
                language: lang,
                lastModified: Date.now(),
                isBinary
            });
        } else if (item.isDirectory) {
            const dirReader = item.createReader();
            const entries = await new Promise<any[]>((resolve) => dirReader.readEntries(resolve));
            for (const entry of entries) {
                await traverseFileTree(entry, path + item.name + '/');
            }
        }
    };

    for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        if (item) await traverseFileTree(item);
    }

    if (projectId && newFiles.length > 0) {
        const existing = await getFiles(projectId);
        const combined = [...existing.filter(e => !newFiles.find(n => n.name === e.name)), ...newFiles];
        localStorage.setItem(getStorageKey(projectId), JSON.stringify(combined));
        return combined;
    }
    return newFiles;
};

export const takeSnapshot = async (projectId: string, description: string): Promise<Snapshot> => {
  const files = await getFiles(projectId);
  const snapshot: Snapshot = {
    id: `snap_${Date.now()}`,
    timestamp: Date.now(),
    description,
    files: JSON.parse(JSON.stringify(files))
  };
  const key = getSnapshotKey(projectId);
  const snapshots: Snapshot[] = JSON.parse(localStorage.getItem(key) || '[]');
  localStorage.setItem(key, JSON.stringify([snapshot, ...snapshots].slice(0, 10)));
  return snapshot;
};

export const generateStandaloneHTML = (files: FileNode[]): string => {
  const htmlFile = files.find(f => f.name.endsWith('html'));
  if (!htmlFile) return '<h1>No index.html found</h1>';
  let content = htmlFile.content;
  files.filter(f => f.name.endsWith('css')).forEach(css => {
    content = content.replace('</head>', `<style>${css.content}</style></head>`);
  });
  files.filter(f => f.name.endsWith('js')).forEach(js => {
    content = content.replace('</body>', `<script type="module">${js.content}</script></body>`);
  });
  return content;
};

export const deployProjectToBlobUrl = (files: FileNode[]): string => {
  const htmlContent = generateStandaloneHTML(files);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return URL.createObjectURL(blob);
};

// Fix: Implement missing exportProjectToZip function
export const exportProjectToZip = async (files: FileNode[]): Promise<Blob> => {
  const zip = new JSZip();
  files.forEach(file => {
    if (file.isBinary && file.content.includes(',')) {
      // For binary files (images stored as base64 data URLs)
      const base64Data = file.content.split(',')[1];
      zip.file(file.name, base64Data, { base64: true });
    } else {
      zip.file(file.name, file.content);
    }
  });
  return await zip.generateAsync({ type: 'blob' });
};

// Fix: Implement missing triggerFileDownload function
export const triggerFileDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
