// src/pages/borrowers/LinkDeclarationModal.tsx
import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Alert } from '../../components/Alert';
import { linkDeclaration } from '../../api/declarationApi';
import type { User } from '../../types';

const DEFAULT_DOCUMENT_NAME = 'customs-declaration.pdf';

type LinkDeclarationModalProps = {
  open: boolean;
  actor: User;
  borrowerId: string;
  onClose: () => void;
  onLinked: () => void;
};

export function LinkDeclarationModal({
  open,
  actor,
  borrowerId,
  onClose,
  onLinked,
}: LinkDeclarationModalProps) {
  const [declarationNo, setDeclarationNo] = useState('');
  const [fileName, setFileName] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDeclarationNo('');
    setFileName('');
    setFieldError(null);
    setApiError(null);
    setSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [open]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : '');
  }

  async function handleConfirm() {
    setApiError(null);
    const trimmed = declarationNo.trim();
    if (!trimmed) {
      setFieldError('กรุณากรอกเลขที่ใบขน');
      return;
    }
    setFieldError(null);
    setSaving(true);
    const documentFileName = fileName.trim() || DEFAULT_DOCUMENT_NAME;
    try {
      await linkDeclaration(actor, borrowerId, trimmed, documentFileName);
      onLinked();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  const previewDocumentName = fileName.trim() || DEFAULT_DOCUMENT_NAME;

  return (
    <Modal
      open={open}
      title="เชื่อมโยงใบขน"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={handleConfirm} loading={saving}>
            ยืนยันการเชื่อมโยง
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {apiError && (
          <Alert tone="error" variant="inline">
            {apiError}
          </Alert>
        )}

        <TextInput
          label="เลขที่ใบขน"
          value={declarationNo}
          onChange={(v) => setDeclarationNo(v)}
          error={fieldError ?? undefined}
          required
          placeholder="เช่น A012-2024-12345678"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-navy-700">
            เอกสารประกอบ
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="text-sm text-navy-700 file:mr-3 file:rounded-md file:border file:border-navy-200 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-navy-700 hover:file:bg-navy-50"
          />
          <span className="text-xs text-navy-400">
            หากไม่เลือกไฟล์ ระบบจะใช้ชื่อเอกสารเริ่มต้น
          </span>
        </div>

        <div className="rounded-md border border-navy-100 bg-navy-50 p-3">
          <div className="text-xs font-medium text-navy-500">
            ตัวอย่างการเชื่อมโยง
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-navy-500">เลขที่ใบขน</dt>
              <dd className="text-sm text-navy-800">
                {declarationNo.trim() || '-'}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-navy-500">เอกสาร</dt>
              <dd className="text-sm text-navy-800">{previewDocumentName}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Modal>
  );
}
