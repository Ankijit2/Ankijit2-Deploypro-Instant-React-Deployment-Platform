"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logEntry } from "@/type";
import { useGetLogs } from "../hooks/hooks";
// Simulated function to fetch logs from the server

export default function Logs({ id }: { id: string }) {
  const [logs, setLogs] = useState<logEntry[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { data } = useGetLogs(id);

 
  useEffect(() => {
    if (data) {
      setLogs(data.logs);

    }
  }, [data]);





  const renderLog = (log: string) => {
  
    return log
      .replace(/^\n|\n$/g, "")
      .replace(/\|/g, ",")
      .split("\n")
      .map((line, index) => (
        <p key={index} className="text-sm text-muted-foreground">
          {line}
        </p>
      ));
  };


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
          {logs.map((log) => (
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
          {logs.length === 0 && (
            <div className="text-center text-muted-foreground">
              No logs to display
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
