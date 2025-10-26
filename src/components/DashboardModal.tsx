import { useState, useEffect, useMemo } from 'react';
import { X, TrendingUp, Users, Eye, Clock, Activity, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import type { Streamer } from '../types';
import type { AppSettings } from '../types/settings';
import { useAnimatedClassWithDuration } from '../hooks/useAnimatedClass';
import { getTwitchStreamData, getKickStreamData } from '../services/api';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamers: Streamer[];
  viewingStreamers: Set<string>;
  settings: AppSettings;
}

export function DashboardModal({ isOpen, onClose, streamers, viewingStreamers }: DashboardModalProps) {
  const animatedModalClass = useAnimatedClassWithDuration('', 'animate__zoomIn', 400);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'comparison' | 'history' | 'recommendations'>('overview');
  const [sessionStart] = useState(new Date());
  const [platformViewers, setPlatformViewers] = useState<Map<string, { twitch?: number; kick?: number }>>(new Map());

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Buscar viewers de todas as plataformas para streamers online
  useEffect(() => {
    if (!isOpen) return;

    const fetchPlatformViewers = async () => {
      const viewersMap = new Map<string, { twitch?: number; kick?: number }>();
      
      for (const streamer of streamers.filter(s => s.status === 'online')) {
        const viewers: { twitch?: number; kick?: number } = {};
        
        // Buscar viewers da Twitch se configurado
        if (streamer.platforms.twitch) {
          try {
            const twitchData = await getTwitchStreamData(streamer.platforms.twitch);
            if (twitchData.isOnline && twitchData.streamInfo) {
              viewers.twitch = twitchData.streamInfo.viewers;
            }
          } catch (error) {
            console.error(`Erro ao buscar viewers da Twitch para ${streamer.name}:`, error);
          }
        }
        
        // Buscar viewers da Kick se configurado
        if (streamer.platforms.kick) {
          try {
            const kickData = await getKickStreamData(streamer.platforms.kick);
            if (kickData.isOnline && kickData.streamInfo) {
              viewers.kick = kickData.streamInfo.viewers;
            }
          } catch (error) {
            console.error(`Erro ao buscar viewers da Kick para ${streamer.name}:`, error);
          }
        }
        
        if (Object.keys(viewers).length > 0) {
          viewersMap.set(streamer.id, viewers);
        }
      }
      
      setPlatformViewers(viewersMap);
    };

    fetchPlatformViewers();
  }, [streamers, isOpen]);

  // Estatísticas
  const totalStreamers = streamers.length;
  const onlineStreamers = streamers.filter(s => s.status === 'online');
  const offlineStreamers = streamers.filter(s => s.status === 'offline');
  const favoriteStreamers = streamers.filter(s => s.isFavorite);
  const activeViewers = viewingStreamers.size;
  const totalViewers = onlineStreamers.reduce((sum, s) => sum + (s.streamInfo?.viewers || 0), 0);
  
  // Streamers por plataforma
  const twitchStreamers = streamers.filter(s => s.platforms.twitch);
  const kickStreamers = streamers.filter(s => s.platforms.kick);
  
  // Viewers por plataforma - usar dados buscados de todas as plataformas
  const twitchViewers = useMemo(() => {
    return twitchStreamers
      .filter(s => s.status === 'online')
      .reduce((sum, s) => {
        // Primeiro tentar usar os dados buscados diretamente
        const platformData = platformViewers.get(s.id);
        if (platformData?.twitch !== undefined) {
          return sum + platformData.twitch;
        }
        // Se não temos dados buscados, usar o streamInfo se for da Twitch
        if (s.streamInfo?.platform === 'twitch') {
          return sum + (s.streamInfo.viewers || 0);
        }
        return sum;
      }, 0);
  }, [twitchStreamers, platformViewers]);
  
  const kickViewers = useMemo(() => {
    return kickStreamers
      .filter(s => s.status === 'online')
      .reduce((sum, s) => {
        // Primeiro tentar usar os dados buscados diretamente
        const platformData = platformViewers.get(s.id);
        if (platformData?.kick !== undefined) {
          return sum + platformData.kick;
        }
        // Se não temos dados buscados, usar o streamInfo se for da Kick
        if (s.streamInfo?.platform === 'kick') {
          return sum + (s.streamInfo.viewers || 0);
        }
        return sum;
      }, 0);
  }, [kickStreamers, platformViewers]);

  // Top 5 streamers por viewers - calcular total de todas as plataformas
  const topStreamers = useMemo(() => {
    return [...onlineStreamers]
      .map(streamer => {
        // Calcular total de viewers de todas as plataformas
        const platformData = platformViewers.get(streamer.id);
        let totalViewers = 0;
        const platformBreakdown: { twitch?: number; kick?: number } = {};
        
        // Usar dados buscados se disponíveis
        if (platformData) {
          if (platformData.twitch !== undefined) {
            totalViewers += platformData.twitch;
            platformBreakdown.twitch = platformData.twitch;
          }
          if (platformData.kick !== undefined) {
            totalViewers += platformData.kick;
            platformBreakdown.kick = platformData.kick;
          }
        } else {
          // Se não temos dados buscados, usar streamInfo
          if (streamer.streamInfo?.viewers) {
            totalViewers = streamer.streamInfo.viewers;
            if (streamer.streamInfo.platform === 'twitch') {
              platformBreakdown.twitch = streamer.streamInfo.viewers;
            } else if (streamer.streamInfo.platform === 'kick') {
              platformBreakdown.kick = streamer.streamInfo.viewers;
            }
          }
        }
        
        return {
          ...streamer,
          totalViewers,
          platformBreakdown
        };
      })
      .sort((a, b) => b.totalViewers - a.totalViewers)
      .slice(0, 5);
  }, [onlineStreamers, platformViewers]);

  if (!isOpen) return null;
  
  // Cálculos adicionais
  const sessionDuration = Math.floor((currentTime.getTime() - sessionStart.getTime()) / 1000 / 60); // minutos
  const averageViewers = onlineStreamers.length > 0 ? Math.round(totalViewers / onlineStreamers.length) : 0;
  const onlineRate = totalStreamers > 0 ? Math.round((onlineStreamers.length / totalStreamers) * 100) : 0;
  
  // Categorias/jogos
  const categories = new Map<string, number>();
  onlineStreamers.forEach(s => {
    const game = s.streamInfo?.game || 'Sem Categoria';
    categories.set(game, (categories.get(game) || 0) + 1);
  });
  const topCategories = Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Streamers com notificações
  const notificationEnabledCount = streamers.filter(s => s.notificationsEnabled).length;

  // Formatação de data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-PT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-PT', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
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
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '1000px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }} className={animatedModalClass}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem 0 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(59, 130, 246, 0.05)',
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
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Activity size={24} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0
                }}>
                  Dashboard
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: 0
                }}>
                  Visão geral do seu Multistream Hub
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
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
            marginBottom: '-1px'
          }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: activeTab === 'overview' 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '10px 10px 0 0',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === 'overview' 
                  ? '2px solid #3b82f6'
                  : '2px solid transparent',
                whiteSpace: 'nowrap'
              }}
            >
              📊 Visão Geral
            </button>
            
            <button
              onClick={() => setActiveTab('analysis')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: activeTab === 'analysis' 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '10px 10px 0 0',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === 'analysis' 
                  ? '2px solid #3b82f6'
                  : '2px solid transparent',
                whiteSpace: 'nowrap'
              }}
            >
              📊 Análise
            </button>
            
            <button
              onClick={() => setActiveTab('comparison')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: activeTab === 'comparison' 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '10px 10px 0 0',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === 'comparison' 
                  ? '2px solid #3b82f6'
                  : '2px solid transparent',
                whiteSpace: 'nowrap'
              }}
            >
              ⚔️ Comparação
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: activeTab === 'history' 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '10px 10px 0 0',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === 'history' 
                  ? '2px solid #3b82f6'
                  : '2px solid transparent',
                whiteSpace: 'nowrap'
              }}
            >
              📅 Histórico
            </button>
            
            <button
              onClick={() => setActiveTab('recommendations')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: activeTab === 'recommendations' 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '10px 10px 0 0',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === 'recommendations' 
                  ? '2px solid #3b82f6'
                  : '2px solid transparent',
                whiteSpace: 'nowrap'
              }}
            >
              💡 Recomendações
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
          background: 'rgba(0, 0, 0, 0.1)'
        }}>
          {/* Tab: Visão Geral */}
          {activeTab === 'overview' && (
            <div>
              {/* Data e Hora */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '0.5rem'
            }}>
              <Calendar size={20} style={{ color: '#3b82f6' }} />
              <span style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                textTransform: 'capitalize'
              }}>
                {formatDate(currentTime)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}>
              <Clock size={20} style={{ color: '#3b82f6' }} />
              <span style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'white',
                fontFamily: 'monospace'
              }}>
                {formatTime(currentTime)}
              </span>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Total de Streamers */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(147, 51, 234, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <Users size={24} style={{ color: '#9333ea' }} />
                <span style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  {totalStreamers}
                </span>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '600'
              }}>
                Total de Streamers
              </div>
            </div>

            {/* Online Agora */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#10b981'
                }}>
                  {onlineStreamers.length}
                </span>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '600'
              }}>
                Online Agora
              </div>
            </div>

            {/* A Assistir */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <Eye size={24} style={{ color: '#3b82f6' }} />
                <span style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#3b82f6'
                }}>
                  {activeViewers}
                </span>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '600'
              }}>
                A Assistir
              </div>
            </div>

            {/* Total de Viewers */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <TrendingUp size={24} style={{ color: '#ef4444' }} />
                <span style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#ef4444'
                }}>
                  {totalViewers.toLocaleString('pt-PT')}
                </span>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '600'
              }}>
                Total de Viewers
              </div>
            </div>
          </div>
            </div>
          )}

          {/* Tab: Análise */}
          {activeTab === 'analysis' && (
            <div>
              {/* Métricas Principais */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                    {averageViewers.toLocaleString('pt-PT')}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Média de Viewers
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📈</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                    {onlineRate}%
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Taxa Online
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👁️</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                    {activeViewers}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    A Assistir Agora
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                    {favoriteStreamers.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Favoritos
                  </div>
                </div>
              </div>

              {/* Gráficos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Gráfico de Pizza - Distribuição por Plataforma */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 1rem 0'
              }}>
                📊 Distribuição por Plataforma
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Twitch', value: twitchStreamers.length, color: '#9146ff' },
                      { name: 'Kick', value: kickStreamers.length, color: '#00ff00' }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Twitch', value: twitchStreamers.length, color: '#9146ff' },
                      { name: 'Kick', value: kickStreamers.length, color: '#00ff00' }
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 15, 35, 0.98)', 
                      border: '3px solid rgba(147, 51, 234, 0.7)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.9)',
                      backdropFilter: 'blur(10px)'
                    }}
                    itemStyle={{
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '700',
                      padding: '6px 0',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
                    }}
                    labelStyle={{
                      color: '#a78bfa',
                      fontSize: '18px',
                      fontWeight: '800',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Barras - Status dos Streamers */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 1rem 0'
              }}>
                📡 Status dos Streamers
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { name: 'Online', value: onlineStreamers.length, fill: '#10b981' },
                    { name: 'Offline', value: offlineStreamers.length, fill: '#6b7280' },
                    { name: 'Favoritos', value: favoriteStreamers.length, fill: '#ef4444' }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255, 255, 255, 0.6)"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.6)"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 15, 35, 0.95)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {[
                      { name: 'Online', value: onlineStreamers.length, fill: '#10b981' },
                      { name: 'Offline', value: offlineStreamers.length, fill: '#6b7280' },
                      { name: 'Favoritos', value: favoriteStreamers.length, fill: '#ef4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Linha - Top Streamers por Viewers */}
          {topStreamers.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 1rem 0'
              }}>
                📈 Viewers dos Top Streamers
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={topStreamers.map(s => ({
                    name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
                    viewers: s.streamInfo?.viewers || 0
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255, 255, 255, 0.6)"
                    style={{ fontSize: '0.75rem' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.6)"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 15, 35, 0.95)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value: number) => [value.toLocaleString('pt-PT'), 'Viewers']}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'white' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="viewers" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
            </div>
          )}

          {/* Tab: Comparação */}
          {activeTab === 'comparison' && (
            <div>
              {/* Título */}
              <div style={{
                textAlign: 'center',
                marginBottom: '2rem'
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  background: 'linear-gradient(90deg, #9146ff 0%, #00ff00 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0 0 0.5rem 0'
                }}>
                  ⚔️ Twitch vs Kick
                </h2>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0
                }}>
                  Comparação detalhada entre as duas plataformas
                </p>
              </div>

              {/* Comparação Lado a Lado */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Twitch */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(145, 70, 255, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
                  borderRadius: '16px',
                  padding: '2rem',
                  border: '2px solid rgba(145, 70, 255, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(145, 70, 255, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(40px)'
                  }} />
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: 'rgba(145, 70, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem'
                    }}>
                      🟣
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: '#9146ff',
                        margin: 0
                      }}>
                        Twitch
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        margin: 0
                      }}>
                        A Gigante do Streaming
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    position: 'relative'
                  }}>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total de Streamers</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{twitchStreamers.length}</span>
                    </div>

                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Online Agora</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                        {twitchStreamers.filter(s => s.status === 'online').length}
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total de Viewers</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                        {twitchViewers.toLocaleString('pt-PT')}
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>Taxa Online</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
                          {twitchStreamers.length > 0 ? Math.round((twitchStreamers.filter(s => s.status === 'online').length / twitchStreamers.length) * 100) : 0}%
                        </span>
                      </div>
                      <div style={{
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${twitchStreamers.length > 0 ? (twitchStreamers.filter(s => s.status === 'online').length / twitchStreamers.length) * 100 : 0}%`,
                          background: 'linear-gradient(90deg, #9146ff 0%, #7c3aed 100%)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kick */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 204, 0, 0.2) 100%)',
                  borderRadius: '16px',
                  padding: '2rem',
                  border: '2px solid rgba(0, 255, 0, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(0, 255, 0, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(40px)'
                  }} />
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: 'rgba(0, 255, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem'
                    }}>
                      🟢
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: '#00ff00',
                        margin: 0
                      }}>
                        Kick
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        margin: 0
                      }}>
                        A Plataforma Emergente
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    position: 'relative'
                  }}>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total de Streamers</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{kickStreamers.length}</span>
                    </div>

                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Online Agora</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                        {kickStreamers.filter(s => s.status === 'online').length}
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total de Viewers</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                        {kickViewers.toLocaleString('pt-PT')}
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>Taxa Online</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
                          {kickStreamers.length > 0 ? Math.round((kickStreamers.filter(s => s.status === 'online').length / kickStreamers.length) * 100) : 0}%
                        </span>
                      </div>
                      <div style={{
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${kickStreamers.length > 0 ? (kickStreamers.filter(s => s.status === 'online').length / kickStreamers.length) * 100 : 0}%`,
                          background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 100%)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 5 Streamers por Plataforma */}
              {topStreamers.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 1rem 0'
              }}>
                🏆 Top 5 Streamers (por Viewers)
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {topStreamers.map((streamer, index) => (
                  <div
                    key={streamer.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7f32' : 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}>
                      {index + 1}
                    </div>
                    <img
                      src={streamer.avatar}
                      alt={streamer.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.2)'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/6B7280/FFFFFF?text=?';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        {streamer.name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.6)'
                      }}>
                        {streamer.streamInfo?.game || 'Sem categoria'}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.25rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                      }}>
                        <Eye size={14} style={{ color: '#ef4444' }} />
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          color: '#ef4444'
                      }}>
                        {(streamer as Streamer & { totalViewers: number; platformBreakdown?: { twitch?: number; kick?: number } }).totalViewers.toLocaleString('pt-PT')}
                      </span>
                    </div>
                    {(() => {
                      const streamerWithData = streamer as Streamer & { totalViewers: number; platformBreakdown?: { twitch?: number; kick?: number } };
                      const breakdown = streamerWithData.platformBreakdown;
                      const hasMultiplePlatforms = breakdown && 
                        breakdown.twitch !== undefined && 
                        breakdown.kick !== undefined;
                      
                      return hasMultiplePlatforms ? (
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          fontSize: '0.7rem',
                          color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                          {breakdown.twitch !== undefined && (
                            <span>
                              🟣 {breakdown.twitch.toLocaleString('pt-PT')}
                            </span>
                          )}
                          {breakdown.kick !== undefined && (
                            <span>
                              🟢 {breakdown.kick.toLocaleString('pt-PT')}
                            </span>
                          )}
                        </div>
                      ) : null;
                    })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

              {/* Mensagem se não houver streamers online */}
              {topStreamers.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 2rem',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    margin: '0 auto 1rem auto'
                  }}>
                    🏆
                  </div>
                  <p style={{
                    fontSize: '1rem',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Nenhum streamer online
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    Os rankings aparecerão quando houver streamers ao vivo
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Histórico */}
          {activeTab === 'history' && (
            <div>
              {/* Informações da Sessão */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 1rem 0'
                }}>
                  ⏱️ Sessão Atual
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏰</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                      {sessionDuration} min
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      Tempo de Sessão
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                      {notificationEnabledCount}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      Notificações Ativas
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                      {formatDate(currentTime)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      Data Atual
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Categorias */}
              {topCategories.length > 0 && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0 0 1rem 0'
                  }}>
                    🎮 Categorias Mais Populares
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '1rem'
                  }}>
                    {topCategories.map(([game, count], index) => (
                      <div
                        key={game}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          textAlign: 'center',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7f32' : 'rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: 'white'
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎮</div>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'white',
                          marginBottom: '0.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {game}
                        </div>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: '#3b82f6'
                        }}>
                          {count} {count === 1 ? 'streamer' : 'streamers'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumo de Plataformas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Twitch */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(145, 70, 255, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(145, 70, 255, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(145, 70, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      🟣
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: '#9146ff',
                        margin: 0
                      }}>
                        Twitch
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        margin: 0
                      }}>
                        {twitchStreamers.length} streamer{twitchStreamers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Online:</span>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>
                        {twitchStreamers.filter(s => s.status === 'online').length}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Offline:</span>
                      <span style={{ color: '#6b7280', fontWeight: '600' }}>
                        {twitchStreamers.filter(s => s.status === 'offline').length}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Viewers:</span>
                      <span style={{ color: 'white', fontWeight: '600' }}>
                        {twitchViewers.toLocaleString('pt-PT')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kick */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 204, 0, 0.2) 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(0, 255, 0, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(0, 255, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      🟢
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: '#00ff00',
                        margin: 0
                      }}>
                        Kick
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        margin: 0
                      }}>
                        {kickStreamers.length} streamer{kickStreamers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Online:</span>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>
                        {kickStreamers.filter(s => s.status === 'online').length}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Offline:</span>
                      <span style={{ color: '#6b7280', fontWeight: '600' }}>
                        {kickStreamers.filter(s => s.status === 'offline').length}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Viewers:</span>
                      <span style={{ color: 'white', fontWeight: '600' }}>
                        {kickViewers.toLocaleString('pt-PT')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Streamers Online */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 1rem 0'
                }}>
                  🔴 Streamers Online Agora ({onlineStreamers.length})
                </h3>
                {onlineStreamers.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '1rem'
                  }}>
                    {onlineStreamers.map((streamer) => (
                      <div
                        key={streamer.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.75rem'
                        }}>
                          <img
                            src={streamer.avatar}
                            alt={streamer.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              border: '2px solid #10b981'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/6B7280/FFFFFF?text=?';
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              color: 'white',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {streamer.name}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: 'rgba(255, 255, 255, 0.6)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {streamer.streamInfo?.game || 'Sem categoria'}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          <span style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <Eye size={12} />
                            {(() => {
                              const platformData = platformViewers.get(streamer.id);
                              const totalViewers = (platformData?.twitch || 0) + (platformData?.kick || 0);
                              return totalViewers > 0 ? totalViewers.toLocaleString('pt-PT') : (streamer.streamInfo?.viewers || 0).toLocaleString('pt-PT');
                            })()}
                          </span>
                          <div style={{
                            display: 'flex',
                            gap: '0.25rem',
                            flexWrap: 'wrap'
                          }}>
                            {(() => {
                              const platformData = platformViewers.get(streamer.id);
                              const platforms = [];
                              if (platformData?.twitch && platformData.twitch > 0) {
                                platforms.push({ name: 'twitch', viewers: platformData.twitch });
                              }
                              if (platformData?.kick && platformData.kick > 0) {
                                platforms.push({ name: 'kick', viewers: platformData.kick });
                              }
                              // Se não temos dados em platformViewers, usar plataforma do streamInfo
                              if (platforms.length === 0 && streamer.streamInfo?.platform) {
                                platforms.push({ name: streamer.streamInfo.platform, viewers: 0 });
                              }
                              // Fallback para primeira plataforma configurada
                              if (platforms.length === 0 && Object.keys(streamer.platforms).length > 0) {
                                platforms.push({ name: Object.keys(streamer.platforms)[0], viewers: 0 });
                              }
                              return platforms;
                            })().map((platform: { name: string; viewers: number }) => (
                              <span
                                key={platform.name}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  background: platform.name === 'twitch' 
                                    ? 'rgba(145, 70, 255, 0.2)' 
                                    : 'rgba(0, 255, 0, 0.2)',
                                  color: platform.name === 'twitch' 
                                    ? '#9146ff' 
                                    : '#00ff00',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  fontSize: '0.7rem'
                                }}
                              >
                                {platform.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    <p style={{ margin: 0 }}>Nenhum streamer online no momento</p>
                  </div>
                )}
              </div>

              {/* Favoritos */}
              {favoriteStreamers.length > 0 && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0 0 1rem 0'
                  }}>
                    ⭐ Seus Favoritos ({favoriteStreamers.length})
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    {favoriteStreamers.map((streamer) => (
                      <div
                        key={streamer.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: 'rgba(239, 68, 68, 0.2)',
                          borderRadius: '20px',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        <img
                          src={streamer.avatar}
                          alt={streamer.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24x24/6B7280/FFFFFF?text=?';
                          }}
                        />
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {streamer.name}
                        </span>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: streamer.status === 'online' ? '#10b981' : '#6b7280'
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Recomendações */}
          {activeTab === 'recommendations' && (
            <div>
              {/* Título */}
              <div style={{
                textAlign: 'center',
                marginBottom: '2rem'
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  background: 'linear-gradient(90deg, #9333ea 0%, #fbbf24 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0 0 0.5rem 0'
                }}>
                  💡 Recomendações
                </h2>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0
                }}>
                  Dicas e sugestões para melhorar sua experiência
                </p>
              </div>

              {/* Cards de Recomendações */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Recomendação 1 */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '1rem'
                  }}>
                    📊
                  </div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    Adicione Mais Streamers
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    Você tem {totalStreamers} streamer{totalStreamers !== 1 ? 's' : ''}. Considere adicionar mais para aumentar suas opções de visualização.
                  </p>
                </div>

                {/* Recomendação 2 */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '1rem'
                  }}>
                    🎯
                  </div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    Ative Notificações
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    {onlineStreamers.length > 0 
                      ? `Você tem ${onlineStreamers.length} streamer${onlineStreamers.length !== 1 ? 's' : ''} online agora. Ative notificações para não perder quando seus favoritos entrarem ao vivo.`
                      : 'Ative notificações para seus streamers favoritos e seja avisado quando entrarem ao vivo.'}
                  </p>
                </div>

                {/* Recomendação 3 */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(147, 51, 234, 0.3)'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '1rem'
                  }}>
                    ⭐
                  </div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    Marque Favoritos
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    {favoriteStreamers.length > 0
                      ? `Você tem ${favoriteStreamers.length} favorito${favoriteStreamers.length !== 1 ? 's' : ''}. Adicione mais para facilitar o acesso rápido aos seus streamers preferidos.`
                      : 'Marque seus streamers favoritos para acesso rápido e personalização da sua experiência.'}
                  </p>
                </div>
              </div>

              {/* Categorias Mais Populares */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 1rem 0'
                }}>
                  🎮 Categorias Mais Populares
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {(() => {
                    const categories: Record<string, number> = {};
                    onlineStreamers.forEach(s => {
                      const game = s.streamInfo?.game || 'Sem Categoria';
                      categories[game] = (categories[game] || 0) + 1;
                    });
                    return Object.entries(categories)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([game, count]) => (
                        <div
                          key={game}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            padding: '1rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{
                            fontSize: '2rem',
                            marginBottom: '0.5rem'
                          }}>
                            🎮
                          </div>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'white',
                            marginBottom: '0.25rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {game}
                          </div>
                          <div style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#3b82f6'
                          }}>
                            {count}
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Fixo */}
        <div style={{
          padding: '1rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(59, 130, 246, 0.05)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            {activeTab === 'overview' && '📊 Visão geral do seu Multistream Hub'}
            {activeTab === 'analysis' && '📈 Análise detalhada com gráficos e métricas'}
            {activeTab === 'comparison' && '⚔️ Comparação entre Twitch e Kick'}
            {activeTab === 'history' && '📅 Histórico da sessão e categorias populares'}
            {activeTab === 'recommendations' && '💡 Sugestões para melhorar a experiência'}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
                animation: onlineStreamers.length > 0 ? 'pulse 2s infinite' : 'none'
              }} />
              <span>{onlineStreamers.length} Online</span>
            </div>
            <div>|</div>
            <div>{totalStreamers} Total</div>
            <div>|</div>
            <div>{totalViewers.toLocaleString('pt-PT')} Viewers</div>
          </div>
        </div>
      </div>
    </div>
  );
}

