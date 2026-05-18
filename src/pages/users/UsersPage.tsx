// src/pages/users/UsersPage.tsx
import { useEffect, useState } from 'react';
import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Dropdown } from '../../components/Dropdown';
import { Alert } from '../../components/Alert';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';
import { Toast } from '../../components/Toast';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../data/store';
import { listUsers, deactivateUser } from '../../api/userApi';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { UserFormModal } from './UserFormModal';
import type { User, Role, EntityStatus } from '../../types';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: 'ผู้ดูแลระบบสูงสุด',
  ADMIN: 'ผู้ดูแลระบบ',
  CREDIT_OFFICER: 'เจ้าหน้าที่สินเชื่อ',
  BORROWER_DATA_ENTRY: 'เจ้าหน้าที่บันทึกข้อมูลผู้กู้',
  CUSTOMS_DATA_ENTRY: 'เจ้าหน้าที่บันทึกข้อมูลใบขน',
  AUDITOR: 'ผู้ตรวจสอบ',
};

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'ทุกบทบาท' },
  ...(Object.keys(roleLabel) as Role[]).map((r) => ({
    value: r,
    label: roleLabel[r],
  })),
];

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'ACTIVE', label: 'ใช้งาน' },
  { value: 'INACTIVE', label: 'ปิดใช้งาน' },
];

export function UsersPage() {
  const { user } = useAuth();
  const actor: User | null =
    user ?? store.users.find((u) => u.role === 'SUPER_ADMIN') ?? null;

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | Role>('');
  const [statusFilter, setStatusFilter] = useState<'' | EntityStatus>('');
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  async function load() {
    setLoading(true);
    const result = await listUsers({
      query: query.trim() || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
    });
    setRows(result);
    setPage(1);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  }

  function handleCreate() {
    setEditUser(null);
    setFormOpen(true);
  }

  function handleEdit(target: User) {
    setEditUser(target);
    setFormOpen(true);
  }

  function handleSaved() {
    const wasEdit = editUser !== null;
    setFormOpen(false);
    setEditUser(null);
    showToast(wasEdit ? 'บันทึกข้อมูลผู้ใช้เรียบร้อย' : 'สร้างผู้ใช้ใหม่เรียบร้อย');
    void load();
  }

  async function handleConfirmDeactivate() {
    if (!confirmUser || !actor) return;
    setDeactivating(true);
    setError(null);
    try {
      await deactivateUser(actor, confirmUser.id);
      setConfirmUser(null);
      showToast('ปิดใช้งานผู้ใช้เรียบร้อย');
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setConfirmUser(null);
    } finally {
      setDeactivating(false);
    }
  }

  const total = rows.length;
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <PageHeader
        title="จัดการผู้ใช้งาน"
        description="เพิ่ม แก้ไข และจัดการบัญชีผู้ใช้งานในระบบ"
        actions={
          <Button variant="primary" onClick={handleCreate}>
            เพิ่มผู้ใช้
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        {error && (
          <Alert tone="error" variant="banner">
            {error}
          </Alert>
        )}

        <section className="rounded-lg bg-white p-4 shadow-card">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <TextInput
                label="ค้นหา"
                value={query}
                onChange={setQuery}
                placeholder="ชื่อ หรือ username"
              />
            </div>
            <Dropdown
              label="บทบาท"
              value={roleFilter}
              onChange={(v) => setRoleFilter(v as '' | Role)}
              options={ROLE_FILTER_OPTIONS}
            />
            <Dropdown
              label="สถานะ"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as '' | EntityStatus)}
              options={STATUS_FILTER_OPTIONS}
            />
          </div>
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={() => void load()}
              loading={loading}
            >
              ค้นหา
            </Button>
          </div>
        </section>

      <section className="rounded-lg bg-white shadow-card">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={28} />
          </div>
        ) : total === 0 ? (
          <EmptyState message="ไม่พบข้อมูลผู้ใช้งาน" />
        ) : (
          <>
            <DataTable<User>
              columns={[
                {
                  key: 'no',
                  header: '#',
                  className: 'w-12 text-gray-500',
                  render: (row) => rows.indexOf(row) + 1,
                },
                {
                  key: 'username',
                  header: 'Username',
                  render: (row) => (
                    <span className="font-medium text-navy underline">
                      {row.username}
                    </span>
                  ),
                },
                {
                  key: 'fullName',
                  header: 'ชื่อ-นามสกุล',
                  render: (row) => `${row.firstName} ${row.lastName}`,
                },
                {
                  key: 'role',
                  header: 'บทบาท',
                  render: (row) => (
                    <Badge text={roleLabel[row.role]} tone="blue" />
                  ),
                },
                {
                  key: 'status',
                  header: 'สถานะ',
                  render: (row) => (
                    <Badge
                      text={row.status === 'ACTIVE' ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      tone={row.status === 'ACTIVE' ? 'green' : 'gray'}
                    />
                  ),
                },
                {
                  key: 'lastLoginAt',
                  header: 'เข้าระบบล่าสุด',
                  render: (row) =>
                    row.lastLoginAt ? formatDateTime(row.lastLoginAt) : '-',
                },
                {
                  key: 'createdAt',
                  header: 'วันที่สร้าง',
                  render: (row) => formatDate(row.createdAt),
                },
                {
                  key: 'action',
                  header: 'จัดการ',
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(row);
                        }}
                        aria-label={`แก้ไข ${row.username}`}
                        className="px-2 py-1"
                      >
                        แก้ไข
                      </Button>
                      {actor?.id !== row.id && row.status === 'ACTIVE' && (
                        <Button
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmUser(row);
                          }}
                          aria-label={`ปิดใช้งาน ${row.username}`}
                          className="px-2 py-1"
                        >
                          ปิดใช้งาน
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
              rows={pageRows}
              rowKey={(row) => row.id}
              onRowClick={handleEdit}
            />
            <div className="border-t border-gray-200 px-3">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
        </section>
      </div>

      {actor && (
        <UserFormModal
          open={formOpen}
          actor={actor}
          editUser={editUser}
          onClose={() => {
            setFormOpen(false);
            setEditUser(null);
          }}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={confirmUser !== null}
        title="ยืนยันการปิดใช้งาน"
        message={
          confirmUser
            ? `ต้องการปิดใช้งานบัญชี "${confirmUser.username}" ใช่หรือไม่?`
            : ''
        }
        confirmLabel={deactivating ? 'กำลังดำเนินการ...' : 'ปิดใช้งาน'}
        danger
        onConfirm={() => void handleConfirmDeactivate()}
        onCancel={() => setConfirmUser(null)}
      />

      <Toast message={toast} visible={toast !== ''} />
    </div>
  );
}
