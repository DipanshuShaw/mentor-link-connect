
import { format } from "date-fns";
import { Meeting } from "@/services/mockData";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

interface MeetingsListProps {
  meetings: Meeting[];
  isLoading: boolean;
}

const MeetingsList = ({ meetings, isLoading }: MeetingsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <p>Loading meetings...</p>
      </div>
    );
  }

  if (!meetings.length) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No meetings found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You don't have any meetings scheduled yet.
        </p>
      </div>
    );
  }

  // Sort meetings: upcoming first, then by date
  const sortedMeetings = [...meetings].sort((a, b) => {
    // First sort by status (scheduled first)
    if (a.status !== b.status) {
      if (a.status === "scheduled") return -1;
      if (b.status === "scheduled") return 1;
    }
    // Then sort by date (soonest first)
    return new Date(a.meetingTime).getTime() - new Date(b.meetingTime).getTime();
  });

  const getMeetingStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {sortedMeetings.map(meeting => (
        <div 
          key={meeting.id}
          className="p-4 border rounded-lg bg-card"
        >
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg">{meeting.title}</h3>
            <Badge 
              variant="outline" 
              className={`${getMeetingStatusColor(meeting.status)} border-0`}
            >
              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
            </Badge>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{format(new Date(meeting.meetingTime), "PPP 'at' p")}</span>
            </div>
            
            {meeting.location && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{meeting.location}</span>
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">{meeting.agenda}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetingsList;
