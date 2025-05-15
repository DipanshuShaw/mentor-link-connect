
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getAssignmentsForMentor, getUserById } from "@/services/api";
import { MentorAssignment } from "@/services/mockData";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

const MenteesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menteeDetails, setMenteeDetails] = useState<Map<string, User>>(new Map());

  const { data: assignments, isLoading } = useQuery({
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
    },
    enabled: !!assignments?.data?.length
  });

  const handleContactMentee = (menteeId: string) => {
    const menteeName = menteeDetails.get(menteeId)?.name || "Student";
    toast({
      title: "Contact Initiated",
      description: `Reaching out to ${menteeName}.`,
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Your Mentees</h1>
          <p className="text-muted-foreground">
            View and manage your assigned students
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assigned Students</CardTitle>
              <Badge className="bg-blue-100 text-blue-800 border-0">
                Total: {assignments?.data?.length || 0}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
            ) : assignments?.data?.length ? (
              <div className="space-y-6">
                {assignments.data.map((assignment: MentorAssignment) => {
                  const mentee = menteeDetails.get(assignment.studentId);
                  
                  return (
                    <div key={assignment.id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4">
                      <div className="flex items-center space-x-4 mb-3 md:mb-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${mentee?.name || "Student"}`} />
                          <AvatarFallback>{mentee?.name?.charAt(0) || 'S'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-medium">{mentee?.name || "Loading..."}</h3>
                          <p className="text-sm text-muted-foreground">
                            {mentee?.email || "Email loading..."}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link to={`/session-notes?menteeId=${assignment.studentId}`}>
                          <Button variant="outline" size="sm">
                            View Notes
                          </Button>
                        </Link>
                        <Link to={`/meetings?studentId=${assignment.studentId}`}>
                          <Button variant="outline" size="sm">
                            Schedule Meeting
                          </Button>
                        </Link>
                        <Button 
                          size="sm"
                          onClick={() => handleContactMentee(assignment.studentId)}
                        >
                          Contact
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Mentees Assigned</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  You don't have any mentees assigned to you yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Link to="/meetings">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Meetings
                  </Button>
                </Link>
                <Link to="/session-notes">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Add Session Notes
                  </Button>
                </Link>
                <Link to="/logs">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    View Meeting Logs
                  </Button>
                </Link>
                <Link to="/notifications">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Send Notifications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default MenteesPage;
