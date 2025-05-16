
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsersByRole, createMentorAssignment, getAssignmentForStudent } from "@/services/api";
import { User } from "@/contexts/AuthContext";
import { MentorAssignment } from "@/services/mockData";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Users, Calendar, X } from "lucide-react";
import { format } from "date-fns";

const ChooseMentorPage = () => {
  const { user } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Get all mentors
  const { data: mentorsResponse, isLoading: mentorsLoading } = useQuery({
    queryKey: ["mentors"],
    queryFn: () => getUsersByRole("mentor"),
  });

  // Check if student already has a mentor assigned
  const { data: assignmentResponse, isLoading: assignmentLoading } = useQuery({
    queryKey: ["currentMentorAssignment", user?.id],
    queryFn: () => {
      if (!user) return Promise.resolve({ data: null, success: false });
      return getAssignmentForStudent(user.id);
    },
    enabled: !!user,
  });

  const handleSelectMentor = (mentor: User) => {
    // Toggle selection - if already selected, deselect it
    if (selectedMentor?.id === mentor.id) {
      setSelectedMentor(null);
    } else {
      setSelectedMentor(mentor);
    }
  };

  const handleConfirmSelection = async () => {
    if (!user || !selectedMentor) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await createMentorAssignment({
        mentorId: selectedMentor.id,
        studentId: user.id,
      });
      
      if (response.success) {
        toast.success(`You have successfully selected ${selectedMentor.name} as your mentor.`);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["currentMentorAssignment"] });
        
        // Reset selection
        setSelectedMentor(null);
      } else {
        toast.error(response.message || "Failed to assign mentor. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning mentor:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMentor = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // For removing mentor, we create an empty assignment which the API will interpret as removing
      const response = await createMentorAssignment({
        mentorId: "removed", // Special value to indicate removal
        studentId: user.id,
      });
      
      if (response.success) {
        toast.success("Your mentor has been removed successfully.");
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["currentMentorAssignment"] });
      } else {
        toast.error(response.message || "Failed to remove mentor. Please try again.");
      }
    } catch (error) {
      console.error("Error removing mentor:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExistingMentor = assignmentResponse?.data !== null && assignmentResponse?.data?.mentorId !== "removed";
  const currentMentor = mentorsResponse?.data?.find(
    (mentor: User) => mentor.id === assignmentResponse?.data?.mentorId
  );
  
  const isLoading = mentorsLoading || assignmentLoading;

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Choose Your Mentor</h1>
          <p className="text-muted-foreground">
            Select a mentor who will guide you through your learning journey
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : hasExistingMentor && currentMentor ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Current Mentor</CardTitle>
              <CardDescription>
                You already have a mentor assigned. You can view their details below or change mentors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentMentor.name}`} />
                    <AvatarFallback>{currentMentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-medium">{currentMentor.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentMentor.email}</p>
                    <p className="text-xs mt-1">
                      Assigned since: {format(new Date(assignmentResponse?.data?.assignedDate), "PPP")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
                  <Button size="sm" variant="outline" onClick={handleRemoveMentor} disabled={isSubmitting}>
                    <X className="mr-2 h-4 w-4" />
                    Remove Mentor
                  </Button>
                  <Button size="sm">
                    Contact Mentor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {selectedMentor ? (
              <Alert className="bg-primary/10 border-primary/20">
                <UserPlus className="h-4 w-4" />
                <AlertTitle>Mentor Selected</AlertTitle>
                <AlertDescription>
                  You've selected {selectedMentor.name} as your mentor. Confirm this selection to proceed or click on the mentor again to deselect.
                </AlertDescription>
              </Alert>
            ) : null}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Available Mentors
                </CardTitle>
                <CardDescription>
                  Choose a mentor who aligns with your learning goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mentorsResponse?.data?.length ? (
                  <div className="space-y-4">
                    {mentorsResponse.data.map((mentor: User) => (
                      <div 
                        key={mentor.id}
                        className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border ${
                          selectedMentor?.id === mentor.id 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${mentor.name}`} />
                            <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-medium">{mentor.name}</h3>
                            <p className="text-sm text-muted-foreground">{mentor.email}</p>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <Button
                            variant={selectedMentor?.id === mentor.id ? "default" : "outline"}
                            onClick={() => handleSelectMentor(mentor)}
                            className="w-full md:w-auto"
                          >
                            {selectedMentor?.id === mentor.id ? "Selected" : "Select as Mentor"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No mentors are available at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {selectedMentor && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleConfirmSelection}
                  disabled={isSubmitting}
                >
                  Confirm Mentor Selection
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ChooseMentorPage;
