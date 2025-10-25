import Swal from 'sweetalert2';

// Configuração personalizada do SweetAlert2 para o Multistream Hub
const customTheme = {
  color: {
    primary: '#9333ea',
    secondary: '#7c3aed',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    dark: '#0f0f23',
    light: '#f8fafc'
  },
  background: {
    primary: 'rgba(15, 15, 35, 0.95)',
    secondary: 'rgba(147, 51, 234, 0.1)',
    backdrop: 'rgba(0, 0, 0, 0.4)'
  }
};

// Configuração global do SweetAlert2
Swal.mixin({
  customClass: {
    popup: 'swal-custom-popup',
    title: 'swal-custom-title',
    confirmButton: 'swal-custom-confirm',
    cancelButton: 'swal-custom-cancel',
    denyButton: 'swal-custom-deny'
  },
  buttonsStyling: false,
  backdrop: 'rgba(0, 0, 0, 0.4)',
  allowOutsideClick: false,
  allowEscapeKey: true,
  showCloseButton: true,
  focusConfirm: true,
  focusCancel: false,
  reverseButtons: true,
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  denyButtonText: 'Negar',
  showDenyButton: false,
  showCancelButton: true,
  heightAuto: true,
  width: 'auto',
  padding: '2rem',
  // Forçar tema escuro
  color: '#e2e8f0',
  background: 'rgba(15, 15, 35, 0.95)'
});

