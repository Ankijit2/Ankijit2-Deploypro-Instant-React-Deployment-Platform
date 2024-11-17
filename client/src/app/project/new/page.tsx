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
import { createProject } from '../actions/actions'
import { io } from 'socket.io-client'

export default function Component() {
    const socket = useMemo(() => io("http://localhost:4000", { withCredentials: true }), []);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([])
 

  const form = useForm<z.infer<typeof ProjectSchema>>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: "",
      gitURL: "",
    },
  })

  async function onSubmit(values: z.infer<typeof ProjectSchema>) {
    console.log("onSubmit", values)
   const data = await createProject(values) 
   console.log("data", data)
   
  }
  useEffect(() => {
    // Subscribe to deployment logs
    socket.emit('subscribe', "deployment-logs");

    // Listen for incoming messages
    const handleNewLog = (newLog: { logs: string }) => {
      console.log("New Log:", newLog.logs);
      setDeploymentLogs((prevLogs) => [...prevLogs, newLog.logs]);
    };

    socket.on('message', handleNewLog);

    // Clean up on component unmount
    return () => {
      socket.off('message', handleNewLog);
      socket.disconnect();
    };
  }, [socket]);
 
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
             
              'bg-red-400'
            }`} />
            <span className="text-sm font-medium">
              idle
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded border p-4">
            <div className="space-y-2">
              {deploymentLogs.map((log, index) => (
                <p key={index} className="text-sm text-black">{log}</p>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}