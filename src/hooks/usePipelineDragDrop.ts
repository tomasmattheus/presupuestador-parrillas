import { useRef, useCallback } from 'react';
import type { Lead } from '../types';

export function usePipelineDragDrop(onStageDrop: (lead: Lead, newStage: string) => void) {
  const draggedCard = useRef<Lead | null>(null);

  const onDragStart = useCallback((lead: Lead) => {
    draggedCard.current = lead;
  }, []);

  const onDragEnd = useCallback(() => {
    draggedCard.current = null;
  }, []);

  const onDrop = useCallback(
    (newStage: string) => {
      if (draggedCard.current) {
        onStageDrop(draggedCard.current, newStage);
        draggedCard.current = null;
      }
    },
    [onStageDrop]
  );

  return { draggedCard, onDragStart, onDragEnd, onDrop };
}
