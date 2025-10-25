export interface Streamer {
  id: string;
  name: string;
  avatar: string;
  platforms: {
    twitch?: string;
    youtube?: string;
    kick?: string;
  };
  status: 'online' | 'offline';
  platformCount: number; // Número de plataformas ativas
  streamInfo?: {
    platform: 'twitch' | 'youtube' | 'kick';
    title: string;
    game: string;
    viewers: number;
    thumbnail: string;
  };
  isFavorite: boolean; // Novo campo para favoritos
  notificationsEnabled: boolean; // Novo campo para notificações
}

export interface PlatformPreview {
  name: string;
  avatar: string;
  found: boolean;
  platform: 'twitch' | 'youtube' | 'kick';
}

export type Platform = 'twitch' | 'youtube' | 'kick';
