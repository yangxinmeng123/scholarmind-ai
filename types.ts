export enum ModuleType {
  HOME = 'HOME',
  INSPIRATION = 'INSPIRATION',
  FRAMEWORK = 'FRAMEWORK',
  LIT_REVIEW = 'LIT_REVIEW',
  WRITING = 'WRITING'
}

export type Language = 'en' | 'zh';

export interface NavItem {
  id: ModuleType;
  label: { en: string; zh: string };
  icon: React.ReactNode;
  description: { en: string; zh: string };
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';