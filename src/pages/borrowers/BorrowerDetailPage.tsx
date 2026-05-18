// src/pages/borrowers/BorrowerDetailPage.tsx
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { Skeleton } from '../../components/Skeleton';
import { Toast } from '../../components/Toast';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../data/store';
import { getBorrower, deactivateBorrower } from '../../api/borrowerApi';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatters';
import { BorrowerFormModal } from './BorrowerFormModal';
import { DeclarationLinkTab } from './DeclarationLinkTab';
import type { User, Borrower, BorrowerType } from '../../types';

const borrowerTypeLabel: Record<BorrowerType, string> = {
  JURISTIC: 'นิติบุคคล',
  INDIVIDUAL: 'บุคคลธรรมดา',
};

type TabKey = 'info' | 'declarations';

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-navy-500">{label}</span>
      <span className="text-sm text-navy-800">{value}</span>
    </div>
  );
}

export function BorrowerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const actor: User | null =
    user ?? store.users.find((u) => u.role === 'SUPER_ADMIN') ?? null;
  const isSuperAdmin = actor?.role === 'SUPER_ADMIN';
  const canWrite = actor?.role !== 'AUDITOR';

  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [toast, setToast] = useState('');

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    const result = await getBorrower(id);
    if (result) {
      setBorrower(result);
      setNotFound(false);
    } else {
      setBorrower(null);
      setNotFound(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  }

  function handleSaved() {
    setFormOpen(false);
    showToast('บันทึกข้อมูลผู้กู้เรียบร้อย');
    void load();
  }

  async function handleConfirmDeactivate() {
    if (!borrower || !actor) return;
    setDeactivating(true);
    setError(null);
    try {
      await deactivateBorrower(actor, borrower.id);
      setConfirmOpen(false);
      showToast('ปิดใช้งานผู้กู้เรียบร้อย');
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setConfirmOpen(false);
    } finally {
      setDeactivating(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-white shadow-card p-6 space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (notFound || !borrower) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="error" variant="banner">
          ไม่พบข้อมูลผู้กู้
        </Alert>
        <Link
          to="/borrowers"
          className="inline-flex items-center gap-1 text-sm text-navy-600 underline"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          กลับไปหน้ารายการผู้กู้
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/borrowers"
          className="inline-flex items-center gap-1 text-sm text-navy-600 underline"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          กลับไปหน้ารายการผู้กู้
        </Link>
      </div>

      <section className="rounded-lg bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold text-navy-800">
              {borrower.nameTh}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-navy-500">{borrower.id}</span>
              <Badge
                text={borrowerTypeLabel[borrower.borrowerType]}
                tone={borrower.borrowerType === 'JURISTIC' ? 'blue' : 'teal'}
              />
              <Badge
                text={borrower.status === 'ACTIVE' ? 'ใช้งาน' : 'ปิดใช้งาน'}
                tone={borrower.status === 'ACTIVE' ? 'green' : 'gray'}
              />
              <Badge
                text={borrower.consentGiven ? 'ยินยอมแล้ว' : 'ยังไม่ยินยอม'}
                tone={borrower.consentGiven ? 'green' : 'amber'}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canWrite && (
              <Button variant="secondary" onClick={() => setFormOpen(true)}>
                แก้ไข
              </Button>
            )}
            {isSuperAdmin && borrower.status === 'ACTIVE' && (
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                ปิดใช้งาน
              </Button>
            )}
          </div>
        </div>
      </section>

      {error && (
        <Alert tone="error" variant="banner">
          {error}
        </Alert>
      )}

      <div className="border-b border-navy-100">
        <nav className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'border-navy-600 text-navy-800'
                : 'border-transparent text-navy-400 hover:text-navy-600'
            }`}
          >
            ข้อมูลผู้กู้
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('declarations')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'declarations'
                ? 'border-navy-600 text-navy-800'
                : 'border-transparent text-navy-400 hover:text-navy-600'
            }`}
          >
            ใบขนที่เชื่อมโยง
          </button>
        </nav>
      </div>

      {activeTab === 'info' ? (
        <section className="rounded-lg bg-white p-5 shadow-card">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="ชื่อบริษัท (TH)" value={borrower.nameTh} />
            <Field label="ชื่อบริษัท (EN)" value={borrower.nameEn || '-'} />
            <Field label="เลขนิติบุคคล" value={borrower.taxId} />
            <Field
              label="ประเภทผู้กู้"
              value={borrowerTypeLabel[borrower.borrowerType]}
            />
            <Field label="ชื่อผู้ติดต่อหลัก" value={borrower.contactName} />
            <Field label="เบอร์โทรศัพท์" value={borrower.phone} />
            <Field label="อีเมล" value={borrower.email || '-'} />
            <Field
              label="วงเงินสินเชื่อ (บาท)"
              value={formatCurrency(borrower.creditLimit)}
            />
            <Field
              label="สถานะ"
              value={
                <Badge
                  text={borrower.status === 'ACTIVE' ? 'ใช้งาน' : 'ปิดใช้งาน'}
                  tone={borrower.status === 'ACTIVE' ? 'green' : 'gray'}
                />
              }
            />
            <Field
              label="การยินยอมให้ข้อมูล"
              value={
                <Badge
                  text={borrower.consentGiven ? 'ยินยอมแล้ว' : 'ยังไม่ยินยอม'}
                  tone={borrower.consentGiven ? 'green' : 'amber'}
                />
              }
            />
            <Field
              label="วันที่สร้าง"
              value={formatDateTime(borrower.createdAt)}
            />
            <Field
              label="แก้ไขล่าสุด"
              value={formatDate(borrower.updatedAt)}
            />
          </div>
        </section>
      ) : (
        <DeclarationLinkTab borrowerId={borrower.id} />
      )}

      {actor && (
        <BorrowerFormModal
          open={formOpen}
          actor={actor}
          editBorrower={borrower}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="ยืนยันการปิดใช้งาน"
        message={`ต้องการปิดใช้งานผู้กู้ "${borrower.nameTh}" ใช่หรือไม่?`}
        confirmLabel={deactivating ? 'กำลังดำเนินการ...' : 'ปิดใช้งาน'}
        danger
        onConfirm={() => void handleConfirmDeactivate()}
        onCancel={() => setConfirmOpen(false)}
      />

      <Toast message={toast} visible={toast !== ''} />
    </div>
  );
}
