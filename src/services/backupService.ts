import type { Streamer } from '../types';
import type { AppSettings } from '../types/settings';

export interface BackupData {
  version: string;
  timestamp: string;
  streamers: Streamer[];
  settings: AppSettings;
  metadata: {
    totalStreamers: number;
    favoriteCount: number;
    onlineCount: number;
    platformBreakdown: {
      twitch: number;
      kick: number;
      youtube: number;
    };
  };
}

export class BackupService {
  private static readonly BACKUP_VERSION = '1.0.0';

  /**
   * Exporta todos os dados para um arquivo JSON
   */
  static async exportData(streamers: Streamer[], settings: AppSettings): Promise<void> {
    const onlineCount = streamers.filter(s => s.status === 'online').length;
    const favoriteCount = streamers.filter(s => s.isFavorite).length;
    
    const backupData: BackupData = {
      version: this.BACKUP_VERSION,
      timestamp: new Date().toISOString(),
      streamers,
      settings,
      metadata: {
        totalStreamers: streamers.length,
        favoriteCount,
        onlineCount,
        platformBreakdown: {
          twitch: streamers.filter(s => s.platforms.twitch).length,
          kick: streamers.filter(s => s.platforms.kick).length,
          youtube: streamers.filter(s => s.platforms.youtube).length
        }
      }
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `multistream-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Importa dados de um arquivo JSON
   */
  static async importData(file: File): Promise<{ streamers: Streamer[]; settings: AppSettings }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          const backupData: BackupData = JSON.parse(jsonString);
          
          // Validar estrutura do arquivo
          if (!this.validateBackupData(backupData)) {
            throw new Error('Arquivo de backup inválido ou corrompido');
          }
          
          resolve({
            streamers: backupData.streamers,
            settings: backupData.settings
          });
        } catch (error) {
          reject(new Error('Erro ao processar arquivo: ' + (error as Error).message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Valida se os dados de backup são válidos
   */
  private static validateBackupData(data: unknown): data is BackupData {
    if (!data || typeof data !== 'object') return false;
    
    const obj = data as Record<string, unknown>;
    
    return (
      typeof obj.version === 'string' &&
      typeof obj.timestamp === 'string' &&
      Array.isArray(obj.streamers) &&
      typeof obj.settings === 'object' &&
      typeof obj.metadata === 'object'
    );
  }

  /**
   * Limpa todos os dados do localStorage
   */
  static clearAllData(): void {
    // Lista de todas as chaves que podem existir no localStorage
    const keysToRemove = [
      'streamers',
      'streamers_backup',
      'settings',
      'settings_backup',
      'viewingStreamers',
      'favorites',
      'notifications',
      'theme',
      'language',
      'lastUpdate',
      'sessionData'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Limpar também qualquer chave que comece com 'multistream'
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('multistream') || key.startsWith('stream')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Cria um backup automático no localStorage
   */
  static createAutoBackup(streamers: Streamer[], settings: AppSettings): void {
    const backupData: BackupData = {
      version: this.BACKUP_VERSION,
      timestamp: new Date().toISOString(),
      streamers,
      settings,
      metadata: {
        totalStreamers: streamers.length,
        favoriteCount: streamers.filter(s => s.isFavorite).length,
        onlineCount: streamers.filter(s => s.status === 'online').length,
        platformBreakdown: {
          twitch: streamers.filter(s => s.platforms.twitch).length,
          kick: streamers.filter(s => s.platforms.kick).length,
          youtube: streamers.filter(s => s.platforms.youtube).length
        }
      }
    };

    localStorage.setItem('multistream_auto_backup', JSON.stringify(backupData));
  }

  /**
   * Restaura dados do backup automático
   */
  static restoreAutoBackup(): { streamers: Streamer[]; settings: AppSettings } | null {
    try {
      const backupString = localStorage.getItem('multistream_auto_backup');
      if (!backupString) return null;

      const backupData: BackupData = JSON.parse(backupString);
      
      if (!this.validateBackupData(backupData)) {
        return null;
      }

      return {
        streamers: backupData.streamers,
        settings: backupData.settings
      };
    } catch {
      return null;
    }
  }

  /**
   * Obtém informações do backup automático
   */
  static getAutoBackupInfo(): { timestamp: string; streamerCount: number } | null {
    try {
      const backupString = localStorage.getItem('multistream_auto_backup');
      if (!backupString) return null;

      const backupData: BackupData = JSON.parse(backupString);
      return {
        timestamp: backupData.timestamp,
        streamerCount: backupData.metadata.totalStreamers
      };
    } catch {
      return null;
    }
  }
}
