import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { AddStreamModal } from './components/AddStreamModal';
import { OptionsModal } from './components/OptionsModal';
import { DashboardModal } from './components/DashboardModal';
import { StreamGrid } from './components/StreamGrid';
import { ChatPanel } from './components/ChatPanel';
import type { Streamer, Platform } from './types';
import { useSettings } from './hooks/useSettings';
import { checkStreamStatus, getStreamInfo, getTwitchStreamData, getKickStreamData } from './services/api';
import { showSuccessToast } from './services/sweetAlert';

import './App.css';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const { settings, updateSettings } = useSettings();
  const intervalRef = useRef<number | null>(null);
  const selectedStreamersRef = useRef(selectedStreamers);
  
  // Atualizar ref quando selectedStreamers muda
  useEffect(() => {
    selectedStreamersRef.current = selectedStreamers;
  }, [selectedStreamers]);
  
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

    // Verificar imediatamente apenas uma vez, mas com delay
    const initialCheck = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updatedStreamers = await Promise.all(
        streamers.map(checkStreamerStatusWithPriority)
      );
      setStreamers(updatedStreamers);
    };
    initialCheck();

    // Configurar intervalo para verificações periódicas
    intervalRef.current = setInterval(async () => {
      const updatedStreamers = await Promise.all(
        streamers.map(checkStreamerStatusWithPriority)
      );
      setStreamers(updatedStreamers);
    }, 60000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [streamers.length]); // Só executa quando o número de streamers muda

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
        display: 'grid', 
        gridTemplateColumns: settings.chatPosition === 'left' 
          ? '320px 320px 1fr' 
          : '320px 1fr 320px',
        flex: 1,
        overflow: 'hidden'
      }}>
        <Sidebar 
          streamers={streamers}
          onRemoveStreamer={handleRemoveStreamer}
          onToggleViewing={(streamerId) => {
            const streamer = streamers.find(s => s.id === streamerId);
            if (streamer) {
              handleToggleViewing(streamer);
            }
          }}
          viewingStreamers={new Set(selectedStreamers.map(s => s.id))}
          onToggleFavorite={handleToggleFavorite}
          onToggleNotifications={handleToggleNotifications}
          settings={settings}
        />
        
        {settings.chatPosition === 'left' && (
          <ChatPanel 
            streamers={streamers}
            selectedStreamer={selectedStreamers[0]}
            viewingStreamers={new Set(selectedStreamers.map(s => s.id))}
          />
        )}
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0
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
          />
        </div>
        
        {settings.chatPosition === 'right' && (
          <ChatPanel 
            streamers={streamers}
            selectedStreamer={selectedStreamers[0]}
            viewingStreamers={new Set(selectedStreamers.map(s => s.id))}
          />
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