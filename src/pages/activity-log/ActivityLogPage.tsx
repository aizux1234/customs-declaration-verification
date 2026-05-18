// src/pages/activity-log/ActivityLogPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DataTable } from '../../components/DataTable';
import { DateRangePicker } from '../../components/DateRangePicker';
import { Dropdown } from '../../components/Dropdown';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';
import { Spinner } from '../../components/Spinner';
import { TextInput } from '../../components/TextInput';
import { listActivityLog, type ActivityLogFilter } from '../../api/activityLogApi';
import { formatDateTime } from '../../utils/formatters';
import type { ActivityLogEntry, LogModule, Role } from '../../types';

const PAGE_SIZE_OPTIONS = [50, 100, 200];

const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  CREDIT_OFFICER: 'Credit Officer',
  BORROWER_DATA_ENTRY: 'Borrower Data Entry',
  CUSTOMS_DATA_ENTRY: 'Customs Data Entry',
  AUDITOR: 'Auditor',
};

const moduleLabel: Record<LogModule, string> = {
  AUTH: 'การเข้าสู่ระบบ',
  USER_MGMT: 'จัดการผู้ใช้งาน',
  BORROWER: 'ข้อมูลผู้กู้',
  DECLARATION: 'ใบขนสินค้า',
  VERIFICATION: 'ตรวจสอบใบขน',
  REPORT: 'รายงาน',
  SYSTEM: 'ระบบ',
};

const MODULE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'ทุกโมดูล' },
  ...(Object.keys(moduleLabel) as LogModule[]).map((m) => ({
    value: m,
    label: moduleLabel[m],
  })),
];

// Action types present in the seed data, grouped roughly by module.
const ACTION_TYPE_OPTIONS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'SESSION_EXPIRED',
  'USER_CREATED',
  'USER_UPDATED',
  'USER_STATUS_CHANGED',
  'BORROWER_CREATED',
  'BORROWER_UPDATED',
  'BORROWER_CONSENT_UPDATED',
  'DECLARATION_CREATED',
  'DECLARATION_LINKED',
  'DECLARATION_UPDATED',
  'DECLARATION_SEARCHED',
  'VERIFICATION_VIEWED',
  'REPORT_EXPORTED',
  'REPORT_VIEWED',
  'SYSTEM_CONFIG_CHANGED',
  'DATA_BACKUP',
];

/** YYYY-MM-DD string for `daysAgo` days before today. */
function isoDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

type Filters = {
  dateFrom: string;
  dateTo: string;
  username: string;
  actionTypes: string[];
  module: string;
};

function defaultFilters(): Filters {
  // Date inputs default to the last 7 days (shown to the user), but the
  // initial data load is unfiltered so the table is never empty on mount.
  return {
    dateFrom: isoDate(7),
    dateTo: isoDate(0),
    username: '',
    actionTypes: [],
    module: '',
  };
}

function toApiFilter(f: Filters): ActivityLogFilter {
  return {
    dateFrom: f.dateFrom || undefined,
    dateTo: f.dateTo || undefined,
    username: f.username.trim() || undefined,
    actionTypes: f.actionTypes.length ? f.actionTypes : undefined,
    module: (f.module || undefined) as LogModule | undefined,
  };
}

