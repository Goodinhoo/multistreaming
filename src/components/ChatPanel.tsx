import { useState, useEffect } from 'react';
import type { Streamer } from '../types';
import { getKickChatUrl } from '../services/kickApi';
import { KickChatEmbed } from './KickChatEmbed';

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
    if (activeStreamers.length > 0) {
      if (!activeStreamerId) {
        setActiveStreamerId(activeStreamers[0].id);
      } else if (!activeStreamers.some(s => s.id === activeStreamerId)) {
        setActiveStreamerId(activeStreamers[0].id);
      }
    } else {
      setActiveStreamerId(null);
    }
  }, [activeStreamers, activeStreamerId]);

  // Definir aba ativa inicial baseada no streamer ativo
  useEffect(() => {
    if (activeStreamerId && activeStreamers.length > 0) {
      const currentStreamer = activeStreamers.find(s => s.id === activeStreamerId);
      if (currentStreamer) {
        const platforms = Object.entries(currentStreamer.platforms)
          .filter(([, channelId]) => channelId && channelId.trim() !== '')
          .map(([platform]) => platform as 'twitch' | 'youtube' | 'kick');
        
        if (platforms.length > 0 && !platforms.includes(activeTab)) {
          setActiveTab(platforms[0]);
        }
      }
    }
  }, [activeStreamerId, activeStreamers, activeTab]);

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

  const getChatUrl = (platform: 'twitch' | 'youtube' | 'kick', channelId: string) => {
    const currentHost = window.location.hostname;
    switch (platform) {
      case 'twitch':
        // Usar o mesmo padrão do código que funciona: parent com hostname atual
        return `https://www.twitch.tv/embed/${channelId}/chat?parent=${currentHost}&darkpopout=true&theme=dark&color=#9146FF`;
      case 'youtube':
        return `https://www.youtube.com/live_chat?v=${channelId}&embed_domain=${currentHost}&theme=dark`;
      case 'kick':
        return getKickChatUrl(channelId);
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
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Indicador de múltiplos chats */}
      {activeStreamers.length > 1 && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          zIndex: 20,
          background: 'rgba(147, 51, 234, 0.9)',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>
          {activeStreamers.length} chats
        </div>
      )}
      {/* Tabs dos streamers - sempre mostrar quando há múltiplos */}
      {activeStreamers.length > 1 && (
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0.5rem',
          gap: '0.5rem',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(147, 51, 234, 0.5) transparent'
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
                position: 'relative',
                minWidth: '60px',
                flexShrink: 0
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

      {/* Header com informações do streamer */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={currentStreamer.avatar}
            alt={currentStreamer.name}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.1)'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32/6B7280/FFFFFF?text=?';
            }}
          />
          <div>
            <h3 style={{
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: '600',
              margin: 0,
              lineHeight: '1.2'
            }}>
              {currentStreamer.name}
            </h3>
            {activeStreamers.length > 1 && (
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem',
                margin: 0,
                lineHeight: '1.2'
              }}>
                {activeStreamers.findIndex(s => s.id === activeStreamerId) + 1} de {activeStreamers.length}
              </p>
            )}
          </div>
        </div>
        
        {/* Indicador de status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: currentStreamer.status === 'online' ? '#10b981' : '#6b7280',
            animation: currentStreamer.status === 'online' ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {currentStreamer.status === 'online' ? 'Ao vivo' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Tabs das plataformas - só mostrar se há mais de uma plataforma */}
      {activePlatforms.length > 1 && (
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0
        }}>
          {activePlatforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                backgroundColor: activeTab === platform ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                color: activeTab === platform ? 'white' : 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
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
              <span style={{ fontSize: '0.9rem' }}>{getPlatformIcon(platform)}</span>
              <span style={{ textTransform: 'capitalize' }}>{platform}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat iframe - Todos os chats são carregados mas apenas o ativo é mostrado */}
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

            // Para Kick, usar componente especial que lida com CSRF
            if (platform === 'kick') {
              return (
                <div
                  key={`${streamer.id}-${platform}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    display: isActive ? 'block' : 'none',
                    zIndex: isActive ? 10 : 1
                  }}
                >
                  <KickChatEmbed
                    channel={channelId}
                    streamerName={streamer.name}
                  />
                </div>
              );
            }

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
                  display: isActive ? 'block' : 'none',
                  zIndex: isActive ? 10 : 1
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