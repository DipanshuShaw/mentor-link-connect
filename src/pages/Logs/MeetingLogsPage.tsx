
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getMeetingLogs, getMeetingById } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MeetingLog } from "@/services/mockData";

const MeetingLogsPage = () => {
  const { user } = useAuth();
  const [selectedLog, setSelectedLog] = useState<MeetingLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["meetingLogs", user?.id, user?.role],
    queryFn: async () => {
      if (!user) return { data: [], success: false };
      
      const response = await getMeetingLogs();
      
      // Filter logs based on user role
      if (user.role === "mentor") {
        return {
          ...response,
          data: response.data.filter((log) => log.mentorId === user.id)
        };
      } else if (user.role === "student") {
        return {
          ...response,
          data: response.data.filter((log) => log.studentId === user.id)
        };
      }
      
      return response; // For admin, return all logs
    },
    enabled: !!user
  });

  const handleViewLog = (log: MeetingLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Meeting Logs</h1>
          <p className="text-muted-foreground">
            {user?.role === "mentor" 
              ? "View and manage your session logs" 
              : "Review your mentoring session logs"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading session logs...</div>
            ) : logsData?.data && logsData.data.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Meeting Title</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsData.data.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.createdAt), "PP")}
                        </TableCell>
                        <TableCell>
                          {log.meetingTitle || "Untitled Meeting"}
                        </TableCell>
                        <TableCell>{log.topic}</TableCell>
                        <TableCell>
                          {log.rating ? `${log.rating}/5` : "No rating"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              log.completed 
                                ? "bg-green-100 text-green-800 border-0" 
                                : "bg-amber-100 text-amber-800 border-0"
                            }
                          >
                            {log.completed ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            className="text-primary text-sm hover:underline"
                            onClick={() => handleViewLog(log)}
                          >
                            View Details
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No meeting logs found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.role === "mentor"
                    ? "Once you complete sessions with your mentees, logs will appear here."
                    : "Once you have mentoring sessions, logs will appear here."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Meeting Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about this mentoring session.
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Meeting Date</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedLog.createdAt), "PPP")}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Meeting Title</h4>
                <p className="text-sm">{selectedLog.meetingTitle || "Untitled Meeting"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Topic Covered</h4>
                <p className="text-sm">{selectedLog.topic}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Summary</h4>
                <p className="text-sm">{selectedLog.notes}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Actions Items</h4>
                <p className="text-sm">
                  {selectedLog.actionItems || "No action items recorded"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Feedback</h4>
                <div className="flex items-center gap-2">
                  <p className="text-sm">
                    {selectedLog.rating ? `Rating: ${selectedLog.rating}/5` : "No rating provided"}
                  </p>
                  {selectedLog.rating && (
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < selectedLog.rating! ? "text-yellow-500" : "text-gray-300"}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm mt-1">{selectedLog.feedback || "No feedback provided"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Status</h4>
                <Badge 
                  variant="outline" 
                  className={
                    selectedLog.completed 
                      ? "bg-green-100 text-green-800 border-0" 
                      : "bg-amber-100 text-amber-800 border-0"
                  }
                >
                  {selectedLog.completed ? "Completed" : "In Progress"}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default MeetingLogsPage;
