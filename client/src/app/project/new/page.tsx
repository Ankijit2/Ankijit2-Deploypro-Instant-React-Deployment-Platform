'use client'

import { useState,useMemo,useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProjectSchema } from '@/type'
import { useCreateProject,useCreateDeployment } from '../hooks/hooks'
import { io } from 'socket.io-client'
import { logEntry } from '@/type'
import { useRouter } from 'next/navigation'
import { renderLog } from '@/lib/renderlog'


export default function Component() {
  const router = useRouter()
    const socket = useMemo(() => io("http://localhost:4000", { withCredentials: true,
     }), []);
     const createProjectMutation = useCreateProject();
     const createDeploymentMutation = useCreateDeployment();
  const [deploymentLogs, setDeploymentLogs] = useState<logEntry[]>([])
  const [projectId,setProjectId] = useState<string | null>(null)

  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');

 

  const form = useForm<z.infer<typeof ProjectSchema>>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: "",
      gitURL: "",
    },
  })

  async function onSubmit(values: z.infer<typeof ProjectSchema>) {
    try {
        // Create project first
        const project = await createProjectMutation.mutateAsync(values);
        console.log(project)
        if (project?.id) {
            setProjectId(project.id)
            const deployment = await createDeploymentMutation.mutateAsync(project.id);
            console.log(deployment)
            if (deployment?.id) {
                setDeploymentId(deployment.id);
                setDeploymentStatus('QUEUED');
                socket.emit('subscribe', deployment.id);
            }

        }
        form.reset();
    } catch (error) {
        console.error('Deployment creation failed:', error);
        // You might want to show an error toast or message here
    }
}

console.log(deploymentId)

useEffect(() => {
  // Listen for incoming messages
  const handleNewLog = (data) => {
      console.log("New Log:", data.logs);
      
      setDeploymentLogs((prevLogs) => [...prevLogs, data.logs]);
      setDeploymentStatus(data.logs.status)
      
      if (data.logs.status === 'READY' || data.logs.status === 'FAIL') {
  
        console.log(`Deployment ${data.logs.deployment_id} is ${data.logs.status}. Disconnecting...`);
        socket.emit('unsubscribe', data.logs.deployment_id);
        socket.disconnect();
        router.push(`/project/${projectId}`)
    }
  };
  socket.on('message',(data)=>console.log(data))

  socket.on('deployment-logs', handleNewLog);


  return () => {
    socket.off('connect');
    socket.off('connect_error');
    socket.off('deployment-logs')
    socket.off('message');
};

}, [socket, deploymentId]);

console.log(deploymentStatus)
 
  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Deployment</CardTitle>
          <CardDescription>Deploy your project using DeployPro</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field ,fieldState}) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Project" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a name for your project.
                    </FormDescription>
                    <FormMessage >{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gitURL"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/username/repo" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the GitHub URL of your project.
                    </FormDescription>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Create Deployment</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Deployment Logs</CardTitle>
          <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
  deploymentStatus === 'READY' ? 'bg-green-400' :
  deploymentStatus === 'FAIL' ? 'bg-red-400' :
  deploymentStatus === 'IN_PROGRESS' ? 'bg-yellow-400' :
  deploymentStatus === 'QUEUED' ? 'bg-blue-400' :
  'bg-gray-400' // default state for 'idle' or unknown status
}`} />
            <span className="text-sm font-medium">
              {deploymentStatus}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded border p-4">
            <div className="space-y-2">
              {deploymentLogs.map((log) => (
                <div key={log.event_id} className="mb-2 flex items-start">
                <span className="text-sm text-muted-foreground w-24 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`flex-grow ${
                    log.status === "fa"
                      ? "text-red-600"
                      : log.status === "success"
                      ? "text-green-600"
                      : "text-primary"
                  }`}
                >
                  {renderLog(log.log)}
                </span>
              </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}