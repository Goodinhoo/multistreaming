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
      padding: 'clamp(1rem, 2vw, 1.5rem)',
      textAlign: 'center',
      gap: 'clamp(0.75rem, 1.5vw, 1.25rem)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Ícone */}
      <div style={{
        width: 'clamp(50px, 8vw, 70px)',
        height: 'clamp(50px, 8vw, 70px)',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 204, 0, 0.2) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'clamp(2rem, 5vw, 2.5rem)',
        animation: 'pulse 3s infinite',
        flexShrink: 0
      }}>
        💬
      </div>

      {/* Título */}
      <div style={{ width: '100%', maxWidth: 'min(90%, 500px)' }}>
        <h3 style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
          fontWeight: '700',
          margin: 0,
          background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}>
          Chat do Kick - {streamerName}
        </h3>
      </div>

      {/* Explicação */}
      <div style={{
        maxWidth: 'min(90%, 500px)',
        width: '100%',
        padding: 'clamp(0.875rem, 1.5vw, 1.25rem)',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 0, 0.2)',
        boxSizing: 'border-box'
      }}>
        <p style={{
          fontSize: 'clamp(0.8rem, 1.3vw, 0.9rem)',
          color: 'rgba(255, 255, 255, 0.9)',
          margin: '0 0 0.75rem 0',
          lineHeight: '1.5',
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}>
          O chat do Kick funciona melhor em uma <strong style={{ color: '#00ff00' }}>janela popup separada</strong>.
        </p>
        <p style={{
          fontSize: 'clamp(0.75rem, 1.2vw, 0.8rem)',
          color: 'rgba(255, 255, 255, 0.7)',
          margin: 0,
          lineHeight: '1.4',
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
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
          borderRadius: '10px',
          padding: 'clamp(0.65rem, 1.5vw, 0.85rem) clamp(1.25rem, 3vw, 2rem)',
          fontSize: 'clamp(0.8rem, 1.3vw, 0.95rem)',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 15px rgba(0, 255, 0, 0.4)',
          transition: 'all 0.3s ease',
          minWidth: 'clamp(200px, 70%, 250px)',
          maxWidth: '85%',
          width: 'auto',
          whiteSpace: 'nowrap'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 255, 0, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 255, 0, 0.4)';
        }}
      >
        <span style={{ fontSize: 'clamp(1rem, 1.8vw, 1.25rem)' }}>💬</span>
        <span>Abrir Chat do Kick</span>
      </button>

      {/* Dica */}
      <div style={{
        padding: 'clamp(0.6rem, 1.5vw, 0.85rem) clamp(0.85rem, 2vw, 1.25rem)',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        fontSize: 'clamp(0.7rem, 1.1vw, 0.75rem)',
        color: 'rgba(255, 255, 255, 0.6)',
        maxWidth: 'min(90%, 400px)',
        width: '100%',
        lineHeight: '1.4',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxSizing: 'border-box',
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}>
        <strong style={{ color: 'rgba(255, 255, 255, 0.8)' }}>💡 Dica:</strong> Posicione a janela do chat ao lado do stream para a melhor experiência de multistreaming!
      </div>
    </div>
  );
}

