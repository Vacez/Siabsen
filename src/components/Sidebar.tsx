import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Calendar,
  User,
  TrendingUp,
  CheckCircle2,
  Users,
  FileSpreadsheet,
  Settings,
  LogOut,
  ArrowLeftRight,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useApp, ScreenName } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { currentUser, activeScreen, navigateTo, logout, leaveRequests } = useApp();

  const pendingApprovalsCount = leaveRequests.filter((r) => r.status === 'pending').length;

  const isAdmin = currentUser?.role === 'admin';

  interface NavItem {
    id: ScreenName;
    title: string;
    icon: React.ReactNode;
    badgeCount?: number;
  }

  const employeeNav: NavItem[] = [
    {
      id: 'employee_dashboard',
      title: 'Dashboard Karyawan',
      icon: (
        <LayoutDashboard
          size={18}
          color={activeScreen === 'employee_dashboard' ? COLORS.primaryDark : COLORS.textSecondary}
        />
      ),
    },
    {
      id: 'attendance',
      title: 'Presensi Harian',
      icon: (
        <Clock
          size={18}
          color={activeScreen === 'attendance' ? COLORS.primaryDark : COLORS.textSecondary}
        />
      ),
    },
    {
      id: 'leave_request',
      title: 'Pengajuan Cuti / Izin',
      icon: (
        <CalendarDays
          size={18}
          color={activeScreen === 'leave_request' ? COLORS.primaryDark : COLORS.textSecondary}
        />
      ),
    },
    {
      id: 'history',
      title: 'Riwayat Kehadiran',
      icon: (
        <Calendar
          size={18}
          color={activeScreen === 'history' ? COLORS.primaryDark : COLORS.textSecondary}
        />
      ),
    },
    {
      id: 'profile',
      title: 'Profil & Pengaturan',
      icon: (
        <User
          size={18}
          color={activeScreen === 'profile' ? COLORS.primaryDark : COLORS.textSecondary}
        />
      ),
    },
  ];

  const adminNav: NavItem[] = [
    {
      id: 'admin_dashboard',
      title: 'Dashboard Eksekutif',
      icon: (
        <TrendingUp
          size={18}
          color={activeScreen === 'admin_dashboard' ? COLORS.primaryDark : COLORS.textSecondary}
        />
      ),
    },
    {
      id: 'approvals',
      title: 'Persetujuan Pengajuan',
      icon: (
        <CheckCircle2
          size={18}
          color={activeScreen === 'approvals' ? COLORS.primaryDark : COLORS.textSecondary}
        />
      ),
      badgeCount: pendingApprovalsCount,
    },
    {
      id: 'employees',
      title: 'Data Karyawan',
      icon: (
        <Users
          size={18}
          color={activeScreen === 'employees' ? COLORS.primaryDark : COLORS.textSecondary}
        />
      ),
    },
    {
      id: 'reports',
      title: 'Rekap & Laporan',
      icon: (
        <FileSpreadsheet
          size={18}
          color={activeScreen === 'reports' ? COLORS.primaryDark : COLORS.textSecondary}
        />
      ),
    },
    {
      id: 'settings',
      title: 'Pengaturan Sistem',
      icon: (
        <Settings
          size={18}
          color={activeScreen === 'settings' ? COLORS.primaryDark : COLORS.textSecondary}
        />
      ),
    },
    {
      id: 'profile',
      title: 'Profil Admin',
      icon: (
        <User
          size={18}
          color={activeScreen === 'profile' ? COLORS.primaryDark : COLORS.textSecondary}
        />
      ),
    },
  ];

  const items = isAdmin ? adminNav : employeeNav;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{isAdmin ? 'MENU ADMINISTRATOR' : 'MENU KARYAWAN'}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => navigateTo(item.id)}
            >
              <View style={styles.navIconWrap}>{item.icon}</View>
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {item.title}
              </Text>
              {item.badgeCount && item.badgeCount > 0 ? (
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{item.badgeCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Role Switcher Quick Shortcut inside sidebar */}
      <View style={styles.roleToggleCard}>
        <Text style={styles.roleToggleTitle}>Peralihan Cepat Role</Text>
        <TouchableOpacity
          style={styles.roleToggleBtn}
          onPress={() => {
            if (isAdmin) {
              navigateTo('employee_dashboard');
            } else {
              navigateTo('admin_dashboard');
            }
          }}
        >
          <ArrowLeftRight size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.roleToggleBtnText}>
            {isAdmin ? 'Lihat Tampilan Karyawan' : 'Lihat Dashboard Admin'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom User Card & Logout */}
      <View style={styles.bottomSection}>
        {currentUser ? (
          <View style={styles.bottomUserRow}>
            <Image source={{ uri: currentUser.avatar }} style={styles.userThumb} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.bottomUserName} numberOfLines={1}>
                {currentUser.name}
              </Text>
              <Text style={styles.bottomUserEmail} numberOfLines={1}>
                {currentUser.department}
              </Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={14} color={COLORS.error} style={{ marginRight: 6 }} />
          <Text style={styles.logoutText}>Keluar Akun</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: COLORS.cardBorder,
    paddingTop: 18,
    paddingBottom: 20,
    paddingHorizontal: 14,
    height: '100%',
  },
  sectionHeader: {
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: COLORS.lightBlue,
  },
  navIconWrap: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
  },
  navTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  badgePill: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  roleToggleCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleToggleTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  roleToggleBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.skyBlue,
    borderRadius: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleToggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  bottomUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userThumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  bottomUserName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.softNavy,
  },
  bottomUserEmail: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.error,
  },
});
