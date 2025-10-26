import { useState, useEffect, useMemo } from 'react';
import { Bell, Heart } from 'lucide-react';
import type { Streamer, Platform } from '../types';
import type { AppSettings } from '../types/settings';
import { getKickPlayerUrl } from '../services/kickApi';
import { getStreamInfo, getTwitchStreamData, getKickStreamData } from '../services/api';
import { showSuccessToast } from '../services/sweetAlert';

interface StreamGridProps {
  streamers: Streamer[];
  selectedStreamer?: Streamer;
  viewingStreamers: Set<string>;
  settings: AppSettings;
  onToggleViewing?: (streamerId: string) => void;
  onToggleNotifications?: (streamerId: string) => void;
  onToggleFavorite?: (streamerId: string) => void;
}

// Função para gerar URLs de embed dos streams
const getStreamEmbedUrl = (platform: Platform, channelId: string): string => {
  const currentHost = window.location.hostname;
  switch (platform) {
    case 'twitch': {
      // URL simplificada como no site oficial da Twitch
      const parentParam = currentHost === 'localhost' || currentHost === '127.0.0.1' 
        ? `${currentHost}&parent=localhost&parent=127.0.0.1`
        : currentHost;
      return `https://player.twitch.tv/?channel=${channelId}&parent=${parentParam}&autoplay=true`;
    }
    case 'youtube':
      return `https://www.youtube.com/embed/${channelId}?autoplay=1&mute=0&controls=1&showinfo=0&rel=0`;
    case 'kick':
      return getKickPlayerUrl(channelId);
    default:
      return '';
  }
};

