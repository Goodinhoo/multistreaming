import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Settings, Users, Sliders, Bell, Heart, Tv, Play, Zap } from 'lucide-react';
import type { Streamer } from '../types';
import { EditStreamerModal } from './EditStreamerModal';
import { useAnimatedClassWithDuration } from '../hooks/useAnimatedClass';
import { confirmSaveSettings, confirmReduceViewers, confirmDeleteStreamer, showSuccessToast } from '../services/sweetAlert';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamers: Streamer[];
  onUpdateStreamer: (updatedStreamer: Streamer) => void;
  onRemoveStreamer: (id: string) => void;
  maxViewers: number;
  onUpdateMaxViewers: (maxViewers: number) => void;
  viewingStreamers: Set<string>;
  onUpdateViewingStreamers: (streamers: Set<string>) => void;
  animationsEnabled: boolean;
  onUpdateAnimations: (enabled: boolean) => void;
  onToggleFavorite: (id: string) => void;
  onToggleNotifications: (id: string) => void;
}

export function OptionsModal({ isOpen, onClose, streamers, onUpdateStreamer, onRemoveStreamer, maxViewers, onUpdateMaxViewers, viewingStreamers, onUpdateViewingStreamers, animationsEnabled, onUpdateAnimations, onToggleFavorite, onToggleNotifications }: OptionsModalProps) {
  const [editingStreamer, setEditingStreamer] = useState<Streamer | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'streamers'>('general');
  
  const animatedModalClass = useAnimatedClassWithDuration('', 'animate__zoomIn', 400);
  const animatedCardClass = useAnimatedClassWithDuration('', 'animate__slideInUp', 600);
  const settingsIconClass = '';
  const slidersIconClass = '';
  const usersIconClass = '';
  const editIconClass = '';
  const trashIconClass = '';
  const bellIconClass = '';
  const heartIconClass = '';
  
  // Estado para configurações pendentes
  const [pendingSettings, setPendingSettings] = useState({
    maxViewers: maxViewers,
    notifications: true,
    animations: animationsEnabled,
    autoRefresh: true,
    refreshInterval: 30,
    theme: 'dark' as 'dark' | 'light',
    language: 'pt' as 'pt' | 'en'
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const platformIcons = {
    twitch: <Tv size={12} style={{ color: '#9146ff' }} />,
    youtube: <Play size={12} style={{ color: '#ff0000' }} />,
    kick: <Zap size={12} style={{ color: '#00ff00' }} />
  };

  // Atualizar estado pendente quando maxViewers ou animationsEnabled mudarem externamente
  useEffect(() => {
    setPendingSettings(prev => ({ ...prev, maxViewers, animations: animationsEnabled }));
  }, [maxViewers, animationsEnabled]);

  const handleSettingChange = (key: keyof typeof pendingSettings, value: string | number | boolean) => {
    setPendingSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    const newMaxViewers = pendingSettings.maxViewers;
    const currentViewingCount = viewingStreamers.size;
    
    // Se o novo limite for menor que o número atual de visualizadores
    if (newMaxViewers < currentViewingCount) {
      const result = await confirmReduceViewers(currentViewingCount, newMaxViewers);
      if (!result.isConfirmed) {
        return; // Usuário cancelou
      }
      
      const streamersToRemove = currentViewingCount - newMaxViewers;
      const viewingArray = Array.from(viewingStreamers);
      
      // Remover os streamers mais antigos (primeiros da lista)
      const newViewingStreamers = new Set(viewingArray.slice(streamersToRemove));
      
      // Atualizar o estado de visualizadores
      onUpdateViewingStreamers(newViewingStreamers);
    }
    
    // Confirmar salvamento das configurações
    const result = await confirmSaveSettings();
    if (!result.isConfirmed) {
      return; // Usuário cancelou
    }
    
    // Salvar o novo limite
    onUpdateMaxViewers(newMaxViewers);
    
    // Salvar configuração de animações
    onUpdateAnimations(pendingSettings.animations);
    
    setHasUnsavedChanges(false);
    showSuccessToast('Configurações Guardadas', 'As suas configurações foram atualizadas com sucesso!');
  };

  const handleCancelChanges = () => {
    setPendingSettings(prev => ({ ...prev, maxViewers, animations: animationsEnabled }));
    setHasUnsavedChanges(false);
  };

  if (!isOpen) return null;

  return (
    <>
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
          width: '100%',
          maxWidth: '800px',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(147, 51, 234, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }} className={animatedModalClass}>
          {/* Header Fixo */}
          <div style={{
            padding: '1.5rem 2rem 0 2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(147, 51, 234, 0.05)',
            flexShrink: 0
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Settings size={20} className={settingsIconClass} />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0
                  }}>
                    Opções
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: 0
                  }}>
                    Configure suas preferências
                  </p>
                </div>
              </div>
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

            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '-1px' // Cola os tabs ao fundo do header
            }}>
              <button
                onClick={() => setActiveTab('general')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: activeTab === 'general' 
                    ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: '10px 10px 0 0',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderBottom: activeTab === 'general' 
                    ? '2px solid #9333ea'
                    : '2px solid transparent'
                }}
              >
                    <Sliders size={16} className={slidersIconClass} />
                    Configurações Gerais
              </button>
              
              <button
                onClick={() => setActiveTab('streamers')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: activeTab === 'streamers' 
                    ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: '10px 10px 0 0',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderBottom: activeTab === 'streamers' 
                    ? '2px solid #9333ea'
                    : '2px solid transparent'
                }}
              >
                    <Users size={16} className={usersIconClass} />
                    Meus Streamers ({streamers.length})
              </button>
            </div>
          </div>

          {/* Conteúdo Principal com Scroll */}
          <div style={{
            flex: 1,
            padding: '2rem',
            overflowY: 'auto',
            background: 'rgba(0, 0, 0, 0.1)'
          }}>
            {activeTab === 'general' && (
              <div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 1rem 0'
                }}>
                  Configurações Gerais
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {/* Limite de Visualizadores */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: '0 0 0.25rem 0'
                        }}>
                          Limite de Visualizadores
                        </h4>
                        <p style={{
                          fontSize: '0.875rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: 0
                        }}>
                          Máximo de streams que podem ser visualizados simultaneamente
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <button
                          onClick={() => handleSettingChange('maxViewers', Math.max(1, pendingSettings.maxViewers - 1))}
                          disabled={pendingSettings.maxViewers <= 1}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: pendingSettings.maxViewers <= 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(147, 51, 234, 0.2)',
                            border: '1px solid',
                            borderColor: pendingSettings.maxViewers <= 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(147, 51, 234, 0.3)',
                            color: pendingSettings.maxViewers <= 1 ? 'rgba(255, 255, 255, 0.3)' : '#9333ea',
                            cursor: pendingSettings.maxViewers <= 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          -
                        </button>
                        
                        <div style={{
                          minWidth: '60px',
                          textAlign: 'center',
                          padding: '0.5rem 1rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          <span style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: 'white'
                          }}>
                            {pendingSettings.maxViewers}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleSettingChange('maxViewers', Math.min(8, pendingSettings.maxViewers + 1))}
                          disabled={pendingSettings.maxViewers >= 8}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: pendingSettings.maxViewers >= 8 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(147, 51, 234, 0.2)',
                            border: '1px solid',
                            borderColor: pendingSettings.maxViewers >= 8 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(147, 51, 234, 0.3)',
                            color: pendingSettings.maxViewers >= 8 ? 'rgba(255, 255, 255, 0.3)' : '#9333ea',
                            cursor: pendingSettings.maxViewers >= 8 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '0.5rem'
                    }}>
                      💡 Quando o limite for atingido, o streamer mais antigo será automaticamente desligado
                      {pendingSettings.maxViewers < viewingStreamers.size && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '6px',
                          color: '#f87171'
                        }}>
                          ⚠️ Reduzindo para {pendingSettings.maxViewers}, {viewingStreamers.size - pendingSettings.maxViewers} streamer(s) mais antigo(s) será(ão) desligado(s) automaticamente
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notificações */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: '0 0 0.25rem 0'
                        }}>
                          🔔 Notificações
                        </h4>
                        <p style={{
                          fontSize: '0.875rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: 0
                        }}>
                          Receber notificações quando streamers ficam online
                        </p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('notifications', !pendingSettings.notifications)}
                        style={{
                          width: '48px',
                          height: '24px',
                          borderRadius: '12px',
                          background: pendingSettings.notifications ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: '2px',
                          left: pendingSettings.notifications ? '26px' : '2px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }} />
                      </button>
                    </div>
                  </div>

                  {/* Animações */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: '0 0 0.25rem 0'
                        }}>
                          ✨ Animações
                        </h4>
                        <p style={{
                          fontSize: '0.875rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: 0
                        }}>
                          Ativar animações e transições na interface
                        </p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('animations', !pendingSettings.animations)}
                        style={{
                          width: '48px',
                          height: '24px',
                          borderRadius: '12px',
                          background: pendingSettings.animations ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: '2px',
                          left: pendingSettings.animations ? '26px' : '2px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }} />
                      </button>
                    </div>
                  </div>

                  {/* Auto Refresh */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: '0 0 0.25rem 0'
                        }}>
                          🔄 Atualização Automática
                        </h4>
                        <p style={{
                          fontSize: '0.875rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: 0
                        }}>
                          Verificar status dos streamers automaticamente
                        </p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('autoRefresh', !pendingSettings.autoRefresh)}
                        style={{
                          width: '48px',
                          height: '24px',
                          borderRadius: '12px',
                          background: pendingSettings.autoRefresh ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: '2px',
                          left: pendingSettings.autoRefresh ? '26px' : '2px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }} />
                      </button>
                    </div>
                    
                    {pendingSettings.autoRefresh && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <label style={{
                          fontSize: '0.875rem',
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: '500'
                        }}>
                          Intervalo (segundos):
                        </label>
                        <select
                          value={pendingSettings.refreshInterval}
                          onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            color: 'white',
                            fontSize: '0.875rem'
                          }}
                        >
                          <option value={15}>15s</option>
                          <option value={30}>30s</option>
                          <option value={60}>1min</option>
                          <option value={120}>2min</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  {hasUnsavedChanges && (
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      justifyContent: 'flex-end',
                      padding: '1rem',
                      background: 'rgba(147, 51, 234, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(147, 51, 234, 0.2)'
                    }}>
                      <button
                        onClick={handleCancelChanges}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'rgba(107, 114, 128, 0.1)',
                          border: '1px solid rgba(107, 114, 128, 0.2)',
                          borderRadius: '8px',
                          color: '#6b7280',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
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
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveSettings}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                        }}
                      >
                        💾 Salvar Configurações
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'streamers' && (
              <div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 1rem 0'
                }}>
                  Gerenciar Streamers
                </h3>

                {streamers.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 2rem',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(147, 51, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      margin: '0 auto 1rem auto'
                    }}>
                      📺
                    </div>
                    <p style={{
                      fontSize: '1rem',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Nenhum streamer adicionado
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      Adicione streamers usando o botão no header
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {streamers.map((streamer) => (
                      <div
                        key={streamer.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.75rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}>
                            <div style={{ position: 'relative' }}>
                              <img
                                src={streamer.avatar}
                                alt={streamer.name}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  border: '2px solid rgba(255, 255, 255, 0.1)',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/6B7280/FFFFFF?text=?';
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: streamer.status === 'online' ? '#10b981' : '#6b7280',
                                border: '2px solid rgba(15, 15, 35, 0.9)',
                                boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1)',
                                animation: streamer.status === 'online' ? 'pulse 2s infinite' : 'none'
                              }} />
                            </div>
                            <div>
                              <h4 style={{
                                fontSize: '1.05rem',
                                fontWeight: '600',
                                color: 'white',
                                margin: '0 0 0.15rem 0'
                              }}>
                                {streamer.name}
                              </h4>
                              <p style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255, 255, 255, 0.6)',
                                margin: 0
                              }}>
                                {streamer.platformCount} plataforma{streamer.platformCount !== 1 ? 's' : ''} • {streamer.status === 'online' ? '🔴 Online' : '⚫ Offline'}
                              </p>
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}>
                            {/* Notification Button */}
                            <button
                              onClick={() => onToggleNotifications(streamer.id)}
                              style={{
                                padding: '0.4rem',
                                borderRadius: '6px',
                                background: streamer.notificationsEnabled 
                                  ? 'rgba(59, 130, 246, 0.3)' 
                                  : 'rgba(59, 130, 246, 0.1)',
                                border: streamer.notificationsEnabled 
                                  ? '2px solid rgba(59, 130, 246, 0.6)' 
                                  : '1px solid rgba(59, 130, 246, 0.2)',
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
                              title={streamer.notificationsEnabled ? 'Desativar notificações' : 'Ativar notificações'}
                            >
                              <Bell size={14} fill={streamer.notificationsEnabled ? 'currentColor' : 'none'} className={bellIconClass} />
                            </button>

                            {/* Favorite Button */}
                            <button
                              onClick={() => onToggleFavorite(streamer.id)}
                              style={{
                                padding: '0.4rem',
                                borderRadius: '6px',
                                background: streamer.isFavorite 
                                  ? 'rgba(239, 68, 68, 0.3)' 
                                  : 'rgba(239, 68, 68, 0.1)',
                                border: streamer.isFavorite 
                                  ? '2px solid rgba(239, 68, 68, 0.6)' 
                                  : '1px solid rgba(239, 68, 68, 0.2)',
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
                              title={streamer.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            >
                              <Heart size={14} fill={streamer.isFavorite ? 'currentColor' : 'none'} className={heartIconClass} />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => setEditingStreamer(streamer)}
                              style={{
                                padding: '0.4rem',
                                borderRadius: '6px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                cursor: 'pointer',
                                color: '#3b82f6',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                              }}
                              title="Editar streamer"
                            >
                              <Edit size={14} className={editIconClass} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={async () => {
                                const result = await confirmDeleteStreamer(streamer.name);
                                if (result.isConfirmed) {
                                  onRemoveStreamer(streamer.id);
                                  showSuccessToast('Streamer Eliminado', `${streamer.name} foi removido com sucesso!`);
                                }
                              }}
                              style={{
                                padding: '0.4rem',
                                borderRadius: '6px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                cursor: 'pointer',
                                color: '#f87171',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                              }}
                              title="Remover streamer"
                            >
                              <Trash2 size={14} className={trashIconClass} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Platform Icons */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}>
                          {Object.entries(streamer.platforms).map(([platform, channelId]) => (
                            channelId && (
                              <div
                                key={platform}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '6px',
                                  backgroundColor: platform === 'twitch' ? 'rgba(145, 70, 255, 0.1)' : 
                                                 platform === 'youtube' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)',
                                  border: '1px solid',
                                  borderColor: platform === 'twitch' ? 'rgba(145, 70, 255, 0.2)' : 
                                             platform === 'youtube' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}
                              >
                                {platformIcons[platform as keyof typeof platformIcons]}
                                <span style={{
                                  color: platform === 'twitch' ? '#9146ff' : 
                                         platform === 'youtube' ? '#ff0000' : '#00ff00',
                                  textTransform: 'capitalize'
                                }}>
                                  {platform}
                                </span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Fixo */}
          <div style={{
            padding: '1rem 2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(147, 51, 234, 0.05)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              💡 Use as tabs acima para navegar entre as configurações
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              Total: {streamers.length} streamer{streamers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Streamer Modal */}
      {editingStreamer && (
        <EditStreamerModal
          isOpen={!!editingStreamer}
          onClose={() => setEditingStreamer(null)}
          streamer={editingStreamer}
          onUpdateStreamer={(updatedStreamer) => {
            onUpdateStreamer(updatedStreamer);
            setEditingStreamer(null);
          }}
        />
      )}
    </>
  );
}
