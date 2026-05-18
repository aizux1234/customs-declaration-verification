// src/pages/reports/SearchHistoryPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { DateRangePicker } from '../../components/DateRangePicker';
import { EmptyState } from '../../components/EmptyState';
import { Toast } from '../../components/Toast';
import { Spinner } from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../data/store';
import { logActivity } from '../../data/activityLog';
import { listHistory, type HistoryFilter } from '../../api/historyApi';
import { downloadHistoryExcel } from './exportExcel';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import type {
  SearchHistoryRecord,
  DeclarationStatus,
  Role,
  User,
} from '../../types';

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const statusTone: Record<DeclarationStatus, 'green' | 'red' | 'amber'> = {
  RELEASED: 'green',
  HOLD: 'red',
  IN_PROCESS: 'amber',
};

const statusLabel: Record<DeclarationStatus, string> = {
  RELEASED: 'ผ่านพิธีการ',
  HOLD: 'ระงับ',
  IN_PROCESS: 'อยู่ระหว่างดำเนินการ',
};

const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  CREDIT_OFFICER: 'Credit Officer',
  BORROWER_DATA_ENTRY: 'Borrower Data Entry',
  CUSTOMS_DATA_ENTRY: 'Customs Data Entry',
  AUDITOR: 'Auditor',
};

type Filters = {
  dateFrom: string;
  dateTo: string;
  searchedBy: string;
  declarationNo: string;
  referenceNumber: string;
};

const EMPTY_FILTERS: Filters = {
  dateFrom: '',
  dateTo: '',
  searchedBy: '',
  declarationNo: '',
  referenceNumber: '',
};

function toApiFilter(f: Filters): HistoryFilter {
  return {
    dateFrom: f.dateFrom || undefined,
    dateTo: f.dateTo || undefined,
    searchedBy: f.searchedBy.trim() || undefined,
    declarationNo: f.declarationNo.trim() || undefined,
    referenceNumber: f.referenceNumber.trim() || undefined,
  };
}

export function SearchHistoryPage() {
  const { user } = useAuth();
  const actor: User | null =
    user ?? store.users.find((u) => u.role === 'CREDIT_OFFICER') ?? null;

  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [rows, setRows] = useState<SearchHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [toast, setToast] = useState(false);

  async function load(f: Filters) {
    setLoading(true);
    const result = await listHistory(toApiFilter(f));
    setRows(result);
    setPage(1);
    setLoading(false);
  }

  useEffect(() => {
    if (actor) {
      logActivity(actor, 'REPORT', 'REPORT_VIEWED', 'เปิดรายงานประวัติการค้นหา');
    }
    void load(EMPTY_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleApply() {
    void load(draft);
  }

  function handleReset() {
    setDraft(EMPTY_FILTERS);
    void load(EMPTY_FILTERS);
  }

  function handleExport() {
    downloadHistoryExcel(rows);
    if (actor) {
      logActivity(
        actor,
        'REPORT',
        'REPORT_EXPORTED',
        `ส่งออกรายงานประวัติการค้นหา (${rows.length} รายการ)`,
      );
    }
    setToast(true);
    window.setTimeout(() => setToast(false), 2500);
  }

  const total = rows.length;
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-navy">
            รายงานประวัติการค้นหา
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            ประวัติการค้นหาและตรวจสอบใบขนสินค้าของผู้ใช้งานในระบบ
          </p>
        </div>
        <Badge text={`ทั้งหมด ${total} รายการ`} tone="navy" />
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">
              ช่วงวันที่ค้นหา
            </span>
            <DateRangePicker
              from={draft.dateFrom}
              to={draft.dateTo}
              onChange={(from, to) =>
                setDraft((d) => ({ ...d, dateFrom: from, dateTo: to }))
              }
            />
          </div>
          <TextInput
            label="ชื่อผู้ค้นหา"
            value={draft.searchedBy}
            onChange={(v) => setDraft((d) => ({ ...d, searchedBy: v }))}
            placeholder="ชื่อ หรือ username"
          />
          <TextInput
            label="เลขที่ใบขน"
            value={draft.declarationNo}
            onChange={(v) => setDraft((d) => ({ ...d, declarationNo: v }))}
            placeholder="เลขที่ใบขนสินค้า"
          />
          <TextInput
            label="Reference Number"
            value={draft.referenceNumber}
            onChange={(v) => setDraft((d) => ({ ...d, referenceNumber: v }))}
            placeholder="เลขอ้างอิง"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={handleApply} loading={loading}>
            ค้นหา
          </Button>
          <Button variant="secondary" onClick={handleReset} disabled={loading}>
            ล้างค่า
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={loading || total === 0}
            className="ml-auto"
          >
            Export Excel
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={28} />
          </div>
        ) : total === 0 ? (
          <EmptyState message="ไม่พบข้อมูลประวัติการค้นหา" />
        ) : (
          <>
            <DataTable<SearchHistoryRecord>
              columns={[
                {
                  key: 'no',
                  header: '#',
                  className: 'w-12 text-gray-500',
                  render: (row) => (
                    <span>
                      {rows.indexOf(row) + 1}
                    </span>
                  ),
                },
                {
                  key: 'searchedAt',
                  header: 'วันเวลา',
                  render: (row) => formatDateTime(row.searchedAt),
                },
                {
                  key: 'searchedBy',
                  header: 'ผู้ค้นหา',
                  render: (row) => (
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {row.searchedByFullName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {row.searchedByUsername}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'role',
                  header: 'Role',
                  render: (row) => (
                    <Badge text={roleLabel[row.searchedByRole]} tone="blue" />
                  ),
                },
                {
                  key: 'declarationNo',
                  header: 'เลขที่ใบขน',
                  render: (row) => (
                    <Link
                      to="/verify"
                      className="font-medium text-brand text-navy underline hover:text-navy/80"
                    >
                      {row.declarationNo}
                    </Link>
                  ),
                },
                {
                  key: 'referenceNumber',
                  header: 'Reference Number',
                },
                {
                  key: 'status',
                  header: 'สถานะใบขน',
                  render: (row) => (
                    <Badge
                      text={statusLabel[row.declarationStatus]}
                      tone={statusTone[row.declarationStatus]}
                    />
                  ),
                },
                {
                  key: 'fobValue',
                  header: 'มูลค่า FOB',
                  className: 'text-right',
                  render: (row) =>
                    `${formatCurrency(row.fobValue)} ${row.currency}`,
                },
              ]}
              rows={pageRows}
              rowKey={(row) => row.id}
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

      <Toast message="ส่งออกรายงานเป็นไฟล์ Excel เรียบร้อย" visible={toast} />
    </div>
  );
}
