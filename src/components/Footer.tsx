export function Footer() {
  return (
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
            <a
              href="#"
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#9333ea'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
            >
              Sobre
            </a>
            <a
              href="#"
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#9333ea'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
            >
              Ajuda
            </a>
            <a
              href="#"
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#9333ea'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
            >
              Contato
            </a>
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
              © 2024 Multistream Hub
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
  );
}
