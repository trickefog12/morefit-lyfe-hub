import React from 'react';
import { useHaptics } from '@/hooks/useHaptics';

interface HapticWrapperProps {
  children: React.ReactElement;
  type?: 'light' | 'medium' | 'heavy' | 'selection';
  disabled?: boolean;
}

/**
 * Wrapper component to add haptic feedback to any interactive element
 * 
 * @example
 * <HapticWrapper type="light">
 *   <div onClick={handleClick}>Tap me</div>
 * </HapticWrapper>
 */
export const HapticWrapper: React.FC<HapticWrapperProps> = ({ 
  children, 
  type = 'medium',
  disabled = false 
}) => {
  const haptics = useHaptics();

  const handleInteraction = async (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !haptics.isAvailable) return;

    switch (type) {
      case 'light':
        await haptics.light();
        break;
      case 'heavy':
        await haptics.heavy();
        break;
      case 'selection':
        await haptics.selectionChanged();
        break;
      case 'medium':
      default:
        await haptics.medium();
        break;
    }

    // Call original onClick or onTouchStart if it exists
    const originalOnClick = children.props.onClick;
    const originalOnTouchStart = children.props.onTouchStart;

    if (e.type === 'click' && originalOnClick) {
      originalOnClick(e);
    } else if (e.type === 'touchstart' && originalOnTouchStart) {
      originalOnTouchStart(e);
    }
  };

  return React.cloneElement(children, {
    onClick: handleInteraction,
    onTouchStart: handleInteraction,
  });
};
