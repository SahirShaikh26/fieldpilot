import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export function useLogs(filters = {}) {
  return useQuery({
    queryKey: ['logs', filters],
    queryFn: async () => {
      const { data } = await api.get('/logs', { params: filters });
      return data;
    },
  });
}

export function useCreateLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log) => api.post('/logs', log).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['logs'] }),
  });
}

export function useUpdateLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/logs/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['logs'] }),
  });
}

export function useDeleteLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/logs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['logs'] }),
  });
}
