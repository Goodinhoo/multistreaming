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

export default Swal;
