// ============================================================
//  Shared TypeScript Interfaces
// ============================================================

export interface Permission {
  allTasks: boolean;
  create: boolean;
  team: boolean;
  roles: boolean;
  reports: boolean;
  settings: boolean;
}

export interface Role {
  id: string;
  name: string;
  color: string;
  system: boolean;
  memberCount?: number;
  perms: Permission;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  color: string;
  perms?: {
    permAllTasks: boolean;
    permCreate: boolean;
    permTeam: boolean;
    permRoles: boolean;
    permReports: boolean;
    permSettings: boolean;
  };
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
}

export interface Task {
  id: string;
  title: string;
  desc: string;
  assigneeId: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tag: string;
  created: string;
  start: string;
  due: string;
  acceptedAt: string;
  progress: number;
  images: string[];
  comments: Comment[];
}

export interface WorkspaceSettings {
  companyName: string;
  accent: string;
  sidebarTheme: 'light' | 'dark';
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFrom?: string;
  emailEnabled?: boolean;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  taskId: string | null;
  createdAt: string;
}

export interface PendingReview {
  id: number;
  milestoneId: number;
  milestoneTitle: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  description: string;
  createdAt: string;
}

export interface SubmissionAttachment {
  id: number;
  fileUrl: string;
  fileName: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface Submission {
  id: number;
  milestoneId: number;
  userId: string;
  userName: string;
  description: string;
  links: string[];
  status: SubmissionStatus;
  reviewComment: string;
  reviewedById: string;
  reviewedByName: string;
  reviewedAt: string;
  createdAt: string;
  createdTime: string;
  attachments: SubmissionAttachment[];
  reviewAttachments: SubmissionAttachment[];
}

export const SUBMISSION_EDIT_WINDOW_MS = 15 * 60 * 1000;

export type MilestoneStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface Milestone {
  id: number;
  taskId: string;
  title: string;
  description: string;
  dueDate: string;
  order: number;
  status: MilestoneStatus;
  createdAt: string;
  submissions: Submission[];
}
