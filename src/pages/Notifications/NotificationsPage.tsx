
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getNotificationsForUser } from "@/services/api";
import NotificationsList from "./NotificationsList";
import CreateNotification from "./CreateNotification";

const NotificationsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("view");
  
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => user ? getNotificationsForUser(user.id) : Promise.resolve({ data: [], success: false }),
    enabled: !!user
  });

  // Automatically switch to 'view' tab for students
  useEffect(() => {
    if (user?.role === "student") {
      setActiveTab("view");
    }
  }, [user]);

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Notifications</h1>
          <p className="text-muted-foreground">
            {user?.role === "mentor" 
              ? "Create and manage notifications for your students" 
              : "View notifications from your mentor"}
          </p>
        </div>

        <Card>
          <CardHeader className="px-6">
            {user?.role === "mentor" ? (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="view">View Notifications</TabsTrigger>
                  <TabsTrigger value="create">Create Notification</TabsTrigger>
                </TabsList>
                <TabsContent value="view" className="pt-4">
                  <NotificationsList 
                    notifications={notifications?.data || []} 
                    isLoading={isLoading} 
                  />
                </TabsContent>
                <TabsContent value="create">
                  <CreateNotification onSuccess={() => {
                    refetch();
                    setActiveTab("view");
                  }} />
                </TabsContent>
              </Tabs>
            ) : (
              <CardTitle>Your Notifications</CardTitle>
            )}
          </CardHeader>
          <CardContent className="px-6">
            {user?.role !== "mentor" && (
              <NotificationsList 
                notifications={notifications?.data || []} 
                isLoading={isLoading} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
