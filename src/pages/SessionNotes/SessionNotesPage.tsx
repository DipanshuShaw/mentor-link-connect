
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  getAssignmentsForMentor, 
  getUserById, 
  createMeetingLog, 
  getMeetingById, 
  getMeetingsForMentor 
} from "@/services/api";
import { User } from "@/contexts/AuthContext";
import { Meeting } from "@/services/mockData";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SessionNotesList from "./SessionNotesList";

// Form validation schema
const sessionNoteSchema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  meetingId: z.string().min(1, "Please select a meeting"),
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  notes: z.string().min(10, "Notes should be at least 10 characters"),
  actionItems: z.string().optional(),
  completed: z.boolean().default(false),
});

type SessionNoteFormValues = z.infer<typeof sessionNoteSchema>;

const SessionNotesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(searchParams.get("menteeId"));
  const [menteeDetails, setMenteeDetails] = useState<Map<string, User>>(new Map());
  const [mentorMeetings, setMentorMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState<string>("view");

  // Form setup
  const form = useForm<SessionNoteFormValues>({
    resolver: zodResolver(sessionNoteSchema),
    defaultValues: {
      studentId: selectedStudent || "",
      meetingId: "",
      topic: "",
      notes: "",
      actionItems: "",
      completed: false,
    },
  });

  // Get mentor's assigned students
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["mentorAssignments", user?.id],
    queryFn: () => {
      if (!user) return Promise.resolve({ data: [], success: false });
      return getAssignmentsForMentor(user.id);
    },
    enabled: !!user && user.role === "mentor"
  });

  // Fetch student details for each assignment
  useQuery({
    queryKey: ["menteeDetails", assignments?.data],
    queryFn: async () => {
      if (!assignments?.data?.length) return;
      
      const newMenteeDetails = new Map<string, User>();
      
      for (const assignment of assignments.data) {
        try {
          const response = await getUserById(assignment.studentId);
          if (response.success && response.data) {
            newMenteeDetails.set(assignment.studentId, response.data);
          }
        } catch (error) {
          console.error("Error fetching mentee details:", error);
        }
      }
      
      setMenteeDetails(newMenteeDetails);
      
      // If no student is selected and we have assignments, select the first one
      if (!selectedStudent && assignments.data.length > 0) {
        const firstStudentId = assignments.data[0].studentId;
        setSelectedStudent(firstStudentId);
        form.setValue("studentId", firstStudentId);
      }
    },
    enabled: !!assignments?.data?.length
  });

  // Fetch mentor's meetings when student is selected
  useQuery({
    queryKey: ["mentorMeetings", user?.id, selectedStudent],
    queryFn: async () => {
      if (!user || !selectedStudent) return { data: [], success: false };
      
      const response = await getMeetingsForMentor(user.id);
      if (response.success) {
        // Filter meetings for the selected student
        const filteredMeetings = response.data.filter(
          meeting => meeting.studentId === selectedStudent
        );
        setMentorMeetings(filteredMeetings);
      }
      return response;
    },
    enabled: !!user && !!selectedStudent
  });

  // Handle student selection
  const handleStudentChange = (value: string) => {
    setSelectedStudent(value);
    form.setValue("studentId", value);
    form.setValue("meetingId", "");
    setSearchParams({ menteeId: value });
  };

  // Create meeting log mutation
  const createNoteMutation = useMutation({
    mutationFn: async (values: SessionNoteFormValues) => {
      if (!user) throw new Error("User not found");
      
      const meetingResponse = await getMeetingById(values.meetingId);
      if (!meetingResponse.success || !meetingResponse.data) {
        throw new Error("Meeting not found");
      }
      
      const meeting = meetingResponse.data;
      
      return createMeetingLog({
        meetingId: values.meetingId,
        meetingTitle: meeting.title,
        mentorId: user.id,
        studentId: values.studentId,
        topic: values.topic,
        notes: values.notes,
        actionItems: values.actionItems || "",
        completed: values.completed,
        rating: null,
        feedback: "",
      });
    },
    onSuccess: () => {
      toast({
        title: "Session Notes Added",
        description: "Your session notes have been saved successfully.",
      });
      form.reset({
        studentId: selectedStudent || "",
        meetingId: "",
        topic: "",
        notes: "",
        actionItems: "",
        completed: false,
      });
      setActiveTab("view");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save session notes: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: SessionNoteFormValues) => {
    createNoteMutation.mutate(values);
  };

  // Update form when selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      form.setValue("studentId", selectedStudent);
    }
  }, [selectedStudent, form]);

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Session Notes</h1>
          <p className="text-muted-foreground">
            Record and track progress notes for your mentoring sessions
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="view">View Notes</TabsTrigger>
                <TabsTrigger value="create">Add Notes</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab}>
              <TabsContent value="view">
                <SessionNotesList />
              </TabsContent>
              
              <TabsContent value="create">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mentee</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => handleStudentChange(value)}
                              disabled={isLoadingAssignments}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a mentee" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {assignments?.data?.map((assignment) => (
                                  <SelectItem 
                                    key={assignment.studentId} 
                                    value={assignment.studentId}
                                  >
                                    {menteeDetails.get(assignment.studentId)?.name || "Loading..."}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="meetingId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Related Meeting</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!selectedStudent || mentorMeetings.length === 0}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a meeting" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mentorMeetings.map((meeting) => (
                                  <SelectItem 
                                    key={meeting.id} 
                                    value={meeting.id}
                                  >
                                    {meeting.title} ({new Date(meeting.meetingTime).toLocaleDateString()})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic</FormLabel>
                          <FormControl>
                            <Input placeholder="Topic covered in this session" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed notes about the session..." 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="actionItems"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action Items</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Action items for the mentee..." 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="completed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer">
                              Mark Session as Completed
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={createNoteMutation.isPending}
                      >
                        {createNoteMutation.isPending ? "Saving..." : "Save Session Notes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SessionNotesPage;
