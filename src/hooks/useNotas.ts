import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllNotas,
  getCachedNotas,
  parseNotas,
  getNotesForContact,
  addNota,
  deleteNota,
} from '../services/notas.service';
import type { Nota } from '../types';

export function useNotas() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notas'],
    queryFn: fetchAllNotas,
    initialData: () => {
      const cached = getCachedNotas();
      return cached.length > 0 ? cached : undefined;
    },
    initialDataUpdatedAt: 0,
    staleTime: 30 * 1000,
  });

  const rawData = data ?? [];

  const allNotas = useMemo(() => parseNotas(rawData), [rawData]);

  const getNotesFor = useCallback(
    (clienteKey: string): Nota[] => getNotesForContact(allNotas, clienteKey),
    [allNotas]
  );

  const addNoteMutation = useMutation({
    mutationFn: addNota,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notas'] }),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (rowIndex: number) => deleteNota(rowIndex),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notas'] }),
  });

  return {
    allNotas,
    getNotesForContact: getNotesFor,
    addNote: addNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    loading: isLoading,
  };
}
