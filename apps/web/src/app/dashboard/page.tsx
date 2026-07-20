"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/store/useAuth";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  
  const socket = useSocket();

  const {token} = useAuth();

  useEffect(() => {
    if (!socket || !jobId) return;

    const eventName = `download-progress-${jobId}`;

    socket.on(eventName, (data: number | string) => {
      const progressValue = typeof data === 'string' ? parseFloat(data) : data;
      setProgress(progressValue);
    });

    return () => {
      socket.off(eventName);
    };
  }, [socket, jobId]);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setJobId(null);
    setProgress(0); 

    try {
      const response = await api.post("/downloads", { url });
      
      const newJobId = response.data.id || response.data.jobId; 
      
      if (newJobId) {
        setJobId(newJobId);
      } else {
        setError("Failed to get Job ID from backend response.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to start download.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Media Force Dashboard</h1>
        </header>

        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader>
            <CardTitle>New Download Job</CardTitle>
            <CardDescription className="text-gray-400">
              Paste a video URL to queue the download worker.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDownload} className="flex gap-4">
              <Input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white flex-1"
                required
              />
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Starting..." : "Start Download"}
              </Button>
            </form>
            {error && <p className="text-red-500 mt-4 font-medium">{error}</p>}
          </CardContent>
        </Card>

        {/* Real-Time Progress Bar Section */}
        {jobId && (
          <Card className="bg-gray-900 border-gray-800 text-white shadow-xl border-blue-900/30">
            <CardHeader>
              <CardTitle className="text-blue-400">Downloading...</CardTitle>
              <CardDescription className="text-gray-400">
                Job ID: <span className="font-mono text-xs">{jobId}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Progress</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              {/* The Shadcn Progress Component */}
              <Progress value={progress} className="h-3 bg-gray-800" />
              
              {progress >= 100 && (

                <div className="flex flex-col items-center gap-4 pt-4">
                  <p className="text-green-500 font-medium text-center pt-4">
                    Download Complete!
                  </p>

                  <a
                    href={`http://localhost:3001/downloads/${jobId}/file?token=${token}`}
                    target="_blnk"
                    rel="noopener noreferrer"
                  
                  >

                    <Button variant="default" className="bg-green-600 hover:bg-green-700">
                      Save Video to Computer
                    </Button>
                  </a>



                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </main>
  );
}