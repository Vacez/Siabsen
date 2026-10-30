export type Role = 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  position: string;
  avatar: string;
  joinDate: string;
  workSchedule: string;
  status: 'active' | 'inactive';
  phone?: string;
  remainingLeaveDays: number;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  department: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  workDurationHours?: number;
  workDurationMinutes?: number;
  status: AttendanceStatus;
  isLate: boolean;
  lateMinutes: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  workType: 'WFO' | 'WFH';
  notes?: string;
}

export type LeaveType = 'cuti' | 'izin' | 'sakit';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  department: string;
  userAvatar?: string;
  type: LeaveType;
  subType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  attachmentName?: string;
  status: LeaveStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface CompanySettings {
  officeName: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  workStartTime: string;
  workEndTime: string;
  lateToleranceMinutes: number;
  allowRemoteWork: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  createdAt: string;
  read: boolean;
  relatedId?: string;
}
