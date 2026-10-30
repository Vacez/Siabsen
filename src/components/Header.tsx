import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal as RNModal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {
  Menu,
  Bell,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { SiaLogo } from './SiaLogo';

export const Header: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    switchUser,
    users,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotificationsCount,
    resetDemoData,
  } = useApp();

  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const userNotifs = notifications.filter(
    (n) => n.userId === 'all' || n.userId === currentUser?.id
  );

  return (
    <View style={styles.container}>
      {/* Brand logo & title */}
      <View style={styles.brandRow}>
        {onToggleSidebar ? (
          <TouchableOpacity
            onPress={onToggleSidebar}
            style={styles.menuToggleBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Menu size={18} color={COLORS.softNavy} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.logoWrapper}>
          <SiaLogo size={isMobile ? 32 : 36} />
        </View>

        <View style={styles.brandInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.brandName, isMobile && { fontSize: 16 }]}>SiAbsen</Text>
            {!isMobile && (
              <View style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>PRO</Text>
              </View>
            )}
          </View>
          {!isMobile && <Text style={styles.tagline}>Hadir Tepat, Kerja Hebat.</Text>}
        </View>
      </View>

      {/* Right actions: switch account, notifications, profile */}
      <View style={styles.rightActions}>
        {/* Switch Account button */}
        <TouchableOpacity
          style={[styles.switchAccountBtn, isMobile && styles.switchAccountBtnMobile]}
          onPress={() => setShowRoleModal(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <RefreshCw size={12} color={COLORS.primaryDark} style={{ marginRight: 4 }} />
          <Text style={isMobile ? styles.switchAccountTextMobile : styles.switchAccountText}>
            {isMobile ? 'Akun' : 'Ganti Akun Demo'}
          </Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={[styles.notifBtn, isMobile && styles.notifBtnMobile]}
          onPress={() => setShowNotifModal(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Bell size={16} color={COLORS.softNavy} />
          {unreadNotificationsCount > 0 ? (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{unreadNotificationsCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* User Avatar & Name */}
        {currentUser ? (
          <TouchableOpacity
            style={styles.userProfile}
            onPress={() => setShowRoleModal(true)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: currentUser.avatar }}
              style={[styles.avatar, isMobile && styles.avatarMobile]}
            />
            {!isMobile && (
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {currentUser.name}
                </Text>
                <View
                  style={[
                    styles.rolePill,
                    {
                      backgroundColor:
                        currentUser.role === 'admin' ? '#FEE2E2' : COLORS.lightBlue,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.rolePillText,
                      {
                        color:
                          currentUser.role === 'admin' ? COLORS.error : COLORS.primary,
                      },
                    ]}
                  >
                    {currentUser.role === 'admin' ? 'BOS / ADMIN' : 'KARYAWAN'}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Notification Modal */}
      <RNModal
        visible={showNotifModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notifBox}>
            <View style={styles.notifHeader}>
              <View>
                <Text style={styles.notifTitle}>Notifikasi ({userNotifs.length})</Text>
                <Text style={styles.notifSub}>{unreadNotificationsCount} belum dibaca</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={markAllNotificationsRead} style={styles.markAllBtn}>
                  <Text style={styles.markAllText}>Tandai Dibaca</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowNotifModal(false)}
                  style={styles.closeNotifBtn}
                >
                  <X size={16} color={COLORS.softNavy} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              {userNotifs.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: COLORS.textMuted }}>Tidak ada notifikasi saat ini.</Text>
                </View>
              ) : (
                userNotifs.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.notifItem, !item.read && styles.notifItemUnread]}
                    onPress={() => markNotificationRead(item.id)}
                  >
                    <View style={styles.notifItemIcon}>
                      {item.type === 'success' ? (
                        <CheckCircle2 size={16} color={COLORS.success} />
                      ) : item.type === 'warning' ? (
                        <AlertTriangle size={16} color={COLORS.warning} />
                      ) : (
                        <Info size={16} color={COLORS.primary} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.notifItemTitle, !item.read && { fontWeight: '800' }]}>
                        {item.title}
                      </Text>
                      <Text style={styles.notifItemMsg}>{item.message}</Text>
                      <Text style={styles.notifItemTime}>{item.createdAt}</Text>
                    </View>
                    {!item.read ? <View style={styles.unreadDot} /> : null}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </RNModal>

      {/* Role Switcher Modal */}
      <RNModal
        visible={showRoleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.switchBox}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>Pilih Akun Demo SiAbsen</Text>
              <TouchableOpacity
                onPress={() => setShowRoleModal(false)}
                style={styles.closeNotifBtn}
              >
                <X size={16} color={COLORS.softNavy} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 360, paddingHorizontal: 16 }}>
              {users.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.userOption, isCurrent && styles.userOptionActive]}
                    onPress={() => {
                      switchUser(u.id);
                      setShowRoleModal(false);
                    }}
                  >
                    <Image source={{ uri: u.avatar }} style={styles.optionAvatar} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.optionName}>{u.name}</Text>
                      <Text style={styles.optionRole}>
                        {u.position} • {u.department}
                      </Text>
                      <Text
                        style={[
                          styles.optionBadge,
                          u.role === 'admin'
                            ? { color: COLORS.error }
                            : { color: COLORS.primary },
                        ]}
                      >
                        {u.role.toUpperCase()}
                      </Text>
                    </View>
                    {isCurrent ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Check size={14} color={COLORS.success} />
                        <Text style={{ color: COLORS.success, fontWeight: '700', fontSize: 12, marginLeft: 3 }}>
                          Aktif
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Reset Demo Data button */}
            <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1,
                  borderColor: '#FECACA',
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
                onPress={() => {
                  resetDemoData();
                  setShowRoleModal(false);
                }}
              >
                <Text style={{ color: COLORS.error, fontWeight: '700', fontSize: 13 }}>
                  Reset Data Demo ke Kondisi Awal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </RNModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    zIndex: 100,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuToggleBtn: {
    marginRight: 8,
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoWrapper: {
    marginRight: 8,
  },
  brandInfo: {
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.softNavy,
    letterSpacing: -0.5,
  },
  tagBadge: {
    backgroundColor: COLORS.skyBlue,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  tagBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CFE6FB',
  },
  switchAccountBtnMobile: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  switchAccountText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  switchAccountTextMobile: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  notifBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  notifBtnMobile: {
    width: 32,
    height: 32,
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1.5,
    borderColor: COLORS.skyBlue,
  },
  avatarMobile: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userInfo: {
    marginLeft: 8,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    maxWidth: 120,
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notifBox: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  switchBox: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFBFD',
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  notifSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  markAllBtn: {
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.lightBlue,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  closeNotifBtn: {
    padding: 6,
  },
  notifItem: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    alignItems: 'flex-start',
  },
  notifItemUnread: {
    backgroundColor: '#F0F7FF',
  },
  notifItemIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  notifItemTitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  notifItemMsg: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  notifItemTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
    marginTop: 6,
  },
  userOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  userOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
  },
  optionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.softNavy,
  },
  optionRole: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  optionBadge: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
});
