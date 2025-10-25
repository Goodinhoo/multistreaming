import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useAnimations() {
  const [animationsEnabled, setAnimationsEnabled] = useLocalStorage<boolean>('animationsEnabled', true);

  useEffect(() => {
    // Aplicar classe ao body baseado no estado das animações
    if (animationsEnabled) {
      document.body.classList.remove('animations-disabled');
      document.body.classList.add('animations-enabled');
    } else {
      document.body.classList.remove('animations-enabled');
      document.body.classList.add('animations-disabled');
    }

    // Cleanup ao desmontar
    return () => {
      document.body.classList.remove('animations-enabled', 'animations-disabled');
    };
  }, [animationsEnabled]);

  const updateAnimations = (enabled: boolean) => {
    setAnimationsEnabled(enabled);
  };

  const toggleAnimations = () => {
    const newValue = !animationsEnabled;
    updateAnimations(newValue);
  };

  const enableAnimations = () => {
    updateAnimations(true);
  };

  const disableAnimations = () => {
    updateAnimations(false);
  };

  return {
    animationsEnabled,
    toggleAnimations,
    enableAnimations,
    disableAnimations,
    setAnimationsEnabled: updateAnimations
  };
}