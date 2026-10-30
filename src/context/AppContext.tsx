import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  AttendanceRecord,
  LeaveRequest,
  CompanySettings,
  NotificationItem,
  Role,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_NOTIFICATIONS,
} from '../mock/initialData';

export type ScreenName =
  | 'login'
  | 'employee_dashboard'
  | 'attendance'
  | 'leave_request'
  | 'history'
  | 'admin_dashboard'
  | 'approvals'
  | 'employees'
  | 'reports'
  | 'settings'
  | 'profile';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  settings: CompanySettings;
  notifications: NotificationItem[];
  activeScreen: ScreenName;
  toast: ToastState;
  
  // Navigation
  navigateTo: (screen: ScreenName) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;

  // Auth
  login: (email: string, role?: Role) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;

  // Attendance
  todayAttendance: AttendanceRecord | undefined;
  checkIn: (workType: 'WFO' | 'WFH', customNotes?: string) => { success: boolean; message: string };
  checkOut: () => { success: boolean; message: string };

  // Leave
  submitLeaveRequest: (data: {
    type: 'cuti' | 'izin' | 'sakit';
    subType: string;
    startDate: string;
    endDate: string;
    daysCount: number;
    reason: string;
    attachmentName?: string;
  }) => { success: boolean; message: string };
  cancelLeaveRequest: (requestId: string) => { success: boolean; message: string };
  reviewLeaveRequest: (
    requestId: string,
    action: 'approved' | 'rejected',
    note?: string
  ) => { success: boolean; message: string };

  // Employee Management
  addEmployee: (employeeData: Omit<User, 'id'>) => { success: boolean; message: string };
  updateEmployee: (id: string, employeeData: Partial<User>) => { success: boolean; message: string };
  toggleEmployeeStatus: (id: string) => void;

  // Settings & Notifications
  updateSettings: (newSettings: CompanySettings) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;
  todayDateStr: string;
  resetDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: '@siabsen_users_v2',
  CURRENT_USER: '@siabsen_current_user_v2',
  ATTENDANCE: '@siabsen_attendance_v2',
  LEAVE_REQUESTS: '@siabsen_leave_v2',
  SETTINGS: '@siabsen_settings_v2',
  NOTIFICATIONS: '@siabsen_notifications_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Default: Budi Pratama (Employee)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [settings, setSettings] = useState<CompanySettings>(INITIAL_SETTINGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeScreen, setActiveScreen] = useState<ScreenName>('employee_dashboard');

  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
        const storedCurrent = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        const storedAtt = await AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE);
        const storedLeave = await AsyncStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
        const storedSet = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        const storedNotif = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);

        if (storedUsers) setUsers(JSON.parse(storedUsers));
        if (storedCurrent) {
          const user = JSON.parse(storedCurrent);
          setCurrentUser(user);
          setActiveScreen(user.role === 'admin' ? 'admin_dashboard' : 'employee_dashboard');
        }
        if (storedAtt) setAttendance(JSON.parse(storedAtt));
        if (storedLeave) setLeaveRequests(JSON.parse(storedLeave));
        if (storedSet) setSettings(JSON.parse(storedSet));
        if (storedNotif) setNotifications(JSON.parse(storedNotif));
      } catch (e) {
        console.warn('Error loading storage', e);
      }
    };
    loadStoredData();
  }, []);

  const persist = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed for', key, e);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  const navigateTo = (screen: ScreenName) => {
    setActiveScreen(screen);
  };

  const login = (email: string, preferredRole?: Role): boolean => {
    let matchedUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!matchedUser && preferredRole) {
      matchedUser = users.find((u) => u.role === preferredRole);
    }

    if (matchedUser) {
      setCurrentUser(matchedUser);
      persist(STORAGE_KEYS.CURRENT_USER, matchedUser);
      if (matchedUser.role === 'admin') {
        setActiveScreen('admin_dashboard');
      } else {
        setActiveScreen('employee_dashboard');
      }
      showToast(`Selamat datang, ${matchedUser.name}! ☁️`, 'success');
      return true;
    }

    showToast('Email atau akun tidak ditemukan!', 'error');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setActiveScreen('login');
    showToast('Anda telah berhasil keluar.', 'info');
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      persist(STORAGE_KEYS.CURRENT_USER, target);
      setActiveScreen(target.role === 'admin' ? 'admin_dashboard' : 'employee_dashboard');
      showToast(`Beralih ke akun: ${target.name} (${target.role.toUpperCase()})`, 'info');
    }
  };

  const getTodayDateString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayDateStr = getTodayDateString();
  const todayAttendance = attendance.find(
    (a) => a.userId === currentUser?.id && a.date === todayDateStr
  );

  const checkIn = (workType: 'WFO' | 'WFH', customNotes?: string) => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };

    if (todayAttendance) {
      return { success: false, message: 'Anda sudah melakukan check-in hari ini.' };
    }

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const checkInTimeString = `${hours}:${minutes}:${seconds}`;

    const [startH, startM] = settings.workStartTime.split(':').map(Number);
    const scheduledStartMin = startH * 60 + startM;
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const diff = currentMin - scheduledStartMin;

    const isLate = diff > settings.lateToleranceMinutes;
    const lateMinutes = isLate ? diff - settings.lateToleranceMinutes : 0;

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      department: currentUser.department,
      date: todayDateStr,
      checkInTime: checkInTimeString,
      status: isLate ? 'late' : 'present',
      isLate,
      lateMinutes,
      workType,
      location: {
        latitude: settings.latitude,
        longitude: settings.longitude,
        address: workType === 'WFO' ? settings.officeName : 'Lokasi Kerja Remote (WFH Terverifikasi)',
      },
      notes: customNotes || (isLate ? `Terlambat ${lateMinutes} menit` : 'Check-in tepat waktu'),
    };

    const updated = [newRecord, ...attendance];
    setAttendance(updated);
    persist(STORAGE_KEYS.ATTENDANCE, updated);

    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      userId: currentUser.id,
      title: isLate ? 'Presensi Tercatat (Terlambat)' : 'Presensi Berhasil ☁️',
      message: `Check-in berhasil pukul ${checkInTimeString} WIB (${workType}). ${
        isLate ? `Keterlambatan: ${lateMinutes} menit.` : 'Tepat waktu!'
      }`,
      type: isLate ? 'warning' : 'success',
      createdAt: `${todayDateStr} ${checkInTimeString}`,
      read: false,
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    persist(STORAGE_KEYS.NOTIFICATIONS, updatedNotifs);

    showToast(
      isLate
        ? `Presensi masuk tercatat: ${checkInTimeString} (Terlambat ${lateMinutes}m)`
        : `Check-in berhasil pukul ${checkInTimeString} WIB. Semangat bekerja!`,
      isLate ? 'warning' : 'success'
    );

    return { success: true, message: 'Check-in berhasil dicatat.' };
  };

  const checkOut = () => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };
    if (!todayAttendance) return { success: false, message: 'Anda belum melakukan check-in hari ini.' };
    if (todayAttendance.checkOutTime) {
      return { success: false, message: 'Anda sudah melakukan check-out hari ini.' };
    }

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const checkOutTimeString = `${hours}:${minutes}:${seconds}`;

    const [inH, inM] = todayAttendance.checkInTime.split(':').map(Number);
    const inTotalMin = inH * 60 + inM;
    const outTotalMin = now.getHours() * 60 + now.getMinutes();
    const durationMin = Math.max(0, outTotalMin - inTotalMin);
    const workDurationHours = Math.floor(durationMin / 60);
    const workDurationMinutes = durationMin % 60;

    const updated = attendance.map((item) => {
      if (item.id === todayAttendance.id) {
        return {
          ...item,
          checkOutTime: checkOutTimeString,
          workDurationHours,
          workDurationMinutes,
        };
      }
      return item;
    });

    setAttendance(updated);
    persist(STORAGE_KEYS.ATTENDANCE, updated);

    showToast(
      `Check-out berhasil pukul ${checkOutTimeString} WIB. Total: ${workDurationHours} jam ${workDurationMinutes} menit.`,
      'success'
    );

    return { success: true, message: 'Check-out berhasil dicatat.' };
  };

  const submitLeaveRequest = (data: {
    type: 'cuti' | 'izin' | 'sakit';
    subType: string;
    startDate: string;
    endDate: string;
    daysCount: number;
    reason: string;
    attachmentName?: string;
  }) => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };

    if (!data.startDate || !data.endDate || !data.reason.trim()) {
      return { success: false, message: 'Mohon lengkapi semua data formulir pengajuan.' };
    }

    if (new Date(data.endDate) < new Date(data.startDate)) {
      return { success: false, message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.' };
    }

    const newReq: LeaveRequest = {
      id: `LR-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      department: currentUser.department,
      userAvatar: currentUser.avatar,
      type: data.type,
      subType: data.subType,
      startDate: data.startDate,
      endDate: data.endDate,
      daysCount: Math.max(1, data.daysCount),
      reason: data.reason,
      attachmentName: data.attachmentName || undefined,
      status: 'pending',
      createdAt: `${todayDateStr} 09:00:00`,
    };

    const updatedLeave = [newReq, ...leaveRequests];
    setLeaveRequests(updatedLeave);
    persist(STORAGE_KEYS.LEAVE_REQUESTS, updatedLeave);

    const adminNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      userId: 'all',
      title: `Pengajuan ${data.type.toUpperCase()} Baru`,
      message: `${currentUser.name} (${currentUser.department}) mengajukan ${data.subType} (${data.startDate} s/d ${data.endDate}). Menunggu persetujuan Anda.`,
      type: 'warning',
      createdAt: `${todayDateStr} 09:00:00`,
      read: false,
      relatedId: newReq.id,
    };
    const updatedNotifs = [adminNotif, ...notifications];
    setNotifications(updatedNotifs);
    persist(STORAGE_KEYS.NOTIFICATIONS, updatedNotifs);

    showToast(`Pengajuan ${data.subType} berhasil dikirim ke pimpinan.`, 'success');
    return { success: true, message: 'Pengajuan berhasil dikirim.' };
  };

  const cancelLeaveRequest = (requestId: string) => {
    const target = leaveRequests.find((r) => r.id === requestId);
    if (!target) return { success: false, message: 'Pengajuan tidak ditemukan.' };

    if (target.status !== 'pending') {
      return { success: false, message: 'Hanya pengajuan dengan status Menunggu yang dapat dibatalkan.' };
    }

    const updated = leaveRequests.map((r) => {
      if (r.id === requestId) {
        return { ...r, status: 'cancelled' as const };
      }
      return r;
    });

    setLeaveRequests(updated);
    persist(STORAGE_KEYS.LEAVE_REQUESTS, updated);
    showToast('Pengajuan telah dibatalkan.', 'info');
    return { success: true, message: 'Pengajuan dibatalkan.' };
  };

  const reviewLeaveRequest = (
    requestId: string,
    action: 'approved' | 'rejected',
    note?: string
  ) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Hanya Admin/Bos yang berhak menyetujui atau menolak pengajuan.' };
    }

    const target = leaveRequests.find((r) => r.id === requestId);
    if (!target) return { success: false, message: 'Pengajuan tidak ditemukan.' };

    const updatedLeave = leaveRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: action,
          reviewedBy: currentUser.name,
          reviewedAt: `${todayDateStr} 10:00:00`,
          reviewNote: note || (action === 'approved' ? 'Pengajuan telah disetujui.' : 'Pengajuan ditolak.'),
        };
      }
      return r;
    });

    setLeaveRequests(updatedLeave);
    persist(STORAGE_KEYS.LEAVE_REQUESTS, updatedLeave);

    if (action === 'approved' && target.type === 'cuti') {
      const updatedUsers = users.map((u) => {
        if (u.id === target.userId) {
          return {
            ...u,
            remainingLeaveDays: Math.max(0, u.remainingLeaveDays - target.daysCount),
          };
        }
        return u;
      });
      setUsers(updatedUsers);
      persist(STORAGE_KEYS.USERS, updatedUsers);
    }

    const employeeNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      userId: target.userId,
      title: action === 'approved' ? 'Pengajuan Disetujui ✅' : 'Pengajuan Ditolak ❌',
      message: `Pengajuan ${target.subType} (${target.startDate}) telah ${
        action === 'approved' ? 'DISETUJUI' : 'DITOLAK'
      } oleh ${currentUser.name}.${note ? ` Catatan: "${note}"` : ''}`,
      type: action === 'approved' ? 'success' : 'alert',
      createdAt: `${todayDateStr} 10:00:00`,
      read: false,
      relatedId: target.id,
    };
    const updatedNotifs = [employeeNotif, ...notifications];
    setNotifications(updatedNotifs);
    persist(STORAGE_KEYS.NOTIFICATIONS, updatedNotifs);

    showToast(
      `Pengajuan ${target.userName} berhasil ${action === 'approved' ? 'disetujui' : 'ditolak'}.`,
      action === 'approved' ? 'success' : 'info'
    );

    return { success: true, message: `Keputusan berhasil disimpan.` };
  };

  const addEmployee = (employeeData: Omit<User, 'id'>) => {
    const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const newEmp: User = {
      id: newId,
      ...employeeData,
    };

    const updated = [...users, newEmp];
    setUsers(updated);
    persist(STORAGE_KEYS.USERS, updated);
    showToast(`Karyawan baru ${newEmp.name} berhasil ditambahkan!`, 'success');
    return { success: true, message: 'Karyawan berhasil ditambahkan.' };
  };

  const updateEmployee = (id: string, employeeData: Partial<User>) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        return { ...u, ...employeeData };
      }
      return u;
    });

    setUsers(updated);
    persist(STORAGE_KEYS.USERS, updated);
    if (currentUser?.id === id) {
      setCurrentUser({ ...currentUser, ...employeeData });
    }
    showToast('Data karyawan berhasil diperbarui.', 'success');
    return { success: true, message: 'Data karyawan diperbarui.' };
  };

  const toggleEmployeeStatus = (id: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const nextStatus = u.status === 'active' ? ('inactive' as const) : ('active' as const);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    persist(STORAGE_KEYS.USERS, updated);
    showToast('Status keaktifan akun berhasil diubah.', 'info');
  };

  const updateSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
    persist(STORAGE_KEYS.SETTINGS, newSettings);
    showToast('Pengaturan sistem dan jam absensi berhasil disimpan.', 'success');
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    persist(STORAGE_KEYS.NOTIFICATIONS, updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    persist(STORAGE_KEYS.NOTIFICATIONS, updated);
    showToast('Semua notifikasi ditandai telah dibaca.', 'info');
  };

  const unreadNotificationsCount = notifications.filter(
    (n) => !n.read && (n.userId === 'all' || n.userId === currentUser?.id)
  ).length;

  const resetDemoData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USERS,
        STORAGE_KEYS.CURRENT_USER,
        STORAGE_KEYS.ATTENDANCE,
        STORAGE_KEYS.LEAVE_REQUESTS,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.NOTIFICATIONS,
      ]);
      setUsers(INITIAL_USERS);
      setCurrentUser(INITIAL_USERS[0]);
      setAttendance(INITIAL_ATTENDANCE);
      setLeaveRequests(INITIAL_LEAVE_REQUESTS);
      setSettings(INITIAL_SETTINGS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setActiveScreen('employee_dashboard');
      showToast('Data demo berhasil direset ke kondisi awal ☁️', 'success');
    } catch (e) {
      console.warn('Failed to reset demo data', e);
      showToast('Gagal mereset data demo.', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        attendance,
        leaveRequests,
        settings,
        notifications,
        activeScreen,
        toast,
        navigateTo,
        showToast,
        hideToast,
        login,
        logout,
        switchUser,
        todayAttendance,
        todayDateStr,
        checkIn,
        checkOut,
        submitLeaveRequest,
        cancelLeaveRequest,
        reviewLeaveRequest,
        addEmployee,
        updateEmployee,
        toggleEmployeeStatus,
        updateSettings,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationsCount,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
