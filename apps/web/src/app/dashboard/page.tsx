"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setJobData(null);

    try {
      const response = await api.post("/downloads", { url });
      
      setJobData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to process URL. Check terminal logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Media Force Dashboard</h1>
          {/*add a User Profile / Logout button here*/}
        </header>

        {/* URL Input Form */}
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader>
            <CardTitle>New Download Job</CardTitle>
            <CardDescription className="text-gray-400">
              Paste a video URL to fetch metadata and queue the download worker.
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
                {loading ? "Processing..." : "Start Download"}
              </Button>
            </form>
            {error && <p className="text-red-500 mt-4 font-medium">{error}</p>}
          </CardContent>
        </Card>

        {jobData && (
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Job Created Successfully!</CardTitle>
              <CardDescription className="text-gray-400">
                This is the raw data returned from your NestJS endpoint.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-black p-4 rounded-md overflow-x-auto text-sm text-green-400">
                {JSON.stringify(jobData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

      </div>
    </main>
  );
}