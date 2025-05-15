
// This file simulates a database with mock data

import { User, UserRole } from "@/contexts/AuthContext";

// Mock Users
export const users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "mentor@example.com",
    role: "mentor"
  },
  {
    id: "3",
    name: "John Doe",
    email: "student@example.com",
    role: "student"
  },
  {
    id: "4",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "mentor"
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "michael@example.com",
    role: "student"
  },
  {
    id: "6",
    name: "Emily Davis",
    email: "emily@example.com",
    role: "student"
  },
  {
    id: "7",
    name: "Robert Wilson",
    email: "robert@example.com",
    role: "mentor"
  }
];

// Mentor-Student assignments
export interface MentorAssignment {
  id: string;
  studentId: string;
  mentorId: string;
  assignedDate: string;
}

export const mentorAssignments: MentorAssignment[] = [
  {
    id: "1",
    studentId: "3", // John Doe
    mentorId: "2", // Jane Smith
    assignedDate: "2023-04-15"
  },
  {
    id: "2",
    studentId: "5", // Michael Brown
    mentorId: "2", // Jane Smith
    assignedDate: "2023-05-20"
  },
  {
    id: "3",
    studentId: "6", // Emily Davis
    mentorId: "4", // Sarah Johnson
    assignedDate: "2023-06-10"
  }
];

// Meeting status types
export type MeetingStatus = "scheduled" | "completed" | "cancelled";

// Meetings
export interface Meeting {
  id: string;
  mentorId: string;
  studentId: string;
  title: string;
  meetingTime: string; // ISO date string
  agenda: string;
  status: MeetingStatus;
  location?: string;
}

export const meetings: Meeting[] = [
  {
    id: "1",
    mentorId: "2", // Jane Smith
    studentId: "3", // John Doe
    title: "Initial Assessment",
    meetingTime: "2023-06-15T14:00:00Z",
    agenda: "Discuss learning goals and set expectations",
    status: "completed"
  },
  {
    id: "2",
    mentorId: "2", // Jane Smith
    studentId: "3", // John Doe
    title: "Progress Review",
    meetingTime: "2023-07-10T15:30:00Z",
    agenda: "Review progress on learning goals and adjust as needed",
    status: "completed"
  },
  {
    id: "3",
    mentorId: "2", // Jane Smith
    studentId: "3", // John Doe
    title: "Project Planning",
    meetingTime: "2023-08-05T13:00:00Z",
    agenda: "Plan upcoming project and discuss resources needed",
    status: "scheduled"
  },
  {
    id: "4",
    mentorId: "4", // Sarah Johnson
    studentId: "6", // Emily Davis
    title: "Career Guidance",
    meetingTime: "2023-07-20T11:00:00Z",
    agenda: "Discuss career opportunities and prepare resume",
    status: "completed"
  },
  {
    id: "5",
    mentorId: "4", // Sarah Johnson
    studentId: "6", // Emily Davis
    title: "Interview Preparation",
    meetingTime: "2023-08-12T16:00:00Z",
    agenda: "Mock interview and feedback session",
    status: "scheduled"
  }
];

// Meeting logs
export interface MeetingLog {
  id: string;
  meetingId: string;
  mentorNotes?: string;
  studentFeedback?: string;
  createdAt: string;
}

export const meetingLogs: MeetingLog[] = [
  {
    id: "1",
    meetingId: "1",
    mentorNotes: "John shows promise in backend development. Should focus more on database design.",
    studentFeedback: "The session was very helpful. I now have a clearer idea of what to focus on.",
    createdAt: "2023-06-15T16:30:00Z"
  },
  {
    id: "2",
    meetingId: "2",
    mentorNotes: "Good progress on database skills. Next steps: API design patterns.",
    studentFeedback: "I appreciate the detailed feedback and resources provided.",
    createdAt: "2023-07-10T17:15:00Z"
  },
  {
    id: "3",
    meetingId: "4",
    mentorNotes: "Emily has strong frontend skills. Suggested focusing on React and state management.",
    studentFeedback: "The career advice was invaluable. I'll work on the suggested portfolio improvements.",
    createdAt: "2023-07-20T12:45:00Z"
  }
];

// Notifications
export interface Notification {
  id: string;
  userId: string;
  title: string; // Added title field here
  message: string;
  seen: boolean;
  createdAt: string;
  type?: string;
}

export const notifications: Notification[] = [
  {
    id: "1",
    userId: "2", // Jane Smith (mentor)
    title: "New Student Assignment",
    message: "You have been assigned a new student: John Doe",
    seen: true,
    createdAt: "2023-04-15T10:30:00Z"
  },
  {
    id: "2",
    userId: "3", // John Doe (student)
    title: "New Mentor Assignment",
    message: "You have been assigned to mentor: Jane Smith",
    seen: true,
    createdAt: "2023-04-15T10:30:00Z"
  },
  {
    id: "3",
    userId: "2", // Jane Smith (mentor)
    title: "Upcoming Meeting",
    message: "Meeting with John Doe is scheduled for tomorrow at 2 PM",
    seen: false,
    createdAt: "2023-06-14T09:00:00Z"
  },
  {
    id: "4",
    userId: "3", // John Doe (student)
    title: "Meeting Notes Added",
    message: "Your mentor has added notes from your last meeting",
    seen: false,
    createdAt: "2023-06-15T17:00:00Z"
  },
  {
    id: "5",
    userId: "3", // John Doe (student)
    title: "Upcoming Meeting Reminder",
    message: "Upcoming meeting: Progress Review on July 10th at 3:30 PM",
    seen: false,
    createdAt: "2023-07-08T11:15:00Z"
  }
];
