import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useDataRefresh() {
  const queryClient = useQueryClient();

  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
    queryClient.invalidateQueries({ queryKey: ['ventas'] });
    queryClient.invalidateQueries({ queryKey: ['notas'] });
  }, [queryClient]);

  return { refreshAll };
}
