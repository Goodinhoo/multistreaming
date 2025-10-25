import type { Streamer, Platform } from '../types';

interface StreamGridProps {
  streamers: Streamer[];
  selectedStreamer?: Streamer;
  viewingStreamers: Set<string>;
}

// Função para gerar URLs de embed dos streams
const getStreamEmbedUrl = (platform: Platform, channelId: string): string => {
  const currentHost = window.location.hostname;
  switch (platform) {
    case 'twitch':
      return `https://player.twitch.tv/?channel=${channelId}&parent=${currentHost}&parent=localhost&parent=127.0.0.1&autoplay=true&muted=false&allowfullscreen=true`;
    case 'youtube':
      return `https://www.youtube.com/embed/${channelId}?autoplay=1&mute=0&controls=1&showinfo=0&rel=0`;
    case 'kick':
      return `https://kick.com/${channelId}/embed`;
    default:
      return '';
  }
};

export function StreamGrid({ streamers, selectedStreamer, viewingStreamers }: StreamGridProps) {
  // Filtrar apenas streamers que estão sendo visualizados
  const activeStreamers = streamers.filter(s => viewingStreamers.has(s.id));
  
  // Calcular layout dinâmico baseado no número de streamers ativos
  const getGridLayout = (count: number) => {
    if (count === 0) return { columns: 1, height: '100%' };
    if (count === 1) return { columns: 1, height: '100%' };
    if (count === 2) return { columns: 2, height: '50%' };
    if (count === 3) return { columns: 2, height: '50%' }; // 2 em cima, 1 em baixo
    if (count === 4) return { columns: 2, height: '50%' };
    return { columns: Math.ceil(Math.sqrt(count)), height: `${100 / Math.ceil(Math.sqrt(count))}%` };
  };

  const layout = getGridLayout(activeStreamers.length);

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
                  cursor: 'pointer'
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

                  {streamer.status === 'online' && streamer.streamInfo ? (
                    <>
                      <iframe
                        src={getStreamEmbedUrl(streamer.streamInfo.platform, streamer.platforms[streamer.streamInfo.platform]!)}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          borderRadius: '0',
                          zIndex: 2,
                          position: 'relative'
                        }}
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                        frameBorder="0"
                        scrolling="no"
                        title={`${streamer.name} - ${streamer.streamInfo.platform} stream`}
                        onLoad={() => {
                          // Esconder loading quando iframe carregar
                          const loadingElement = document.getElementById(`loading-${streamer.id}`);
                          if (loadingElement) {
                            loadingElement.style.display = 'none';
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
                  justifyContent: 'center'
                }}>
                  {/* Stream Title */}
                  {streamer.streamInfo?.title && (
                    <h3 style={{
                      fontSize: '0.8rem', // Reduzido de 0.9rem para 0.8rem
                      color: 'white',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.2' // Adicionado line-height para melhor espaçamento
                    }}>
                      {streamer.streamInfo.title}
                    </h3>
                  )}
                  
                  {/* Viewers e Game */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {streamer.streamInfo?.viewers && (
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
                          {streamer.streamInfo.viewers.toLocaleString()} viewers
                        </span>
                      )}
                      
                      {streamer.streamInfo?.game && (
                        <span style={{
                          fontSize: '0.875rem',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          🎮 {streamer.streamInfo.game}
                        </span>
                      )}
                    </div>
                    
                    {/* Platform Indicator */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        animation: 'pulse 1.5s infinite'
                      }} />
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'white',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {streamer.streamInfo?.platform || 'Live'}
                      </span>
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
