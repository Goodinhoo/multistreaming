import { Settings, Grid3X3, Plus } from 'lucide-react';
import { useAnimatedClassWithDuration, useHoverAnimation, useInfiniteAnimation } from '../hooks/useAnimatedClass';

interface HeaderProps {
  onAddStreamer: () => void;
  onOpenOptions: () => void;
  onOpenDashboard: () => void;
}

export function Header({ onAddStreamer, onOpenOptions, onOpenDashboard }: HeaderProps) {
  const animatedLogoClass = useAnimatedClassWithDuration('', 'animate__zoomIn', 500);
  const dashboardIconClass = useHoverAnimation('', 'icon-hover-tada');
  const settingsIconClass = useHoverAnimation('', 'icon-hover-jello');
  const plusIconClass = useHoverAnimation('', 'icon-hover-gentle');
  const addButtonPulseClass = useInfiniteAnimation('', 'animate__pulse', 2000);
  
  return (
    <header style={{
      background: 'rgba(15, 15, 35, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(147, 51, 234, 0.2)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Logo e Título */}
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
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 4px 12px rgba(147, 51, 234, 0.4)'
        }} className={animatedLogoClass}>
          📺
        </div>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            lineHeight: 1.2
          }}>
            Multistream Hub
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0,
            fontWeight: '500'
          }}>
            Gerencie seus streamers favoritos
          </p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* Botão Dashboard */}
        <button
          onClick={onOpenDashboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '10px',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
          }}
        >
          <Grid3X3 size={18} className={dashboardIconClass} />
          Dashboard
        </button>

        {/* Botão Opções */}
        <button
          onClick={onOpenOptions}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(107, 114, 128, 0.1)',
            border: '1px solid rgba(107, 114, 128, 0.2)',
            borderRadius: '10px',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
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
          <Settings size={18} className={settingsIconClass} />
          Opções
        </button>

        {/* Botão Adicionar Streamer */}
        <button
          onClick={onAddStreamer}
          className={addButtonPulseClass}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(147, 51, 234, 0.4)';
          }}
        >
          <Plus size={18} className={plusIconClass} />
          Adicionar Streamer
        </button>
      </div>
    </header>
  );
}
