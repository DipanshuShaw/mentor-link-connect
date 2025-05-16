
import { 
  mentorAssignments, 
  meetings, 
  meetingLogs, 
  notifications,
  MentorAssignment,
  Meeting,
  MeetingLog,
  Notification,
} from "./mockData";
import { User, UserRole } from "@/contexts/AuthContext";

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic API response
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Users API
export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  await delay(500);
  // Get users from localStorage instead of using the imported mock data
  const storedUsers = localStorage.getItem("mockUsers");
  let users: User[] = [];
  
  if (storedUsers) {
    try {
      users = JSON.parse(storedUsers);
      console.log("Retrieved users from localStorage:", users);
    } catch (error) {
      console.error("Failed to parse stored users:", error);
    }
  }
  
  return {
    data: users,
    success: true
  };
};

export const getUserById = async (id: string): Promise<ApiResponse<User | null>> => {
  await delay(300);
  // Get users from localStorage
  const storedUsers = localStorage.getItem("mockUsers");
  let users: User[] = [];
  
  if (storedUsers) {
    try {
      users = JSON.parse(storedUsers);
    } catch (error) {
      console.error("Failed to parse stored users:", error);
    }
  }
  
  const user = users.find(u => u.id === id);
  return {
    data: user || null,
    success: !!user,
    message: user ? undefined : "User not found"
  };
};

export const getUsersByRole = async (role: UserRole): Promise<ApiResponse<User[]>> => {
  await delay(300);
  // Get users from localStorage
  const storedUsers = localStorage.getItem("mockUsers");
  let users: User[] = [];
  
  if (storedUsers) {
    try {
      users = JSON.parse(storedUsers);
      console.log(`Retrieved ${role} users from localStorage:`, users.filter(u => u.role === role));
    } catch (error) {
      console.error("Failed to parse stored users:", error);
    }
  }
  
  const filteredUsers = users.filter(u => u.role === role);
  return {
    data: filteredUsers,
    success: true
  };
};

// Mentor assignments API
export const getMentorAssignments = async (): Promise<ApiResponse<MentorAssignment[]>> => {
  await delay(500);
  // Get assignments from localStorage or use the default ones
  const storedAssignments = localStorage.getItem("mentorAssignments");
  let assignments: MentorAssignment[] = mentorAssignments;
  
  if (storedAssignments) {
    try {
      assignments = JSON.parse(storedAssignments);
    } catch (error) {
      console.error("Failed to parse stored assignments:", error);
    }
  }
  
  return {
    data: assignments,
    success: true
  };
};

export const getAssignmentsForMentor = async (mentorId: string): Promise<ApiResponse<MentorAssignment[]>> => {
  await delay(300);
  // Get assignments from localStorage or use the default ones
  const storedAssignments = localStorage.getItem("mentorAssignments");
  let assignments: MentorAssignment[] = mentorAssignments;
  
  if (storedAssignments) {
    try {
      assignments = JSON.parse(storedAssignments);
    } catch (error) {
      console.error("Failed to parse stored assignments:", error);
    }
  }
  
  const filteredAssignments = assignments.filter(a => a.mentorId === mentorId);
  return {
    data: filteredAssignments,
    success: true
  };
};

export const getAssignmentForStudent = async (studentId: string): Promise<ApiResponse<MentorAssignment | null>> => {
  await delay(300);
  // Get assignments from localStorage or use the default ones
  const storedAssignments = localStorage.getItem("mentorAssignments");
  let assignments: MentorAssignment[] = mentorAssignments;
  
  if (storedAssignments) {
    try {
      assignments = JSON.parse(storedAssignments);
    } catch (error) {
      console.error("Failed to parse stored assignments:", error);
    }
  }
  
  const assignment = assignments.find(a => a.studentId === studentId);
  return {
    data: assignment || null,
    success: !!assignment,
    message: assignment ? undefined : "No mentor assigned"
  };
};

export const createMentorAssignment = async (assignment: Omit<MentorAssignment, "id" | "assignedDate">): Promise<ApiResponse<MentorAssignment>> => {
  await delay(700);
  
  // Get existing assignments from localStorage or use the default ones
  const storedAssignments = localStorage.getItem("mentorAssignments");
  let existingAssignments: MentorAssignment[] = mentorAssignments;
  
  if (storedAssignments) {
    try {
      existingAssignments = JSON.parse(storedAssignments);
    } catch (error) {
      console.error("Failed to parse stored assignments:", error);
    }
  }
  
  // Remove any existing assignment for this student (allows changing mentors)
  const filteredAssignments = existingAssignments.filter(a => a.studentId !== assignment.studentId);
  
  // Create new assignment
  const newAssignment: MentorAssignment = {
    id: String(Date.now()), // Use timestamp as unique ID
    ...assignment,
    assignedDate: new Date().toISOString().split('T')[0]
  };
  
  // Add new assignment to list
  const updatedAssignments = [...filteredAssignments, newAssignment];
  
  // Save to localStorage
  localStorage.setItem("mentorAssignments", JSON.stringify(updatedAssignments));
  
  return {
    data: newAssignment,
    success: true,
    message: "Assignment created successfully"
  };
};

