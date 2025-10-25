import { KICK_CONFIG } from '../config/kick';

// Tipos baseados na documentação oficial do Kick
export interface KickUser {
  user_id: number;
  name: string;
  email?: string;
  profile_picture: string;
}

export interface KickChannel {
  channel_id: number;
  slug: string;
  user_id: number;
  stream_title?: string;
  category_id?: number;
}

export interface KickLivestream {
  broadcaster_user_id: number;
  channel_id: number;
  slug: string;
  stream_title: string;
  thumbnail: string;
  viewer_count: number;
  started_at: string;
  language: string;
  has_mature_content: boolean;
  category?: {
    id: number;
    name: string;
    thumbnail: string;
  };
}

export interface KickChatMessage {
  is_sent: boolean;
  message_id: string;
}

// Cliente da API do Kick
class KickApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = KICK_CONFIG.API_KEY;
    this.baseUrl = KICK_CONFIG.API_BASE_URL;
  }

  // Método auxiliar para fazer requisições autenticadas
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; message?: string }> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Kick API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição à API do Kick:', error);
      throw error;
    }
  }

  // GET /users - Obter informações de usuários
  async getUsers(userIds?: number[]): Promise<KickUser[]> {
    const params = userIds && userIds.length > 0 
      ? `?${userIds.map(id => `id=${id}`).join('&')}`
      : '';
    
    const response = await this.request<KickUser[]>(`/users${params}`);
    return response.data;
  }

  // GET /channels - Obter informações de canais
  async getChannels(slugs?: string[]): Promise<KickChannel[]> {
    const params = slugs && slugs.length > 0
      ? `?${slugs.map(slug => `slug=${slug}`).join('&')}`
      : '';
    
    const response = await this.request<KickChannel[]>(`/channels${params}`);
    return response.data;
  }

  // GET /livestreams - Obter livestreams ativos
  async getLivestreams(params?: {
    broadcaster_user_id?: number[];
    category_id?: number;
    language?: string;
    limit?: number;
    sort?: 'viewer_count' | 'started_at';
  }): Promise<KickLivestream[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.broadcaster_user_id) {
      params.broadcaster_user_id.forEach(id => {
        queryParams.append('broadcaster_user_id', id.toString());
      });
    }
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.language) queryParams.append('language', params.language);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/livestreams?${queryString}` : '/livestreams';
    
    const response = await this.request<KickLivestream[]>(endpoint);
    return response.data;
  }

  // POST /chat - Enviar mensagem no chat
  async sendChatMessage(params: {
    broadcaster_user_id?: number;
    content: string;
    reply_to_message_id?: string;
    type: 'user' | 'bot';
  }): Promise<KickChatMessage> {
    const response = await this.request<KickChatMessage>('/chat', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.data;
  }

  // Verificar se um canal está ao vivo
  async isChannelLive(slug: string): Promise<boolean> {
    try {
      const livestreams = await this.getLivestreams();
      return livestreams.some(stream => stream.slug === slug);
    } catch (error) {
      console.error('Erro ao verificar se canal está ao vivo:', error);
      return false;
    }
  }

  // Obter informações de livestream de um canal específico
  async getChannelLivestream(slug: string): Promise<KickLivestream | null> {
    try {
      const livestreams = await this.getLivestreams();
      return livestreams.find(stream => stream.slug === slug) || null;
    } catch (error) {
      console.error('Erro ao obter livestream do canal:', error);
      return null;
    }
  }
}

// Instância singleton do cliente
export const kickApiClient = new KickApiClient();

// Funções auxiliares para URLs de embed
export function getKickPlayerUrl(channel: string): string {
  return `${KICK_CONFIG.PLAYER_EMBED_URL}/${channel}`;
}

export function getKickChatUrl(channel: string): string {
  // URL de popout do Kick - funciona perfeitamente em iframe sem CSRF!
  return `${KICK_CONFIG.CHAT_EMBED_URL}/popout/${channel}/chat`;
}

export function getKickChannelUrl(channel: string): string {
  return `${KICK_CONFIG.CHAT_EMBED_URL}/${channel}`;
}

