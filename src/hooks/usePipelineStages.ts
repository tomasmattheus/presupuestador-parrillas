import { useState, useCallback } from 'react';
import {
  getPipelineStages,
  savePipelineStages,
} from '../services/settings.service';
import { pushSingleKey } from '../services/sync.service';
import { CACHE_KEYS } from '../lib/cache';
import type { PipelineStage } from '../types';

function syncStages() { pushSingleKey(CACHE_KEYS.pipelineStages).catch(() => {}); }

export function usePipelineStages() {
  const [stages, setStages] = useState<PipelineStage[]>(getPipelineStages);

  const saveStages = useCallback((updated: PipelineStage[]) => {
    savePipelineStages(updated);
    setStages(updated);
    syncStages();
  }, []);

  const addStage = useCallback((stage: PipelineStage) => {
    setStages((prev) => {
      const next = [...prev, stage];
      savePipelineStages(next);
      syncStages();
      return next;
    });
  }, []);

  const deleteStage = useCallback((index: number) => {
    setStages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      savePipelineStages(next);
      syncStages();
      return next;
    });
  }, []);

  const getActiveStages = useCallback(
    () => stages.filter((s) => s.name !== 'Cerrado Ganado' && s.name !== 'Cerrado Perdido'),
    [stages]
  );

  return { stages, saveStages, addStage, deleteStage, getActiveStages };
}
