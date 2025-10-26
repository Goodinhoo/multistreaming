import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Settings, Users, Sliders, Bell, Heart, Tv, Play, Zap } from 'lucide-react';
import type { Streamer } from '../types';
import type { AppSettings } from '../types/settings';
import { EditStreamerModal } from './EditStreamerModal';
import { useAnimatedClass } from '../hooks/useAnimatedClass';

import { confirmSaveSettings, confirmReduceViewers, confirmDeleteStreamer, confirmUnsavedChanges, showSuccessToast, confirmExportData, confirmImportData, confirmClearAllData, showImportSuccess, showExportSuccess, showClearSuccess } from '../services/sweetAlert';
import { BackupService } from '../services/backupService';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamers: Streamer[];
  onUpdateStreamer: (updatedStreamer: Streamer) => void;
  onRemoveStreamer: (id: string) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  viewingStreamers: Set<string>;
  onUpdateViewingStreamers: (streamers: Set<string>) => void;
  onToggleFavorite: (id: string) => void;
  onToggleNotifications: (id: string) => void;
  onClearAllData: () => void;
  onImportData: (streamers: Streamer[], settings: AppSettings) => void;
}

export function OptionsModal({ isOpen, onClose, streamers, onUpdateStreamer, onRemoveStreamer, settings, onUpdateSettings, viewingStreamers, onUpdateViewingStreamers, onToggleFavorite, onToggleNotifications, onClearAllData, onImportData }: OptionsModalProps) {
  const [editingStreamer, setEditingStreamer] = useState<Streamer | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'streamers' | 'filters' | 'stats' | 'updates'>('general');
  
  const animatedModalClass = useAnimatedClass('', 'animate__fadeIn');
  const animatedCardClass = useAnimatedClass('', 'animate__fadeIn');
  const settingsIconClass = '';
  const slidersIconClass = '';
  const usersIconClass = '';
  const editIconClass = '';
  const trashIconClass = '';
  const bellIconClass = '';
  const heartIconClass = '';
  
  // Estado para configurações pendentes
  const [pendingSettings, setPendingSettings] = useState<AppSettings>(settings);
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Lista de sons disponíveis - atualizada com todos os arquivos
  const availableSounds = [
    { value: 'notification.wav', label: '🔔 Som Padrão' },
    { value: 'mixkit-bell-notification-933.wav', label: '🔔 Sino' },
    { value: 'mixkit-bonus-earned-in-video-game-2058.wav', label: '🎮 Bônus (Jogo)' },
    { value: 'mixkit-bubble-pop-up-alert-notification-2357.wav', label: '💬 Bolha Pop' },
    { value: 'mixkit-cartoon-laugh-voice-2882.wav', label: '😄 Risada Cartoon' },
    { value: 'mixkit-cartoon-toy-whistle-616.wav', label: '🎵 Apito Cartoon' },
    { value: 'mixkit-clear-announce-tones-2861.wav', label: '📢 Anúncio Claro' },
    { value: 'mixkit-clown-horn-at-circus-715.wav', label: '🎪 Trombeta de Circo' },
    { value: 'mixkit-correct-answer-tone-2870.wav', label: '✅ Resposta Correta' },
    { value: 'mixkit-dry-pop-up-notification-alert-2356.wav', label: '🔊 Pop Seco' },
    { value: 'mixkit-flute-mobile-phone-notification-alert-2316.wav', label: '📱 Flauta Mobile' },
    { value: 'mixkit-funny-squeaky-toy-hits-2813.wav', label: '🎭 Brinquedo Engraçado' },
    { value: 'mixkit-gaming-lock-2848.wav', label: '🎯 Lock Gaming' },
    { value: 'mixkit-guitar-stroke-down-slow-2339.wav', label: '🎸 Guitarra Down' },
    { value: 'mixkit-guitar-stroke-up-slow-2338.wav', label: '🎸 Guitarra Up' },
    { value: 'mixkit-interface-option-select-2573.wav', label: '🖱️ Seleção Interface' },
    { value: 'mixkit-laughing-cartoon-creature-414.wav', label: '😆 Criatura Rindo' },
    { value: 'mixkit-long-pop-2358.wav', label: '🔊 Pop Longo' },
    { value: 'mixkit-mechanical-brush-transition-3146.wav', label: '🔧 Transição Mecânica' },
    { value: 'mixkit-message-pop-alert-2354.mp3', label: '💬 Mensagem Pop' },
    { value: 'mixkit-police-whistle-614.wav', label: '🚨 Apito Policial' },
    { value: 'mixkit-sad-game-over-trombone-471.wav', label: '😢 Game Over' },
    { value: 'mixkit-slot-machine-win-alert-1931.wav', label: '🎰 Slot Machine Win' },
    { value: 'mixkit-software-interface-back-2575.wav', label: '⬅️ Interface Back' },
    { value: 'mixkit-wrong-answer-fail-notification-946.wav', label: '❌ Resposta Errada' }
  ];
  
  // Função para testar o som selecionado
  const testSound = (soundFile: string) => {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.volume = (pendingSettings.notificationVolume || 50) / 100;
    audio.play().catch(() => {
      showSuccessToast('Erro', 'Não foi possível reproduzir o som. Verifique se o arquivo existe.');
    });
  };

  const platformIcons = {
    twitch: <Tv size={12} style={{ color: '#9146ff' }} />,
    youtube: <Play size={12} style={{ color: '#ff0000' }} />,
    kick: <Zap size={12} style={{ color: '#00ff00' }} />
  };

  // Atualizar estado pendente quando settings mudarem externamente
  useEffect(() => {
    setPendingSettings(settings);
    setHasUnsavedChanges(false);
  }, [settings, isOpen]);

  const handleSettingChange = (key: keyof typeof pendingSettings, value: string | number | boolean) => {
    setPendingSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
    
    // Mostrar toast de alteração pendente
    const settingNames: Record<string, string> = {
      maxViewers: 'Limite de Visualizadores',
      notifications: 'Notificações',
      animations: 'Animações',
      autoRefresh: 'Atualização Automática',
      refreshInterval: 'Intervalo de Atualização',
      theme: 'Tema',
      language: 'Idioma',
      filterPlatform: 'Filtro de Plataforma',
      filterStatus: 'Filtro de Status',
      showOnlyFavorites: 'Mostrar Apenas Favoritos',
      sortBy: 'Ordenação',
      notificationSound: 'Som de Notificação',
      desktopNotifications: 'Notificações Desktop',
      notifyOnlyFavorites: 'Notificar Apenas Favoritos',
      notificationVolume: 'Volume de Notificação',
      compactMode: 'Modo Compacto',
      gridLayout: 'Layout do Grid',
      chatPosition: 'Posição do Chat'
    };
    
    showSuccessToast(
      'Configuração Alterada',
      `${settingNames[key] || key} foi modificado. Clique em "Salvar" para aplicar.`
    );
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
    
    // Salvar todas as configurações
    onUpdateSettings(pendingSettings);
    
    setHasUnsavedChanges(false);
    showSuccessToast('Configurações Guardadas', 'As suas configurações foram atualizadas com sucesso!');
  };

  const handleCancelChanges = () => {
    setPendingSettings(settings);
    setHasUnsavedChanges(false);
  };

  const handleClose = async () => {
    if (hasUnsavedChanges) {
      const result = await confirmUnsavedChanges();
      if (result.isConfirmed) {
        // Usuário confirmou que quer sair sem salvar
        handleCancelChanges();
        onClose();
      }
      // Se cancelar, não faz nada (continua no modal)
    } else {
      // Não há alterações, pode fechar normalmente
      onClose();
    }
  };

  // Funções de Backup/Restore
  const handleExportData = async () => {
    const result = await confirmExportData();
    if (result.isConfirmed) {
      try {
        await BackupService.exportData(streamers, settings);
        showExportSuccess();
      } catch (error) {
        showSuccessToast('Erro', 'Erro ao exportar dados: ' + (error as Error).message);
      }
    }
  };

  const handleImportData = async () => {
    const result = await confirmImportData();
    if (result.isConfirmed) {
      // Criar input de arquivo
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const { streamers: importedStreamers, settings: importedSettings } = await BackupService.importData(file);
          onImportData(importedStreamers, importedSettings);
          showImportSuccess(importedStreamers.length);
        } catch (error) {
          showSuccessToast('Erro', 'Erro ao importar dados: ' + (error as Error).message);
        }
      };

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    }
  };

  const handleClearAllData = async () => {
    const result = await confirmClearAllData();
    if (result.isConfirmed) {
      try {
        BackupService.clearAllData();
        onClearAllData();
        showClearSuccess();
        onClose(); // Fechar modal após limpeza
      } catch (error) {
        showSuccessToast('Erro', 'Erro ao limpar dados: ' + (error as Error).message);
      }
    }
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
               <div className={`${animatedModalClass} options-modal`} style={{
                 background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                 borderRadius: '20px',
                 height: '90vh',
                 width: "60%",
                 display: 'flex',
                 flexDirection: 'column',
                 border: '1px solid rgba(147, 51, 234, 0.3)',
                 boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                 overflow: 'hidden'
               }}>
          {/* Header Fixo */}
          <div style={{
            padding: '1.5rem 2rem 0 2rem',
            paddingLeft: '2rem',
            paddingRight: '2rem',
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
                      onClick={handleClose}
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
                           : '2px solid transparent',
                         whiteSpace: 'nowrap'
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
                           : '2px solid transparent',
                         whiteSpace: 'nowrap'
                       }}
                     >
                           <Users size={16} className={usersIconClass} />
                           Meus Streamers ({streamers.length})
                     </button>
              
                     <button
                       onClick={() => setActiveTab('filters')}
                       style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem',
                         padding: '0.75rem 1.5rem',
                         background: activeTab === 'filters' 
                           ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
                           : 'rgba(255, 255, 255, 0.05)',
                         border: 'none',
                         borderRadius: '10px 10px 0 0',
                         color: 'white',
                         fontSize: '0.875rem',
                         fontWeight: '600',
                         cursor: 'pointer',
                         transition: 'all 0.2s ease',
                         borderBottom: activeTab === 'filters' 
                           ? '2px solid #9333ea'
                           : '2px solid transparent',
                         whiteSpace: 'nowrap'
                       }}
                     >
                           🔍 Filtros e Visualização
                     </button>
                     
                     <button
                       onClick={() => setActiveTab('stats')}
                       style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem',
                         padding: '0.75rem 1.5rem',
                         background: activeTab === 'stats' 
                           ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
                           : 'rgba(255, 255, 255, 0.05)',
                         border: 'none',
                         borderRadius: '10px 10px 0 0',
                         color: 'white',
                         fontSize: '0.875rem',
                         fontWeight: '600',
                         cursor: 'pointer',
                         transition: 'all 0.2s ease',
                         borderBottom: activeTab === 'stats' 
                           ? '2px solid #9333ea'
                           : '2px solid transparent',
                         whiteSpace: 'nowrap'
                       }}
                     >
                           📊 Estatísticas
                     </button>
                     
                     <button
                       onClick={() => setActiveTab('updates')}
                       style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem',
                         padding: '0.75rem 1.5rem',
                         background: activeTab === 'updates' 
                           ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
                           : 'rgba(255, 255, 255, 0.05)',
                         border: 'none',
                         borderRadius: '10px 10px 0 0',
                         color: 'white',
                         fontSize: '0.875rem',
                         fontWeight: '600',
                         cursor: 'pointer',
                         transition: 'all 0.2s ease',
                         borderBottom: activeTab === 'updates' 
                           ? '2px solid #9333ea'
                           : '2px solid transparent',
                         whiteSpace: 'nowrap'
                       }}
                     >
                           📝 Atualizações
                     </button>
            </div>
          </div>

          {/* Conteúdo Principal com Scroll */}
          <div style={{
            flex: 1,
            padding: '2rem',
            paddingLeft: '2rem',
            paddingRight: '2rem',
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
                          onClick={() => handleSettingChange('maxViewers', Math.min(12, pendingSettings.maxViewers + 1))}
                          disabled={pendingSettings.maxViewers >= 12}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: pendingSettings.maxViewers >= 12 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(147, 51, 234, 0.2)',
                            border: '1px solid',
                            borderColor: pendingSettings.maxViewers >= 12 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(147, 51, 234, 0.3)',
                            color: pendingSettings.maxViewers >= 12 ? 'rgba(255, 255, 255, 0.3)' : '#9333ea',
                            cursor: pendingSettings.maxViewers >= 12 ? 'not-allowed' : 'pointer',
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
                    
                    {/* Som de Notificação - só aparece se notificações estiverem ativadas */}
                    {pendingSettings.notifications && (
                      <div style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{
                          marginBottom: '0.75rem'
                        }}>
                          <h4 style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'white',
                            margin: '0 0 0.25rem 0'
                          }}>
                            🔊 Som de Notificação
                          </h4>
                          <p style={{
                            fontSize: '0.8rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            margin: 0
                          }}>
                            Escolha o arquivo de som
                          </p>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem'
                        }}>
                            <select
                              value={pendingSettings.notificationSoundFile || 'notification.wav'}
                              onChange={(e) => {
                                const selectedSound = e.target.value;
                                handleSettingChange('notificationSoundFile', selectedSound);
                                // Tocar o som automaticamente quando selecionar
                                testSound(selectedSound);
                              }}
                              style={{
                                background: 'rgba(15, 15, 35, 0.8)',
                                border: '1px solid rgba(147, 51, 234, 0.3)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                color: 'white',
                                fontSize: '0.875rem',
                                width: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.6)';
                                e.currentTarget.style.background = 'rgba(15, 15, 35, 0.95)';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
                                e.currentTarget.style.background = 'rgba(15, 15, 35, 0.8)';
                              }}
                            >
                            {availableSounds.map(sound => (
                              <option key={sound.value} value={sound.value}>
                                {sound.label}
                              </option>
                            ))}
                          </select>
                          
                          <button
                            onClick={() => testSound(pendingSettings.notificationSoundFile || 'notification.wav')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '6px',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              width: 'fit-content'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                            }}
                          >
                            ▶️ Testar Som
                          </button>
                        </div>
                        
                        {/* Volume de Notificação */}
                        <div style={{
                          marginTop: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%'
                          }}>
                            <label style={{
                              fontSize: '0.875rem',
                              color: 'rgba(255, 255, 255, 0.9)',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              margin: 0,
                              lineHeight: '1'
                            }}>
                              🔊 Volume
                            </label>
                            <span style={{
                              fontSize: '0.875rem',
                              color: '#10b981',
                              fontWeight: '700',
                              minWidth: '45px',
                              textAlign: 'right',
                              lineHeight: '1'
                            }}>
                              {pendingSettings.notificationVolume || 50}%
                            </span>
                          </div>
                          <div style={{ 
                            position: 'relative',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={pendingSettings.notificationVolume || 50}
                              onChange={(e) => handleSettingChange('notificationVolume', parseInt(e.target.value))}
                              style={{
                                width: '100%',
                                height: '8px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.15)',
                                outline: 'none',
                                cursor: 'pointer',
                                WebkitAppearance: 'none',
                                appearance: 'none',
                                margin: 0,
                                padding: 0
                              }}
                            />
                            <style>{`
                              input[type="range"]::-webkit-slider-thumb {
                                -webkit-appearance: none;
                                appearance: none;
                                width: 18px;
                                height: 18px;
                                border-radius: 50%;
                                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                                cursor: pointer;
                                border: 2px solid white;
                                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
                                transition: all 0.2s ease;
                                margin-top: -5px;
                              }
                              input[type="range"]::-webkit-slider-thumb:hover {
                                transform: scale(1.15);
                                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.7);
                              }
                              input[type="range"]::-moz-range-thumb {
                                width: 18px;
                                height: 18px;
                                border-radius: 50%;
                                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                                cursor: pointer;
                                border: 2px solid white;
                                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
                                transition: all 0.2s ease;
                              }
                              input[type="range"]::-moz-range-thumb:hover {
                                transform: scale(1.15);
                                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.7);
                              }
                              input[type="range"]::-webkit-slider-runnable-track {
                                height: 8px;
                                background: linear-gradient(to right, 
                                  rgba(16, 185, 129, 0.8) 0%, 
                                  rgba(16, 185, 129, 0.8) ${pendingSettings.notificationVolume || 50}%, 
                                  rgba(255, 255, 255, 0.15) ${pendingSettings.notificationVolume || 50}%, 
                                  rgba(255, 255, 255, 0.15) 100%
                                );
                                border-radius: 4px;
                              }
                              input[type="range"]::-moz-range-track {
                                height: 8px;
                                background: rgba(255, 255, 255, 0.15);
                                border-radius: 4px;
                              }
                              input[type="range"]::-moz-range-progress {
                                height: 8px;
                                background: linear-gradient(to right, #10b981 0%, #059669 100%);
                                border-radius: 4px;
                              }
                            `}</style>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Notificações Desktop - só aparece se notificações estiverem ativadas */}
                    {pendingSettings.notifications && (
                      <div style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <h4 style={{
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: 'white',
                              margin: '0 0 0.25rem 0'
                            }}>
                              🖥️ Notificações Desktop
                            </h4>
                            <p style={{
                              fontSize: '0.8rem',
                              color: 'rgba(255, 255, 255, 0.6)',
                              margin: 0
                            }}>
                              Mostrar notificações do sistema operacional
                            </p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('desktopNotifications', !pendingSettings.desktopNotifications)}
                            style={{
                              width: '48px',
                              height: '24px',
                              borderRadius: '12px',
                              background: pendingSettings.desktopNotifications ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
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
                              left: pendingSettings.desktopNotifications ? '26px' : '2px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }} />
                          </button>
                        </div>
                        
                        {/* Informação sobre status de notificações */}
                        {pendingSettings.desktopNotifications && (
                          <div style={{
                            marginTop: '0.75rem',
                            fontSize: '0.8rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            lineHeight: '1.4'
                          }}>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                              <strong>Status:</strong> {
                                Notification.permission === 'granted' ? '✅ Permissão concedida' :
                                Notification.permission === 'denied' ? '❌ Permissão negada' :
                                '⚠️ Permissão pendente'
                              }
                            </div>
                            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                              <strong style={{ color: '#3b82f6', fontSize: '0.8rem' }}>🔧 Para Opera GX:</strong>
                              <ol style={{ margin: '0.5rem 0 0 1.2rem', padding: 0, fontSize: '0.75rem', lineHeight: '1.6' }}>
                                <li>Abra <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.1rem 0.3rem', borderRadius: '2px', fontSize: '0.7rem' }}>opera://settings/content/notifications</code></li>
                                <li>Ou: Configurações → Privacidade e Segurança → Definições de Sites → Notificações</li>
                                <li>Certifique-se que "Permitir que os sites enviem notificações" está <strong>ativado</strong></li>
                                <li>Verifique se localhost/127.0.0.1 está na lista de sites permitidos</li>
                                <li>Se não aparecer, adicione manualmente ou configure para "Perguntar antes de enviar"</li>
                              </ol>
                            </div>
                            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                              💡 As notificações só aparecem quando um streamer muda de <strong>offline</strong> para <strong>online</strong>. Certifique-se de que:
                            </div>
                            <ul style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 1rem', padding: 0 }}>
                              <li>Notificações gerais estão ativadas</li>
                              <li>O streamer tem notificações habilitadas</li>
                              <li>Se "Notificar Apenas Favoritos" estiver ativo, o streamer deve ser favorito</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Notificar Apenas Favoritos - só aparece se notificações estiverem ativadas */}
                    {pendingSettings.notifications && (
                      <div style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <h4 style={{
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: 'white',
                              margin: '0 0 0.25rem 0'
                            }}>
                              ⭐ Notificar Apenas Favoritos
                            </h4>
                            <p style={{
                              fontSize: '0.8rem',
                              color: 'rgba(255, 255, 255, 0.6)',
                              margin: 0
                            }}>
                              Receber notificações apenas de streamers favoritos
                            </p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('notifyOnlyFavorites', !pendingSettings.notifyOnlyFavorites)}
                            style={{
                              width: '48px',
                              height: '24px',
                              borderRadius: '12px',
                              background: pendingSettings.notifyOnlyFavorites ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
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
                              left: pendingSettings.notifyOnlyFavorites ? '26px' : '2px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }} />
                          </button>
                        </div>
                      </div>
                    )}
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

                  {/* Backup e Dados */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginTop: '1.5rem'
                  }} className={animatedCardClass}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0 0 1rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      💾 Backup e Dados
                    </h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      {/* Exportar */}
                      <button
                        onClick={handleExportData}
                        style={{
                          padding: '1rem',
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.3) 100%)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                        }}
                      >
                        <div style={{ fontSize: '1.5rem' }}>📤</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Exportar Dados</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                          Salvar backup
                        </div>
                      </button>

                      {/* Importar */}
                      <button
                        onClick={handleImportData}
                        style={{
                          padding: '1rem',
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)';
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)';
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        <div style={{ fontSize: '1.5rem' }}>📥</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Importar Dados</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                          Restaurar backup
                        </div>
                      </button>

                      {/* Limpar Tudo */}
                      <button
                        onClick={handleClearAllData}
                        style={{
                          padding: '1rem',
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        }}
                      >
                        <div style={{ fontSize: '1.5rem' }}>🗑️</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Limpar Tudo</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                          Reset completo
                        </div>
                      </button>
                    </div>

                    {/* Informações */}
                    <div style={{
                      padding: '1rem',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        lineHeight: '1.5'
                      }}>
                        <strong style={{ color: '#3b82f6' }}>💡 Dicas:</strong>
                        <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                          <li>Faça backup regularmente para não perder seus dados</li>
                          <li>O arquivo de backup contém todos os streamers e configurações</li>
                          <li>Importar substitui todos os dados atuais</li>
                          <li>Limpar tudo é irreversível - faça backup antes!</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'filters' && (
              <div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 1rem 0'
                }}>
                  Filtros e Visualização
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {/* Filtro por Plataforma */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0 0 1rem 0'
                    }}>
                      🎯 Filtrar por Plataforma
                    </h4>
                    <div style={{
                      display: 'flex',
                      gap: '0.75rem',
                      flexWrap: 'wrap'
                    }}>
                      {['all', 'twitch', 'kick'].map((platform) => (
                        <button
                          key={platform}
                          onClick={() => handleSettingChange('filterPlatform', platform)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: '2px solid',
                            borderColor: pendingSettings.filterPlatform === platform 
                              ? platform === 'twitch' ? '#9146ff' : platform === 'kick' ? '#00ff00' : '#9333ea'
                              : 'rgba(255, 255, 255, 0.2)',
                            background: pendingSettings.filterPlatform === platform 
                              ? platform === 'twitch' ? 'rgba(145, 70, 255, 0.2)' : platform === 'kick' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(147, 51, 234, 0.2)'
                              : 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          {platform === 'all' && '🌐 Todas'}
                          {platform === 'twitch' && '🟣 Twitch'}
                          {platform === 'kick' && '🟢 Kick'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtro por Status */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0 0 1rem 0'
                    }}>
                      📡 Filtrar por Status
                    </h4>
                    <div style={{
                      display: 'flex',
                      gap: '0.75rem',
                      flexWrap: 'wrap'
                    }}>
                      {[
                        { value: 'all', label: '🌐 Todos', color: '#9333ea' },
                        { value: 'online', label: '🔴 Online', color: '#10b981' },
                        { value: 'offline', label: '⚫ Offline', color: '#6b7280' }
                      ].map((status) => (
                        <button
                          key={status.value}
                          onClick={() => handleSettingChange('filterStatus', status.value)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: '2px solid',
                            borderColor: pendingSettings.filterStatus === status.value ? status.color : 'rgba(255, 255, 255, 0.2)',
                            background: pendingSettings.filterStatus === status.value 
                              ? `${status.color}33`
                              : 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mostrar apenas Favoritos */}
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
                          ⭐ Mostrar Apenas Favoritos
                        </h4>
                        <p style={{
                          fontSize: '0.875rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: 0
                        }}>
                          Exibir somente streamers marcados como favoritos
                        </p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('showOnlyFavorites', !pendingSettings.showOnlyFavorites)}
                        style={{
                          width: '48px',
                          height: '24px',
                          borderRadius: '12px',
                          background: pendingSettings.showOnlyFavorites ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
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
                          left: pendingSettings.showOnlyFavorites ? '26px' : '2px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }} />
                      </button>
                    </div>
                  </div>

                  {/* Ordenação */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0 0 1rem 0'
                    }}>
                      📊 Ordenar Streamers Por
                    </h4>
                    <select
                      value={pendingSettings.sortBy}
                      onChange={(e) => handleSettingChange('sortBy', e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="name" style={{ background: '#1a1a2e' }}>📝 Nome (A-Z)</option>
                      <option value="status" style={{ background: '#1a1a2e' }}>🔴 Status (Online primeiro)</option>
                      <option value="viewers" style={{ background: '#1a1a2e' }}>👥 Viewers (Maior primeiro)</option>
                      <option value="platform" style={{ background: '#1a1a2e' }}>🎯 Plataforma</option>
                    </select>
                  </div>

                  {/* Layout do Grid */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0 0 1rem 0'
                    }}>
                      📐 Layout do Grid
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.75rem'
                    }}>
                      {[
                        { value: 'auto', label: '🔄 Automático', icon: '⚡' },
                        { value: '2x2', label: '2×2', icon: '🔲' },
                        { value: '3x3', label: '3×3', icon: '🔳' },
                        { value: '4x4', label: '4×4', icon: '⬛' }
                      ].map((layout) => (
                        <button
                          key={layout.value}
                          onClick={() => handleSettingChange('gridLayout', layout.value)}
                          style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '2px solid',
                            borderColor: pendingSettings.gridLayout === layout.value ? '#9333ea' : 'rgba(255, 255, 255, 0.2)',
                            background: pendingSettings.gridLayout === layout.value 
                              ? 'rgba(147, 51, 234, 0.2)'
                              : 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <span style={{ fontSize: '1.5rem' }}>{layout.icon}</span>
                          <span>{layout.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Modo Compacto */}
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
                          📦 Modo Compacto
                        </h4>
                        <p style={{
                          fontSize: '0.875rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: 0
                        }}>
                          Interface mais compacta com menos espaçamento
                        </p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('compactMode', !pendingSettings.compactMode)}
                        style={{
                          width: '48px',
                          height: '24px',
                          borderRadius: '12px',
                          background: pendingSettings.compactMode ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
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
                          left: pendingSettings.compactMode ? '26px' : '2px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }} />
                      </button>
                    </div>
                  </div>

                  {/* Posição do Chat */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0 0 1rem 0'
                    }}>
                      💬 Posição do Chat
                    </h4>
                    <div style={{
                      display: 'flex',
                      gap: '0.75rem'
                    }}>
                      {[
                        { value: 'right', label: '➡️ Direita' },
                        { value: 'left', label: '⬅️ Esquerda' }
                      ].map((position) => (
                        <button
                          key={position.value}
                          onClick={() => handleSettingChange('chatPosition', position.value)}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: '2px solid',
                            borderColor: pendingSettings.chatPosition === position.value ? '#9333ea' : 'rgba(255, 255, 255, 0.2)',
                            background: pendingSettings.chatPosition === position.value 
                              ? 'rgba(147, 51, 234, 0.2)'
                              : 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {position.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 1rem 0'
                }}>
                  Estatísticas
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1.5rem'
                }}>
                  {/* Total de Streamers */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(147, 51, 234, 0.3)'
                  }} className={animatedCardClass}>
                    <div style={{
                      fontSize: '2.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      📺
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: 'white',
                      marginBottom: '0.25rem'
                    }}>
                      {streamers.length}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      Total de Streamers
                    </div>
                  </div>

                  {/* Streamers Online */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }} className={animatedCardClass}>
                    <div style={{
                      fontSize: '2.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      🔴
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#10b981',
                      marginBottom: '0.25rem'
                    }}>
                      {streamers.filter(s => s.status === 'online').length}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      Online Agora
                    </div>
                  </div>

                  {/* Favoritos */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }} className={animatedCardClass}>
                    <div style={{
                      fontSize: '2.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      ⭐
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#ef4444',
                      marginBottom: '0.25rem'
                    }}>
                      {streamers.filter(s => s.isFavorite).length}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      Favoritos
                    </div>
                  </div>

                  {/* Assistindo */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }} className={animatedCardClass}>
                    <div style={{
                      fontSize: '2.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      👁️
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#3b82f6',
                      marginBottom: '0.25rem'
                    }}>
                      {viewingStreamers.size}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      Assistindo Agora
                    </div>
                  </div>
                </div>

                {/* Distribuição por Plataforma */}
                <div style={{
                  marginTop: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }} className={animatedCardClass}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0 0 1rem 0'
                  }}>
                    📊 Distribuição por Plataforma
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {/* Twitch */}
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: '#9146ff', fontWeight: '600', fontSize: '0.875rem' }}>
                          🟣 Twitch
                        </span>
                        <span style={{ color: 'white', fontWeight: '600', fontSize: '0.875rem' }}>
                          {streamers.filter(s => s.platforms.twitch).length}
                        </span>
                      </div>
                      <div style={{
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(streamers.filter(s => s.platforms.twitch).length / Math.max(streamers.length, 1)) * 100}%`,
                          background: 'linear-gradient(90deg, #9146ff 0%, #7c3aed 100%)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Kick */}
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: '#00ff00', fontWeight: '600', fontSize: '0.875rem' }}>
                          🟢 Kick
                        </span>
                        <span style={{ color: 'white', fontWeight: '600', fontSize: '0.875rem' }}>
                          {streamers.filter(s => s.platforms.kick).length}
                        </span>
                      </div>
                      <div style={{
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(streamers.filter(s => s.platforms.kick).length / Math.max(streamers.length, 1)) * 100}%`,
                          background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 100%)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  </div>
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
                      Adicione streamers usando o botão "+" no topo da tela
                    </p>
                  </div>
                ) : (
                  <div className="streamers-grid">
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

            {activeTab === 'updates' && (
              <div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 1rem 0'
                }}>
                  📝 Últimas Atualizações
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {/* Atualização mais recente */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(147, 51, 234, 0.3)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🆕</span>
                      <div>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          Correções de Favoritos e Estilo dos Botões
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: '0.25rem 0 0 0'
                        }}>
                          28/10/2025
                        </p>
                      </div>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <li>Corrigido problema de favoritos/notificações ao clicar rapidamente</li>
                      <li>Botões de plataforma agora têm mesma altura e border-radius do botão X</li>
                      <li>Preferências manuais preservadas em todas as atualizações</li>
                      <li>Atualizações de texto para refletir nova posição do botão adicionar</li>
                    </ul>
                  </div>

                  {/* Ajustes de Z-index e Animações */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🎨</span>
                      <div>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          Ajustes de Z-index e Animações
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: '0.25rem 0 0 0'
                        }}>
                          28/10/2025
                        </p>
                      </div>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <li>Botões toggle agora ficam acima dos visualizadores</li>
                      <li>Z-index ajustado para garantir visibilidade dos controles</li>
                      <li>Animações de fadeInLeft/fadeInRight nas colunas</li>
                      <li>Transições suaves de largura mantidas</li>
                    </ul>
                  </div>

                  {/* Correções de Layout e Limite de Visualizadores */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📐</span>
                      <div>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          Correções de Layout e Limite de Visualizadores
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: '0.25rem 0 0 0'
                        }}>
                          26/10/2025
                        </p>
                      </div>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <li>Botões do footer fixos à direita mesmo sem título</li>
                      <li>Limite máximo de visualizadores aumentado para 12</li>
                      <li>Alinhamento consistente dos controles</li>
                    </ul>
                  </div>

                  {/* Correções no Chat da Twitch */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>💬</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          Correções no Chat da Twitch
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: '0.25rem 0 0 0'
                        }}>
                          26/10/2025
                        </p>
                      </div>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <li>Tema escuro nativo aplicado ao chat</li>
                      <li>Correção para permitir envio de mensagens</li>
                      <li>Largura padrão do chat ajustada para 350px</li>
                      <li>Largura padrão da sidebar ajustada para 350px</li>
                    </ul>
                  </div>

                  {/* Layout Responsivo */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📱</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          Layout Responsivo
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: '0.25rem 0 0 0'
                        }}>
                          26/10/2025
                        </p>
                      </div>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <li>Cards de streamers: 2 colunas em 1920px</li>
                      <li>Cards de streamers: 3 colunas em 3440px</li>
                      <li>Modal de opções ajustável por resolução</li>
                    </ul>
                  </div>

                  {/* Sistema de Notificações */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🔔</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          Sistema de Notificações
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: '0.25rem 0 0 0'
                        }}>
                          26/10/2025
                        </p>
                      </div>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <li>Notificações de desktop</li>
                      <li>Sons personalizados de notificação</li>
                      <li>Volume configurável</li>
                      <li>Opção "notificar apenas favoritos"</li>
                    </ul>
                  </div>

                  {/* Colunas Redimensionáveis */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📐</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          Colunas Redimensionáveis
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: '0.25rem 0 0 0'
                        }}>
                          26/10/2025
                        </p>
                      </div>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <li>Arraste para redimensionar sidebar e chat</li>
                      <li>Botões de reset para voltar ao padrão</li>
                      <li>Toggle para ocultar/mostrar colunas</li>
                      <li>Coluna de streams sempre centralizada</li>
                    </ul>
                  </div>

                  {/* Dashboard e Estatísticas */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📊</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          Dashboard e Estatísticas
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: '0.25rem 0 0 0'
                        }}>
                          26/10/2025
                        </p>
                      </div>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <li>Visualização de estatísticas gerais</li>
                      <li>Top 5 streamers mais assistidos</li>
                      <li>Cálculo de viewers por plataforma</li>
                      <li>Estatísticas detalhadas na aba de opções</li>
                    </ul>
                  </div>

                  {/* Visualizador de Streams */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📺</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          Visualizador de Streams
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: '0.25rem 0 0 0'
                        }}>
                          26/10/2025
                        </p>
                      </div>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <li>Botão X para fechar stream</li>
                      <li>Troca de plataformas (Twitch, YouTube, Kick)</li>
                      <li>Viewers individuais por plataforma</li>
                      <li>Modais informativos no footer</li>
                    </ul>
                  </div>

                  {/* Multistreaming com Kick */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🟢</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          Suporte Multiplataforma
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: '0.25rem 0 0 0'
                        }}>
                          25/10/2025
                        </p>
                      </div>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <li>Suporte completo para Twitch e Kick</li>
                      <li>YouTube brevemente</li>
                      <li>Chat simultâneo de múltiplas plataformas</li>
                      <li>ChatPanel otimizado com abas</li>
                      <li>Troca dinâmica entre plataformas</li>
                    </ul>
                  </div>

                  {/* Backup e Restore */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className={animatedCardClass}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>💾</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          Backup e Restore
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: '0.25rem 0 0 0'
                        }}>
                          25/10/2025
                        </p>
                      </div>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <li>Exportar dados em JSON</li>
                      <li>Importar backup de dados</li>
                      <li>Limpar todos os dados</li>
                      <li>Salvamento automático no navegador</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Footer Fixo */}
            <div style={{
              padding: '1rem 2rem',
              paddingLeft: '2rem',
              paddingRight: '2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: hasUnsavedChanges ? 'rgba(239, 68, 68, 0.1)' : 'rgba(147, 51, 234, 0.05)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                {hasUnsavedChanges ? (
                  <span style={{ color: '#ef4444', fontWeight: '600' }}>
                    ⚠️ Alterações não guardadas!
                  </span>
                ) : (
                  '💡 Use as tabs acima para navegar entre as configurações'
                )}
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Total: {streamers.length} streamer{streamers.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Botões de ação */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center'
              }}>
                {hasUnsavedChanges && (
                  <>
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
                  </>
                )}
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
