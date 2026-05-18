// src/pages/borrowers/DeclarationLinkTab.tsx
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../data/store';
import {
  listLinksByBorrower,
  unlinkDeclaration,
} from '../../api/declarationApi';
import { formatDate } from '../../utils/formatters';
import { LinkDeclarationModal } from './LinkDeclarationModal';
import type { User, DeclarationLink } from '../../types';

type DeclarationLinkTabProps = {
  borrowerId: string;
};

export function DeclarationLinkTab({ borrowerId }: DeclarationLinkTabProps) {
  const { user } = useAuth();
  const actor: User | null =
    user ?? store.users.find((u) => u.role === 'SUPER_ADMIN') ?? null;
  const isSuperAdmin = actor?.role === 'SUPER_ADMIN';
  const canWrite = actor?.role !== 'AUDITOR';

  const [links, setLinks] = useState<DeclarationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<DeclarationLink | null>(null);
  const [unlinking, setUnlinking] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listLinksByBorrower(borrowerId);
      setLinks(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }, [borrowerId]);

  useEffect(() => {
    void load();
  }, [load]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  }

  function handleLinked() {
    setLinkModalOpen(false);
    showToast('เชื่อมโยงใบขนเรียบร้อย');
    void load();
  }

  async function handleConfirmUnlink() {
    if (!unlinkTarget || !actor) return;
    setUnlinking(true);
    setError(null);
    try {
      await unlinkDeclaration(actor, unlinkTarget.id);
      setUnlinkTarget(null);
      showToast('ยกเลิกการเชื่อมโยงเรียบร้อย');
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setUnlinkTarget(null);
    } finally {
      setUnlinking(false);
    }
  }

  const columns = [
    {
      key: 'declarationNo',
      header: 'เลขที่ใบขน',
      render: (row: DeclarationLink) => (
        <Link to="/verify" className="font-medium text-navy underline">
          {row.declarationNo}
        </Link>
      ),
    },
    {
      key: 'linkedAt',
      header: 'วันที่เชื่อมโยง',
      render: (row: DeclarationLink) => formatDate(row.linkedAt),
    },
    {
      key: 'linkedByUsername',
      header: 'เชื่อมโยงโดย',
      render: (row: DeclarationLink) => row.linkedByUsername,
    },
    {
      key: 'documentFileName',
      header: 'เอกสาร',
      render: (row: DeclarationLink) => row.documentFileName,
    },
    {
      key: 'action',
      header: 'การจัดการ',
      render: (row: DeclarationLink) =>
        isSuperAdmin ? (
          <Button variant="danger" onClick={() => setUnlinkTarget(row)}>
            ยกเลิกการเชื่อมโยง
          </Button>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-navy">ใบขนที่เชื่อมโยง</h2>
        {canWrite && (
          <Button variant="primary" onClick={() => setLinkModalOpen(true)}>
            เชื่อมโยงใบขน
          </Button>
        )}
      </div>

      {error && (
        <Alert tone="error" variant="banner" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size={24} />
        </div>
      ) : links.length === 0 ? (
        <EmptyState message="ยังไม่มีใบขนที่เชื่อมโยงกับผู้กู้รายนี้" />
      ) : (
        <DataTable
          columns={columns}
          rows={links}
          rowKey={(row) => row.id}
        />
      )}

      {actor && (
        <LinkDeclarationModal
          open={linkModalOpen}
          actor={actor}
          borrowerId={borrowerId}
          onClose={() => setLinkModalOpen(false)}
          onLinked={handleLinked}
        />
      )}

      <ConfirmDialog
        open={unlinkTarget !== null}
        title="ยืนยันการยกเลิกการเชื่อมโยง"
        message={
          unlinkTarget
            ? `ต้องการยกเลิกการเชื่อมโยงใบขน "${unlinkTarget.declarationNo}" ใช่หรือไม่?`
            : ''
        }
        confirmLabel={unlinking ? 'กำลังดำเนินการ...' : 'ยกเลิกการเชื่อมโยง'}
        danger
        onConfirm={() => void handleConfirmUnlink()}
        onCancel={() => setUnlinkTarget(null)}
      />

      <Toast message={toast} visible={toast !== ''} />
    </section>
  );
}
