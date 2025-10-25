import { useState } from 'react';
import { X, Check, Plus, Tv, Play, Zap } from 'lucide-react';
import type { Streamer, Platform, PlatformPreview } from '../types';
import { fetchPlatformPreview } from '../services/api';

interface EditStreamerModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamer: Streamer;
  onUpdateStreamer: (updatedStreamer: Streamer) => void;
}

interface PlatformEntry {
  platform: Platform;
  channelId: string;
  preview: PlatformPreview | null;
  isSearching: boolean;
}

export function EditStreamerModal({ isOpen, onClose, streamer, onUpdateStreamer }: EditStreamerModalProps) {
  const [platformEntries, setPlatformEntries] = useState<PlatformEntry[]>(() => {
    // Inicializar com as plataformas existentes do streamer
    return Object.entries(streamer.platforms).map(([platform, channelId]) => ({
      platform: platform as Platform,
      channelId: channelId || '',
      preview: null,
      isSearching: false
    }));
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const platformColors = {
    twitch: 'rgba(145, 70, 255, 0.1)',
    youtube: 'rgba(255, 0, 0, 0.1)',
    kick: 'rgba(0, 255, 0, 0.1)'
  };

  const platformIcons = {
    twitch: <Tv size={32} style={{ color: '#9146ff' }} />,
    youtube: <Play size={32} style={{ color: '#ff0000' }} />,
    kick: <Zap size={32} style={{ color: '#00ff00' }} />
  };

  const platformPlaceholders = {
    twitch: 'Nome do usuário (ex: ninja)',
    youtube: 'Nome do canal (ex: PewDiePie)',
    kick: 'Nome do usuário (ex: xqc)'
  };

  const platformDescriptions = {
    twitch: 'Digite o nome de usuário do Twitch',
    youtube: 'Digite o nome do canal do YouTube',
    kick: 'Digite o nome de usuário do Kick'
  };

  const togglePlatform = (platform: Platform) => {
    setPlatformEntries(prev => {
      const existing = prev.find(entry => entry.platform === platform);
      if (existing) {
        // Remover plataforma
        return prev.filter(entry => entry.platform !== platform);
      } else {
        // Adicionar plataforma
        return [...prev, {
          platform,
          channelId: '',
          preview: null,
          isSearching: false
        }];
      }
    });
  };

  const updatePlatform = (platform: Platform, value: string | boolean | PlatformPreview | null) => {
    setPlatformEntries(prev => prev.map(entry => {
      if (entry.platform === platform) {
        if (typeof value === 'string') {
          return { ...entry, channelId: value };
        } else if (typeof value === 'boolean') {
          return { ...entry, isSearching: value };
        } else {
          return { ...entry, preview: value };
        }
      }
      return entry;
    }));
  };

  const handleSearch = async (platform: Platform, channelId: string) => {
    if (!channelId.trim()) {
      updatePlatform(platform, null);
      return;
    }

    updatePlatform(platform, true);
    try {
      const preview = await fetchPlatformPreview(platform, channelId);
      updatePlatform(platform, preview);
    } catch (error) {
      console.error('Erro ao buscar preview:', error);
      updatePlatform(platform, null);
    } finally {
      updatePlatform(platform, false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Coletar dados das plataformas
      const platforms: Record<Platform, string> = {
        twitch: '',
        youtube: '',
        kick: ''
      };

      let streamerName = streamer.name;
      let streamerAvatar = streamer.avatar;

      // Processar cada entrada de plataforma
      for (const entry of platformEntries) {
        if (entry.channelId.trim()) {
          platforms[entry.platform] = entry.channelId.trim();
          
          // Se não temos preview, buscar
          if (!entry.preview) {
            try {
              const preview = await fetchPlatformPreview(entry.platform, entry.channelId.trim());
              if (preview && preview.found) {
                if (!streamerName || streamerName === streamer.name) {
                  streamerName = preview.name;
                }
                if (!streamerAvatar || streamerAvatar === streamer.avatar) {
                  streamerAvatar = preview.avatar;
                }
              }
            } catch (error) {
              console.error(`Erro ao buscar preview para ${entry.platform}:`, error);
            }
          } else if (entry.preview.found) {
            if (!streamerName || streamerName === streamer.name) {
              streamerName = entry.preview.name;
            }
            if (!streamerAvatar || streamerAvatar === streamer.avatar) {
              streamerAvatar = entry.preview.avatar;
            }
          }
        }
      }

      // Calcular número de plataformas ativas
      const platformCount = Object.values(platforms).filter(Boolean).length;

      // Criar streamer atualizado
      const updatedStreamer: Streamer = {
        ...streamer,
        name: streamerName,
        avatar: streamerAvatar,
        platforms,
        platformCount
      };

      onUpdateStreamer(updatedStreamer);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar streamer:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '20px',
        padding: '2rem',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(147, 51, 234, 0.3)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Editar Streamer
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Streamer Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <img
            src={streamer.avatar}
            alt={streamer.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '2px solid rgba(147, 51, 234, 0.3)',
              objectFit: 'cover'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x60/6B7280/FFFFFF?text=?';
            }}
          />
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'white',
              margin: '0 0 0.25rem 0'
            }}>
              {streamer.name}
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: 0
            }}>
              {streamer.platformCount} plataforma{streamer.platformCount !== 1 ? 's' : ''} • {streamer.status === 'online' ? '🔴 Online' : '⚫ Offline'}
            </p>
          </div>
        </div>

        {/* Platform Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'white',
            margin: '0 0 1rem 0'
          }}>
            Plataformas
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {(['twitch', 'youtube', 'kick'] as Platform[]).map((platform) => {
              const isSelected = platformEntries.some(entry => entry.platform === platform);
              return (
                <div
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  style={{
                    minWidth: '140px',
                    minHeight: '85px',
                    padding: '1.25rem 1.75rem',
                    background: isSelected 
                      ? platformColors[platform]
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected 
                      ? `2px solid ${platform === 'twitch' ? 'rgba(145, 70, 255, 0.5)' : platform === 'youtube' ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)'}`
                      : '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {platformIcons[platform]}
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'white',
                    textTransform: 'capitalize'
                  }}>
                    {platform}
                  </span>
                  
                  {isSelected ? (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white'
                    }}>
                      <Check size={12} color="white" />
                    </div>
                  ) : (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      <Plus size={12} color="white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Platform Inputs */}
          {platformEntries.map((entry) => (
            <div key={entry.platform} style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: platformColors[entry.platform]
                }}>
                  {platformIcons[entry.platform]}
                </div>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'white',
                  textTransform: 'capitalize'
                }}>
                  {entry.platform}
                </span>
                {entry.preview?.avatar && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginLeft: 'auto'
                  }}>
                    <img
                      src={entry.preview.avatar}
                      alt={entry.preview.name}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24x24/6B7280/FFFFFF?text=?';
                      }}
                    />
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}>
                      {entry.preview.name}
                    </span>
                  </div>
                )}
              </div>
              
              <input
                type="text"
                value={entry.channelId}
                onChange={(e) => {
                  updatePlatform(entry.platform, e.target.value);
                  handleSearch(entry.platform, e.target.value);
                }}
                placeholder={entry.preview?.name || platformPlaceholders[entry.platform]}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.5)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
              
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: '0.25rem 0 0 0'
              }}>
                {platformDescriptions[entry.platform]}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Cancelar
          </button>
          
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            style={{
              padding: '0.75rem 1.5rem',
              background: isUpdating 
                ? 'rgba(147, 51, 234, 0.5)' 
                : 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4)'
            }}
            onMouseOver={(e) => {
              if (!isUpdating) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.6)';
              }
            }}
            onMouseOut={(e) => {
              if (!isUpdating) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(147, 51, 234, 0.4)';
              }
            }}
          >
            {isUpdating ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Atualizando...
              </>
            ) : (
              <>
                <Check size={16} />
                Atualizar Streamer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
