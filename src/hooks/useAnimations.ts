import { useSettings } from './useSettings';

export function useAnimations() {
  const { settings } = useSettings();
  const animationsEnabled = settings.animations;

  return {
    animationsEnabled
  };
}