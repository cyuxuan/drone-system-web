import { createContext, useContext } from 'react';
import { Language, TranslationKey } from './i18n';
import { MessageType } from './components/MessageModal';

export interface MessageOptions {
  type?: MessageType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface AppContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;
  showMessage: (options: MessageOptions) => void;
  confirm: (message: string, options?: Partial<MessageOptions>) => Promise<boolean>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
