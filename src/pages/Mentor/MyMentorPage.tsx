
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getAssignmentForStudent, getUserById } from "@/services/api";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Calendar, Clock, User, Mail, Users } from "lucide-react";
import { format } from "date-fns";

const MyMentorPage = () => {
  const { user } = useAuth();

  const { data: assignmentResponse, isLoading: assignmentLoading } = useQuery({
    queryKey: ["currentMentorAssignment", user?.id],
    queryFn: () => {
      if (!user) return Promise.resolve({ data: null, success: false });
      return getAssignmentForStudent(user.id);
    },
    enabled: !!user,
  });

  const { data: mentorResponse, isLoading: mentorLoading } = useQuery({
    queryKey: ["mentorDetails", assignmentResponse?.data?.mentorId],
    queryFn: () => {
      if (!assignmentResponse?.data?.mentorId) {
        return Promise.resolve({ data: null, success: false });
      }
      return getUserById(assignmentResponse.data.mentorId);
    },
    enabled: !!assignmentResponse?.data?.mentorId,
  });

  const isLoading = assignmentLoading || mentorLoading;
  const hasAssignedMentor = assignmentResponse?.data !== null;
  const mentor = mentorResponse?.data;

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">My Mentor</h1>
          <p className="text-muted-foreground">
            View information about your assigned mentor
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                
                <div className="pt-4 space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !hasAssignedMentor ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Mentor Assigned</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md">
                  You don't have a mentor assigned yet. Choose a mentor to get started with your mentorship journey.
                </p>
                <Link to="/choose-mentor">
                  <Button>
                    Choose a Mentor
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : mentor ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Your Mentor</CardTitle>
                <CardDescription>
                  Information about your assigned mentor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${mentor.name}`} />
                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-2xl font-semibold">{mentor.name}</h2>
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {mentor.email}
                    </p>
                    <p className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Assigned since {format(new Date(assignmentResponse?.data?.assignedDate), "PPP")}
                    </p>
                    <div className="pt-2">
                      <Badge variant="outline" className="border-primary text-primary">
                        Mentor
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link to="/meetings">
                      <Button className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Meeting
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full">
                      Contact Mentor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to="/meetings">
                    <Button variant="outline" className="w-full">
                      View All Meetings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/meetings">
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Meeting
                      </Button>
                    </Link>
                    <Link to="/notifications">
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="mr-2 h-4 w-4" />
                        Messages
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Alert variant="destructive">
            <AlertDescription>
              There was an error loading your mentor information. Please try again later.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AppLayout>
  );
};

export default MyMentorPage;
