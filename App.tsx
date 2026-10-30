import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Text,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  User,
  TrendingUp,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { COLORS } from './src/constants/theme';
import { Header } from './src/components/Header';
import { Sidebar } from './src/components/Sidebar';
import { Toast } from './src/components/Toast';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { EmployeeDashboardScreen } from './src/screens/EmployeeDashboardScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { LeaveRequestScreen } from './src/screens/LeaveRequestScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { ApprovalScreen } from './src/screens/ApprovalScreen';
import { EmployeeManagementScreen } from './src/screens/EmployeeManagementScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const ANDROID_STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0;

const MainNavigator: React.FC = () => {
  const { activeScreen, currentUser, navigateTo, leaveRequests } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If on login screen or not logged in
  if (activeScreen === 'login' || !currentUser) {
    return <LoginScreen />;
  }

  const pendingApprovalsCount = leaveRequests.filter((l) => l.status === 'pending').length;

  const renderScreen = () => {
    switch (activeScreen) {
      case 'employee_dashboard':
        return <EmployeeDashboardScreen />;
      case 'attendance':
        return <AttendanceScreen />;
      case 'leave_request':
        return <LeaveRequestScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'admin_dashboard':
        return <AdminDashboardScreen />;
      case 'approvals':
        return <ApprovalScreen />;
      case 'employees':
        return <EmployeeManagementScreen />;
      case 'reports':
        return <ReportScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <EmployeeDashboardScreen />;
    }
  };

  return (
    <View style={styles.rootContainer}>
      {/* Top Status Bar Spacer for Android edge-to-edge screens */}
      {Platform.OS === 'android' && (
        <View style={{ height: ANDROID_STATUS_BAR_HEIGHT, backgroundColor: '#FFFFFF' }} />
      )}

      {/* Main Header */}
      <Header
        onToggleSidebar={!isDesktop ? () => setMobileSidebarOpen(!mobileSidebarOpen) : undefined}
      />

      <View style={styles.bodyLayout}>
        {/* Desktop Sidebar */}
        {isDesktop ? <Sidebar /> : null}

        {/* Mobile Slide-in Drawer */}
        {!isDesktop && mobileSidebarOpen ? (
          <View style={styles.mobileDrawerOverlay}>
            <TouchableOpacity
              style={styles.mobileDrawerBackdrop}
              onPress={() => setMobileSidebarOpen(false)}
              activeOpacity={1}
            />
            <View style={styles.mobileDrawerSheet}>
              <View style={styles.mobileDrawerHeader}>
                <Text style={styles.mobileDrawerTitle}>Menu Navigasi</Text>
                <TouchableOpacity
                  onPress={() => setMobileSidebarOpen(false)}
                  style={styles.closeDrawerBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color={COLORS.softNavy} />
                </TouchableOpacity>
              </View>
              <Sidebar />
            </View>
          </View>
        ) : null}

        {/* Main Content Area */}
        <View style={styles.contentArea}>{renderScreen()}</View>
      </View>

      {/* Mobile Bottom Tab Bar with Professional Vector SVG Icons */}
      {!isDesktop ? (
        <View style={styles.bottomTabBar}>
          {currentUser.role === 'employee' ? (
            <>
              {/* Employee Tab 1: Beranda */}
              <TouchableOpacity
                style={[
                  styles.tabBarItem,
                  activeScreen === 'employee_dashboard' && styles.tabBarItemActive,
                ]}
                onPress={() => navigateTo('employee_dashboard')}
                activeOpacity={0.7}
              >
                <LayoutDashboard
                  size={20}
                  color={
                    activeScreen === 'employee_dashboard' ? COLORS.primary : COLORS.textMuted
                  }
                  strokeWidth={activeScreen === 'employee_dashboard' ? 2.4 : 1.8}
                />
                <Text
                  style={[
                    styles.tabBarLabel,
                    activeScreen === 'employee_dashboard' && styles.tabBarLabelActive,
                  ]}
                >
                  Beranda
                </Text>
              </TouchableOpacity>

              {/* Employee Tab 2: Absen */}
              <TouchableOpacity
                style={[
                  styles.tabBarItem,
                  activeScreen === 'attendance' && styles.tabBarItemActive,
                ]}
                onPress={() => navigateTo('attendance')}
                activeOpacity={0.7}
              >
                <Clock
                  size={20}
                  color={activeScreen === 'attendance' ? COLORS.primary : COLORS.textMuted}
                  strokeWidth={activeScreen === 'attendance' ? 2.4 : 1.8}
                />
                <Text
                  style={[
                    styles.tabBarLabel,
                    activeScreen === 'attendance' && styles.tabBarLabelActive,
                  ]}
                >
                  Absen
                </Text>
              </TouchableOpacity>

              {/* Employee Tab 3: Cuti/Izin */}
              <TouchableOpacity
                style={[
                  styles.tabBarItem,
                  activeScreen === 'leave_request' && styles.tabBarItemActive,
                ]}
                onPress={() => navigateTo('leave_request')}
                activeOpacity={0.7}
              >
                <CalendarDays
                  size={20}
                  color={
                    activeScreen === 'leave_request' ? COLORS.primary : COLORS.textMuted
                  }
                  strokeWidth={activeScreen === 'leave_request' ? 2.4 : 1.8}
                />
                <Text
                  style={[
                    styles.tabBarLabel,
                    activeScreen === 'leave_request' && styles.tabBarLabelActive,
                  ]}
                >
                  Cuti/Izin
                </Text>
              </TouchableOpacity>

              {/* Employee Tab 4: Profil */}
              <TouchableOpacity
                style={[
                  styles.tabBarItem,
                  activeScreen === 'profile' && styles.tabBarItemActive,
                ]}
                onPress={() => navigateTo('profile')}
                activeOpacity={0.7}
              >
                <User
                  size={20}
                  color={activeScreen === 'profile' ? COLORS.primary : COLORS.textMuted}
                  strokeWidth={activeScreen === 'profile' ? 2.4 : 1.8}
                />
                <Text
                  style={[
                    styles.tabBarLabel,
                    activeScreen === 'profile' && styles.tabBarLabelActive,
                  ]}
                >
                  Profil
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Admin Tab 1: Eksekutif */}
              <TouchableOpacity
                style={[
                  styles.tabBarItem,
                  activeScreen === 'admin_dashboard' && styles.tabBarItemActive,
                ]}
                onPress={() => navigateTo('admin_dashboard')}
                activeOpacity={0.7}
              >
                <TrendingUp
                  size={20}
                  color={
                    activeScreen === 'admin_dashboard' ? COLORS.primary : COLORS.textMuted
                  }
                  strokeWidth={activeScreen === 'admin_dashboard' ? 2.4 : 1.8}
                />
                <Text
                  style={[
                    styles.tabBarLabel,
                    activeScreen === 'admin_dashboard' && styles.tabBarLabelActive,
                  ]}
                >
                  Eksekutif
                </Text>
              </TouchableOpacity>

              {/* Admin Tab 2: Persetujuan */}
              <TouchableOpacity
                style={[
                  styles.tabBarItem,
                  activeScreen === 'approvals' && styles.tabBarItemActive,
                ]}
                onPress={() => navigateTo('approvals')}
                activeOpacity={0.7}
              >
                <View style={styles.iconWithBadgeWrap}>
                  <CheckCircle2
                    size={20}
                    color={activeScreen === 'approvals' ? COLORS.primary : COLORS.textMuted}
                    strokeWidth={activeScreen === 'approvals' ? 2.4 : 1.8}
                  />
                  {pendingApprovalsCount > 0 && (
                    <View style={styles.navBadgeDot}>
                      <Text style={styles.navBadgeText}>{pendingApprovalsCount}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.tabBarLabel,
                    activeScreen === 'approvals' && styles.tabBarLabelActive,
                  ]}
                >
                  Persetujuan
                </Text>
              </TouchableOpacity>

              {/* Admin Tab 3: Rekap */}
              <TouchableOpacity
                style={[
                  styles.tabBarItem,
                  activeScreen === 'reports' && styles.tabBarItemActive,
                ]}
                onPress={() => navigateTo('reports')}
                activeOpacity={0.7}
              >
                <FileSpreadsheet
                  size={20}
                  color={activeScreen === 'reports' ? COLORS.primary : COLORS.textMuted}
                  strokeWidth={activeScreen === 'reports' ? 2.4 : 1.8}
                />
                <Text
                  style={[
                    styles.tabBarLabel,
                    activeScreen === 'reports' && styles.tabBarLabelActive,
                  ]}
                >
                  Rekap
                </Text>
              </TouchableOpacity>

              {/* Admin Tab 4: Admin */}
              <TouchableOpacity
                style={[
                  styles.tabBarItem,
                  activeScreen === 'profile' && styles.tabBarItemActive,
                ]}
                onPress={() => navigateTo('profile')}
                activeOpacity={0.7}
              >
                <ShieldCheck
                  size={20}
                  color={activeScreen === 'profile' ? COLORS.primary : COLORS.textMuted}
                  strokeWidth={activeScreen === 'profile' ? 2.4 : 1.8}
                />
                <Text
                  style={[
                    styles.tabBarLabel,
                    activeScreen === 'profile' && styles.tabBarLabelActive,
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : null}

      <Toast />
    </View>
  );
};

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <MainNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  bodyLayout: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  mobileDrawerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: 'row',
  },
  mobileDrawerBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  mobileDrawerSheet: {
    width: 280,
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  mobileDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobileDrawerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  closeDrawerBtn: {
    padding: 6,
  },
  bottomTabBar: {
    height: 62,
    paddingBottom: Platform.OS === 'android' ? 8 : 4,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    flex: 1,
    borderRadius: 12,
  },
  tabBarItemActive: {
    // subtle active indicator
  },
  iconWithBadgeWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBadgeDot: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  tabBarLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
});
