// src/pages/borrowers/BorrowersPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Dropdown } from '../../components/Dropdown';
import { Alert } from '../../components/Alert';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { Toast } from '../../components/Toast';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../data/store';
import { listBorrowers, deactivateBorrower } from '../../api/borrowerApi';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { BorrowerFormModal } from './BorrowerFormModal';
import type { User, Borrower, BorrowerType, EntityStatus } from '../../types';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const borrowerTypeLabel: Record<BorrowerType, string> = {
  JURISTIC: 'นิติบุคคล',
  INDIVIDUAL: 'บุคคลธรรมดา',
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'ACTIVE', label: 'ใช้งาน' },
  { value: 'INACTIVE', label: 'ปิดใช้งาน' },
];

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'ทุกประเภท' },
  { value: 'JURISTIC', label: 'นิติบุคคล' },
  { value: 'INDIVIDUAL', label: 'บุคคลธรรมดา' },
];

export function BorrowersPage() {
  const { user } = useAuth();
  const actor: User | null =
    user ?? store.users.find((u) => u.role === 'SUPER_ADMIN') ?? null;
  const isSuperAdmin = actor?.role === 'SUPER_ADMIN';
  const canWrite = actor?.role !== 'AUDITOR';

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | BorrowerType>('');
  const [statusFilter, setStatusFilter] = useState<'' | EntityStatus>('');
  const [rows, setRows] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editBorrower, setEditBorrower] = useState<Borrower | null>(null);
  const [confirmBorrower, setConfirmBorrower] = useState<Borrower | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  async function load() {
    setLoading(true);
    const result = await listBorrowers({
      query: query.trim() || undefined,
      borrowerType: typeFilter || undefined,
      status: statusFilter || undefined,
    });
    setRows(result);
    setPage(1);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  }

  function handleCreate() {
    setEditBorrower(null);
    setFormOpen(true);
  }

  function handleEdit(target: Borrower) {
    setEditBorrower(target);
    setFormOpen(true);
  }

  function handleSaved() {
    const wasEdit = editBorrower !== null;
    setFormOpen(false);
    setEditBorrower(null);
    showToast(wasEdit ? 'บันทึกข้อมูลผู้กู้เรียบร้อย' : 'เพิ่มผู้กู้ใหม่เรียบร้อย');
    void load();
  }

  async function handleConfirmDeactivate() {
    if (!confirmBorrower || !actor) return;
    setDeactivating(true);
    setError(null);
    try {
      await deactivateBorrower(actor, confirmBorrower.id);
      setConfirmBorrower(null);
      showToast('ปิดใช้งานผู้กู้เรียบร้อย');
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setConfirmBorrower(null);
    } finally {
      setDeactivating(false);
    }
  }

  const total = rows.length;
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <PageHeader
        title="จัดการข้อมูลผู้กู้"
        description="เพิ่ม แก้ไข และจัดการข้อมูลผู้กู้ในระบบ"
        actions={
          canWrite && (
            <Button variant="primary" onClick={handleCreate}>
              เพิ่มผู้กู้
            </Button>
          )
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
              placeholder="ชื่อบริษัท เลขนิติบุคคล หรือ รหัสผู้กู้"
            />
          </div>
          <Dropdown
            label="ประเภทผู้กู้"
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as '' | BorrowerType)}
            options={TYPE_FILTER_OPTIONS}
          />
          <Dropdown
            label="สถานะ"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as '' | EntityStatus)}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
        <div className="mt-4">
          <Button variant="primary" onClick={() => void load()} loading={loading}>
            ค้นหา
          </Button>
        </div>
      </section>

      <section className="rounded-lg bg-white shadow-card">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : total === 0 ? (
          <EmptyState message="ไม่พบข้อมูลผู้กู้" />
        ) : (
          <>
            <DataTable<Borrower>
              columns={[
                {
                  key: 'id',
                  header: 'รหัสผู้กู้',
                  render: (row) => (
                    <Link
                      to={`/borrowers/${row.id}`}
                      className="font-medium text-navy-700 underline"
                    >
                      {row.id}
                    </Link>
                  ),
                },
                {
                  key: 'nameTh',
                  header: 'ชื่อบริษัท',
                  render: (row) => row.nameTh,
                },
                {
                  key: 'taxId',
                  header: 'เลขนิติบุคคล',
                  render: (row) => row.taxId,
                },
                {
                  key: 'borrowerType',
                  header: 'ประเภท',
                  render: (row) => (
                    <Badge
                      text={borrowerTypeLabel[row.borrowerType]}
                      tone={row.borrowerType === 'JURISTIC' ? 'blue' : 'teal'}
                    />
                  ),
                },
                {
                  key: 'creditLimit',
                  header: 'วงเงินสินเชื่อ',
                  className: 'text-right',
                  render: (row) => formatCurrency(row.creditLimit),
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
                  key: 'createdAt',
                  header: 'วันที่สร้าง',
                  render: (row) => formatDate(row.createdAt),
                },
                {
                  key: 'action',
                  header: 'จัดการ',
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/borrowers/${row.id}`}
                        className="rounded-md border border-navy-200 bg-white px-2 py-1 text-sm font-medium text-navy-700 hover:bg-navy-50"
                      >
                        ดู
                      </Link>
                      {canWrite && (
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(row)}
                          aria-label={`แก้ไข ${row.nameTh}`}
                          className="px-2 py-1"
                        >
                          แก้ไข
                        </Button>
                      )}
                      {isSuperAdmin && row.status === 'ACTIVE' && (
                        <Button
                          variant="danger"
                          onClick={() => setConfirmBorrower(row)}
                          aria-label={`ปิดใช้งาน ${row.nameTh}`}
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
            />
            <div className="border-t border-navy-100 px-3">
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
        <BorrowerFormModal
          open={formOpen}
          actor={actor}
          editBorrower={editBorrower}
          onClose={() => {
            setFormOpen(false);
            setEditBorrower(null);
          }}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={confirmBorrower !== null}
        title="ยืนยันการปิดใช้งาน"
        message={
          confirmBorrower
            ? `ต้องการปิดใช้งานผู้กู้ "${confirmBorrower.nameTh}" ใช่หรือไม่?`
            : ''
        }
        confirmLabel={deactivating ? 'กำลังดำเนินการ...' : 'ปิดใช้งาน'}
        danger
        onConfirm={() => void handleConfirmDeactivate()}
        onCancel={() => setConfirmBorrower(null)}
      />

      <Toast message={toast} visible={toast !== ''} />
    </div>
  );
}
