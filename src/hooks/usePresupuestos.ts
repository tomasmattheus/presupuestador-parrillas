import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllPresupuestos, getCachedPresupuestos, getAllBudgetsFlat, getNextPresupNumber } from '../services/presupuestos.service';

export function usePresupuestos() {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['presupuestos'],
    queryFn: fetchAllPresupuestos,
    placeholderData: getCachedPresupuestos(),
    staleTime: 30 * 1000,
  });

  const rawData = data ?? [];

  const budgetsFlat = useMemo(() => getAllBudgetsFlat(rawData), [rawData]);

  const nextNumber = useMemo(() => getNextPresupNumber(budgetsFlat), [budgetsFlat]);

  return {
    data: rawData,
    budgetsFlat,
    nextNumber,
    loading: isLoading,
    fetching: isFetching,
  };
}
