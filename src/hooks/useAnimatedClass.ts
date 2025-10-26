import { useAnimations } from './useAnimations';

export function useAnimatedClass(baseClass: string, animationClass: string, duration?: string) {
  const { animationsEnabled } = useAnimations();
  
  if (!animationsEnabled) {
    return baseClass;
  }
  
  let classes = `${baseClass} animate__animated ${animationClass}`;
  
  if (duration) {
    classes += ` animate__duration-${duration}`;
  }
  
  return classes;
}

// Hook específico para animações com durações customizadas
export function useAnimatedClassWithDuration(
  baseClass: string, 
  animationClass: string, 
  duration: number = 500
) {
  const { animationsEnabled } = useAnimations();
  
  if (!animationsEnabled) {
    return baseClass;
  }
  
  return `${baseClass} animate__animated ${animationClass} animate__duration-${duration}`;
}

// Hook para animações infinitas
export function useInfiniteAnimation(
  baseClass: string, 
  animationClass: string, 
  duration: number = 2000
) {
  const { animationsEnabled } = useAnimations();
  
  if (!animationsEnabled) {
    return baseClass;
  }
  
  // Se animationClass estiver vazio, retornar apenas baseClass (para usar animações CSS customizadas)
  if (!animationClass) {
    return baseClass;
  }
  
  return `${baseClass} animate__animated ${animationClass} animate__infinite animate__duration-${duration}`;
}

// Hook para animações de hover com controle condicional
export function useHoverAnimation(
  baseClass: string, 
  hoverClass: string
) {
  const { animationsEnabled } = useAnimations();
  
  if (!animationsEnabled) {
    return baseClass;
  }
  
  return `${baseClass} ${hoverClass}`;
}

// Hook para microinterações estratégicas
export function useMicroInteraction(baseClass: string) {
  const { animationsEnabled } = useAnimations();
  
  if (!animationsEnabled) {
    return baseClass;
  }
  
  return `${baseClass} micro-interaction`;
}

// Hook para feedback de estados
export function useStateFeedback(baseClass: string, state: 'success' | 'error' | 'loading' | 'notification') {
  const { animationsEnabled } = useAnimations();
  
  if (!animationsEnabled) {
    return baseClass;
  }
  
  const stateClasses = {
    success: 'success-state',
    error: 'error-state', 
    loading: 'loading-feedback',
    notification: 'notification-gentle'
  };
  
  return `${baseClass} ${stateClasses[state]}`;
}
