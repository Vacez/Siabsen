import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Plus, Edit2, Search } from 'lucide-react-native';

export const EmployeeManagementScreen: React.FC = () => {
  const {
    users,
    attendance,
    addEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    navigateTo,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedDetailUser, setSelectedDetailUser] = useState<User | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('Teknologi & IT');
  const [formPos, setFormPos] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLeaveDays, setFormLeaveDays] = useState('12');
  const [formSchedule, setFormSchedule] = useState('Senin - Jumat (08:30 - 17:30)');
  const [formJoinDate, setFormJoinDate] = useState('2026-10-01');

  const departments = [
    'all',
    'Teknologi & IT',
    'Desain Produk',
    'Keuangan & Akuntansi',
    'Pemasaran & Bisnis',
  ];

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchDept = selectedDept === 'all' || u.department === selectedDept;
    const matchStatus = selectedStatus === 'all' || u.status === selectedStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormDept('Teknologi & IT');
    setFormPos('');
    setFormPhone('');
    setFormLeaveDays('12');
    setFormSchedule('Senin - Jumat (08:30 - 17:30)');
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormDept(user.department);
    setFormPos(user.position);
    setFormPhone(user.phone || '');
    setFormLeaveDays(String(user.remainingLeaveDays));
    setFormSchedule(user.workSchedule || 'Senin - Jumat (08:30 - 17:30)');
    setFormJoinDate(user.joinDate || '2026-10-01');
  };

  const handleSaveEmployee = () => {
    if (!formName.trim() || !formEmail.trim() || !formPos.trim()) {
      showToast('Harap isi Nama, Email, dan Jabatan.', 'warning');
      return;
    }

    if (editingUser) {
      updateEmployee(editingUser.id, {
        name: formName,
        email: formEmail,
        department: formDept,
        position: formPos,
        phone: formPhone,
        workSchedule: formSchedule,
        joinDate: formJoinDate,
        remainingLeaveDays: parseInt(formLeaveDays, 10) || 12,
      });
      setEditingUser(null);
    } else {
      addEmployee({
        name: formName,
        email: formEmail,
        role: 'employee',
        department: formDept,
        position: formPos,
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        joinDate: formJoinDate,
        workSchedule: formSchedule,
        status: 'active',
        phone: formPhone,
        remainingLeaveDays: parseInt(formLeaveDays, 10) || 12,
      });
      setShowAddModal(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Manajemen Data Karyawan</Text>
          <Text style={styles.pageSubtitle}>
            Kelola data staf, jabatan, divisi, hak akses, serta kuota hak cuti tahunan.
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.8}>
          <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addBtnText}>Tambah Karyawan</Text>
        </TouchableOpacity>
      </View>

      {/* Filter and Search Bar */}
      <View style={[styles.filterCard, SHADOWS.card]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12 }}>
          <Search size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { flex: 1, borderWidth: 0, paddingHorizontal: 0 }]}
            placeholder="Cari nama, ID, atau email karyawan..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Division Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {departments.map((dept) => (
              <TouchableOpacity
                key={dept}
                style={[
                  styles.filterPill,
                  selectedDept === dept && styles.filterPillActive,
                ]}
                onPress={() => setSelectedDept(dept)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedDept === dept && styles.filterPillTextActive,
                  ]}
                >
                  {dept === 'all' ? 'Semua Divisi' : dept}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Status Filter Pills */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          {[
            { id: 'all', label: 'Semua Status Akun' },
            { id: 'active', label: 'Akun Aktif' },
            { id: 'inactive', label: 'Non-aktif' },
          ].map((st) => (
            <TouchableOpacity
              key={st.id}
              style={[
                styles.filterPill,
                selectedStatus === st.id && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
              ]}
              onPress={() => setSelectedStatus(st.id as any)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedStatus === st.id && { color: '#FFFFFF', fontWeight: '700' },
                ]}
              >
                {st.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Employee List Grid */}
      <View style={styles.empGrid}>
        {filteredUsers.map((user) => (
          <View key={user.id} style={[styles.empCard, SHADOWS.card]}>
            <View style={styles.cardHeaderRow}>
              <Image source={{ uri: user.avatar }} style={styles.empAvatar} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.empName}>{user.name}</Text>
                <Text style={styles.empPos}>{user.position}</Text>
                <Text style={styles.empDept}>{user.department}</Text>
              </View>
              <Badge
                label={user.status === 'active' ? 'Aktif' : 'Non-aktif'}
                variant={user.status === 'active' ? 'success' : 'muted'}
                size="sm"
              />
            </View>

            <View style={styles.empDetailsBox}>
              <View style={styles.empDetailRow}>
                <Text style={styles.detailLabel}>ID Karyawan:</Text>
                <Text style={styles.detailVal}>{user.id}</Text>
              </View>
              <View style={styles.empDetailRow}>
                <Text style={styles.detailLabel}>Jadwal Kerja:</Text>
                <Text style={styles.detailVal}>{user.workSchedule}</Text>
              </View>
              <View style={styles.empDetailRow}>
                <Text style={styles.detailLabel}>Tanggal Bergabung:</Text>
                <Text style={styles.detailVal}>{user.joinDate}</Text>
              </View>
              <View style={styles.empDetailRow}>
                <Text style={styles.detailLabel}>Sisa Cuti:</Text>
                <Text style={[styles.detailVal, { color: COLORS.primaryDark, fontWeight: '800' }]}>
                  {user.remainingLeaveDays} Hari
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                style={[styles.editBtn, { flexDirection: 'row', alignItems: 'center' }]}
                onPress={() => handleOpenEdit(user)}
                activeOpacity={0.7}
              >
                <Edit2 size={13} color={COLORS.primaryDark} style={{ marginRight: 4 }} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.lightBlue,
                  paddingVertical: 7,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: COLORS.skyBlue,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => setSelectedDetailUser(user)}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primaryDark }}>
                  👁️ Riwayat
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  user.status === 'active' ? { backgroundColor: '#FEE2E2' } : { backgroundColor: '#DCFCE7' },
                ]}
                onPress={() => toggleEmployeeStatus(user.id)}
              >
                <Text
                  style={[
                    styles.statusToggleText,
                    user.status === 'active' ? { color: COLORS.error } : { color: '#166534' },
                  ]}
                >
                  {user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Add / Edit Modal */}
      <Modal
        visible={showAddModal || !!editingUser}
        title={editingUser ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
        subtitle="Lengkapi data profil dan jabatan untuk administrasi presensi."
        onClose={() => {
          setShowAddModal(false);
          setEditingUser(null);
        }}
      >
        <View style={{ paddingTop: 6, gap: 12 }}>
          <View>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Rian Anggara"
              placeholderTextColor="#94A3B8"
              value={formName}
              onChangeText={setFormName}
            />
          </View>

          <View>
            <Text style={styles.inputLabel}>Email Perusahaan</Text>
            <TextInput
              style={styles.textInput}
              placeholder="nama@siabsen.id"
              placeholderTextColor="#94A3B8"
              value={formEmail}
              onChangeText={setFormEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text style={styles.inputLabel}>Jabatan / Posisi</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Software Quality Assurance"
              placeholderTextColor="#94A3B8"
              value={formPos}
              onChangeText={setFormPos}
            />
          </View>

          <View>
            <Text style={styles.inputLabel}>Departemen / Divisi</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {departments
                .filter((d) => d !== 'all')
                .map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.deptSelectPill,
                      formDept === d && styles.deptSelectPillActive,
                    ]}
                    onPress={() => setFormDept(d)}
                  >
                    <Text
                      style={[
                        styles.deptSelectText,
                        formDept === d && styles.deptSelectTextActive,
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>No. Handphone</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0812-xxxx-xxxx"
                placeholderTextColor="#94A3B8"
                value={formPhone}
                onChangeText={setFormPhone}
              />
            </View>

            <View style={{ width: 110 }}>
              <Text style={styles.inputLabel}>Kuota Cuti (Hari)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
                value={formLeaveDays}
                onChangeText={setFormLeaveDays}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Jadwal Kerja Resmi</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Senin - Jumat (08:30 - 17:30)"
                placeholderTextColor="#94A3B8"
                value={formSchedule}
                onChangeText={setFormSchedule}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Tanggal Bergabung</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                value={formJoinDate}
                onChangeText={setFormJoinDate}
              />
            </View>
          </View>

          <View style={styles.modalBtnsRow}>
            <TouchableOpacity
              style={styles.cancelModalBtn}
              onPress={() => {
                setShowAddModal(false);
                setEditingUser(null);
              }}
            >
              <Text style={styles.cancelModalText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveModalBtn} onPress={handleSaveEmployee}>
              <Text style={styles.saveModalText}>Simpan Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Detail & Attendance History Modal */}
      <Modal
        visible={!!selectedDetailUser}
        title={selectedDetailUser ? `Detail & Riwayat: ${selectedDetailUser.name}` : ''}
        subtitle={selectedDetailUser ? `${selectedDetailUser.position} • ${selectedDetailUser.department}` : ''}
        onClose={() => setSelectedDetailUser(null)}
      >
        {selectedDetailUser ? (
          <ScrollView style={{ maxHeight: 420 }}>
            {/* Quick Profile Summary Box */}
            <View
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 14,
                padding: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                gap: 6,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>ID Pegawai:</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.softNavy }}>{selectedDetailUser.id}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Email:</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.softNavy }}>{selectedDetailUser.email}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Jadwal Shift:</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.softNavy }}>{selectedDetailUser.workSchedule}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Tanggal Mulai:</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.softNavy }}>{selectedDetailUser.joinDate}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Sisa Hak Cuti:</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.primary }}>{selectedDetailUser.remainingLeaveDays} Hari</Text>
              </View>
            </View>

            {/* Attendance History Section */}
            <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.softNavy, marginBottom: 10 }}>
              Riwayat Presensi ({attendance.filter((a) => a.userId === selectedDetailUser.id).length} Catatan)
            </Text>

            {attendance.filter((a) => a.userId === selectedDetailUser.id).length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>Belum ada riwayat absensi tercatat.</Text>
              </View>
            ) : (
              attendance
                .filter((a) => a.userId === selectedDetailUser.id)
                .map((rec) => (
                  <View
                    key={rec.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: COLORS.cardBorder,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.softNavy }}>{rec.date}</Text>
                      <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
                        Masuk: {rec.checkInTime} • Pulang: {rec.checkOutTime || '--:--'}
                      </Text>
                      <Text style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>
                        Mode: {rec.workType} {rec.notes ? `• ${rec.notes}` : ''}
                      </Text>
                    </View>
                    <Badge
                      label={rec.isLate ? `Terlambat ${rec.lateMinutes}m` : 'Tepat Waktu'}
                      variant={rec.isLate ? 'warning' : 'success'}
                      size="sm"
                    />
                  </View>
                ))
            )}
          </ScrollView>
        ) : null}
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.softNavy,
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  empGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  empCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flex: 1,
    minWidth: 300,
    maxWidth: 420,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  empAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  empName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.softNavy,
  },
  empPos: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  empDept: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  empDetailsBox: {
    gap: 6,
    marginBottom: 14,
  },
  empDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: COLORS.lightBlue,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  statusToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.softNavy,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  deptSelectPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deptSelectPillActive: {
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  deptSelectText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  deptSelectTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  modalBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  saveModalBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveModalText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
