import { useState, useEffect } from 'react';
import { X, Search, Check, AlertCircle, Trash2, Plus, Tv, Play, Zap } from 'lucide-react';
import type { Platform, PlatformPreview } from '../types';
import { fetchPlatformPreview } from '../services/api';

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStreamer: (data: {
    name: string;
    avatar: string;
    found: boolean;
    platforms: Record<Platform, string>;
  }) => void;
}

interface PlatformEntry {
  platform: Platform;
  channelId: string;
  preview: PlatformPreview | null;
  isSearching: boolean;
  error: string;
}

export function AddStreamModal({ isOpen, onClose, onAddStreamer }: AddStreamModalProps) {
  const [platformEntries, setPlatformEntries] = useState<PlatformEntry[]>([
    { platform: 'twitch', channelId: '', preview: null, isSearching: false, error: '' }
  ]);
  const [isAdding, setIsAdding] = useState(false);

  const platformLabels = {
    twitch: 'Twitch',
    youtube: 'YouTube',
    kick: 'Kick'
  };

  const platformIcons = {
    twitch: <Tv size={32} style={{ color: '#9146ff' }} />,
    youtube: <Play size={32} style={{ color: '#ff0000' }} />,
    kick: <Zap size={32} style={{ color: '#00ff00' }} />
  };

  const platformPlaceholders = {
    twitch: 'Nome do canal (ex: ninja)',
    youtube: 'Nome do canal (ex: PewDiePie)',
    kick: 'Nome do canal (ex: xqc)'
  };

  const platformColors = {
    twitch: '#7c3aed',
    youtube: '#dc2626',
    kick: '#059669'
  };

  useEffect(() => {
    if (isOpen) {
      setPlatformEntries([{ platform: 'twitch', channelId: '', preview: null, isSearching: false, error: '' }]);
    }
  }, [isOpen]);

  const togglePlatform = (platform: Platform) => {
    const existingIndex = platformEntries.findIndex(entry => entry.platform === platform);
    
    if (existingIndex !== -1) {
      // Se já existe, remove (toggle off) - permite remover todas
      setPlatformEntries(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      // Se não existe, adiciona (toggle on)
      setPlatformEntries(prev => [...prev, {
        platform,
        channelId: '',
        preview: null,
        isSearching: false,
        error: ''
      }]);
    }
  };

  const removePlatform = (index: number) => {
    if (platformEntries.length > 1) {
      setPlatformEntries(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePlatform = (index: number, field: keyof PlatformEntry, value: string | boolean | PlatformPreview | null) => {
    setPlatformEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ));
  };

  const handleSearch = async (index: number) => {
    const entry = platformEntries[index];
    if (!entry.channelId.trim()) {
      updatePlatform(index, 'error', 'Digite um nome/ID de canal');
      return;
    }

    updatePlatform(index, 'isSearching', true);
    updatePlatform(index, 'error', '');

    try {
      const result = await fetchPlatformPreview(entry.platform, entry.channelId.trim());
      updatePlatform(index, 'preview', result);
      
    } catch {
      updatePlatform(index, 'error', 'Erro ao buscar streamer. Tente novamente.');
      updatePlatform(index, 'preview', null);
    } finally {
      updatePlatform(index, 'isSearching', false);
    }
  };

  const handleAdd = async () => {
    if (platformEntries.length === 0) {
      return;
    }

    setIsAdding(true);

    // Buscar previews para plataformas que ainda não foram buscadas
    const updatedEntries = await Promise.all(
      platformEntries.map(async (entry) => {
        if (entry.channelId.trim() && !entry.preview) {
          try {
            const result = await fetchPlatformPreview(entry.platform, entry.channelId.trim());
            return { ...entry, preview: result };
          } catch {
            return entry;
          }
        }
        return entry;
      })
    );

    setPlatformEntries(updatedEntries);

    // Criar objeto de plataformas
    const platforms: Record<Platform, string> = {
      twitch: '',
      youtube: '',
      kick: ''
    };

    updatedEntries.forEach(entry => {
      if (entry.channelId.trim()) {
        platforms[entry.platform] = entry.channelId.trim();
      }
    });

    // Usar o nome da primeira plataforma encontrada como nome do streamer
    const firstPreview = updatedEntries.find(entry => entry.preview?.name);
    const streamerName = firstPreview?.preview?.name || 'Streamer';

    onAddStreamer({
      name: streamerName,
      avatar: firstPreview?.preview?.avatar || 'https://via.placeholder.com/48x48/6B7280/FFFFFF?text=?',
      found: true,
      platforms
    });

    setIsAdding(false);
    onClose();
  };

  if (!isOpen) return null;

  const hasValidPlatforms = platformEntries.some(entry => entry.channelId.trim() && entry.preview?.found);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(147, 51, 234, 0.2)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div>
          <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 0.25rem 0'
            }}>Adicionar Streamer</h2>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.6)',
            margin: 0
            }}>Configure as plataformas do streamer</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              padding: '0.75rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Platform Entries */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.75rem',
              display: 'block'
            }}>
              Plataformas
            </label>
            
            {/* Cards de seleção de plataformas */}
          <div style={{
            display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {['twitch', 'youtube', 'kick'].map((platform) => {
                const isUsed = platformEntries.some(entry => entry.platform === platform);
                const isDisabled = !isUsed && platformEntries.length >= 3;
                
                return (
              <button
                    key={platform}
                    onClick={() => togglePlatform(platform as Platform)}
                    disabled={isDisabled}
                    style={{
                      background: isUsed 
                        ? `linear-gradient(135deg, ${platformColors[platform as Platform]} 0%, ${platformColors[platform as Platform]}CC 100%)`
                        : `linear-gradient(135deg, ${platformColors[platform as Platform]}20 0%, ${platformColors[platform as Platform]}10 100%)`,
                      border: `2px solid ${isUsed 
                        ? platformColors[platform as Platform]
                        : platformColors[platform as Platform] + '40'}`,
                      borderRadius: '12px',
                      padding: '1.25rem 1.75rem',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      minWidth: '140px',
                      minHeight: '85px',
                      opacity: isDisabled ? 0.4 : 1,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      boxShadow: isUsed 
                        ? `0 8px 25px ${platformColors[platform as Platform]}40`
                        : 'none'
                    }}
                    onMouseOver={(e) => {
                      if (!isDisabled) {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                        e.currentTarget.style.boxShadow = `0 12px 35px ${platformColors[platform as Platform]}50`;
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = isUsed 
                        ? `0 8px 25px ${platformColors[platform as Platform]}40`
                        : 'none';
                    }}
                  >
                    <div style={{
                      marginBottom: '0.5rem',
                      filter: isUsed ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {platformIcons[platform as Platform]}
                    </div>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: isUsed ? 'white' : 'rgba(255, 255, 255, 0.9)',
                      textTransform: 'capitalize',
                      textShadow: isUsed ? '0 2px 4px rgba(0, 0, 0, 0.3)' : 'none'
                    }}>
                      {platformLabels[platform as Platform]}
                    </span>
                    {isUsed && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: platformColors[platform as Platform],
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease'
                      }}>
                        <Check size={12} strokeWidth={2.5} />
                      </div>
                    )}
                    {!isUsed && !isDisabled && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.2s ease'
                      }}>
                        <Plus size={12} strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {platformEntries.map((entry, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  position: 'relative'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${platformColors[entry.platform]}20 0%, ${platformColors[entry.platform]}10 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <div style={{ 
                        width: '24px', 
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {platformIcons[entry.platform]}
                      </div>
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'white',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {platformLabels[entry.platform]}
                      </h3>
                      {entry.preview?.avatar ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img
                            src={entry.preview.avatar}
                            alt={entry.preview.name}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid rgba(255, 255, 255, 0.2)'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span style={{
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: '500'
                          }}>
                            {entry.preview.name}
                          </span>
                        </div>
                      ) : (
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: 0
                        }}>
                          {entry.platform === 'youtube' ? 'Digite o nome do canal (ex: PewDiePie)' : platformPlaceholders[entry.platform]}
                        </p>
                      )}
                    </div>
                  </div>
                  {platformEntries.length > 1 && (
                    <button
                      onClick={() => removePlatform(index)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                }}
                onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                }}
              >
                      <Trash2 size={14} />
              </button>
                  )}
        </div>

          <div style={{
            display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
          }}>
            <input
              type="text"
                    value={entry.channelId}
                    onChange={(e) => updatePlatform(index, 'channelId', e.target.value)}
                    placeholder={platformPlaceholders[entry.platform]}
              style={{
                flex: 1,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                color: 'white',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = `${platformColors[entry.platform]}50`;
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(index)}
            />
            <button
                    onClick={() => handleSearch(index)}
                    disabled={entry.isSearching}
              style={{
                      background: `linear-gradient(135deg, ${platformColors[entry.platform]} 0%, ${platformColors[entry.platform]}CC 100%)`,
                color: 'white',
                border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      cursor: entry.isSearching ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      opacity: entry.isSearching ? 0.6 : 1,
                      transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                      if (!entry.isSearching) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${platformColors[entry.platform]}40`;
                }
              }}
              onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Search size={16} />
                    {entry.isSearching ? 'Buscando...' : 'Buscar'}
            </button>
        </div>

        {/* Error Message */}
                {entry.error && (
          <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
            padding: '0.75rem',
                    borderRadius: '6px',
                    marginTop: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
                    <AlertCircle size={14} />
                    {entry.error}
          </div>
        )}

        {/* Preview */}
                {entry.preview && (
          <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
            padding: '1rem',
                    marginTop: '0.75rem'
                  }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <img
                        src={entry.preview.avatar}
                        alt={entry.preview.name}
                style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          objectFit: 'cover'
                }}
                onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/6B7280/FFFFFF?text=?';
                }}
              />
                      <div style={{ flex: 1 }}>
                <h4 style={{
                          fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 0.25rem 0'
                        }}>{entry.preview.name}</h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                          {entry.preview.found ? (
                    <>
                              <Check size={14} style={{ color: '#10b981' }} />
                              <span style={{ color: '#10b981', fontSize: '0.75rem' }}>
                        Canal encontrado
                      </span>
                    </>
                  ) : (
                    <>
                              <AlertCircle size={14} style={{ color: '#f59e0b' }} />
                              <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>
                        Canal não encontrado
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
              </div>
            ))}
          </div>
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
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
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
            onClick={handleAdd}
            disabled={!hasValidPlatforms || isAdding}
            style={{
              background: hasValidPlatforms && !isAdding 
                ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)' 
                : 'rgba(107, 114, 128, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: hasValidPlatforms && !isAdding ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              fontWeight: '500',
              opacity: hasValidPlatforms && !isAdding ? 1 : 0.6,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              if (hasValidPlatforms && !isAdding) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isAdding ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Adicionando...
              </>
            ) : (
              'Adicionar Streamer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
