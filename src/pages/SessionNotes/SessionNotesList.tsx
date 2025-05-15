
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getMeetingLogs, getUserById } from "@/services/api";
import { format } from "date-fns";
import { MeetingLog } from "@/services/mockData";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  FileEdit 
} from "lucide-react";
import { cn } from "@/lib/utils";

const SessionNotesList = () => {
  const { user } = useAuth();
  const [selectedLog, setSelectedLog] = useState<MeetingLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [studentNames, setStudentNames] = useState<Map<string, string>>(new Map());

  // Fetch session notes
  const { data: logsData, isLoading } = useQuery({
    queryKey: ["sessionNotes", user?.id],
    queryFn: async () => {
      if (!user) return { data: [], success: false };
      
      const response = await getMeetingLogs();
      
      // Filter logs for the current mentor
      return {
        ...response,
        data: user.role === 'mentor' 
          ? response.data.filter(log => log.mentorId === user.id)
          : []
      };
    },
    enabled: !!user && user.role === "mentor"
  });

  // Fetch student names for the logs
  useQuery({
    queryKey: ["studentNames", logsData?.data],
    queryFn: async () => {
      if (!logsData?.data?.length) return;
      
      const newStudentNames = new Map<string, string>();
      const uniqueStudentIds = [...new Set(logsData.data.map(log => log.studentId))];
      
      for (const studentId of uniqueStudentIds) {
        try {
          const response = await getUserById(studentId);
          if (response.success && response.data) {
            newStudentNames.set(studentId, response.data.name);
          }
        } catch (error) {
          console.error(`Error fetching student name for ID ${studentId}:`, error);
        }
      }
      
      setStudentNames(newStudentNames);
    },
    enabled: !!logsData?.data?.length
  });

  // Handle viewing log details
  const handleViewLog = (log: MeetingLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  // Filter logs based on selected filter
  const filteredLogs = logsData?.data?.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'completed') return log.completed;
    if (filter === 'in-progress') return !log.completed;
    return true;
  }) || [];

  // Group logs by student for better organization
  const logsByStudent = filteredLogs.reduce((acc, log) => {
    if (!acc[log.studentId]) {
      acc[log.studentId] = [];
    }
    acc[log.studentId].push(log);
    return acc;
  }, {} as Record<string, MeetingLog[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading session notes...</p>
      </div>
    );
  }

  if (!filteredLogs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Session Notes Found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          {filter !== 'all' 
            ? `No ${filter === 'completed' ? 'completed' : 'in-progress'} session notes found.` 
            : "You haven't created any session notes yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Session Notes</h3>
        <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-6">
        {Object.entries(logsByStudent).map(([studentId, logs]) => (
          <div key={studentId} className="border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-4 py-3 flex justify-between items-center">
              <h4 className="font-medium">
                {studentNames.get(studentId) || "Loading student name..."}
              </h4>
              <Badge className="bg-blue-100 text-blue-800 border-0">
                {logs.length} {logs.length === 1 ? 'note' : 'notes'}
              </Badge>
            </div>
            <div className="divide-y">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => handleViewLog(log)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className={cn(
                              "mr-2 p-1 rounded-full", 
                              log.completed ? "text-green-600" : "text-amber-600"
                            )}>
                              {log.completed ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{log.completed ? "Completed" : "In Progress"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="font-medium">{log.topic}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.createdAt), "PP")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{log.notes}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Session Note Details</DialogTitle>
            <DialogDescription>
              Detailed information about this mentoring session.
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
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
                <span className="text-sm text-muted-foreground">
                  {format(new Date(selectedLog.createdAt), "PPP")}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Student</h4>
                <p className="text-sm">
                  {studentNames.get(selectedLog.studentId) || "Loading student name..."}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Meeting</h4>
                <p className="text-sm">{selectedLog.meetingTitle || "Untitled Meeting"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Topic</h4>
                <p className="text-sm">{selectedLog.topic}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Session Notes</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedLog.notes}</p>
              </div>

              {selectedLog.actionItems && (
                <div>
                  <h4 className="text-sm font-medium">Action Items</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedLog.actionItems}</p>
                </div>
              )}

              {(selectedLog.rating || selectedLog.feedback) && (
                <div>
                  <h4 className="text-sm font-medium">Student Feedback</h4>
                  {selectedLog.rating && (
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm">Rating: {selectedLog.rating}/5</p>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-sm ${i < selectedLog.rating! ? "text-yellow-500" : "text-gray-300"}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedLog.feedback && (
                    <p className="text-sm">{selectedLog.feedback}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionNotesList;
