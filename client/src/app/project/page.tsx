'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Globe, Plus } from 'lucide-react'

import { useStore } from '@/store/store'
import { useGetProjects } from './hooks/hooks'
import Link from 'next/link'

export default function Profilepage() {
  const { addProject, projects } = useStore((state) => state)
const router = useRouter()
  const { data, isLoading } = useGetProjects();


  useEffect(() => {
    if (data) {
      addProject(data);
    }
  }, [data]);







  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-2xl font-semibold text-primary-foreground mb-2">Loading Projects</h2>
          <p className="text-muted-foreground">Please wait while we fetch your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-grow bg-background min-h-[80vh]">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Projects</h1>
          <Link href={'/project/new'}>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
          </Link>
          
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects && projects.map((project) => (
            <Card key={project.id} className="overflow-hidden" onClick={() => router.push(`/project/${project.id}`)}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={`http://${project.subDomain}.${process.env.NEXT_PUBLIC_BASE_URL}`} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline flex items-center mb-2">
                  <Globe className="h-4 w-4 mr-2" />
                  {project.subDomain}.{process.env.NEXT_PUBLIC_BASE_URL}
                </a>
              
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Created on {new Date(project.createdAt).toDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </main>
  )
}