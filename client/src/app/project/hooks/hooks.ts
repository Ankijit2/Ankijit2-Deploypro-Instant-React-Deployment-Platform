import axios from 'axios';
import z from 'zod';
import { ProjectSchema } from '@/type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// API client setup
const apiClient = axios.create({ 
    baseURL: 'http://localhost:4000/api/v1/project',
    withCredentials: true 
});

// Types
interface Deployment {
    id: string;
    projectId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface Project {
    id: string;
    name: string;
    gitURL: string;
    subDomain: string;
    Deployment?: Deployment[];
}

// API Functions
const getProjects = async () => {
    const { data } = await apiClient.get('/');
    return data.data;
};

const getProjectById = async (id: string) => {
    const { data } = await apiClient.get(`/${id}`);
    return data.data;
};

const createProject = async (projectData: z.infer<typeof ProjectSchema>) => {
    const { data } = await apiClient.post('/', projectData);
    return data.data;
};

const updateProject = async ({ id, data }: { id: string; data: z.infer<typeof ProjectSchema> }) => {
    const response = await apiClient.put(`/${id}`, data);
    return response.data.data;
};

const deleteProject = async (id: string) => {
    const { data } = await apiClient.delete(`/${id}`);
    return data.data;
};

// Deployment API Functions
const createDeployment = async (projectId: string) => {
    const { data } = await apiClient.post(`/${projectId}/deployments`);
    return data.data;
};

const getDeployments = async (projectId: string) => {
    const { data } = await apiClient.get(`/${projectId}/deployments`);
    return data.data;
};

const getDeploymentById = async ({ projectId, deploymentId }: { projectId: string; deploymentId: string }) => {
    const { data } = await apiClient.get(`/${projectId}/deployments/${deploymentId}`);
    return data.data;
};

const deleteDeployment = async ({ projectId, deploymentId }: { projectId: string; deploymentId: string }) => {
    const { data } = await apiClient.delete(`/${projectId}/deployments/${deploymentId}`);
    return data.data;
};

const getLogs = async ({ projectId, deploymentId }: { projectId: string; deploymentId: string }) => {
    const { data } = await apiClient.get(`/${projectId}/deployments/${deploymentId}/logs`);
    return data.data;
};

// React Query Hooks
export function useGetProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: getProjects,
    });
}

export function useGetProjectById(id: string) {
    return useQuery({
        queryKey: ['project', id],
        queryFn: () => getProjectById(id),
        enabled: !!id,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProject,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

export function useCreateDeployment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createDeployment,
        onSuccess: (_, projectId) => {
            queryClient.invalidateQueries({ queryKey: ['deployments', projectId] });
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        },
    });
}

export function useDeployments(projectId: string) {
    return useQuery({
        queryKey: ['deployments', projectId],
        queryFn: () => getDeployments(projectId),
        enabled: !!projectId,
    });
}

export function useDeployment(projectId: string, deploymentId: string) {
    return useQuery({
        queryKey: ['deployment', projectId, deploymentId],
        queryFn: () => getDeploymentById({ projectId, deploymentId }),
        enabled: !!projectId && !!deploymentId,
    });
}

export function useDeleteDeployment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDeployment,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deployments', variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
        },
    });
}

export function useGetLogs(projectId: string, deploymentId: string) {
    return useQuery({
        queryKey: ['logs', projectId, deploymentId],
        queryFn: () => getLogs({ projectId, deploymentId }), // Poll every 2 seconds
    });
}

// Optional: Add error handling utility
export function handleApiError(error: unknown) {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
}