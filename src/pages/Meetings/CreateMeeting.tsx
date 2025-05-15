
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMeeting, getAssignmentsForMentor } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface CreateMeetingProps {
  onSuccess: () => void;
}

const CreateMeeting = ({ onSuccess }: CreateMeetingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<User[]>([]);
  
  // Fetch mentor's assigned students
  const { data: assignments } = useQuery({
    queryKey: ["mentorAssignments", user?.id],
    queryFn: () => user?.id ? getAssignmentsForMentor(user.id) : Promise.resolve({ data: [], success: false }),
    enabled: !!user && user.role === "mentor",
  });
  
  // Process assignments to get student details
  useEffect(() => {
    if (assignments?.data) {
      const studentList = assignments.data.map(assignment => ({
        id: assignment.studentId,
        name: assignment.studentName,
        email: "", // Not available from assignment data
        role: "student" as const,
      }));
      setStudents(studentList);
    }
  }, [assignments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !agenda.trim() || !selectedStudent || !meetingDate || !meetingTime) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time into ISO string
      const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`).toISOString();
      
      const response = await createMeeting({
        title,
        agenda,
        studentId: selectedStudent,
        mentorId: user?.id || "",
        meetingTime: meetingDateTime,
        status: "scheduled",
        location,
      });
      
      if (response.success) {
        toast({
          title: "Meeting Scheduled",
          description: "The meeting has been scheduled successfully.",
        });
        
        // Reset form
        setTitle("");
        setAgenda("");
        setSelectedStudent("");
        setMeetingDate("");
        setMeetingTime("");
        setLocation("");
        
        // Call success callback
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to schedule meeting.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get today's date in YYYY-MM-DD format for min date input
  const today = format(new Date(), "yyyy-MM-dd");
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student">Student</Label>
          <Select
            value={selectedStudent}
            onValueChange={setSelectedStudent}
          >
            <SelectTrigger id="student">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.length > 0 ? (
                students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No students assigned
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Meeting Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="agenda">Agenda</Label>
          <Textarea
            id="agenda"
            placeholder="Meeting agenda and discussion points..."
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              min={today}
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location (Optional)</Label>
          <Input
            id="location"
            placeholder="Office, Online, etc."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
      </Button>
    </form>
  );
};

export default CreateMeeting;
