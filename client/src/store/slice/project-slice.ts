import { ProjectWithDeployment } from '@/type';
import { StateCreator } from 'zustand';
import { find, uniqBy } from 'lodash';

export type ProjectState = {
    projects: ProjectWithDeployment[];
};

export type ProjectAction = {
    addProject: (project: ProjectWithDeployment[]) => void
    getProject:()=>ProjectWithDeployment[]
    getProjectId:(id: string) =>ProjectWithDeployment 
    pushProject: (project: ProjectWithDeployment) => void
}

export type ProjectStore = ProjectState & ProjectAction

export const initialState: ProjectState = {
    projects: [],
};

export const createProjectSlice:StateCreator<ProjectStore> = (set, get) =>({
    ...initialState,
    addProject: (data: ProjectWithDeployment[]) => {
        set(() => ({
          projects:data
        }));
      },
    
    getProject: () => get().projects,
    getProjectId: (id: string) => find(get().projects, (project) => project.id === id)!,
    pushProject: (project: ProjectWithDeployment) => {
        set((state) => ({
          projects: uniqBy([...state.projects, project], 'id'),
        }));
      },


})