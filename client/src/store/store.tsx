"use client"
import { type ReactNode, createContext, useRef, useContext } from 'react';
import { type StoreApi, useStore as zuseStore, create } from 'zustand';
import { ProjectStore,createProjectSlice } from './slice/project-slice';

export const StoreContext = createContext<StoreApi<ProjectStore>|null>(null);


export interface StoreProviderProps {
    children: ReactNode;
  }
export const StoreProvider = ({ children }: StoreProviderProps) => {
    const storeRef =
      useRef<
        StoreApi<
         ProjectStore
        >
      >();
    if (!storeRef.current) {
      storeRef.current = create<
        ProjectStore
      >((...a) => ({
        ...createProjectSlice(...a),
       
      }));
    }
  
    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    );
  };
  
  export const useStore = <T,>(
    selector: (
      store: ProjectStore
    ) => T
  ): T => {
    const storeContext = useContext(StoreContext);
  
    if (!storeContext) {
      throw new Error(`useStore must be use within StoreProvider`);
    }
  
    return zuseStore(storeContext, selector);
  };
  