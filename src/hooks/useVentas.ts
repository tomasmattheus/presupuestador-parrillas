import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllVentas, getCachedVentas, parseVentas } from '../services/ventas.service';
import { useLeads } from './useLeads';

export function useVentas() {
  const { data: leads = [] } = useLeads();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['ventas'],
    queryFn: fetchAllVentas,
    initialData: () => {
      const cached = getCachedVentas();
      return cached.length > 0 ? cached : undefined;
    },
    initialDataUpdatedAt: 0,
    staleTime: 30 * 1000,
  });

  const rawData = data ?? [];

  const ganados = useMemo(
    () => leads.filter((l) => l.stage === 'Cerrado Ganado'),
    [leads]
  );

  const { ventasMap, ventasList } = useMemo(
    () => parseVentas(rawData, ganados),
    [rawData, ganados]
  );

  const filtered = useMemo(() => {
    if (!dateFrom && !dateTo) return ventasList;
    return ventasList.filter((row) => {
      const fecha = row[5] || row[2] || '';
      if (dateFrom && fecha < dateFrom) return false;
      if (dateTo && fecha > dateTo) return false;
      return true;
    });
  }, [ventasList, dateFrom, dateTo]);

  const metrics = useMemo(() => {
    let totalMonto = 0;
    filtered.forEach((row) => {
      totalMonto += parseFloat(row[2]) || 0;
    });
    const count = filtered.length;
    const ticketPromedio = count > 0 ? totalMonto / count : 0;
    return { totalMonto, count, ticketPromedio };
  }, [filtered]);

  return {
    data: rawData,
    ventasMap,
    ventasList,
    filtered,
    metrics,
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
    loading: isLoading,
  };
}
