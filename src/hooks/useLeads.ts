import { useQuery } from '@tanstack/react-query';
import { fetchAllLeads, getCachedLeads } from '../services/leads.service';
import { usePipelineStages } from './usePipelineStages';

export function useLeads() {
  const { stages } = usePipelineStages();

  return useQuery({
    queryKey: ['leads'],
    queryFn: () => fetchAllLeads(stages),
    placeholderData: getCachedLeads(),
    staleTime: 30 * 1000,
  });
}
