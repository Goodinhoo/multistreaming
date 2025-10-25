interface KickChatEmbedProps {
  channel: string;
  streamerName: string;
}

export function KickChatEmbed({ channel, streamerName }: KickChatEmbedProps) {
  const kickChatPopoutUrl = `https://kick.com/popout/${channel}/chat`;

  const openChatPopup = () => {
    window.open(
      kickChatPopoutUrl, 
      `kick-chat-${channel}`,
      'width=400,height=700,menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes'
    );
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '2rem',
      textAlign: 'center',
      gap: '2rem'
    }}>
      {/* Ícone */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 204, 0, 0.2) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4rem',
        marginBottom: '1rem',
        animation: 'pulse 3s infinite'
      }}>
        💬
      </div>

      {/* Título */}
      <div>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          margin: '0 0 0.5rem 0',
          background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Chat do Kick - {streamerName}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.6)',
          margin: 0
        }}>
          Canal: {channel}
        </p>
      </div>

      {/* Explicação */}
      <div style={{
        maxWidth: '400px',
        padding: '1.5rem',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 0, 0.2)'
      }}>
        <p style={{
          fontSize: '0.95rem',
          color: 'rgba(255, 255, 255, 0.9)',
          margin: '0 0 1rem 0',
          lineHeight: '1.6'
        }}>
          O chat do Kick funciona melhor em uma <strong style={{ color: '#00ff00' }}>janela popup separada</strong>.
        </p>
        <p style={{
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.7)',
          margin: 0,
          lineHeight: '1.5'
        }}>
          Você poderá ver e enviar mensagens, usar emotes e interagir normalmente com o chat!
        </p>
      </div>

      {/* Botão principal */}
      <button
        onClick={openChatPopup}
        style={{
          background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
          color: 'black',
          border: 'none',
          borderRadius: '12px',
          padding: '1rem 2.5rem',
          fontSize: '1rem',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          boxShadow: '0 8px 20px rgba(0, 255, 0, 0.3)',
          transition: 'all 0.3s ease',
          minWidth: '280px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 255, 0, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 255, 0, 0.3)';
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>💬</span>
        <span>Abrir Chat do Kick</span>
      </button>

      {/* Dica */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem 1.5rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        fontSize: '0.8rem',
        color: 'rgba(255, 255, 255, 0.6)',
        maxWidth: '350px',
        lineHeight: '1.5',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <strong style={{ color: 'rgba(255, 255, 255, 0.8)' }}>💡 Dica:</strong> Posicione a janela do chat ao lado do stream para a melhor experiência de multistreaming!
      </div>
    </div>
  );
}

