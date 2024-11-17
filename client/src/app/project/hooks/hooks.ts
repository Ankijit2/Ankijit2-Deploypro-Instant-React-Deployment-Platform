import axios from 'axios'

import z from 'zod';
import { ProjectSchema } from '@/type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const  apiClient = axios.create({ baseURL: '/api/v1' });

 const getProject = async (id?: string) => {
  return (await apiClient.get(`project${id ? `?id=${id}` : ''}`))
    .data;
};

 const postProject = async (data: z.infer<typeof ProjectSchema>) => {
  return (await apiClient.post('project', data)).data;
};

 const deleteProject = async (id:string) => {
  return (await apiClient.delete(`project?id=${id}`,)).data;
};

 const updateProject = async (data: { id: string; data: z.infer<typeof ProjectSchema> }) => {
  return (await apiClient.put(`project`, data)).data;
};


const getLogs = async (id: string) => {
  return (await axios.get(`http://localhost:4000/logs/${id}`)).data;
}


export function useGetproject(id?: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
  });
}

export function usePostproject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postProject,
    onSuccess: async() => {
      await queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useDeleteproject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: async() => {
      await queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useUpdateproject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProject,
    onSuccess: async() => {
      await queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useGetLogs(id: string) {
  return useQuery({
    queryKey: ['logs', id],
    queryFn: () => getLogs(id),
  });
}