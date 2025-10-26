import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { AddStreamModal } from './components/AddStreamModal';
import { OptionsModal } from './components/OptionsModal';
import { DashboardModal } from './components/DashboardModal';
import { StreamGrid } from './components/StreamGrid';
import { ChatPanel, AvatarButton } from './components/ChatPanel';
import type { Streamer, Platform } from './types';
import { useSettings } from './hooks/useSettings';
import { checkStreamStatus, getStreamInfo, getTwitchStreamData, getKickStreamData } from './services/api';
import { showSuccessToast } from './services/sweetAlert';

import './App.css';

// Ref para rastrear áudios em reprodução e evitar múltiplas reproduções
const activeAudios = new Set<HTMLAudioElement>();

// Função para tocar som de notificação
const playNotificationSound = (volume: number = 50, soundFile: string = 'notification.wav') => {
  try {
    // Limpar áudios que já terminaram
    activeAudios.forEach(audio => {
      if (audio.ended || audio.paused) {
        activeAudios.delete(audio);
      }
    });
    
    // Tentar carregar arquivo de som personalizado
    const audioPath = `/sounds/${soundFile}`;
    const audio = new Audio(audioPath);
    audio.volume = volume / 100;
    
    // Adicionar ao conjunto de áudios ativos
    activeAudios.add(audio);
    
    // Limpar quando terminar
    audio.addEventListener('ended', () => {
      activeAudios.delete(audio);
    });
    
    audio.addEventListener('error', () => {
      activeAudios.delete(audio);
      // Se falhar, tentar formato padrão ou fallback
      if (soundFile !== 'notification.wav') {
        playNotificationSound(volume, 'notification.wav');
      } else {
        playFallbackSound(volume);
      }
    });
    
    audio.play().catch(() => {
      activeAudios.delete(audio);
      // Tentar fallback se não conseguir tocar
      playFallbackSound(volume);
    });
    
  } catch (err) {
    console.error('Erro ao carregar som:', err);
    playFallbackSound(volume);
  }
};

// Função fallback para criar som programaticamente
const playFallbackSound = (volume: number) => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume / 100 * 0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (err) {
    console.error('Erro ao tocar som de fallback:', err);
  }
};

// Expor função globalmente para teste
declare global {
  interface Window {
    testNotificationSound?: (soundFile?: string, volume?: number) => void;
  }
}
window.testNotificationSound = (soundFile?: string, volume?: number) => {
  playNotificationSound(volume || 50, soundFile || 'notification.wav');
};

// Função para determinar a plataforma prioritária para avatar e status
const getPriorityPlatform = (platforms: Partial<Record<Platform, string>>) => {
  // Prioridade: Twitch > Kick > YouTube
  if (platforms.twitch) return 'twitch';
  if (platforms.kick) return 'kick';
  if (platforms.youtube) return 'youtube';
  return null;
};

