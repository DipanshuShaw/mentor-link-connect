
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Unauthorized from "./pages/Auth/Unauthorized";
import Dashboard from "./pages/Dashboard/Dashboard";
import ManageUsers from "./pages/Users/ManageUsers";
import NotificationsPage from "./pages/Notifications/NotificationsPage";
import MeetingsPage from "./pages/Meetings/MeetingsPage";
import MenteesPage from "./pages/Mentees/MenteesPage";
import MeetingLogsPage from "./pages/Logs/MeetingLogsPage";
import SessionNotesPage from "./pages/SessionNotes/SessionNotesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mentees" 
              element={
                <ProtectedRoute allowedRoles={["mentor"]}>
                  <MenteesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute allowedRoles={["mentor", "student"]}>
                  <NotificationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meetings" 
              element={
                <ProtectedRoute allowedRoles={["mentor", "student"]}>
                  <MeetingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/logs" 
              element={
                <ProtectedRoute allowedRoles={["admin", "mentor", "student"]}>
                  <MeetingLogsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/session-notes" 
              element={
                <ProtectedRoute allowedRoles={["mentor"]}>
                  <SessionNotesPage />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
