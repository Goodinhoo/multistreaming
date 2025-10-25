import { useState } from 'react';

export function Footer() {
  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const handleOpenDiscord = () => {
    // Abrir Discord no navegador ou app
    // Se o usuário tem o Discord instalado, vai abrir o app
    // Caso contrário, abre no navegador
    const discordUsername = 'goodinhoo';
    
    // Tentar protocolo do Discord app primeiro
    try {
      window.location.href = `discord://users/${discordUsername}`;
    } catch {
      // Se falhar, abre no navegador
      window.open(`https://discord.com/users/${discordUsername}`, '_blank');
    }
    
    // Fallback para web após um pequeno delay
    setTimeout(() => {
      window.open(`https://discord.com/users/${discordUsername}`, '_blank');
    }, 300);
  };

  return (
    <>
      <footer style={{
        background: 'rgba(15, 15, 35, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '1.5rem 2rem',
        marginTop: 'auto',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Informações do Projeto */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <div>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 0.25rem 0'
              }}>
                Multistream Hub
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: 0
              }}>
                Plataforma para gerenciar múltiplos streamers
              </p>
            </div>
            
            <div style={{
              height: '30px',
              width: '1px',
              background: 'rgba(255, 255, 255, 0.2)'
            }} />
            
            <div>
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: '0 0 0.25rem 0'
              }}>
                Suporta
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#9146ff',
                  fontWeight: '500'
                }}>Twitch</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#ff0000',
                  fontWeight: '500'
                }}>YouTube</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#00ff00',
                  fontWeight: '500'
                }}>Kick</span>
              </div>
            </div>
          </div>

          {/* Links e Informações */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowAbout(true)}
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#9333ea'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
              >
                Sobre
              </button>
              <button
                onClick={() => setShowHelp(true)}
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#9333ea'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
              >
                Ajuda
              </button>
              <button
                onClick={() => setShowContact(true)}
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#9333ea'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
              >
                Contato
              </button>
            </div>
          
          <div style={{
            height: '30px',
            width: '1px',
            background: 'rgba(255, 255, 255, 0.2)'
          }} />
          
          <div style={{
            textAlign: 'right'
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: '0 0 0.25rem 0'
            }}>
              © 2025 Multistream Hub
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0
            }}>
              Feito com ❤️ para a comunidade
            </p>
          </div>
        </div>
      </div>
    </footer>

    {/* Modal Sobre */}
    {showAbout && (
      <div
        onClick={() => setShowAbout(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(15, 15, 35, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}
        >
          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: '0 0 1rem 0'
          }}>
            Sobre o Multistream Hub
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            margin: '0 0 1rem 0'
          }}>
            O Multistream Hub é uma plataforma desenvolvida para facilitar o acompanhamento de múltiplos streamers simultaneamente nas principais plataformas de streaming.
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            margin: '0 0 1rem 0'
          }}>
            <strong style={{ color: 'white' }}>Funcionalidades principais:</strong>
          </p>
          <ul style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            lineHeight: '1.8',
            margin: '0 0 1rem 0',
            paddingLeft: '1.5rem'
          }}>
            <li>Visualize múltiplos streams ao mesmo tempo</li>
            <li>Suporte para Twitch e Kick (YouTube em breve)</li>
            <li>Troca fácil entre plataformas</li>
            <li>Chat integrado para cada plataforma</li>
            <li>Notificações quando streamers ficam online</li>
          </ul>
          <button
            onClick={() => setShowAbout(false)}
            style={{
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              width: '100%'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Fechar
          </button>
        </div>
      </div>
    )}

    {/* Modal Ajuda */}
    {showHelp && (
      <div
        onClick={() => setShowHelp(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(15, 15, 35, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}
        >
          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: '0 0 1rem 0'
          }}>
            Ajuda
          </h2>
          <div style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            lineHeight: '1.8'
          }}>
            <p style={{ margin: '0 0 1rem 0' }}>
              <strong style={{ color: 'white' }}>Como adicionar um streamer:</strong><br />
              Clique no botão "+" na sidebar e digite o nome do streamer ou o canal da plataforma.
            </p>
            <p style={{ margin: '0 0 1rem 0' }}>
              <strong style={{ color: 'white' }}>Como visualizar um stream:</strong><br />
              Clique no card do streamer na sidebar para abrir o visualizador.
            </p>
            <p style={{ margin: '0 0 1rem 0' }}>
              <strong style={{ color: 'white' }}>Trocar entre plataformas:</strong><br />
              Se o streamer estiver em múltiplas plataformas, clique nos botões "Twitch" ou "Kick" no footer do visualizador.
            </p>
            <p style={{ margin: '0 0 1rem 0' }}>
              <strong style={{ color: 'white' }}>Fechar um stream:</strong><br />
              Clique no botão "X" no canto direito do footer do visualizador ou clique novamente no card do streamer.
            </p>
            <p style={{ margin: '0 0 1rem 0' }}>
              <strong style={{ color: 'white' }}>Chat do Kick:</strong><br />
              O chat do Kick abre em uma janela popup separada para melhor experiência.
            </p>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            style={{
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              width: '100%'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Fechar
          </button>
        </div>
      </div>
    )}

    {/* Modal Contato */}
    {showContact && (
      <div
        onClick={() => setShowContact(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(15, 15, 35, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}
        >
          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: '0 0 1rem 0'
          }}>
            Contato
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            margin: '0 0 1rem 0'
          }}>
            Precisa de ajuda, encontrou um bug ou tem alguma sugestão? Estou sempre aberto para feedback e melhorias!
          </p>
          <div style={{
            background: 'rgba(147, 51, 234, 0.1)',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem'
          }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.8rem',
              lineHeight: '1.5',
              margin: 0
            }}>
              💡 <strong style={{ color: 'white' }}>Dica:</strong> Este projeto é open source e está em constante desenvolvimento. Sua opinião é muito importante!
            </p>
          </div>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.85rem',
            lineHeight: '1.5',
            margin: '0 0 1.5rem 0'
          }}>
            Entre em contato através do Discord clicando no botão abaixo:
          </p>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: '0 0 0.5rem 0'
            }}>
              Discord Username
            </p>
            <p style={{
              fontSize: '1.25rem',
              color: '#5865F2',
              fontWeight: '600',
              margin: '0 0 1rem 0',
              fontFamily: 'monospace'
            }}>
              goodinhoo
            </p>
            <button
              onClick={handleOpenDiscord}
              style={{
                background: 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(88, 101, 242, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>💬</span>
              <span>Abrir Discord</span>
            </button>
          </div>
          <button
            onClick={() => setShowContact(false)}
            style={{
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              width: '100%'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Fechar
          </button>
        </div>
      </div>
    )}
    </>
  );
}
