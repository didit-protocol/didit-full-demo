"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RefreshCw, Trash2, CheckCircle, XCircle, Eye } from "lucide-react";

interface WebhookLog {
  id: string;
  sessionId: string;
  status: string;
  signatureMethod: string | null;
  signatureValid: boolean;
  rawPayload: string;
  headers: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export default function WebhookLogs() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/webhook-logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      const response = await fetch("/api/webhook-logs", { method: "DELETE" });
      if (response.ok) {
        setLogs([]);
      }
    } catch (error) {
      console.error("Error clearing logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500";
      case "Declined":
        return "bg-red-500";
      case "In Review":
        return "bg-yellow-500";
      case "In Progress":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatJson = (jsonString: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Webhook Logs</CardTitle>
            <CardDescription>
              Recent webhooks received from Didit ({logs.length} total)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No webhooks received yet.</p>
            <p className="text-sm mt-2">
              Complete a verification to see webhooks here.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {log.signatureValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getStatusColor(log.status)} text-white`}
                          >
                            {log.status}
                          </Badge>
                          {log.signatureMethod && (
                            <Badge variant="outline" className="text-xs">
                              {log.signatureMethod} signature
                            </Badge>
                          )}
                          {!log.signatureValid && (
                            <Badge variant="destructive" className="text-xs">
                              Invalid Signature
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Session: {log.sessionId.substring(0, 20)}...
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(log.createdAt)}
                        </p>
                        {log.errorMessage && (
                          <p className="text-xs text-red-500 mt-1">
                            {log.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            Webhook Details
                            {log.signatureValid ? (
                              <Badge className="bg-green-500">Valid</Badge>
                            ) : (
                              <Badge variant="destructive">Invalid</Badge>
                            )}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">
                              Signature Verification
                            </h4>
                            <div className="bg-gray-100 rounded p-3 text-sm">
                              <p>
                                <strong>Valid:</strong>{" "}
                                {log.signatureValid ? "Yes ✓" : "No ✗"}
                              </p>
                              <p>
                                <strong>Method Used:</strong>{" "}
                                {log.signatureMethod || "None"}
                              </p>
                              {log.errorMessage && (
                                <p className="text-red-600">
                                  <strong>Error:</strong> {log.errorMessage}
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Headers</h4>
                            <ScrollArea className="h-[100px]">
                              <pre className="bg-gray-900 text-green-400 rounded p-3 text-xs overflow-x-auto">
                                {log.headers
                                  ? formatJson(log.headers)
                                  : "No headers"}
                              </pre>
                            </ScrollArea>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              Payload (JSON)
                            </h4>
                            <ScrollArea className="h-[300px]">
                              <pre className="bg-gray-900 text-green-400 rounded p-3 text-xs overflow-x-auto">
                                {formatJson(log.rawPayload)}
                              </pre>
                            </ScrollArea>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
