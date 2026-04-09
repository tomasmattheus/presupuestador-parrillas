import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllLeads, getCachedLeads } from '../services/leads.service';
import { usePipelineStages } from './usePipelineStages';

export function useLeads() {
  const { stages } = usePipelineStages();
  const queryClient = useQueryClient();
  const prevStagesRef = useRef('');

  const stageNames = stages.map((s) => s.name).join(',');

  useEffect(() => {
    if (prevStagesRef.current && prevStagesRef.current !== stageNames) {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
    prevStagesRef.current = stageNames;
  }, [stageNames, queryClient]);

  return useQuery({
    queryKey: ['leads'],
    queryFn: () => fetchAllLeads(stages),
    placeholderData: getCachedLeads(),
    staleTime: 30 * 1000,
  });
}
