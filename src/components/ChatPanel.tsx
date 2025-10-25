import { useState, useEffect } from 'react';
import type { Streamer } from '../types';

interface ChatPanelProps {
  streamers: Streamer[];
  selectedStreamer?: Streamer;
  viewingStreamers: Set<string>;
}

export function ChatPanel({ streamers, viewingStreamers }: ChatPanelProps) {
  const [activeTab, setActiveTab] = useState<'twitch' | 'youtube' | 'kick'>('twitch');
  const [activeStreamerId, setActiveStreamerId] = useState<string | null>(null);

  // Obter streamers que estão sendo visualizados
  const activeStreamers = streamers.filter(s => viewingStreamers.has(s.id));

  // Definir streamer ativo inicial
  useEffect(() => {
    if (activeStreamers.length > 0 && !activeStreamerId) {
      setActiveStreamerId(activeStreamers[0].id);
    }
  }, [activeStreamers, activeStreamerId]);

  // Se não há streamers sendo visualizados, mostrar mensagem
  if (activeStreamers.length === 0) {
    return (
      <div style={{
        backgroundColor: '#1f2937',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem'
        }}>
          Selecione um streamer para ver o chat
        </div>
      </div>
    );
  }

  const currentStreamer = activeStreamers.find(s => s.id === activeStreamerId) || activeStreamers[0];

  // Obter plataformas onde o streamer está fazendo streaming
  const activePlatforms = Object.entries(currentStreamer.platforms)
    .filter(([, channelId]) => channelId && channelId.trim() !== '')
    .map(([platform]) => platform as 'twitch' | 'youtube' | 'kick');

  // Se não há plataformas ativas, mostrar mensagem
  if (activePlatforms.length === 0) {
    return (
      <div style={{
        backgroundColor: '#1f2937',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem'
        }}>
          Nenhuma plataforma configurada para este streamer
        </div>
      </div>
    );
  }

  // Se a aba ativa não está disponível, mudar para a primeira disponível
  if (!activePlatforms.includes(activeTab)) {
    setActiveTab(activePlatforms[0]);
  }

  const getChatUrl = (platform: 'twitch' | 'youtube' | 'kick', channelId: string) => {
    switch (platform) {
      case 'twitch':
        return `https://www.twitch.tv/embed/${channelId}/chat?parent=localhost&darkpopout=true&theme=dark&color=#9146FF`;
      case 'youtube':
        return `https://www.youtube.com/live_chat?v=${channelId}&embed_domain=localhost&theme=dark`;
      case 'kick':
        return `https://kick.com/embed/chat/${channelId}?theme=dark`;
      default:
        return '';
    }
  };

  const getPlatformIcon = (platform: 'twitch' | 'youtube' | 'kick') => {
    switch (platform) {
      case 'twitch':
        return '🟣';
      case 'youtube':
        return '🔴';
      case 'kick':
        return '🟢';
      default:
        return '';
    }
  };

  const getPlatformColor = (platform: 'twitch' | 'youtube' | 'kick') => {
    switch (platform) {
      case 'twitch':
        return '#9146ff';
      case 'youtube':
        return '#ff0000';
      case 'kick':
        return '#00ff00';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Tabs dos streamers - só mostrar se há mais de um streamer */}
      {activeStreamers.length > 1 && (
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0.5rem',
          gap: '0.5rem'
        }}>
          {activeStreamers.map((streamer) => (
            <button
              key={streamer.id}
              onClick={() => setActiveStreamerId(streamer.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                backgroundColor: activeStreamerId === streamer.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: activeStreamerId === streamer.id ? `2px solid ${streamer.status === 'online' ? '#10b981' : '#6b7280'}` : '2px solid transparent',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                if (activeStreamerId !== streamer.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseOut={(e) => {
                if (activeStreamerId !== streamer.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <img
                src={streamer.avatar}
                alt={streamer.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32/6B7280/FFFFFF?text=?';
                }}
              />
              {/* Status indicator */}
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: streamer.status === 'online' ? '#10b981' : '#6b7280',
                border: '2px solid #1f2937'
              }} />
            </button>
          ))}
        </div>
      )}

      {/* Header com nome do streamer */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '1rem',
          fontWeight: '600',
          margin: 0,
          textAlign: 'center'
        }}>
          {currentStreamer.name}
        </h3>
      </div>

      {/* Tabs das plataformas - só mostrar se há mais de uma plataforma */}
      {activePlatforms.length > 1 && (
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {activePlatforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: activeTab === platform ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                color: activeTab === platform ? 'white' : 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === platform ? `2px solid ${getPlatformColor(platform)}` : '2px solid transparent'
              }}
              onMouseOver={(e) => {
                if (activeTab !== platform) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== platform) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }
              }}
            >
              <span>{getPlatformIcon(platform)}</span>
              <span style={{ textTransform: 'capitalize' }}>{platform}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat iframe */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {activeStreamers.map((streamer) => {
          const streamerPlatforms = Object.entries(streamer.platforms)
            .filter(([, channelId]) => channelId && channelId.trim() !== '')
            .map(([platform]) => platform as 'twitch' | 'youtube' | 'kick');

          return streamerPlatforms.map((platform) => {
            const isActive = activeStreamerId === streamer.id && activeTab === platform;
            const channelId = streamer.platforms[platform];
            
            if (!channelId) return null;

            return (
              <iframe
                key={`${streamer.id}-${platform}`}
                src={getChatUrl(platform, channelId)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#1f2937',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  display: isActive ? 'block' : 'none'
                }}
                title={`${streamer.name} - ${platform} chat`}
              />
            );
          });
        })}
      </div>
    </div>
  );
}