export function StreamGrid({ streamers, selectedStreamer, viewingStreamers, settings, onToggleViewing, onToggleNotifications, onToggleFavorite }: StreamGridProps) {
  // Estado para controlar qual plataforma está ativa para cada streamer
  const [activePlatforms, setActivePlatforms] = useState<Record<string, Platform>>({});
  
  // Estado para armazenar informações de stream por plataforma
  const [platformStreamInfo, setPlatformStreamInfo] = useState<Record<string, {
    platform: Platform;
    title: string;
    game: string;
    viewers: number;
    thumbnail: string;
  }>>({});
  
  // Filtrar apenas streamers que estão sendo visualizados
  const activeStreamers = streamers.filter(s => viewingStreamers.has(s.id));
  
  // Memoizar IDs dos streamers ativos e suas plataformas
  const streamerPlatformsKey = useMemo(() => {
    return activeStreamers.map(s => 
      `${s.id}-${s.platforms.twitch || ''}-${s.platforms.kick || ''}-${s.platforms.youtube || ''}`
    ).join('|');
  }, [activeStreamers]);
  
  // Inicializar plataforma ativa com prioridade: Twitch > Kick > YouTube
  useEffect(() => {
    const newActivePlatforms: Record<string, Platform> = {};
    activeStreamers.forEach(streamer => {
      // Se já tem uma plataforma ativa definida, mantém
      if (activePlatforms[streamer.id]) {
        return;
      }
      
      // Prioridade: Twitch primeiro, depois Kick, depois YouTube
      if (streamer.platforms.twitch && streamer.platforms.twitch.trim() !== '') {
        newActivePlatforms[streamer.id] = 'twitch';
      } else if (streamer.platforms.kick && streamer.platforms.kick.trim() !== '') {
        newActivePlatforms[streamer.id] = 'kick';
      } else if (streamer.platforms.youtube && streamer.platforms.youtube.trim() !== '') {
        newActivePlatforms[streamer.id] = 'youtube';
      } else if (streamer.streamInfo?.platform) {
        // Fallback para streamInfo se não tiver plataformas configuradas
        newActivePlatforms[streamer.id] = streamer.streamInfo.platform;
      }
    });
    
    // Só atualiza se houver novas plataformas para inicializar
    if (Object.keys(newActivePlatforms).length > 0) {
      setActivePlatforms(prev => ({ ...prev, ...newActivePlatforms }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamerPlatformsKey]);
  
  // Função para buscar informações da plataforma específica
  const fetchPlatformInfo = async (streamer: Streamer, platform: Platform) => {
    const channelId = streamer.platforms[platform];
    if (!channelId) return;
    
    const key = `${streamer.id}-${platform}`;
    
    try {
      let streamInfo = null;
      
      if (platform === 'twitch') {
        const data = await getTwitchStreamData(channelId);
        streamInfo = data.streamInfo;
      } else if (platform === 'kick') {
        const data = await getKickStreamData(channelId);
        streamInfo = data.streamInfo;
      } else {
        streamInfo = await getStreamInfo(platform, channelId);
      }
      
      if (streamInfo) {
        setPlatformStreamInfo(prev => ({
          ...prev,
          [key]: streamInfo!
        }));
      }
    } catch (error) {
      console.error(`Erro ao buscar info de ${platform}:`, error);
    }
  };
  
  // Função para trocar plataforma
  const handlePlatformSwitch = async (streamerId: string, platform: Platform) => {
    setActivePlatforms(prev => ({ ...prev, [streamerId]: platform }));
    
    // Buscar informações da nova plataforma
    const streamer = activeStreamers.find(s => s.id === streamerId);
    if (streamer) {
      await fetchPlatformInfo(streamer, platform);
    }
  };
  
  // Memoizar streamer IDs para evitar recálculos
  const streamerIdsKey = useMemo(() => {
    return activeStreamers.map(s => s.id).join(',');
  }, [activeStreamers]);
  
  // Buscar informações quando a plataforma ativa mudar ou quando streamer é adicionado
  useEffect(() => {
    activeStreamers.forEach(streamer => {
      const activePlatform = activePlatforms[streamer.id];
      if (activePlatform) {
        const key = `${streamer.id}-${activePlatform}`;
        // Só busca se não tiver cache
        if (!platformStreamInfo[key]) {
          fetchPlatformInfo(streamer, activePlatform);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlatforms, streamerIdsKey]);
  
  // Função para obter plataformas disponíveis (que têm channelId configurado e não vazio)
  const getAvailablePlatforms = (streamer: Streamer): Platform[] => {
    const available: Platform[] = [];
    if (streamer.platforms.twitch && streamer.platforms.twitch.trim() !== '') {
      available.push('twitch');
    }
    if (streamer.platforms.kick && streamer.platforms.kick.trim() !== '') {
      available.push('kick');
    }
    if (streamer.platforms.youtube && streamer.platforms.youtube.trim() !== '') {
      available.push('youtube');
    }
    return available;
  };
  
  // Função para obter o nome formatado da plataforma
  const getPlatformName = (platform: Platform): string => {
    switch (platform) {
      case 'twitch': return 'Twitch';
      case 'kick': return 'Kick';
      case 'youtube': return 'YouTube';
      default: return 'Live';
    }
  };
  
  // Função para obter a cor da plataforma
  const getPlatformColor = (platform: Platform): string => {
    switch (platform) {
      case 'twitch': return '#9146ff';
      case 'kick': return '#00ff00';
      case 'youtube': return '#ff0000';
      default: return '#10b981';
    }
  };
  
  // Calcular layout baseado nas configurações
  const getGridLayout = (count: number, gridLayout: string) => {
    // Se o usuário escolheu um layout específico
    if (gridLayout !== 'auto') {
      const layoutMap: Record<string, number> = {
        '2x2': 2,
        '3x3': 3,
        '4x4': 4
      };
      const columns = layoutMap[gridLayout] || 2;
      return { columns, height: `${100 / columns}%` };
    }
    
    // Layout automático baseado no número de streamers
    if (count === 0) return { columns: 1, height: '100%' };
    if (count === 1) return { columns: 1, height: '100%' };
    if (count === 2) return { columns: 2, height: '50%' };
    if (count === 3) return { columns: 2, height: '50%' }; // 2 em cima, 1 em baixo
    if (count === 4) return { columns: 2, height: '50%' };
    if (count === 5) return { columns: 3, height: '33.33%' };
    if (count === 6) return { columns: 3, height: '33.33%' };
    // Para 7+, manter mesma altura dos primeiros 6
    return { columns: 3, height: '33.33%' };
  };

  const layout = getGridLayout(activeStreamers.length, settings.gridLayout);

  return (
    <div style={{
      background: 'rgba(15, 15, 35, 0.4)',
      backdropFilter: 'blur(20px)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 5,
      minHeight: 0
    }}>
      {/* Streams Grid */}
      <div style={{
        flex: 1,
        padding: '1rem',
        overflow: 'hidden',
        minHeight: 0
      }}>
        {activeStreamers.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
            padding: '3rem 2rem'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              marginBottom: '2rem',
              animation: 'pulse 3s infinite'
            }}>📺</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 1rem 0'
            }}>Nenhum stream ativo</h3>
            <p style={{
              fontSize: '1rem',
              margin: '0 0 2rem 0',
              maxWidth: '400px',
              lineHeight: '1.6'
            }}>
              Adicione streamers e aguarde eles ficarem online para ver os streams aqui
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(147, 51, 234, 0.1)',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              borderRadius: '25px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              <span>💡</span>
              <span>Clique no botão + na sidebar para começar</span>
            </div>
          </div>
        ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
                gridAutoRows: '1fr',
                gap: '1rem',
                height: '100%',
                overflow: 'hidden',
                minHeight: 0
              }}>
            {activeStreamers.map((streamer) => (
              <div
                key={streamer.id}
                className="animate-fade-in"
                style={{
                  background: selectedStreamer?.id === streamer.id 
                    ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: selectedStreamer?.id === streamer.id 
                    ? '2px solid rgba(147, 51, 234, 0.6)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = selectedStreamer?.id === streamer.id 
                    ? 'rgba(147, 51, 234, 0.6)' 
                    : 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Stream Preview */}
                <div style={{
                  height: 'calc(100% - 100px)', // Ajustado para 100px (novo tamanho do footer)
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderRadius: '8px 8px 0 0',
                  minHeight: 0
                }}>
                  {/* Live Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    zIndex: 2
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      animation: 'pulse 1.5s infinite'
                    }} />
                    LIVE
                  </div>

                  {/* Platform Count Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    zIndex: 2
                  }}>
                    {streamer.platformCount} plataforma{streamer.platformCount !== 1 ? 's' : ''}
                  </div>

                  {streamer.status === 'online' && activePlatforms[streamer.id] && streamer.platforms[activePlatforms[streamer.id]] ? (
                    <>
                      <iframe
                        key={`${streamer.id}-${activePlatforms[streamer.id]}`}
                        src={getStreamEmbedUrl(activePlatforms[streamer.id], streamer.platforms[activePlatforms[streamer.id]]!)}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          borderRadius: '0',
                          zIndex: 2,
                          position: 'relative',
                          minWidth: '400px', // Requisito mínimo da Twitch para autoplay
                          minHeight: '300px' // Requisito mínimo da Twitch para autoplay
                        }}
                        allowFullScreen
                        allow="autoplay; picture-in-picture; fullscreen"
                        frameBorder="0"
                        scrolling="no"
                        title={`${streamer.name} - ${activePlatforms[streamer.id]} stream`}
                        onLoad={() => {
                          // Esconder loading quando iframe carregar
                          const loadingElement = document.getElementById(`loading-${streamer.id}`);
                          if (loadingElement) {
                            loadingElement.style.display = 'none';
                          }
                          
                          // Tentar iniciar autoplay via mensagens para o player Twitch
                          if (activePlatforms[streamer.id] === 'twitch') {
                            try {
                              const iframe = document.querySelector(`iframe[src*="channel=${streamer.platforms[activePlatforms[streamer.id]]}"]`) as HTMLIFrameElement;
                              if (iframe && iframe.contentWindow) {
                                // Aguardar mais tempo para o player estar completamente pronto
                                const tryAutoplay = () => {
                                  // Múltiplas tentativas com diferentes métodos
                                  const attempts = [
                                    { method: 'play' },
                                    { method: 'play', params: {} },
                                    { eventName: 'playVideo' },
                                    { eventName: 'play', params: {} }
                                  ];
                                  
                                  attempts.forEach((msg, index) => {
                                    setTimeout(() => {
                                      iframe.contentWindow?.postMessage(msg, 'https://player.twitch.tv');
                                    }, index * 300);
                                  });
                                };
                                
                                // Tentar após 2 segundos e depois a cada 2 segundos
                                setTimeout(tryAutoplay, 2000);
                                setTimeout(tryAutoplay, 4000);
                                setTimeout(tryAutoplay, 6000);
                              }
                            } catch (error) {
                              console.log('Erro ao tentar iniciar autoplay:', error);
                            }
                          }
                        }}
                        onError={() => {
                          // Mostrar mensagem de erro se iframe falhar
                          const loadingElement = document.getElementById(`loading-${streamer.id}`);
                          if (loadingElement) {
                            loadingElement.innerHTML = `
                              <div style="text-align: center; color: #f87171;">
                                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚠️</div>
                                <div style="font-size: 0.875rem;">Stream não disponível</div>
                                <div style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.8;">
                                  Clique no botão abaixo para assistir
                                </div>
                              </div>
                            `;
                          }
                        }}
                      />
                      {/* Loading indicator */}
                      <div
                        id={`loading-${streamer.id}`}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '1rem',
                          color: 'white',
                          zIndex: 10
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          border: '3px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '3px solid #9333ea',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                          Carregando stream...
                        </span>
                      </div>
                    </>
                  ) : null}
                  
                  {/* Placeholder quando offline */}
                  <div style={{
                    textAlign: 'center',
                    color: 'white',
                    zIndex: 1,
                    display: streamer.status === 'offline' ? 'flex' : 'none',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}>
                    <div style={{
                      fontSize: '4rem',
                      marginBottom: '1rem',
                      filter: 'drop-shadow(0 0 20px rgba(107, 114, 128, 0.5))'
                    }}>⚫</div>
                    <p style={{
                      fontSize: '1rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: '500',
                      margin: '0 0 0.5rem 0'
                    }}>Streamer Offline</p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      margin: 0
                    }}>Aguardando streamer ficar online</p>
                  </div>

                </div>

                {/* Stream Info - Footer Separado */}
                <div style={{
                  height: '100px', // Aumentado de 80px para 100px
                  background: 'rgba(15, 15, 35, 0.9)',
                  backdropFilter: 'blur(10px)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0 0 8px 8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {/* Linha Superior: Título + Botão de Notificações */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    {/* Stream Title */}
                    {(() => {
                      const activePlatform = activePlatforms[streamer.id];
                      const platformKey = activePlatform ? `${streamer.id}-${activePlatform}` : null;
                      const currentStreamInfo = platformKey && platformStreamInfo[platformKey] 
                        ? platformStreamInfo[platformKey] 
                        : streamer.streamInfo;
                      
                      return currentStreamInfo?.title ? (
                        <h3 style={{
                          fontSize: '0.8rem',
                          color: 'white',
                          fontWeight: '600',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.2',
                          flex: 1,
                          paddingRight: '0.5rem'
                        }}>
                          {currentStreamInfo.title}
                        </h3>
                      ) : null;
                    })()}
                    
                    {/* Botões de Notificações e Favoritos */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginLeft: 'auto'
                    }}>
                      {/* Botão de Notificações */}
                      {onToggleNotifications && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const wasEnabled = streamer.notificationsEnabled;
                            onToggleNotifications(streamer.id);
                            // Mostrar toast com o valor ANTES do toggle
                            showSuccessToast('Notificações', `Notificações para ${streamer.name} foram ${wasEnabled ? 'desativadas' : 'ativadas'}!`);
                          }}
                          style={{
                            background: streamer.notificationsEnabled 
                              ? 'rgba(59, 130, 246, 0.3)' 
                              : 'rgba(59, 130, 246, 0.15)',
                            border: streamer.notificationsEnabled 
                              ? '1.5px solid rgba(59, 130, 246, 0.6)' 
                              : '1.5px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: streamer.notificationsEnabled ? '#93c5fd' : '#3b82f6',
                            transition: 'all 0.2s ease',
                            padding: 0,
                            flexShrink: 0,
                            boxShadow: streamer.notificationsEnabled 
                              ? '0 2px 8px rgba(59, 130, 246, 0.3)' 
                              : '0 2px 8px rgba(59, 130, 246, 0.15)',
                            backdropFilter: 'blur(10px)',
                            lineHeight: '1',
                            margin: 0
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.4)';
                            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.8)';
                            e.currentTarget.style.transform = 'scale(1.08)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = streamer.notificationsEnabled 
                              ? 'rgba(59, 130, 246, 0.3)' 
                              : 'rgba(59, 130, 246, 0.15)';
                            e.currentTarget.style.borderColor = streamer.notificationsEnabled 
                              ? '1.5px solid rgba(59, 130, 246, 0.6)' 
                              : '1.5px solid rgba(59, 130, 246, 0.3)';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = streamer.notificationsEnabled 
                              ? '0 2px 8px rgba(59, 130, 246, 0.3)' 
                              : '0 2px 8px rgba(59, 130, 246, 0.15)';
                          }}
                          title={streamer.notificationsEnabled ? 'Desativar notificações' : 'Ativar notificações'}
                        >
                          <Bell size={16} fill={streamer.notificationsEnabled ? 'currentColor' : 'none'} />
                        </button>
                      )}
                      
                      {/* Botão de Favoritos */}
                      {onToggleFavorite && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const wasFavorite = streamer.isFavorite;
                            onToggleFavorite(streamer.id);
                            // Mostrar toast com o valor ANTES do toggle
                            showSuccessToast('Favoritos', `${streamer.name} foi ${wasFavorite ? 'removido dos' : 'adicionado aos'} favoritos!`);
                          }}
                          style={{
                            background: streamer.isFavorite 
                              ? 'rgba(236, 72, 153, 0.3)' 
                              : 'rgba(236, 72, 153, 0.15)',
                            border: streamer.isFavorite 
                              ? '1.5px solid rgba(236, 72, 153, 0.6)' 
                              : '1.5px solid rgba(236, 72, 153, 0.3)',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: streamer.isFavorite ? '#f9a8d4' : '#ec4899',
                            transition: 'all 0.2s ease',
                            padding: 0,
                            flexShrink: 0,
                            boxShadow: streamer.isFavorite 
                              ? '0 2px 8px rgba(236, 72, 153, 0.3)' 
                              : '0 2px 8px rgba(236, 72, 153, 0.15)',
                            backdropFilter: 'blur(10px)',
                            lineHeight: '1',
                            margin: 0
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(236, 72, 153, 0.4)';
                            e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.8)';
                            e.currentTarget.style.transform = 'scale(1.08)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = streamer.isFavorite 
                              ? 'rgba(236, 72, 153, 0.3)' 
                              : 'rgba(236, 72, 153, 0.15)';
                            e.currentTarget.style.borderColor = streamer.isFavorite 
                              ? '1.5px solid rgba(236, 72, 153, 0.6)' 
                              : '1.5px solid rgba(236, 72, 153, 0.3)';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = streamer.isFavorite 
                              ? '0 2px 8px rgba(236, 72, 153, 0.3)' 
                              : '0 2px 8px rgba(236, 72, 153, 0.15)';
                          }}
                          title={streamer.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          <Heart size={16} fill={streamer.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Viewers e Game */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {(() => {
                        const activePlatform = activePlatforms[streamer.id];
                        const platformKey = activePlatform ? `${streamer.id}-${activePlatform}` : null;
                        const currentStreamInfo = platformKey && platformStreamInfo[platformKey] 
                          ? platformStreamInfo[platformKey] 
                          : streamer.streamInfo;
                        
                        return (
                          <>
                            {currentStreamInfo?.viewers !== undefined && currentStreamInfo.viewers > 0 && (
                              <span style={{
                                fontSize: '0.875rem',
                                color: '#10b981',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: '#10b981',
                                  animation: 'pulse 2s infinite'
                                }} />
                                {currentStreamInfo.viewers.toLocaleString()} viewers
                              </span>
                            )}
                            
                            {currentStreamInfo?.game && (
                              <span style={{
                                fontSize: '0.875rem',
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                🎮 {currentStreamInfo.game}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    
                    {/* Plataformas e Botão X */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginLeft: 'auto'
                    }}>
                      {/* Botões de Plataforma */}
                      {getAvailablePlatforms(streamer).map((platform) => {
                        const isActive = activePlatforms[streamer.id] === platform;
                        return (
                          <button
                            key={platform}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlatformSwitch(streamer.id, platform);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.4rem 0.75rem',
                              background: isActive 
                                ? `rgba(${platform === 'twitch' ? '145, 70, 255' : platform === 'kick' ? '0, 255, 0' : '255, 0, 0'}, 0.3)`
                                : 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              height: '32px',
                              border: isActive
                                ? `1px solid ${getPlatformColor(platform)}`
                                : '1px solid rgba(255, 255, 255, 0.2)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              fontSize: '0.75rem',
                              color: 'white',
                              fontWeight: '600',
                              textTransform: 'capitalize'
                            }}
                            onMouseOver={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                              }
                            }}
                            title={`Trocar para ${getPlatformName(platform)}`}
                          >
                            <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isActive ? getPlatformColor(platform) : '#10b981',
                              animation: isActive ? 'pulse 1.5s infinite' : 'none'
                            }} />
                            {getPlatformName(platform)}
                          </button>
                        );
                      })}
                      
                      {/* Botão X para fechar */}
                      {onToggleViewing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleViewing(streamer.id);
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.25)',
                            border: '1.5px solid rgba(239, 68, 68, 0.5)',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#fff',
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            transition: 'all 0.2s ease',
                            padding: 0,
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                            backdropFilter: 'blur(10px)',
                            lineHeight: '1',
                            margin: 0
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#ef4444';
                            e.currentTarget.style.borderColor = '#dc2626';
                            e.currentTarget.style.transform = 'scale(1.08)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.color = '#fff';
                          }}
                          title="Fechar stream"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
