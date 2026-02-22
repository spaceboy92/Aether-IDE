
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  isGuest?: boolean;
  syncEnabled?: boolean;
  driveConnected?: boolean;
  lastSync?: number;
  storageUsed?: string;
  accessToken?: string;
  autoSaveInterval?: number;
  isMature?: boolean;
  items?: string[];
  theme?: string;
  font?: string;
  coins?: number;
  isPremium?: boolean;
}

export interface FileNode {
  id: string;
  name: string;
  content: string;
  language: string;
  lastModified: number;
  isBinary?: boolean;
}

export interface GroundingLink {
  uri: string;
  title?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  thoughts?: string; 
  timestamp: number;
  isAction?: boolean; 
  attachments?: {
    type: 'image' | 'video' | 'file';
    url: string;
    name: string;
  }[];
  groundingLinks?: GroundingLink[];
  executionSteps?: ExecutionStep[];
}

export interface ExecutionStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  details?: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
  memoryNodes?: string[]; // Persistent task context
}

export enum ViewMode {
  HOME = 'HOME',
  FILES = 'FILES',
  EDITOR = 'EDITOR',
  PREVIEW = 'PREVIEW',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS',
  GAME_STUDIO_3D = 'GAME_STUDIO_3D',
  GAME_STUDIO_2D = 'GAME_STUDIO_2D'
}

export type ViewportType = 'desktop' | 'tablet' | 'mobile';

export interface AgentAction {
  action: 'create' | 'update' | 'delete' | 'terminal_command' | 'snapshot';
  path?: string;
  content?: string;
  command?: string;
}

export interface AgentResponse {
  message: string;
  actions: AgentAction[];
}

export interface TerminalLog {
  id: string;
  type: 'info' | 'error' | 'warn' | 'success' | 'system' | 'ai' | 'console';
  message: string;
  timestamp: number;
  source?: string;
}

export type AutoAgentState = 'IDLE' | 'PROCESSING'; // Simplified

export interface Snapshot {
  id: string;
  timestamp: number;
  description: string;
  files: FileNode[];
  diffSummary?: string;
}

export interface MarketItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  price: number;
  category: 'theme' | 'plugin' | 'font' | 'premium' | 'tool' | 'sound';
  isInstalled: boolean;
  isPremium: boolean;
}

export const PROJECT_TEMPLATES = {
  VANILLA: 'vanilla',
  GAME_3D: 'game-3d',
  GAME_2D: 'game-2d',
  REACT_MOCK: 'react-mock'
};
