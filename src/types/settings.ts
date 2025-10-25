export interface AppSettings {
  // Configurações Gerais
  maxViewers: number;
  notifications: boolean;
  animations: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  theme: 'dark' | 'light';
  language: 'pt' | 'en';
  
  // Filtros
  filterPlatform: 'all' | 'twitch' | 'kick';
  filterStatus: 'all' | 'online' | 'offline';
  showOnlyFavorites: boolean;
  sortBy: 'name' | 'status' | 'viewers' | 'platform';
  
  // Notificações Avançadas
  notificationSound: boolean;
  desktopNotifications: boolean;
  notifyOnlyFavorites: boolean;
  notificationVolume: number;
  
  // Visualização
  compactMode: boolean;
  gridLayout: 'auto' | '2x2' | '3x3' | '4x4';
  chatPosition: 'right' | 'left';
}

export const DEFAULT_SETTINGS: AppSettings = {
  maxViewers: 4,
  notifications: true,
  animations: true,
  autoRefresh: true,
  refreshInterval: 30,
  theme: 'dark',
  language: 'pt',
  filterPlatform: 'all',
  filterStatus: 'all',
  showOnlyFavorites: false,
  sortBy: 'name',
  notificationSound: true,
  desktopNotifications: false,
  notifyOnlyFavorites: false,
  notificationVolume: 50,
  compactMode: false,
  gridLayout: 'auto',
  chatPosition: 'right'
};

