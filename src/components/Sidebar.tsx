import { Trash2, Bell, Heart, Tv, Play, Zap } from 'lucide-react';
import type { Streamer, Platform } from '../types';
import type { AppSettings } from '../types/settings';
import { useAnimatedClass, useInfiniteAnimation } from '../hooks/useAnimatedClass';
import { useAnimations } from '../hooks/useAnimations';
import { confirmDeleteStreamer, showSuccessToast } from '../services/sweetAlert';

interface SidebarProps {
  streamers: Streamer[];
  onRemoveStreamer: (id: string) => void;
  onToggleViewing: (streamerId: string) => void;
  viewingStreamers: Set<string>;
  onToggleFavorite: (id: string) => void;
  onToggleNotifications: (id: string) => void;
  settings: AppSettings;
}

const platformIcons = {
  twitch: <Tv size={12} style={{ color: '#9146ff' }} />,
  youtube: <Play size={12} style={{ color: '#ff0000' }} />,
  kick: <Zap size={12} style={{ color: '#00ff00' }} />
};

export function Sidebar({ 
  streamers, 
  onRemoveStreamer, 
  onToggleViewing,
  viewingStreamers,
  onToggleFavorite,
  onToggleNotifications,
  settings
}: SidebarProps) {
  const { animationsEnabled } = useAnimations();
  const animatedCardClass = useAnimatedClass('', 'animate__fadeIn');
  const subtlePulseClass = useInfiniteAnimation('', 'animate__pulse', 2000);
  const trashIconClass = '';
  const bellIconClass = '';
  const heartIconClass = '';
  const onlineStatusClass = useInfiniteAnimation('', 'animate__pulse', 2000);
  
  // Aplicar filtros
  let filteredStreamers = streamers;
  
  // Filtro de favoritos
  if (settings.showOnlyFavorites) {
    filteredStreamers = filteredStreamers.filter(s => s.isFavorite);
  }
  
  // Filtro de status
  if (settings.filterStatus !== 'all') {
    filteredStreamers = filteredStreamers.filter(s => s.status === settings.filterStatus);
  }
  
  // Filtro de plataforma
  if (settings.filterPlatform !== 'all') {
    filteredStreamers = filteredStreamers.filter(s => {
      const platform = settings.filterPlatform as Platform;
      return s.platforms[platform] !== undefined && s.platforms[platform] !== '';
    });
  }
  
  // Ordenação
  const sortedStreamers = [...filteredStreamers].sort((a, b) => {
    switch (settings.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        if (a.status === 'online' && b.status === 'offline') return -1;
        if (a.status === 'offline' && b.status === 'online') return 1;
        return a.name.localeCompare(b.name);
      case 'viewers':
        const aViewers = a.streamInfo?.viewers || 0;
        const bViewers = b.streamInfo?.viewers || 0;
        return bViewers - aViewers;
      case 'platform':
        const aPlatform = Object.keys(a.platforms)[0] || '';
        const bPlatform = Object.keys(b.platforms)[0] || '';
        return aPlatform.localeCompare(bPlatform);
      default:
        return 0;
    }
  });
  
  // Separar streamers por categoria
  const favoriteStreamers = sortedStreamers.filter(streamer => streamer.isFavorite);
  const nonFavoriteStreamers = sortedStreamers.filter(streamer => !streamer.isFavorite);
  
  // Dentro dos não-favoritos, separar por status
  const onlineStreamers = nonFavoriteStreamers.filter(streamer => streamer.status === 'online');
  const offlineStreamers = nonFavoriteStreamers.filter(streamer => streamer.status === 'offline');

  // Funções para notificações e favoritos
  const handleNotificationToggle = (streamerId: string, streamerName: string) => {
    onToggleNotifications(streamerId);
    const streamer = streamers.find(s => s.id === streamerId);
    const isEnabled = streamer?.notificationsEnabled || false;
    showSuccessToast('Notificações', `Notificações para ${streamerName} foram ${!isEnabled ? 'ativadas' : 'desativadas'}!`);
  };

  const handleFavoriteToggle = (streamerId: string, streamerName: string) => {
    onToggleFavorite(streamerId);
    const streamer = streamers.find(s => s.id === streamerId);
    const isFavorite = streamer?.isFavorite || false;
    showSuccessToast('Favoritos', `${streamerName} foi ${!isFavorite ? 'adicionado aos' : 'removido dos'} favoritos!`);
  };

  // Função para renderizar um card de streamer
  const renderStreamerCard = (streamer: Streamer) => {
    const isSelected = viewingStreamers.has(streamer.id);
    const cardClasses = `${animatedCardClass} ${animationsEnabled ? 'smooth-transition' : ''}`;
    const pulseClass = isSelected ? subtlePulseClass : '';
    
  return (
            <div
              key={streamer.id}
      className={`${cardClasses} ${pulseClass}`}
              style={{
        background: viewingStreamers.has(streamer.id) 
          ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)'
          : 'rgba(255, 255, 255, 0.05)',
        border: viewingStreamers.has(streamer.id) 
          ? '2px solid rgba(147, 51, 234, 0.6)' 
          : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
                padding: '0.75rem',
        marginBottom: '0.5rem',
                cursor: 'pointer',
        transition: animationsEnabled ? 'all 0.3s ease' : 'none',
        position: 'relative',
        backdropFilter: 'blur(10px)',
        minHeight: 'auto'
              }}
      onClick={() => onToggleViewing(streamer.id)}
              onMouseOver={(e) => {
        if (!viewingStreamers.has(streamer.id)) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
          // Só aplica transform se animações estão habilitadas
          if (animationsEnabled) {
            e.currentTarget.style.transform = 'translateY(-2px)';
          } else {
            // Garantir que não há transform quando animações estão desabilitadas
            e.currentTarget.style.transform = 'none';
          }
                }
              }}
              onMouseOut={(e) => {
        if (!viewingStreamers.has(streamer.id)) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          // Só aplica transform se animações estão habilitadas
          if (animationsEnabled) {
            e.currentTarget.style.transform = 'translateY(0)';
          } else {
            // Garantir que não há transform quando animações estão desabilitadas
            e.currentTarget.style.transform = 'none';
          }
        }
      }}
    >
      {/* Avatar e Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.25rem'
              }}>
                <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.9rem',
          overflow: 'hidden',
          flexShrink: 0
                }}>
          {streamer.avatar ? (
                  <img
                    src={streamer.avatar}
                    alt={streamer.name}
                    style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
                    }}
                    onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div style={{
            display: streamer.avatar ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            {streamer.name.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                fontSize: '0.85rem',
            fontWeight: '600',
                      color: 'white',
            margin: '0 0 0.15rem 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
          }}>
            {streamer.name}
          </h3>
          
          {/* Stream Title */}
          {streamer.streamInfo?.title && (
            <p style={{
              fontSize: '0.65rem',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: '0 0 0.15rem 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: '1.2'
            }}>
              {streamer.streamInfo.title}
            </p>
          )}
          
          {/* Status */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
            gap: '0.4rem'
          }}>
            <div 
              className={streamer.status === 'online' ? onlineStatusClass : ''}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: streamer.status === 'online' ? '#10b981' : '#6b7280',
                animation: streamer.status === 'online' ? 'pulse 2s infinite' : 'none',
                flexShrink: 0
              }}
            />
            <span style={{
              fontSize: '0.65rem',
              color: streamer.status === 'online' ? '#10b981' : '#9ca3af',
              fontWeight: '500'
            }}>
              {streamer.status === 'online' ? 'Ao vivo' : 'Offline'}
                        </span>
                    </div>
                  </div>
                </div>

          {/* Platforms and Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.25rem'
          }}>
            {/* Left side - Platform buttons */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
              gap: '0.3rem'
            }}>
              {Object.entries(streamer.platforms).map(([platform, channelId]) => (
                channelId && (
                  <div key={platform} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  padding: '0.15rem 0.4rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    {platformIcons[platform as keyof typeof platformIcons]}
                    <span style={{ textTransform: 'capitalize' }}>{platform}</span>
                  </div>
                )
              ))}
            </div>

            {/* Right side - Action buttons */}
                  <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              {/* Notification Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotificationToggle(streamer.id, streamer.name);
                }}
                style={{
                  background: streamer.notificationsEnabled 
                    ? 'rgba(59, 130, 246, 0.3)' 
                    : 'rgba(59, 130, 246, 0.1)',
                  border: streamer.notificationsEnabled 
                    ? '2px solid rgba(59, 130, 246, 0.6)' 
                    : '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '6px',
                  padding: '0.3rem',
                  cursor: 'pointer',
                  color: streamer.notificationsEnabled ? '#93c5fd' : '#3b82f6',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: streamer.notificationsEnabled 
                    ? '0 0 8px rgba(59, 130, 246, 0.4)' 
                    : 'none',
                  width: '32px',
                  height: '32px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = streamer.notificationsEnabled 
                    ? 'rgba(59, 130, 246, 0.4)' 
                    : 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.borderColor = streamer.notificationsEnabled 
                    ? 'rgba(59, 130, 246, 0.8)' 
                    : 'rgba(59, 130, 246, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = streamer.notificationsEnabled 
                    ? 'rgba(59, 130, 246, 0.3)' 
                    : 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.borderColor = streamer.notificationsEnabled 
                    ? '2px solid rgba(59, 130, 246, 0.6)' 
                    : '1px solid rgba(59, 130, 246, 0.2)';
                }}
              >
                <Bell size={16} fill={streamer.notificationsEnabled ? 'currentColor' : 'none'} className={bellIconClass} />
              </button>

              {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                  handleFavoriteToggle(streamer.id, streamer.name);
                }}
                style={{
                  background: streamer.isFavorite 
                    ? 'rgba(239, 68, 68, 0.3)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  border: streamer.isFavorite 
                    ? '2px solid rgba(239, 68, 68, 0.6)' 
                    : '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                  padding: '0.3rem',
                  cursor: 'pointer',
                  color: streamer.isFavorite ? '#fca5a5' : '#ef4444',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: streamer.isFavorite 
                    ? '0 0 8px rgba(239, 68, 68, 0.4)' 
                    : 'none',
                  width: '32px',
                  height: '32px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = streamer.isFavorite 
                    ? 'rgba(239, 68, 68, 0.4)' 
                    : 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.borderColor = streamer.isFavorite 
                    ? 'rgba(239, 68, 68, 0.8)' 
                    : 'rgba(239, 68, 68, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = streamer.isFavorite 
                    ? 'rgba(239, 68, 68, 0.3)' 
                    : 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = streamer.isFavorite 
                    ? '2px solid rgba(239, 68, 68, 0.6)' 
                    : '1px solid rgba(239, 68, 68, 0.2)';
                }}
              >
                <Heart size={16} fill={streamer.isFavorite ? 'currentColor' : 'none'} className={heartIconClass} />
              </button>

              {/* Delete Button */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const result = await confirmDeleteStreamer(streamer.name);
                  if (result.isConfirmed) {
                      onRemoveStreamer(streamer.id);
                    showSuccessToast('Streamer Eliminado', `${streamer.name} foi removido com sucesso!`);
                  }
                    }}
                    style={{
                  background: 'rgba(107, 114, 128, 0.1)',
                  border: '1px solid rgba(107, 114, 128, 0.2)',
                  borderRadius: '6px',
                  padding: '0.3rem',
                      cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px'
                    }}
                    onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.4)';
                    }}
                    onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                    }}
                  >
                <Trash2 size={16} className={trashIconClass} />
                  </button>
                </div>
              </div>
            </div>
    );
  };
  
  return (
    <div style={{
      background: 'rgba(15, 15, 35, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(147, 51, 234, 0.2)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 10,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid rgba(147, 51, 234, 0.2)',
        background: 'rgba(147, 51, 234, 0.05)'
      }}>
        {/* Title */}
        <div style={{
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'white',
            margin: 0,
            background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Meus Streamers
          </h2>
        </div>
      </div>

      {/* Streamers List */}
      <div 
        className="sidebar-scroll"
        style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: 'calc(100vh - 200px)', // Altura fixa para garantir scroll
          minHeight: 0
        }}>
        {streamers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
            padding: '3rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>📺</div>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>Nenhum streamer adicionado</p>
              <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.8 }}>Clique no botão + para adicionar seu primeiro streamer</p>
            </div>
          </div>
        ) : (
          <>
            {/* Favoritos */}
            {favoriteStreamers.length > 0 && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444'
                  }} />
                  <h3 style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#ef4444',
                    margin: 0
                  }}>
                    ⭐ Favoritos ({favoriteStreamers.length})
                  </h3>
                </div>
                {favoriteStreamers.map(renderStreamerCard)}
              </>
            )}

            {/* Streamers Online */}
            {onlineStreamers.length > 0 && (
              <>
                {favoriteStreamers.length > 0 && (
                  <div style={{
                    height: '1px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    margin: '1.5rem 0'
                  }} />
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    animation: 'pulse 2s infinite'
                  }} />
                  <h3 style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#10b981',
                    margin: 0
                  }}>
                    Ao Vivo ({onlineStreamers.length})
                  </h3>
                </div>
                {onlineStreamers.map(renderStreamerCard)}
              </>
            )}

            {/* Streamers Offline */}
            {offlineStreamers.length > 0 && (
              <>
                {(favoriteStreamers.length > 0 || onlineStreamers.length > 0) && (
                  <div style={{
                    height: '1px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    margin: '1.5rem 0'
                  }} />
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(107, 114, 128, 0.1)',
                  border: '1px solid rgba(107, 114, 128, 0.2)',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#6b7280'
                  }} />
                  <h3 style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#9ca3af',
                    margin: 0
                  }}>
                    Offline ({offlineStreamers.length})
                  </h3>
                </div>
                {offlineStreamers.map(renderStreamerCard)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
