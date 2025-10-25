import type { Platform, PlatformPreview } from '../types';

const KICK_API = 'https://kick.com/api/v1/channels';
const YOUTUBE_API = 'https://noembed.com/embed';

// Função para buscar avatar da Twitch usando API pública
async function fetchTwitchAvatar(channel: string): Promise<string | null> {
  try {
    const response = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
      },
      body: JSON.stringify({
        query: `
          query {
            user(login: "${channel}") {
              profileImageURL(width: 300)
            }
          }
        `
      })
    });
    
    const data = await response.json();
    if (data.data && data.data.user && data.data.user.profileImageURL) {
      return data.data.user.profileImageURL;
    }
    return null;
  } catch (e) {
    console.log('Erro ao buscar avatar:', e);
    return null;
  }
}

// Função otimizada para buscar status e info em uma única chamada
export async function getTwitchStreamData(channel: string): Promise<{
  isOnline: boolean;
  streamInfo: {
    platform: Platform;
    title: string;
    game: string;
    viewers: number;
    thumbnail: string;
  } | null;
}> {
  try {
    const response = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
      },
      body: JSON.stringify({
        query: `
          query {
            user(login: "${channel}") {
              stream {
                id
                title
                viewersCount
                game { name }
              }
            }
          }
        `
      })
    });
    
    const data = await response.json();
    if (data.data && data.data.user && data.data.user.stream) {
      const stream = data.data.user.stream;
      return {
        isOnline: true,
        streamInfo: {
          title: stream.title || 'Live Stream',
          game: stream.game?.name || '',
          viewers: stream.viewersCount || 0,
          thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel}-320x180.jpg`,
          platform: 'twitch'
        }
      };
    }
    return { isOnline: false, streamInfo: null };
  } catch {
    return { isOnline: false, streamInfo: null };
  }
}

// Função para verificar status online usando API pública da Twitch
async function checkTwitchStatus(channel: string): Promise<boolean> {
  try {
    const data = await getTwitchStreamData(channel);
    return data.isOnline;
  } catch (error) {
    console.log('Erro ao verificar status:', error);
    return false;
  }
}

export async function fetchTwitchChannel(username: string): Promise<PlatformPreview | null> {
  try {
    const avatarUrl = await fetchTwitchAvatar(username);
    return {
      name: username,
      avatar: avatarUrl || 'https://via.placeholder.com/48x48/9146FF/FFFFFF?text=T',
      found: true,
      platform: 'twitch'
    };
  } catch {
    return {
      name: username,
      avatar: 'https://via.placeholder.com/48x48/9146FF/FFFFFF?text=T',
      found: true,
      platform: 'twitch'
    };
  }
}

export async function fetchYouTubeChannel(identifier: string): Promise<PlatformPreview | null> {
  try {
    const response = await fetch(`${YOUTUBE_API}?url=https://www.youtube.com/c/${encodeURIComponent(identifier)}`);
    if (response.ok) {
      const data = await response.json();
      if (data && !data.error) {
        return {
          name: data.author_name || identifier,
          avatar: data.thumbnail_url || '',
          found: true,
          platform: 'youtube'
        };
      }
    }
    
    return {
      name: identifier,
      avatar: 'https://via.placeholder.com/48x48/ff0000/FFFFFF?text=YT',
      found: true,
      platform: 'youtube'
    };
  } catch {
    return {
      name: identifier,
      avatar: 'https://via.placeholder.com/48x48/ff0000/FFFFFF?text=YT',
      found: true,
      platform: 'youtube'
    };
  }
}

export async function fetchKickChannel(username: string): Promise<PlatformPreview | null> {
  try {
    const response = await fetch(`${KICK_API}/${username}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      name: data.user?.username || username,
      avatar: data.user?.profile_pic || '',
      found: true,
      platform: 'kick'
    };
  } catch {
    return null;
  }
}

export async function fetchPlatformPreview(platform: Platform, identifier: string): Promise<PlatformPreview | null> {
  switch (platform) {
    case 'twitch':
      return fetchTwitchChannel(identifier);
    case 'youtube':
      return fetchYouTubeChannel(identifier);
    case 'kick':
      return fetchKickChannel(identifier);
    default:
      return null;
  }
}

export async function checkStreamStatus(platform: Platform, channelId: string): Promise<boolean> {
  switch (platform) {
    case 'twitch': {
      return await checkTwitchStatus(channelId);
    }
    
    case 'youtube': {
      // Simulação para YouTube (você pode implementar uma verificação real depois)
      return Math.random() > 0.5;
    }
    
    case 'kick': {
      const kickResponse = await fetch(`https://kick.com/api/v1/channels/${channelId}`);
      if (!kickResponse.ok) return false;
      const kickData = await kickResponse.json();
      return kickData.livestream && kickData.livestream.is_live;
    }
    
    default:
      return false;
  }
}

export async function getStreamInfo(platform: Platform, channelId: string): Promise<{
  platform: Platform;
  title: string;
  game: string;
  viewers: number;
  thumbnail: string;
} | null> {
  switch (platform) {
    case 'twitch': {
      try {
        const response = await fetch('https://gql.twitch.tv/gql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
          },
          body: JSON.stringify({
            query: `
              query {
                user(login: "${channelId}") {
                  stream {
                    id
                    title
                    viewersCount
                    game { name }
                  }
                }
              }
            `
          })
        });
        
        const data = await response.json();
        if (data.data && data.data.user && data.data.user.stream) {
          const stream = data.data.user.stream;
          return {
            title: stream.title || 'Live Stream',
            game: stream.game?.name || '',
            viewers: stream.viewersCount || 0,
            thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelId}-320x180.jpg`,
            platform: 'twitch'
          };
        }
        return null;
      } catch {
        return null;
      }
    }
    
    case 'youtube': {
      // Informações básicas para YouTube
      return {
        title: 'YouTube Stream',
        game: '',
        viewers: 0,
        thumbnail: 'https://via.placeholder.com/320x180/ff0000/FFFFFF?text=YouTube',
        platform: 'youtube'
      };
    }
    
    case 'kick': {
      const response = await fetch(`https://kick.com/api/v1/channels/${channelId}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.livestream && data.livestream.is_live) {
        return {
          title: data.livestream.session_title || '',
          game: '',
          viewers: data.livestream.viewer_count || 0,
          thumbnail: data.livestream.thumbnail?.src || '',
          platform: 'kick'
        };
      }
      return null;
    }
    
    default:
      return null;
  }
}