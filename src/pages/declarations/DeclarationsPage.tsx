// src/pages/declarations/DeclarationsPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Dropdown } from '../../components/Dropdown';
import { DateRangePicker } from '../../components/DateRangePicker';
import { Alert } from '../../components/Alert';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { Toast } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../data/store';
import {
  listDeclarations,
  type DeclarationRow,
} from '../../api/declarationApi';
import { unlinkDeclaration } from '../../api/declarationApi';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { DeclarationFormModal } from './DeclarationFormModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { User, Declaration, DeclarationStatus } from '../../types';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'RELEASED', label: 'ตรวจปล่อยแล้ว' },
  { value: 'HOLD', label: 'ระงับ' },
  { value: 'IN_PROCESS', label: 'อยู่ระหว่างดำเนินการ' },
];

const STATUS_LABEL: Record<DeclarationStatus, { text: string; tone: 'green' | 'red' | 'amber' }> = {
  RELEASED: { text: 'ตรวจปล่อยแล้ว', tone: 'green' },
  HOLD: { text: 'ระงับ', tone: 'red' },
  IN_PROCESS: { text: 'อยู่ระหว่างดำเนินการ', tone: 'amber' },
};

export function DeclarationsPage() {
  const { user } = useAuth();
  const actor: User | null =
    user ?? store.users.find((u) => u.role === 'SUPER_ADMIN') ?? null;
  const isSuperAdmin = actor?.role === 'SUPER_ADMIN';
  const canWrite = actor?.role !== 'AUDITOR';

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | DeclarationStatus>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [rows, setRows] = useState<DeclarationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Declaration | null>(null);
  const [confirmUnlink, setConfirmUnlink] = useState<DeclarationRow | null>(null);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await listDeclarations({
        query: query.trim() || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setRows(result);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFrom, dateTo]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  }

  function handleCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function handleEdit(target: Declaration) {
    setEditTarget(target);
    setFormOpen(true);
  }

  function handleSaved() {
    const wasEdit = editTarget !== null;
    setFormOpen(false);
    setEditTarget(null);
    showToast(wasEdit ? 'บันทึกข้อมูลใบขนเรียบร้อย' : 'เพิ่มใบขนใหม่เรียบร้อย');
    void load();
  }

  async function handleConfirmUnlink() {
    if (!confirmUnlink || !confirmUnlink.linkId || !actor) return;
    setUnlinking(true);
    setError(null);
    try {
      await unlinkDeclaration(actor, confirmUnlink.linkId);
      setConfirmUnlink(null);
      showToast('ยกเลิกการเชื่อมโยงเรียบร้อย');
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setConfirmUnlink(null);
    } finally {
      setUnlinking(false);
    }
  }

  const total = rows.length;
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <PageHeader
        title="จัดการข้อมูลใบขน"
        description="เพิ่ม แก้ไข ค้นหา และจัดการการเชื่อมโยงใบขนกับผู้กู้"
        actions={
          canWrite && (
            <Button variant="primary" onClick={handleCreate}>
              เพิ่มใบขน
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TextInput
                label="ค้นหา"
                value={query}
                onChange={setQuery}
                placeholder="เลขที่ใบขน หรือ ชื่อผู้ส่งออก"
              />
            </div>
            <Dropdown
              label="สถานะใบขน"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as '' | DeclarationStatus)}
              options={STATUS_FILTER_OPTIONS}
            />
            <div className="lg:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-navy-700">
                ช่วงวันที่ใบขน
              </label>
              <DateRangePicker
                from={dateFrom}
                to={dateTo}
                onChange={(f, t) => {
                  setDateFrom(f);
                  setDateTo(t);
                }}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" onClick={() => void load()} loading={loading}>
              ค้นหา
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('');
                setStatusFilter('');
                setDateFrom('');
                setDateTo('');
              }}
            >
              ล้างค่า
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
            <EmptyState message="ไม่พบข้อมูลใบขน" />
          ) : (
            <>
              <DataTable<DeclarationRow>
                columns={[
                  {
                    key: 'declarationNo',
                    header: 'เลขที่ใบขน',
                    render: (row) => (
                      <span className="font-medium text-navy-700">
                        {row.declaration.declarationNo}
                      </span>
                    ),
                  },
                  {
                    key: 'declarationDate',
                    header: 'วันที่ใบขน',
                    render: (row) => formatDate(row.declaration.declarationDate),
                  },
                  {
                    key: 'status',
                    header: 'สถานะ',
                    render: (row) => {
                      const s = STATUS_LABEL[row.declaration.status];
                      return <Badge text={s.text} tone={s.tone} />;
                    },
                  },
                  {
                    key: 'exporter',
                    header: 'ผู้ส่งออก',
                    render: (row) => row.declaration.exporterName,
                  },
                  {
                    key: 'fobValue',
                    header: 'มูลค่า FOB',
                    className: 'text-right',
                    render: (row) =>
                      `${formatCurrency(row.declaration.fobValue)} ${row.declaration.currency}`,
                  },
                  {
                    key: 'borrower',
                    header: 'ผู้กู้ที่เชื่อมโยง',
                    render: (row) =>
                      row.borrowerId ? (
                        <Link
                          to={`/borrowers/${row.borrowerId}`}
                          className="text-navy-700 underline"
                        >
                          {row.borrowerName ?? row.borrowerId}
                        </Link>
                      ) : (
                        <span className="text-navy-400">ยังไม่เชื่อมโยง</span>
                      ),
                  },
                  {
                    key: 'action',
                    header: 'จัดการ',
                    render: (row) => (
                      <div className="flex items-center gap-2">
                        {canWrite && (
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(row.declaration)}
                            aria-label={`แก้ไข ${row.declaration.declarationNo}`}
                            className="px-2 py-1"
                          >
                            แก้ไข
                          </Button>
                        )}
                        {isSuperAdmin && row.linkId && (
                          <Button
                            variant="danger"
                            onClick={() => setConfirmUnlink(row)}
                            aria-label={`ยกเลิกการเชื่อมโยง ${row.declaration.declarationNo}`}
                            className="px-2 py-1"
                          >
                            ยกเลิกการเชื่อมโยง
                          </Button>
                        )}
                      </div>
                    ),
                  },
                ]}
                rows={pageRows}
                rowKey={(row) => row.declaration.declarationNo}
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
        <DeclarationFormModal
          open={formOpen}
          actor={actor}
          editDeclaration={editTarget}
          onClose={() => {
            setFormOpen(false);
            setEditTarget(null);
          }}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={confirmUnlink !== null}
        title="ยืนยันการยกเลิกการเชื่อมโยง"
        message={
          confirmUnlink
            ? `ต้องการยกเลิกการเชื่อมโยงใบขน "${confirmUnlink.declaration.declarationNo}" ออกจากผู้กู้ "${confirmUnlink.borrowerName ?? '-'}" ใช่หรือไม่?`
            : ''
        }
        confirmLabel={unlinking ? 'กำลังดำเนินการ...' : 'ยกเลิกการเชื่อมโยง'}
        danger
        onConfirm={() => void handleConfirmUnlink()}
        onCancel={() => setConfirmUnlink(null)}
      />

      <Toast message={toast} visible={toast !== ''} />
    </div>
  );
}