// Funções específicas para diferentes tipos de confirmação
export const confirmDeleteStreamer = (streamerName: string) => {
  return Swal.fire({
    title: 'Eliminar Streamer',
    html: `
      <div style="text-align: center; padding: 1rem 0;">
        <p style="margin-bottom: 1rem; color: #e2e8f0;">
          Tem a certeza que deseja eliminar <strong style="color: #9333ea;">${streamerName}</strong>?
        </p>
        <p style="color: #94a3b8; font-size: 0.9rem;">
          Esta ação não pode ser desfeita.
        </p>
      </div>
    `,
    icon: 'warning',
    iconColor: customTheme.color.warning,
    confirmButtonText: 'Sim, Eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: customTheme.color.error,
    cancelButtonColor: customTheme.color.dark,
    showCancelButton: true,
    focusCancel: true,
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const confirmCloseStream = (streamerName: string) => {
  return Swal.fire({
    title: 'Fechar Visualização',
    html: `
      <div style="text-align: center; padding: 1rem 0;">
        <p style="margin-bottom: 1rem; color: #e2e8f0;">
          Deseja fechar a visualização de <strong style="color: #9333ea;">${streamerName}</strong>?
        </p>
        <p style="color: #94a3b8; font-size: 0.9rem;">
          Pode sempre reativar clicando no card do streamer.
        </p>
      </div>
    `,
    icon: 'question',
    iconColor: customTheme.color.info,
    confirmButtonText: 'Fechar',
    cancelButtonText: 'Manter Aberto',
    confirmButtonColor: customTheme.color.warning,
    cancelButtonColor: customTheme.color.primary,
    showCancelButton: true,
    focusCancel: true,
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const confirmSaveSettings = () => {
  return Swal.fire({
    title: 'Guardar Configurações',
    html: `
      <div style="text-align: center; padding: 1rem 0;">
        <p style="margin-bottom: 1rem; color: #e2e8f0;">
          Deseja guardar as alterações nas configurações?
        </p>
        <p style="color: #94a3b8; font-size: 0.9rem;">
          As configurações serão aplicadas imediatamente.
        </p>
      </div>
    `,
    icon: 'question',
    iconColor: customTheme.color.info,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: customTheme.color.success,
    cancelButtonColor: customTheme.color.dark,
    showCancelButton: true,
    focusCancel: true,
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const confirmReduceViewers = (currentViewers: number, newLimit: number) => {
  const streamsToClose = currentViewers - newLimit;
  
  return Swal.fire({
    title: 'Reduzir Visualizadores',
    html: `
      <div style="text-align: center; padding: 1rem 0;">
        <p style="margin-bottom: 1rem; color: #e2e8f0;">
          Tem <strong style="color: #9333ea;">${currentViewers}</strong> visualizadores ativos.
        </p>
        <p style="margin-bottom: 1rem; color: #e2e8f0;">
          Ao reduzir para <strong style="color: #f59e0b;">${newLimit}</strong>, 
          <strong style="color: #ef4444;">${streamsToClose}</strong> visualização(ões) será(ão) fechada(s) automaticamente.
        </p>
        <p style="color: #94a3b8; font-size: 0.9rem;">
          Os visualizadores mais antigos serão fechados primeiro.
        </p>
      </div>
    `,
    icon: 'warning',
    iconColor: customTheme.color.warning,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: customTheme.color.warning,
    cancelButtonColor: customTheme.color.dark,
    showCancelButton: true,
    focusCancel: true,
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const confirmUnsavedChanges = () => {
  return Swal.fire({
    title: 'Alterações Não Guardadas',
    html: `
      <div style="text-align: center; padding: 1rem 0;">
        <p style="margin-bottom: 1rem; color: #e2e8f0;">
          Tem alterações não guardadas nas configurações.
        </p>
        <p style="color: #94a3b8; font-size: 0.9rem;">
          Deseja sair sem guardar?
        </p>
      </div>
    `,
    icon: 'warning',
    iconColor: customTheme.color.warning,
    confirmButtonText: 'Sair Sem Guardar',
    cancelButtonText: 'Continuar Editando',
    confirmButtonColor: customTheme.color.error,
    cancelButtonColor: customTheme.color.primary,
    showCancelButton: true,
    focusCancel: true,
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const showSuccess = (title: string, message: string) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    iconColor: customTheme.color.success,
    confirmButtonText: 'OK',
    confirmButtonColor: customTheme.color.success,
    showCancelButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const showSuccessToast = (title: string, message: string) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    iconColor: customTheme.color.success,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 500, // Reduzido para 500ms (meio segundo)
    timerProgressBar: true,
    width: 'auto',
    padding: '1rem',
    customClass: {
      popup: 'swal-custom-popup swal-toast',
      title: 'swal-custom-title swal-toast-title'
    }
  });
};

export const showError = (title: string, message: string) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    iconColor: customTheme.color.error,
    confirmButtonText: 'OK',
    confirmButtonColor: customTheme.color.error,
    showCancelButton: false,
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const showInfo = (title: string, message: string) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'info',
    iconColor: customTheme.color.info,
    confirmButtonText: 'OK',
    confirmButtonColor: customTheme.color.info,
    showCancelButton: false,
    timer: 4000,
    timerProgressBar: true,
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const showLoading = (title: string, message: string) => {
  return Swal.fire({
    title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0',
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const closeLoading = () => {
  Swal.close();
};

// Funções de Backup/Restore
export const confirmExportData = () => {
  return Swal.fire({
    title: '📤 Exportar Dados',
    html: `
      <div style="text-align: left; margin: 1rem 0;">
        <p style="margin-bottom: 1rem;">Esta ação irá:</p>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li>📋 Exportar todos os seus streamers</li>
          <li>⚙️ Incluir todas as configurações</li>
          <li>💾 Criar um arquivo JSON para download</li>
        </ul>
        <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2);">
          <strong style="color: #3b82f6;">💡 Dica:</strong> Guarde este arquivo em local seguro para restaurar seus dados mais tarde!
        </div>
      </div>
    `,
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: '📤 Exportar Agora',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const confirmImportData = () => {
  return Swal.fire({
    title: '📥 Importar Dados',
    html: `
      <div style="text-align: left; margin: 1rem 0;">
        <p style="margin-bottom: 1rem;">Esta ação irá:</p>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li>📋 Substituir todos os streamers atuais</li>
          <li>⚙️ Restaurar todas as configurações</li>
          <li>🔄 Sobrescrever dados existentes</li>
        </ul>
        <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);">
          <strong style="color: #ef4444;">⚠️ Atenção:</strong> Todos os dados atuais serão perdidos! Faça backup antes de importar.
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '📥 Importar Arquivo',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const confirmClearAllData = () => {
  return Swal.fire({
    title: '🗑️ Limpar Todos os Dados',
    html: `
      <div style="text-align: left; color: white; font-family: 'Inter', sans-serif;">
        <div style="color: #ef4444; font-weight: 600; margin-bottom: 1rem;">
          ⚠️ Esta ação é <strong>IRREVERSÍVEL</strong> e irá:
        </div>
        
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="color: #ef4444;">🗑️</span>
            <span>Apagar <strong>TODOS</strong> os streamers</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="color: #ef4444;">⚙️</span>
            <span>Resetar <strong>TODAS</strong> as configurações</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="color: #ef4444;">📊</span>
            <span>Limpar histórico e estatísticas</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: #ef4444;">💾</span>
            <span>Remover dados do localStorage</span>
          </div>
        </div>
        
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: #ef4444; font-weight: 600;">
            <span>🚨</span>
            <span>PERIGO: Sem backup, os dados ficam perdidos PARA SEMPRE!</span>
          </div>
        </div>
        
        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: #3b82f6; font-weight: 600;">
            <span>💡</span>
            <span>Recomendação: Exporte seus dados antes de limpar!</span>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="position: relative;">
            <input type="checkbox" id="confirmClear" style="
              appearance: none;
              width: 20px;
              height: 20px;
              border: 2px solid rgba(255, 255, 255, 0.3);
              border-radius: 4px;
              background: rgba(255, 255, 255, 0.05);
              cursor: pointer;
              position: relative;
              transition: all 0.3s ease;
            ">
            <div id="checkmark" style="
              position: absolute;
              top: 2px;
              left: 2px;
              width: 16px;
              height: 16px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border-radius: 2px;
              opacity: 0;
              transform: scale(0);
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;
            ">✓</div>
          </div>
          <label for="confirmClear" style="
            color: rgba(255, 255, 255, 0.9); 
            font-size: 0.95rem; 
            font-weight: 500;
            cursor: pointer;
            user-select: none;
            transition: color 0.3s ease;
          ">
            Confirmo que li e entendi os riscos desta ação irreversível
          </label>
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '🗑️ Limpar TUDO',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: 'white',
    customClass: {
      popup: 'swal-clear-data-popup',
      confirmButton: 'swal-clear-confirm-btn',
      cancelButton: 'swal-clear-cancel-btn'
    },
    didOpen: () => {
      const confirmBtn = document.querySelector('.swal-clear-confirm-btn') as HTMLButtonElement;
      const checkbox = document.getElementById('confirmClear') as HTMLInputElement;
      const checkmark = document.getElementById('checkmark') as HTMLDivElement;
      
      if (confirmBtn && checkbox && checkmark) {
        // Desabilitar botão inicialmente
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';
        confirmBtn.style.cursor = 'not-allowed';
        confirmBtn.style.transform = 'scale(0.95)';
        
        // Adicionar listener para checkbox
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            // Ativar checkbox visual
            checkbox.style.borderColor = '#10b981';
            checkbox.style.background = 'rgba(16, 185, 129, 0.1)';
            checkmark.style.opacity = '1';
            checkmark.style.transform = 'scale(1)';
            
            // Ativar botão
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.cursor = 'pointer';
            confirmBtn.style.transform = 'scale(1)';
            confirmBtn.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
          } else {
            // Desativar checkbox visual
            checkbox.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            checkbox.style.background = 'rgba(255, 255, 255, 0.05)';
            checkmark.style.opacity = '0';
            checkmark.style.transform = 'scale(0)';
            
            // Desativar botão
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
            confirmBtn.style.transform = 'scale(0.95)';
            confirmBtn.style.boxShadow = 'none';
          }
        });
        
        // Adicionar hover effects
        checkbox.addEventListener('mouseenter', () => {
          if (!checkbox.checked) {
            checkbox.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            checkbox.style.background = 'rgba(255, 255, 255, 0.1)';
          }
        });
        
        checkbox.addEventListener('mouseleave', () => {
          if (!checkbox.checked) {
            checkbox.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            checkbox.style.background = 'rgba(255, 255, 255, 0.05)';
          }
        });
      }
    },
    preConfirm: () => {
      const checkbox = document.getElementById('confirmClear') as HTMLInputElement;
      if (!checkbox || !checkbox.checked) {
        Swal.showValidationMessage('Você deve confirmar que leu e entendeu os riscos');
        return false;
      }
      return true;
    }
  });
};

export const showImportSuccess = (count: number) => {
  return Swal.fire({
    title: '✅ Importação Concluída',
    html: `
      <div style="text-align: center; margin: 1rem 0;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">
          <strong>${count}</strong> streamer${count !== 1 ? 's' : ''} importado${count !== 1 ? 's' : ''} com sucesso!
        </p>
        <p style="color: rgba(255, 255, 255, 0.7); margin: 0;">
          Todas as configurações foram restauradas.
        </p>
      </div>
    `,
    icon: 'success',
    confirmButtonText: 'Perfeito!',
    confirmButtonColor: '#10b981',
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const showExportSuccess = () => {
  return Swal.fire({
    title: '✅ Exportação Concluída',
    html: `
      <div style="text-align: center; margin: 1rem 0;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📤</div>
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">
          <strong>Dados exportados com sucesso!</strong>
        </p>
        <p style="color: rgba(255, 255, 255, 0.7); margin: 0;">
          O arquivo foi baixado para o seu dispositivo.
        </p>
      </div>
    `,
    icon: 'success',
    confirmButtonText: 'Ótimo!',
    confirmButtonColor: '#3b82f6',
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export const showClearSuccess = () => {
  return Swal.fire({
    title: '✅ Limpeza Concluída',
    html: `
      <div style="text-align: center; margin: 1rem 0;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🧹</div>
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">
          <strong>Todos os dados foram removidos!</strong>
        </p>
        <p style="color: rgba(255, 255, 255, 0.7); margin: 0;">
          O aplicativo foi resetado para o estado inicial.
        </p>
      </div>
    `,
    icon: 'success',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#6b7280',
    background: 'rgba(15, 15, 35, 0.95)',
    color: '#e2e8f0'
  });
};

export default Swal;
