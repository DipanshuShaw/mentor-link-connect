
import { useState } from "react";
import { Notification } from "@/services/mockData";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markNotificationSeen } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, BellRing } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationsListProps {
  notifications: Notification[];
  isLoading: boolean;
}

const NotificationsList = ({ notifications, isLoading }: NotificationsListProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [markingSeenIds, setMarkingSeenIds] = useState<Set<string>>(new Set());

  // Handle marking a notification as seen
  const handleMarkAsSeen = async (notificationId: string) => {
    setMarkingSeenIds(prev => new Set(prev).add(notificationId));
    
    try {
      const response = await markNotificationSeen(notificationId);
      
      if (response.success) {
        toast({
          title: "Notification marked as seen",
          description: "The notification has been updated."
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update notification.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error marking notification as seen:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setMarkingSeenIds(prev => {
        const updated = new Set(prev);
        updated.delete(notificationId);
        return updated;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No notifications found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.role === "student" 
            ? "You don't have any notifications yet." 
            : "You haven't sent any notifications yet."}
        </p>
      </div>
    );
  }

  // Sort notifications: unread first, then by date (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    // First sort by seen status
    if (a.seen !== b.seen) {
      return a.seen ? 1 : -1;
    }
    // Then sort by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedNotifications.map(notification => (
        <div 
          key={notification.id}
          className={`p-4 border rounded-lg transition-all ${
            notification.seen ? 'bg-background' : 'bg-primary/5 border-primary/20'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              {notification.seen ? (
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              ) : (
                <BellRing className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${!notification.seen ? 'text-primary' : ''}`}>
                    {notification.title || "Notification"}
                  </p>
                  {!notification.seen && (
                    <Badge variant="outline" className="text-xs">New</Badge>
                  )}
                </div>
                <p className="text-sm mt-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(notification.createdAt), "PPp")}
                </p>
              </div>
            </div>
            
            {user?.role === "student" && !notification.seen && (
              <Button 
                size="sm" 
                variant="outline" 
                className="shrink-0"
                disabled={markingSeenIds.has(notification.id)}
                onClick={() => handleMarkAsSeen(notification.id)}
              >
                Mark as Read
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsList;
