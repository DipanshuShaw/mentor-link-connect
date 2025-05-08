
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";
import { getNotificationsForUser, getMeetingsForMentor, getMeetingsForStudent } from "@/services/api";
import { Meeting, Notification } from "@/services/mockData";
import AppLayout from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch notifications
        const notifResponse = await getNotificationsForUser(user.id);
        setNotifications(notifResponse.data);

        // Fetch upcoming meetings
        if (user.role === "student") {
          const meetingsResponse = await getMeetingsForStudent(user.id);
          setUpcomingMeetings(meetingsResponse.data.filter(m => m.status === "scheduled"));
        } else if (user.role === "mentor") {
          const meetingsResponse = await getMeetingsForMentor(user.id);
          setUpcomingMeetings(meetingsResponse.data.filter(m => m.status === "scheduled"));
        }
        // Admin doesn't have upcoming meetings in this implementation
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Role-specific welcome messages
  const getWelcomeMessage = () => {
    if (!user) return "Welcome to the Student Mentorship Portal";
    
    switch (user.role) {
      case "admin":
        return "Welcome to the Admin Dashboard";
      case "mentor":
        return "Welcome to your Mentor Dashboard";
      case "student":
        return "Welcome to your Student Dashboard";
      default:
        return "Welcome to the Student Mentorship Portal";
    }
  };

  // Role-specific action buttons
  const getPrimaryAction = () => {
    switch (user?.role) {
      case "admin":
        return (
          <Link to="/users">
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </Link>
        );
      case "mentor":
        return (
          <Link to="/mentees">
            <Button>
              <Users className="mr-2 h-4 w-4" />
              View Mentees
            </Button>
          </Link>
        );
      case "student":
        return (
          <Link to="/my-mentor">
            <Button>
              <Users className="mr-2 h-4 w-4" />
              View Mentor
            </Button>
          </Link>
        );
      default:
        return null;
    }
  };

  // Format date to a more readable format
  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPP 'at' p"); // Example: "Apr 29, 2023 at 2:30 PM"
  };

  return (
    <AppLayout>
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{getWelcomeMessage()}</h1>
          <p className="text-muted-foreground">
            {user && `Logged in as ${user.name} (${user.role})`}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          {getPrimaryAction()}
        </div>
      </div>

      {/* Dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unread Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <span className="mr-2">Notifications</span>
              {notifications.filter(n => !n.seen).length > 0 && (
                <Badge className="ml-2" variant="destructive">
                  {notifications.filter(n => !n.seen).length} New
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Your latest updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="h-[200px] flex items-center justify-center">
                <p>Loading...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-md border ${!notification.seen ? 'border-primary bg-primary/5' : 'bg-muted/30'}`}
                >
                  <div className="flex justify-between items-start">
                    <p className={`text-sm ${!notification.seen ? 'font-medium' : ''}`}>
                      {notification.message}
                    </p>
                    {!notification.seen && (
                      <Badge variant="outline" className="text-xs">New</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(notification.createdAt), "PPp")}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-[150px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/notifications">
              <Button variant="outline" size="sm">
                View All Notifications
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Meetings
            </CardTitle>
            <CardDescription>
              Your scheduled sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="h-[200px] flex items-center justify-center">
                <p>Loading...</p>
              </div>
            ) : upcomingMeetings.length > 0 ? (
              upcomingMeetings.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="p-3 rounded-md border bg-card">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{meeting.title}</h4>
                    <Badge variant="outline">{meeting.status}</Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatMeetingDate(meeting.meetingTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {meeting.agenda}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-[150px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No upcoming meetings</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/meetings">
              <Button variant="outline" size="sm">
                View All Meetings
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions Based on Role */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {user?.role === "admin" && (
            <>
              <Link to="/users" className="dashboard-card hover:bg-muted/30">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-blue-100 p-3 mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-1">Manage Users</h3>
                  <p className="text-sm text-muted-foreground">Review and manage system users</p>
                </div>
              </Link>
              <Link to="/meetings" className="dashboard-card hover:bg-muted/30">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-green-100 p-3 mb-3">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-1">All Meetings</h3>
                  <p className="text-sm text-muted-foreground">View all scheduled sessions</p>
                </div>
              </Link>
              <Link to="/logs" className="dashboard-card hover:bg-muted/30">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-purple-100 p-3 mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-purple-600"
                    >
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                      <path d="M9 9h1" />
                      <path d="M9 13h6" />
                      <path d="M9 17h6" />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-1">Meeting Logs</h3>
                  <p className="text-sm text-muted-foreground">Review feedback and notes</p>
                </div>
              </Link>
            </>
          )}

          {user?.role === "mentor" && (
            <>
              <Link to="/mentees" className="dashboard-card hover:bg-muted/30">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-indigo-100 p-3 mb-3">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="font-medium mb-1">Your Mentees</h3>
                  <p className="text-sm text-muted-foreground">View and manage your assigned students</p>
                </div>
              </Link>
              <Link to="/meetings" className="dashboard-card hover:bg-muted/30">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-green-100 p-3 mb-3">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-1">Schedule Meetings</h3>
                  <p className="text-sm text-muted-foreground">Create and manage mentoring sessions</p>
                </div>
              </Link>
              <Link to="/logs" className="dashboard-card hover:bg-muted/30">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-amber-100 p-3 mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-amber-600"
                    >
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                      <path d="M9 9h1" />
                      <path d="M9 13h6" />
                      <path d="M9 17h6" />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-1">Add Session Notes</h3>
                  <p className="text-sm text-muted-foreground">Log feedback and progress notes</p>
                </div>
              </Link>
            </>
          )}

          {user?.role === "student" && (
            <>
              <Link to="/my-mentor" className="dashboard-card hover:bg-muted/30">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-violet-100 p-3 mb-3">
                    <Users className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="font-medium mb-1">Your Mentor</h3>
                  <p className="text-sm text-muted-foreground">View your assigned mentor</p>
                </div>
              </Link>
              <Link to="/meetings" className="dashboard-card hover:bg-muted/30">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-green-100 p-3 mb-3">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-1">Request Meetings</h3>
                  <p className="text-sm text-muted-foreground">Schedule time with your mentor</p>
                </div>
              </Link>
              <Link to="/logs" className="dashboard-card hover:bg-muted/30">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-rose-100 p-3 mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-rose-600"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-1">Submit Feedback</h3>
                  <p className="text-sm text-muted-foreground">Provide feedback on mentoring sessions</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