// Meetings API
export const getMeetings = async (): Promise<ApiResponse<Meeting[]>> => {
  await delay(500);
  return {
    data: meetings,
    success: true
  };
};

export const getMeetingById = async (id: string): Promise<ApiResponse<Meeting | null>> => {
  await delay(300);
  const meeting = meetings.find(m => m.id === id);
  return {
    data: meeting || null,
    success: !!meeting,
    message: meeting ? undefined : "Meeting not found"
  };
};

export const getMeetingsForMentor = async (mentorId: string): Promise<ApiResponse<Meeting[]>> => {
  await delay(300);
  const mentorMeetings = meetings.filter(m => m.mentorId === mentorId);
  return {
    data: mentorMeetings,
    success: true
  };
};

export const getMeetingsForStudent = async (studentId: string): Promise<ApiResponse<Meeting[]>> => {
  await delay(300);
  const studentMeetings = meetings.filter(m => m.studentId === studentId);
  return {
    data: studentMeetings,
    success: true
  };
};

export const createMeeting = async (meeting: Omit<Meeting, "id">): Promise<ApiResponse<Meeting>> => {
  await delay(700);
  const newMeeting: Meeting = {
    id: String(meetings.length + 1),
    ...meeting
  };
  meetings.push(newMeeting);
  return {
    data: newMeeting,
    success: true,
    message: "Meeting created successfully"
  };
};

export const updateMeetingStatus = async (id: string, status: Meeting["status"]): Promise<ApiResponse<Meeting>> => {
  await delay(500);
  const meetingIndex = meetings.findIndex(m => m.id === id);
  if (meetingIndex === -1) {
    return {
      data: {} as Meeting,
      success: false,
      message: "Meeting not found"
    };
  }
  
  meetings[meetingIndex].status = status;
  return {
    data: meetings[meetingIndex],
    success: true,
    message: "Meeting status updated successfully"
  };
};

// Meeting logs API
export const getMeetingLogs = async (): Promise<ApiResponse<MeetingLog[]>> => {
  await delay(500);
  return {
    data: meetingLogs,
    success: true
  };
};

export const getMeetingLogById = async (logId: string): Promise<ApiResponse<MeetingLog | null>> => {
  await delay(300);
  const log = meetingLogs.find(l => l.id === logId);
  return {
    data: log || null,
    success: !!log,
    message: log ? undefined : "Meeting log not found"
  };
};

export const getLogForMeeting = async (meetingId: string): Promise<ApiResponse<MeetingLog | null>> => {
  await delay(300);
  const log = meetingLogs.find(l => l.meetingId === meetingId);
  return {
    data: log || null,
    success: !!log,
    message: log ? undefined : "No log found for this meeting"
  };
};

export const createMeetingLog = async (log: Omit<MeetingLog, "id" | "createdAt">): Promise<ApiResponse<MeetingLog>> => {
  await delay(700);
  const newLog: MeetingLog = {
    id: String(meetingLogs.length + 1),
    ...log,
    createdAt: new Date().toISOString()
  };
  meetingLogs.push(newLog);
  return {
    data: newLog,
    success: true,
    message: "Meeting log created successfully"
  };
};

// Notifications API
export const getNotificationsForUser = async (userId: string): Promise<ApiResponse<Notification[]>> => {
  await delay(500);
  const userNotifications = notifications.filter(n => n.userId === userId);
  return {
    data: userNotifications,
    success: true
  };
};

export const markNotificationSeen = async (id: string): Promise<ApiResponse<Notification>> => {
  await delay(300);
  const notificationIndex = notifications.findIndex(n => n.id === id);
  if (notificationIndex === -1) {
    return {
      data: {} as Notification,
      success: false,
      message: "Notification not found"
    };
  }
  
  notifications[notificationIndex].seen = true;
  return {
    data: notifications[notificationIndex],
    success: true,
    message: "Notification marked as seen"
  };
};

export const createNotification = async (notification: Omit<Notification, "id" | "seen" | "createdAt">): Promise<ApiResponse<Notification>> => {
  await delay(500);
  const newNotification: Notification = {
    id: String(notifications.length + 1),
    ...notification,
    seen: false,
    createdAt: new Date().toISOString()
  };
  notifications.push(newNotification);
  return {
    data: newNotification,
    success: true,
    message: "Notification created successfully"
  };
};
