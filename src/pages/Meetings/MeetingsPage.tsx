
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getMeetingsForMentor, getMeetingsForStudent } from "@/services/api";
import MeetingsList from "./MeetingsList";
import CreateMeeting from "./CreateMeeting";

const MeetingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("view");
  
  const { data: meetings, isLoading, refetch } = useQuery({
    queryKey: ["meetings", user?.id],
    queryFn: () => {
      if (!user) return Promise.resolve({ data: [], success: false });
      
      if (user.role === "mentor") {
        return getMeetingsForMentor(user.id);
      } else if (user.role === "student") {
        return getMeetingsForStudent(user.id);
      }
      
      return Promise.resolve({ data: [], success: false });
    },
    enabled: !!user
  });

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Meetings</h1>
          <p className="text-muted-foreground">
            {user?.role === "mentor" 
              ? "Schedule and manage meetings with your students" 
              : "View your scheduled meetings"}
          </p>
        </div>

        <Card>
          <CardHeader className="px-6">
            {user?.role === "mentor" ? (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="view">View Meetings</TabsTrigger>
                  <TabsTrigger value="create">Schedule Meeting</TabsTrigger>
                </TabsList>
                <TabsContent value="view" className="pt-4">
                  <MeetingsList 
                    meetings={meetings?.data || []} 
                    isLoading={isLoading} 
                  />
                </TabsContent>
                <TabsContent value="create">
                  <CreateMeeting onSuccess={() => {
                    refetch();
                    setActiveTab("view");
                  }} />
                </TabsContent>
              </Tabs>
            ) : (
              <CardTitle>Your Meetings</CardTitle>
            )}
          </CardHeader>
          <CardContent className="px-6">
            {user?.role !== "mentor" && (
              <MeetingsList 
                meetings={meetings?.data || []} 
                isLoading={isLoading} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MeetingsPage;
