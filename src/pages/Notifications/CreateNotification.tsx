
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createNotification, getAssignmentsForMentor } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/contexts/AuthContext";

interface CreateNotificationProps {
  onSuccess: () => void;
}

const CreateNotification = ({ onSuccess }: CreateNotificationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
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
    
    if (!title.trim() || !message.trim() || !selectedStudent) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await createNotification({
        title,
        message,
        userId: selectedStudent,
        type: "mentor_message",
      });
      
      if (response.success) {
        toast({
          title: "Notification Created",
          description: "The notification has been sent to the student.",
        });
        
        // Reset form
        setTitle("");
        setMessage("");
        setSelectedStudent("");
        
        // Call success callback
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create notification.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
            placeholder="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Notification"}
      </Button>
    </form>
  );
};

export default CreateNotification;