export function ActivityLogPage() {
  const [draft, setDraft] = useState<Filters>(defaultFilters);
  const [rows, setRows] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  async function load(filter: ActivityLogFilter) {
    setLoading(true);
    const result = await listActivityLog(filter);
    setRows(result);
    setPage(1);
    setExpanded(new Set());
    setLoading(false);
  }

  useEffect(() => {
    // First load is unfiltered so rows always appear; the date inputs still
    // show the default 7-day range, applied when the user clicks "ค้นหา".
    void load({});
  }, []);

  function handleApply() {
    void load(toApiFilter(draft));
  }

  function handleReset() {
    setDraft(defaultFilters());
    void load({});
  }

  function toggleActionType(action: string) {
    setDraft((d) => {
      const next = d.actionTypes.includes(action)
        ? d.actionTypes.filter((a) => a !== action)
        : [...d.actionTypes, action];
      return { ...d, actionTypes: next };
    });
  }

  function toggleRow(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const total = rows.length;
  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize],
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-navy">บันทึกกิจกรรมระบบ</h1>
          <p className="mt-1 text-sm text-gray-600">
            ประวัติการใช้งานระบบของผู้ใช้งานทั้งหมด (ดูได้อย่างเดียว)
          </p>
        </div>
        <Badge text={`ทั้งหมด ${total} รายการ`} tone="navy" />
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-navy">ตัวกรองข้อมูล</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">
              ช่วงวันที่
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
            label="ชื่อผู้ใช้งาน"
            value={draft.username}
            onChange={(v) => setDraft((d) => ({ ...d, username: v }))}
            placeholder="username"
          />
          <Dropdown
            label="โมดูล"
            value={draft.module}
            onChange={(v) => setDraft((d) => ({ ...d, module: v }))}
            options={MODULE_OPTIONS}
          />
        </div>

        <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-medium text-gray-700">
            ประเภทการกระทำ
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {ACTION_TYPE_OPTIONS.map((action) => (
              <label
                key={action}
                className="flex items-center gap-1.5 text-xs text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={draft.actionTypes.includes(action)}
                  onChange={() => toggleActionType(action)}
                  className="h-4 w-4 rounded border-gray-300 text-navy focus:ring-brand"
                />
                {action}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={handleApply} loading={loading}>
            ค้นหา
          </Button>
          <Button variant="secondary" onClick={handleReset} disabled={loading}>
            ล้างค่า
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={28} />
          </div>
        ) : total === 0 ? (
          <EmptyState message="ไม่พบบันทึกกิจกรรมตามเงื่อนไขที่เลือก" />
        ) : (
          <>
            <DataTable<ActivityLogEntry>
              columns={[
                {
                  key: 'no',
                  header: '#',
                  className: 'w-12 text-gray-500',
                  render: (row) => rows.indexOf(row) + 1,
                },
                {
                  key: 'timestamp',
                  header: 'วันเวลา',
                  render: (row) => formatDateTime(row.timestamp),
                },
                { key: 'username', header: 'Username' },
                { key: 'fullName', header: 'ชื่อ-นามสกุล' },
                {
                  key: 'role',
                  header: 'บทบาท',
                  render: (row) => (
                    <Badge text={roleLabel[row.role]} tone="blue" />
                  ),
                },
                {
                  key: 'actionType',
                  header: 'ประเภทการกระทำ',
                  render: (row) => <Badge text={row.actionType} tone="teal" />,
                },
                {
                  key: 'module',
                  header: 'โมดูล',
                  render: (row) => moduleLabel[row.module],
                },
                { key: 'detail', header: 'รายละเอียด' },
                { key: 'ipAddress', header: 'IP Address' },
                {
                  key: 'expand',
                  header: '',
                  className: 'w-8 text-center text-gray-400',
                  render: (row) => (expanded.has(row.id) ? '▾' : '▸'),
                },
              ]}
              rows={pageRows}
              rowKey={(row) => row.id}
              onRowClick={(row) => toggleRow(row.id)}
            />

            {pageRows.some((r) => expanded.has(r.id)) && (
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                {pageRows
                  .filter((r) => expanded.has(r.id))
                  .map((r) => (
                    <div
                      key={r.id}
                      className="border-b border-gray-200 py-2 last:border-b-0"
                    >
                      <p className="text-xs font-semibold text-navy">
                        {formatDateTime(r.timestamp)} · {r.actionType}
                      </p>
                      {r.beforeValue === null && r.afterValue === null ? (
                        <p className="mt-1 text-xs text-gray-500">
                          ไม่มีข้อมูลการเปลี่ยนแปลง
                        </p>
                      ) : (
                        <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              ค่าก่อนหน้า (Before)
                            </p>
                            <pre className="mt-0.5 overflow-x-auto rounded bg-white p-2 text-xs text-gray-700">
                              {r.beforeValue ?? '-'}
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              ค่าหลังเปลี่ยน (After)
                            </p>
                            <pre className="mt-0.5 overflow-x-auto rounded bg-white p-2 text-xs text-gray-700">
                              {r.afterValue ?? '-'}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

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
  );
}
