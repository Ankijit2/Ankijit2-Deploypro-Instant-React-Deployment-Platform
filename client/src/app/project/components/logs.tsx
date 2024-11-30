"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logEntry } from "@/type";
import { useGetLogs } from "../hooks/hooks";
// Simulated function to fetch logs from the server
import { renderLog } from "@/lib/renderlog";
export default function Logs({ project_id,deployment_id }: { project_id:string,deployment_id:string }) {
  const [logs, setLogs] = useState<logEntry[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { data,isLoading } = useGetLogs(project_id,deployment_id);

 
  useEffect(() => {
    if (data) {
      console.log(data)
      setLogs(data)
     

    }
  }, [data]);





 


  return (

    <Card className="w-full  mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Deployment Logs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea
          className="h-[400px] w-full rounded-md border p-4 "
          ref={scrollAreaRef}
        >
         {logs.length === 0 && !isLoading &&(
          <div className="text-center text-muted-foreground">
            no logs to display
        </div>
         )}
          {logs && logs.map((log) => (
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
          {isLoading && (
            <div className="text-center text-muted-foreground">
              loading logs
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