// Função para verificar status com prioridade (otimizada)
const checkStreamerStatusWithPriority = async (streamer: Streamer) => {
  const priorityPlatform = getPriorityPlatform(streamer.platforms);
  if (!priorityPlatform) return { ...streamer, status: 'offline' as const };

  let isOnline = false;
  let streamInfo = null;

  // Verificar primeiro a plataforma prioritária
  const priorityChannelId = streamer.platforms[priorityPlatform];
  if (priorityChannelId) {
    try {
      if (priorityPlatform === 'twitch') {
        // Usar função otimizada para Twitch
        const data = await getTwitchStreamData(priorityChannelId);
        isOnline = data.isOnline;
        streamInfo = data.streamInfo;
      } else if (priorityPlatform === 'kick') {
        // Usar função otimizada para Kick
        const data = await getKickStreamData(priorityChannelId);
        isOnline = data.isOnline;
        streamInfo = data.streamInfo;
      } else {
        // Para outras plataformas, usar método original
        const isLive = await checkStreamStatus(priorityPlatform, priorityChannelId);
        if (isLive) {
          isOnline = true;
          const info = await getStreamInfo(priorityPlatform, priorityChannelId);
          if (info) {
            streamInfo = { ...info };
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao verificar ${priorityPlatform}:`, error);
    }
  }

  // Se não estiver online na plataforma prioritária, verificar as outras
  if (!isOnline) {
    const platformsToCheck = Object.entries(streamer.platforms).filter(
      ([platform]) => platform !== priorityPlatform
    );

    for (const [platform, channelId] of platformsToCheck) {
      if (channelId) {
        try {
          const isLive = await checkStreamStatus(platform as Platform, channelId);
          if (isLive) {
            isOnline = true;
            const info = await getStreamInfo(platform as Platform, channelId);
            if (info) {
              streamInfo = { ...info };
              break;
            }
          }
        } catch (error) {
          console.error(`Erro ao verificar ${platform}:`, error);
        }
      }
    }
  }

  // Determinar avatar baseado na plataforma prioritária
  let updatedAvatar = streamer.avatar;
  if (priorityPlatform && streamer.platforms[priorityPlatform]) {
    // Se temos uma plataforma prioritária, usar o avatar dessa plataforma
    // O avatar já deve estar correto do fetchPlatformPreview
    updatedAvatar = streamer.avatar;
  }

  return {
    ...streamer,
    status: isOnline ? 'online' as const : 'offline' as const,
    streamInfo: streamInfo || undefined,
    avatar: updatedAvatar
  };
};

function App() {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [selectedStreamers, setSelectedStreamers] = useState<Streamer[]>([]);
  const [activeChatStreamerId, setActiveChatStreamerId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [chatVisible, setChatVisible] = useState(true);
  const DEFAULT_SIDEBAR_WIDTH = 350;
  const DEFAULT_CHAT_WIDTH = 350;
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const [isResizing, setIsResizing] = useState<'sidebar' | 'chat' | null>(null);
  const [hoveredResizer, setHoveredResizer] = useState<'sidebar' | 'chat' | null>(null);
  
  // Verificar se as larguras foram alteradas do padrão
  const sidebarWidthChanged = sidebarWidth !== DEFAULT_SIDEBAR_WIDTH;
  const chatWidthChanged = chatWidth !== DEFAULT_CHAT_WIDTH;
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);
  const { settings, updateSettings } = useSettings();
  const intervalRef = useRef<number | null>(null);
  const selectedStreamersRef = useRef(selectedStreamers);
  
  // Função para resetar larguras ao padrão
  const resetColumnWidth = useCallback((type: 'sidebar' | 'chat') => {
    if (type === 'sidebar') {
      setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    } else {
      setChatWidth(DEFAULT_CHAT_WIDTH);
    }
  }, []);
  
  // Handler para iniciar redimensionamento
  const handleResizeStart = useCallback((type: 'sidebar' | 'chat', e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(type);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = type === 'sidebar' ? sidebarWidth : chatWidth;
  }, [sidebarWidth, chatWidth]);
  
  // Handler de mouse move global
  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing === 'sidebar') {
        // Sidebar à esquerda (chat à direita): arrastar para direita aumenta (diff positivo)
        // Sidebar à direita (chat à esquerda): arrastar para esquerda aumenta (diff negativo vira positivo)
        const diff = settings.chatPosition === 'right' 
          ? e.clientX - resizeStartX.current // Normal: arrastar para direita aumenta
          : resizeStartX.current - e.clientX; // Invertido: arrastar para esquerda aumenta
        const newWidth = Math.max(250, Math.min(600, resizeStartWidth.current + diff));
        setSidebarWidth(newWidth);
      } else if (isResizing === 'chat') {
        // Para chat à direita: arrastar para esquerda aumenta (diff negativo vira positivo)
        // Para chat à esquerda: arrastar para direita aumenta (diff positivo)
        const diff = settings.chatPosition === 'right' 
          ? resizeStartX.current - e.clientX // Invertido: arrastar para esquerda aumenta
          : e.clientX - resizeStartX.current; // Normal: arrastar para direita aumenta
        const newWidth = Math.max(250, Math.min(600, resizeStartWidth.current + diff));
        setChatWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(null);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, settings.chatPosition]);
  
  // Atualizar ref quando selectedStreamers muda
  useEffect(() => {
    selectedStreamersRef.current = selectedStreamers;
  }, [selectedStreamers]);
  
  // Inicializar chat ativo quando streamers são selecionados
  useEffect(() => {
    if (selectedStreamers.length > 0 && !activeChatStreamerId) {
      setActiveChatStreamerId(selectedStreamers[0].id);
    } else if (selectedStreamers.length === 0) {
      setActiveChatStreamerId(null);
    } else if (activeChatStreamerId && !selectedStreamers.some(s => s.id === activeChatStreamerId)) {
      // Se o chat ativo não está mais na lista de selecionados, mudar para o primeiro
      setActiveChatStreamerId(selectedStreamers[0].id);
    }
  }, [selectedStreamers, activeChatStreamerId]);
  
  // Verificar e corrigir limite de visualizadores quando o limite muda
  useEffect(() => {
    const currentStreamers = selectedStreamersRef.current;
    if (currentStreamers.length > settings.maxViewers) {
      const limitedStreamers = currentStreamers.slice(0, settings.maxViewers);
      setSelectedStreamers(limitedStreamers);
      showSuccessToast('Limite Corrigido', `Limite de ${settings.maxViewers} streams aplicado. ${currentStreamers.length - settings.maxViewers} stream(s) foi(ram) fechado(s).`);
    }
  }, [settings.maxViewers]); // Só executa quando o limite muda

  // Controlar animações e modo compacto
  useEffect(() => {
    if (settings.animations) {
      document.body.classList.remove('animations-disabled');
      document.body.classList.add('animations-enabled');
    } else {
      document.body.classList.remove('animations-enabled');
      document.body.classList.add('animations-disabled');
    }
    
    if (settings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [settings.animations, settings.compactMode]);
  
  // Debug: Verificar localStorage
  useEffect(() => {
    const savedStreamers = localStorage.getItem('streamers');
    const backupStreamers = localStorage.getItem('streamers_backup');
    
    console.log('🔍 Streamers no localStorage:', savedStreamers);
    console.log('🔍 Backup no localStorage:', backupStreamers);
    
    if (savedStreamers) {
      try {
        const parsed = JSON.parse(savedStreamers);
        console.log('📋 Streamers parseados:', parsed);
        setStreamers(parsed);
      } catch (e) {
        console.error('❌ Erro ao parsear streamers:', e);
        // Tentar backup se o principal falhar
        if (backupStreamers) {
          try {
            const backupParsed = JSON.parse(backupStreamers);
            console.log('🔄 Usando backup:', backupParsed);
            setStreamers(backupParsed);
          } catch (backupError) {
            console.error('❌ Erro ao parsear backup:', backupError);
          }
        }
      }
    } else if (backupStreamers) {
      // Se não há dados principais, tentar backup
      try {
        const backupParsed = JSON.parse(backupStreamers);
        console.log('🔄 Usando backup (sem dados principais):', backupParsed);
        setStreamers(backupParsed);
      } catch (backupError) {
        console.error('❌ Erro ao parsear backup:', backupError);
      }
    }
  }, []);

  // Salvar streamers no localStorage sempre que mudarem
  useEffect(() => {
    if (streamers.length > 0) {
      const streamersData = JSON.stringify(streamers);
      localStorage.setItem('streamers', streamersData);
      // Backup adicional
      localStorage.setItem('streamers_backup', streamersData);
      console.log('💾 Streamers salvos:', streamers.length);
    } else {
      // Se não há streamers, limpar o localStorage
      localStorage.removeItem('streamers');
      localStorage.removeItem('streamers_backup');
      console.log('🗑️ Streamers removidos do localStorage');
    }
  }, [streamers]);


  // Verificar status dos streams periodicamente
  useEffect(() => {
    // Limpar intervalo anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (streamers.length === 0) return;
    
    // Se autoRefresh estiver desativado, não fazer verificações periódicas
    if (!settings.autoRefresh) {
      return;
    }

    // Verificar imediatamente apenas uma vez, mas com delay
    const initialCheck = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updatedStreamers = await Promise.all(
        streamers.map(checkStreamerStatusWithPriority)
      );
      setStreamers(updatedStreamers);
    };
    initialCheck();

    // Configurar intervalo para verificações periódicas usando refreshInterval
    const intervalMs = (settings.refreshInterval || 30) * 1000;
    intervalRef.current = setInterval(async () => {
      const currentStreamers = streamers;
      const updatedStreamers = await Promise.all(
        currentStreamers.map(checkStreamerStatusWithPriority)
      );
      
      // Verificar mudanças de status e enviar notificações ANTES de atualizar o estado
      updatedStreamers.forEach((updatedStreamer) => {
        const oldStreamer = currentStreamers.find(s => s.id === updatedStreamer.id);
        // Verificar se o streamer mudou de offline para online E não estava online antes
        if (oldStreamer && oldStreamer.status === 'offline' && updatedStreamer.status === 'online') {
          // Streamer ficou online - verificar se deve notificar
          const shouldNotify = updatedStreamer.notificationsEnabled && 
            (settings.notifications && (!settings.notifyOnlyFavorites || updatedStreamer.isFavorite));
          
          if (shouldNotify) {
            console.log(`🔔 Notificando: ${updatedStreamer.name} ficou online`);
            // Solicitar permissão para notificações desktop
            if (settings.desktopNotifications && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                try {
                  new Notification(`${updatedStreamer.name} está ao vivo! 🎬`, {
                    body: updatedStreamer.streamInfo?.game || 'Assistir agora',
                    icon: updatedStreamer.avatar,
                    badge: updatedStreamer.avatar,
                    tag: `streamer-${updatedStreamer.id}`,
                    requireInteraction: false
                  });
                } catch (error) {
                  console.error('Erro ao criar notificação:', error);
                  // Fallback: tentar sem ícone se houver erro
                  try {
                    new Notification(`${updatedStreamer.name} está ao vivo! 🎬`, {
                      body: updatedStreamer.streamInfo?.game || 'Assistir agora',
                      tag: `streamer-${updatedStreamer.id}`
                    });
                  } catch (fallbackError) {
                    console.error('Erro ao criar notificação (fallback):', fallbackError);
                  }
                }
              } else if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    try {
                      new Notification(`${updatedStreamer.name} está ao vivo! 🎬`, {
                        body: updatedStreamer.streamInfo?.game || 'Assistir agora',
                        icon: updatedStreamer.avatar,
                        badge: updatedStreamer.avatar,
                        tag: `streamer-${updatedStreamer.id}`
                      });
                    } catch (error) {
                      console.error('Erro ao criar notificação após permissão:', error);
                      // Fallback simples
                      try {
                        new Notification(`${updatedStreamer.name} está ao vivo! 🎬`, {
                          body: updatedStreamer.streamInfo?.game || 'Assistir agora',
                          tag: `streamer-${updatedStreamer.id}`
                        });
                      } catch (fallbackError) {
                        console.error('Erro ao criar notificação (fallback):', fallbackError);
                      }
                    }
                  }
                }).catch(error => {
                  console.error('Erro ao solicitar permissão:', error);
                });
              } else {
                // Permissão negada - logar para debug
                console.warn('Notificações desktop bloqueadas pelo usuário');
              }
            }
            
            // Tocar som de notificação se habilitado
            if (settings.notificationSound) {
              // Usar setTimeout para garantir que só toca uma vez por notificação
              setTimeout(() => {
                playNotificationSound(settings.notificationVolume, settings.notificationSoundFile || 'notification.wav');
              }, 100);
            }
            
            // Mostrar toast de notificação
            showSuccessToast(`${updatedStreamer.name} está ao vivo! 🎬`, updatedStreamer.streamInfo?.game || '');
          }
        }
      });
      
      // Atualizar estado após verificar notificações
      setStreamers(updatedStreamers);
    }, intervalMs);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    streamers.length,
    settings.desktopNotifications,
    settings.notificationSound,
    settings.notificationSoundFile,
    settings.notificationVolume,
    settings.notifications,
    settings.notifyOnlyFavorites,
    settings.autoRefresh,
    settings.refreshInterval
    // Note: streamers não está na dependência porque usamos o valor capturado no closure
    // para comparar com o estado anterior antes de atualizar
  ]);

  const handleAddStreamer = async (data: {
    name: string;
    avatar: string;
    found: boolean;
    platforms: Record<Platform, string>;
  }) => {
    const streamer: Streamer = {
      id: Date.now().toString(),
      name: data.name,
      avatar: data.avatar,
      platforms: data.platforms,
      status: 'offline',
      platformCount: Object.values(data.platforms).filter(Boolean).length,
      isFavorite: false,
      notificationsEnabled: false
    };

    // Buscar informações do stream imediatamente
    const updatedStreamer = await checkStreamerStatusWithPriority(streamer);
    
    setStreamers(prev => [...prev, updatedStreamer]);
    setIsAddModalOpen(false);
    showSuccessToast('Streamer adicionado com sucesso!', '');
  };

  const handleToggleViewing = (streamer: Streamer) => {
    setSelectedStreamers(prev => {
      const isSelected = prev.some(s => s.id === streamer.id);
      if (isSelected) {
        return prev.filter(s => s.id !== streamer.id);
      } else {
        // Verificar se já atingiu o limite
        if (prev.length >= settings.maxViewers) {
          // Se atingiu o limite, remover o mais antigo e adicionar o novo
          const updatedViewing = [...prev.slice(1), streamer];
          showSuccessToast('Limite Atingido', `Limite de ${settings.maxViewers} streams atingido. O stream mais antigo foi fechado.`);
          return updatedViewing;
        } else {
          // Se não atingiu o limite, adicionar normalmente
          return [...prev, streamer];
        }
      }
    });
  };

  const handleRemoveStreamer = (streamerId: string) => {
    setStreamers(prev => prev.filter(s => s.id !== streamerId));
    setSelectedStreamers(prev => prev.filter(s => s.id !== streamerId));
  };

  const handleToggleFavorite = (streamerId: string) => {
    setStreamers(prev => prev.map(streamer => 
      streamer.id === streamerId 
        ? { ...streamer, isFavorite: !streamer.isFavorite }
        : streamer
    ));
  };

  const handleToggleNotifications = (streamerId: string) => {
    setStreamers(prev => prev.map(streamer => 
      streamer.id === streamerId 
        ? { ...streamer, notificationsEnabled: !streamer.notificationsEnabled }
        : streamer
    ));
  };


  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Header 
        onAddStreamer={() => setIsAddModalOpen(true)}
        onOpenOptions={() => setIsOptionsModalOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />
      
      <div style={{ 
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Se chat está à esquerda: Chat → Streams → Sidebar */}
        {/* Se chat está à direita: Sidebar → Streams → Chat */}
        
        {/* Chat à esquerda */}
        {settings.chatPosition === 'left' && chatVisible && (
          <div className="animate__animated animate__fadeInLeft" style={{ 
            display: 'flex',
            width: `${chatWidth}px`,
            position: 'relative',
            transition: isResizing === 'chat' ? 'none' : 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            minWidth: 250,
            maxWidth: 600
          }}>
            {/* Coluna de Avatares - mesma funcionalidade da barra horizontal */}
            <div 
              className="avatars-column-scroll" 
              style={{
                width: selectedStreamers.length > 1 ? '60px' : '0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: selectedStreamers.length > 1 ? '0.5rem' : '0',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRight: selectedStreamers.length > 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                overflowY: 'auto',
                overflowX: 'hidden',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), padding 0.5s cubic-bezier(0.4, 0, 0.2, 1), border 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: selectedStreamers.length > 1 ? 1 : 0
              }}>
              {selectedStreamers.length > 1 && selectedStreamers.map((streamer) => (
                <AvatarButton
                  key={streamer.id}
                  streamer={streamer}
                  isActive={activeChatStreamerId === streamer.id}
                  onClick={() => setActiveChatStreamerId(streamer.id)}
                  vertical={true}
                />
              ))}
            </div>
            
            {/* ChatPanel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <ChatPanel 
                streamers={streamers}
                selectedStreamer={selectedStreamers[0]}
                viewingStreamers={new Set(selectedStreamers.map(s => s.id))}
                activeChatStreamerId={activeChatStreamerId}
                onActiveChatStreamerChange={setActiveChatStreamerId}
                renderAvatarsInSidebar={true}
              />
            </div>
            {/* Handle de redimensionamento */}
            <div
              onMouseDown={(e) => handleResizeStart('chat', e)}
              onMouseEnter={() => setHoveredResizer('chat')}
              onMouseLeave={() => setHoveredResizer(null)}
              style={{
                position: 'absolute',
                right: '-5px',
                top: 0,
                bottom: 0,
                width: '10px',
                cursor: 'col-resize',
                zIndex: 50,
                backgroundColor: 'transparent'
              }}
            >
              {/* Botão reset visível quando largura foi alterada */}
              {chatWidthChanged && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetColumnWidth('chat');
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '-12px',
                    width: '20px',
                    height: '20px',
                    background: 'rgba(147, 51, 234, 0.9)',
                    border: '1px solid rgba(147, 51, 234, 0.5)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px',
                    zIndex: 150,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    opacity: hoveredResizer === 'chat' ? 1 : 0.7
                  }}
                  onMouseEnter={() => setHoveredResizer('chat')}
                  onMouseLeave={() => setHoveredResizer(null)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.opacity = '0.7';
                  }}
                  title="Resetar largura"
                >
                  ↺
                </button>
              )}
            </div>
            {/* Botão toggle chat */}
            <button
              onClick={() => setChatVisible(false)}
              style={{
                position: 'absolute',
                right: '-12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '48px',
                background: 'rgba(147, 51, 234, 0.8)',
                border: '1px solid rgba(147, 51, 234, 0.5)',
                borderRadius: '0 6px 6px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                zIndex: 100,
                transition: 'all 0.2s ease',
                boxShadow: '2px 0 8px rgba(0, 0, 0, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
                e.currentTarget.style.width = '28px';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(147, 51, 234, 0.8)';
                e.currentTarget.style.width = '24px';
              }}
            >
              <span style={{ fontSize: '16px' }}>◀</span>
            </button>
          </div>
        )}
        
        {/* Botão para mostrar chat quando escondido à esquerda */}
        {settings.chatPosition === 'left' && !chatVisible && (
          <button
            onClick={() => setChatVisible(true)}
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '48px',
              background: 'rgba(147, 51, 234, 0.8)',
              border: '1px solid rgba(147, 51, 234, 0.5)',
              borderRadius: '0 8px 8px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 100,
              transition: 'all 0.2s ease',
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
              e.currentTarget.style.width = '35px';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(147, 51, 234, 0.8)';
              e.currentTarget.style.width = '30px';
            }}
          >
            <span style={{ fontSize: '18px' }}>▶</span>
          </button>
        )}
        
        {/* Sidebar - aparece à esquerda quando chat está à direita, ou à direita quando chat está à esquerda */}
        {sidebarVisible && settings.chatPosition === 'right' && (
          <div className="animate__animated animate__fadeInLeft" style={{ 
            width: `${sidebarWidth}px`,
            position: 'relative',
            transition: isResizing === 'sidebar' ? 'none' : 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            minWidth: 250,
            maxWidth: 600
      }}>
        <Sidebar 
          streamers={streamers}
          onToggleViewing={(streamerId) => {
            const streamer = streamers.find(s => s.id === streamerId);
            if (streamer) {
              handleToggleViewing(streamer);
            }
          }}
          viewingStreamers={new Set(selectedStreamers.map(s => s.id))}
          settings={settings}
        />
            {/* Handle de redimensionamento */}
            <div
              onMouseDown={(e) => handleResizeStart('sidebar', e)}
              onMouseEnter={() => setHoveredResizer('sidebar')}
              onMouseLeave={() => setHoveredResizer(null)}
              style={{
                position: 'absolute',
                right: '-5px',
                top: 0,
                bottom: 0,
                width: '10px',
                cursor: 'col-resize',
                zIndex: 50,
                backgroundColor: 'transparent'
              }}
            >
              {/* Botão reset visível quando largura foi alterada */}
              {sidebarWidthChanged && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetColumnWidth('sidebar');
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '-12px',
                    width: '20px',
                    height: '20px',
                    background: 'rgba(147, 51, 234, 0.9)',
                    border: '1px solid rgba(147, 51, 234, 0.5)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px',
                    zIndex: 150,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    opacity: hoveredResizer === 'sidebar' ? 1 : 0.7
                  }}
                  onMouseEnter={() => setHoveredResizer('sidebar')}
                  onMouseLeave={() => setHoveredResizer(null)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.opacity = '0.7';
                  }}
                  title="Resetar largura"
                >
                  ↺
                </button>
              )}
            </div>
            {/* Botão toggle sidebar */}
            <button
              onClick={() => setSidebarVisible(false)}
              style={{
                position: 'absolute',
                right: '-12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '48px',
                background: 'rgba(147, 51, 234, 0.8)',
                border: '1px solid rgba(147, 51, 234, 0.5)',
                borderRadius: '0 6px 6px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                zIndex: 100,
                transition: 'all 0.2s ease',
                boxShadow: '2px 0 8px rgba(0, 0, 0, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
                e.currentTarget.style.width = '28px';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(147, 51, 234, 0.8)';
                e.currentTarget.style.width = '24px';
              }}
            >
              <span style={{ fontSize: '16px' }}>◀</span>
            </button>
          </div>
        )}
        
        {/* Botão para mostrar sidebar quando escondida e chat está à direita */}
        {!sidebarVisible && settings.chatPosition === 'right' && (
          <button
            onClick={() => setSidebarVisible(true)}
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '48px',
              background: 'rgba(147, 51, 234, 0.8)',
              border: '1px solid rgba(147, 51, 234, 0.5)',
              borderRadius: '0 8px 8px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 100,
              transition: 'all 0.2s ease',
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
              e.currentTarget.style.width = '35px';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(147, 51, 234, 0.8)';
              e.currentTarget.style.width = '30px';
            }}
          >
            <span style={{ fontSize: '18px' }}>▶</span>
          </button>
        )}
        
        {/* Coluna do meio - Streams (sempre no meio) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0,
          flex: 1,
          minWidth: 0
        }}>
          <StreamGrid 
            streamers={streamers}
            selectedStreamer={selectedStreamers[0]}
            viewingStreamers={new Set(selectedStreamers.map(s => s.id))}
            settings={settings}
            onToggleViewing={(streamerId) => {
              const streamer = streamers.find(s => s.id === streamerId);
              if (streamer) {
                handleToggleViewing(streamer);
              }
            }}
            onToggleNotifications={handleToggleNotifications}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
        
        {/* Sidebar à direita quando chat está à esquerda */}
        {sidebarVisible && settings.chatPosition === 'left' && (
          <div className="animate__animated animate__fadeInRight" style={{ 
            width: `${sidebarWidth}px`,
            position: 'relative',
            transition: isResizing === 'sidebar' ? 'none' : 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            minWidth: 250,
            maxWidth: 600
          }}>
            <Sidebar 
              streamers={streamers}
              onToggleViewing={(streamerId) => {
                const streamer = streamers.find(s => s.id === streamerId);
                if (streamer) {
                  handleToggleViewing(streamer);
                }
              }}
              viewingStreamers={new Set(selectedStreamers.map(s => s.id))}
              settings={settings}
            />
            {/* Handle de redimensionamento */}
            <div
              onMouseDown={(e) => handleResizeStart('sidebar', e)}
              onMouseEnter={() => setHoveredResizer('sidebar')}
              onMouseLeave={() => setHoveredResizer(null)}
              style={{
                position: 'absolute',
                left: '-5px',
                top: 0,
                bottom: 0,
                width: '10px',
                cursor: 'col-resize',
                zIndex: 50,
                backgroundColor: 'transparent'
              }}
            >
              {/* Botão reset visível quando largura foi alterada */}
              {sidebarWidthChanged && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetColumnWidth('sidebar');
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '-12px',
                    width: '20px',
                    height: '20px',
                    background: 'rgba(147, 51, 234, 0.9)',
                    border: '1px solid rgba(147, 51, 234, 0.5)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px',
                    zIndex: 150,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Resetar largura"
                >
                  ↺
                </button>
              )}
            </div>
            {/* Botão toggle sidebar */}
            <button
              onClick={() => setSidebarVisible(false)}
              style={{
                position: 'absolute',
                left: '-12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '48px',
                background: 'rgba(147, 51, 234, 0.8)',
                border: '1px solid rgba(147, 51, 234, 0.5)',
                borderRadius: '6px 0 0 6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                zIndex: 100,
                transition: 'all 0.2s ease',
                boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
                e.currentTarget.style.width = '28px';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(147, 51, 234, 0.8)';
                e.currentTarget.style.width = '24px';
              }}
            >
              <span style={{ fontSize: '16px' }}>▶</span>
            </button>
          </div>
        )}
        
        {/* Botão para mostrar sidebar quando escondida e chat está à esquerda */}
        {!sidebarVisible && settings.chatPosition === 'left' && (
          <button
            onClick={() => setSidebarVisible(true)}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '48px',
              background: 'rgba(147, 51, 234, 0.8)',
              border: '1px solid rgba(147, 51, 234, 0.5)',
              borderRadius: '8px 0 0 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 100,
              transition: 'all 0.2s ease',
              boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
              e.currentTarget.style.width = '35px';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(147, 51, 234, 0.8)';
              e.currentTarget.style.width = '30px';
            }}
          >
            <span style={{ fontSize: '18px' }}>◀</span>
          </button>
        )}
        
        {/* Chat à direita */}
        {settings.chatPosition === 'right' && chatVisible && (
          <div className="animate__animated animate__fadeInRight" style={{ 
            display: 'flex',
            width: `${chatWidth}px`,
            position: 'relative',
            transition: isResizing === 'chat' ? 'none' : 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            minWidth: 250,
            maxWidth: 600
          }}>
            {/* ChatPanel */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              transition: isResizing === 'chat' ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}>
          <ChatPanel 
            streamers={streamers}
            selectedStreamer={selectedStreamers[0]}
            viewingStreamers={new Set(selectedStreamers.map(s => s.id))}
                activeChatStreamerId={activeChatStreamerId}
                onActiveChatStreamerChange={setActiveChatStreamerId}
                renderAvatarsInSidebar={true}
              />
            </div>
            
            {/* Coluna de Avatares - mesma funcionalidade da barra horizontal */}
            <div className={`avatars-column-scroll`} style={{
              width: selectedStreamers.length > 1 ? '60px' : '0px',
              flexDirection: 'column',
              alignItems: 'center',
              gap: selectedStreamers.length > 1 ? '0.5rem' : '0',
              padding: selectedStreamers.length > 1 ? '0.5rem' : '0',
              background: 'rgba(0, 0, 0, 0.3)',
              borderLeft: selectedStreamers.length > 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              opacity: selectedStreamers.length > 1 ? 1 : 0,
              transform: selectedStreamers.length > 1 ? 'translateX(0)' : 'translateX(-20px)'
            }}>
              {selectedStreamers.map((streamer) => (
                <AvatarButton
                  key={streamer.id}
                  streamer={streamer}
                  isActive={activeChatStreamerId === streamer.id}
                  onClick={() => setActiveChatStreamerId(streamer.id)}
                  vertical={true}
                />
              ))}
            </div>
            {/* Handle de redimensionamento */}
            <div
              onMouseDown={(e) => handleResizeStart('chat', e)}
              onMouseEnter={() => setHoveredResizer('chat')}
              onMouseLeave={() => setHoveredResizer(null)}
              style={{
                position: 'absolute',
                left: '-5px',
                top: 0,
                bottom: 0,
                width: '10px',
                cursor: 'col-resize',
                zIndex: 50,
                backgroundColor: 'transparent'
              }}
            >
              {/* Botão reset visível quando largura foi alterada */}
              {chatWidthChanged && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetColumnWidth('chat');
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '-12px',
                    width: '20px',
                    height: '20px',
                    background: 'rgba(147, 51, 234, 0.9)',
                    border: '1px solid rgba(147, 51, 234, 0.5)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px',
                    zIndex: 150,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Resetar largura"
                >
                  ↺
                </button>
              )}
            </div>
            {/* Botão toggle chat */}
            <button
              onClick={() => setChatVisible(false)}
              style={{
                position: 'absolute',
                left: '-12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '48px',
                background: 'rgba(147, 51, 234, 0.8)',
                border: '1px solid rgba(147, 51, 234, 0.5)',
                borderRadius: '6px 0 0 6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                zIndex: 100,
                transition: 'all 0.2s ease',
                boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
                e.currentTarget.style.width = '28px';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(147, 51, 234, 0.8)';
                e.currentTarget.style.width = '24px';
              }}
            >
              <span style={{ fontSize: '16px' }}>▶</span>
            </button>
          </div>
        )}
        
        {/* Botão para mostrar chat quando escondido à direita */}
        {settings.chatPosition === 'right' && !chatVisible && (
          <button
            onClick={() => setChatVisible(true)}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '48px',
              background: 'rgba(147, 51, 234, 0.8)',
              border: '1px solid rgba(147, 51, 234, 0.5)',
              borderRadius: '8px 0 0 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 100,
              transition: 'all 0.2s ease',
              boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(147, 51, 234, 1)';
              e.currentTarget.style.width = '35px';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(147, 51, 234, 0.8)';
              e.currentTarget.style.width = '30px';
            }}
          >
            <span style={{ fontSize: '18px' }}>◀</span>
          </button>
        )}
      </div>

      <Footer />

      <AddStreamModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStreamer={handleAddStreamer}
      />

      <OptionsModal 
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        streamers={streamers}
        onUpdateStreamer={(streamer) => {
          setStreamers(prev => prev.map(s => s.id === streamer.id ? streamer : s));
        }}
        onRemoveStreamer={handleRemoveStreamer}
        settings={settings}
        onUpdateSettings={updateSettings}
        viewingStreamers={new Set(selectedStreamers.map(s => s.id))}
        onUpdateViewingStreamers={(streamerIds) => {
          const selectedStreamers = streamers.filter(s => streamerIds.has(s.id));
          // Verificar se excede o limite
          if (selectedStreamers.length > settings.maxViewers) {
            // Manter apenas os primeiros até o limite
            const limitedStreamers = selectedStreamers.slice(0, settings.maxViewers);
            setSelectedStreamers(limitedStreamers);
            showSuccessToast('Limite Aplicado', `Apenas ${settings.maxViewers} streams podem ser visualizados simultaneamente.`);
          } else {
            setSelectedStreamers(selectedStreamers);
          }
        }}
        onToggleFavorite={handleToggleFavorite}
        onToggleNotifications={handleToggleNotifications}
        onClearAllData={() => {
          setStreamers([]);
          setSelectedStreamers([]);
        }}
        onImportData={(importedStreamers, importedSettings) => {
          setStreamers(importedStreamers);
          updateSettings(importedSettings);
          setSelectedStreamers([]);
        }}
      />

      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        streamers={streamers}
        viewingStreamers={new Set(selectedStreamers.map(s => s.id))}
        settings={settings}
      />
    </div>
  );
}

export default App;