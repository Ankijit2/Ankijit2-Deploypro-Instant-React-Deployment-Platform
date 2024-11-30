/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, Check, Rocket } from 'lucide-react'

import { useGetProjectById } from '../hooks/hooks'

import Logs from '../components/logs'
import { Deployement } from '@prisma/client'
import { ProjectWithDeployment } from '@/type'
import Link from 'next/link'




export default function DeployPage({
    params: { id },
  }: {
    params: { id: string };
  }) {



  const {data,isLoading} = useGetProjectById(id)
  console.log(data)

  const [project, setProject] = useState<ProjectWithDeployment | null>(null);

console.log(project)

useEffect(() => {
  if (data) {
    setProject(data);
  }
}, [data])








  



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-primary-foreground mb-2">Loading Project</h2>
          <p className="text-muted-foreground">Please wait while we fetch your project details...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-primary-foreground mb-2">Project Not Found</h2>
          <p className="text-muted-foreground">We couldn't find the project you're looking for.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex flex-col">
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">{project.name}</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Project Name:</span> {project.name}
                </div>
                <div>
                  <span className="font-semibold">Git URL:</span> {project.gitURL}
                </div>
                <div>   
                    <span className="font-semibold">Created At:</span> {new Date(project.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Allocated link:</span><a href={`http://${project.subDomain}.${process.env.NEXT_PUBLIC_BASE_URL}`} target='_blank'>{project.subDomain}.{process.env.NEXT_PUBLIC_BASE_URL}</a> 
  </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Deployments</CardTitle>
             
            </CardHeader>
            <CardContent>
              {!project.Deployement || project?.Deployement.length === 0 ? (
                <div className="text-center py-12">
                  <Rocket className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Deployments Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Your project hasn't been deployed. Create your first deployment to get started!
                  </p>
                 
                
                </div>
              ) : (
                <div className="space-y-4 ">
                  {project.Deployement && project.Deployement.map((deployment:Deployement) => (
                    <div key={deployment.id} className="flex flex-col gap-5 p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className=" flex items-center ">
                          <span className='font-semibold'>ID</span>:{deployment.id}
                          {deployment.is_main && <Check className="ml-2 h-4 w-4 text-green-500" />}
                        </div>
                        <a
                          href='#'
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center text-lg"
                        >
                         
                        </a>
                      </div>
                      <Logs deployment_id={deployment.id} project_id={id}/>
                    </div>
                    
                  ))}
                  
                </div>
              )}
              
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}