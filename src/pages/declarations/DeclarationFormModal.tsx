// src/pages/declarations/DeclarationFormModal.tsx
import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Dropdown } from '../../components/Dropdown';
import { Alert } from '../../components/Alert';
import {
  createDeclaration,
  updateDeclaration,
  isDeclarationNoDuplicate,
  type DeclarationInput,
} from '../../api/declarationApi';
import type { User, Declaration, DeclarationStatus } from '../../types';

const STATUS_OPTIONS: { value: DeclarationStatus; label: string }[] = [
  { value: 'RELEASED', label: 'ตรวจปล่อยแล้ว' },
  { value: 'HOLD', label: 'ระงับ' },
  { value: 'IN_PROCESS', label: 'อยู่ระหว่างดำเนินการ' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'THB', label: 'THB' },
  { value: 'EUR', label: 'EUR' },
  { value: 'JPY', label: 'JPY' },
  { value: 'CNY', label: 'CNY' },
];

type DeclarationFormModalProps = {
  open: boolean;
  actor: User;
  editDeclaration: Declaration | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  declarationNo: string;
  declarationDate: string;
  status: DeclarationStatus;
  fobValue: string;
  cifValue: string;
  currency: string;
  exporterName: string;
  destinationCountry: string;
  exportDate: string;
  containerNo: string;
  vesselName: string;
};

const EMPTY_FORM: FormState = {
  declarationNo: '',
  declarationDate: '',
  status: 'IN_PROCESS',
  fobValue: '',
  cifValue: '',
  currency: 'USD',
  exporterName: '',
  destinationCountry: '',
  exportDate: '',
  containerNo: '',
  vesselName: '',
};

type Errors = Partial<Record<keyof FormState, string>>;

function isoToDateInput(iso: string): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function dateInputToIso(value: string): string {
  if (!value) return '';
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function DeclarationFormModal({
  open,
  actor,
  editDeclaration,
  onClose,
  onSaved,
}: DeclarationFormModalProps) {
  const isEdit = editDeclaration !== null;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [declNoDuplicate, setDeclNoDuplicate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setApiError(null);
    setDeclNoDuplicate(false);
    setSaving(false);
    if (editDeclaration) {
      setForm({
        declarationNo: editDeclaration.declarationNo,
        declarationDate: isoToDateInput(editDeclaration.declarationDate),
        status: editDeclaration.status,
        fobValue: String(editDeclaration.fobValue),
        cifValue: String(editDeclaration.cifValue),
        currency: editDeclaration.currency,
        exporterName: editDeclaration.exporterName,
        destinationCountry: editDeclaration.destinationCountry,
        exportDate: isoToDateInput(editDeclaration.exportDate),
        containerNo: editDeclaration.containerNo ?? '',
        vesselName: editDeclaration.vesselName ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editDeclaration]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleDeclNoChange(value: string) {
    set('declarationNo', value);
    const unchanged = isEdit && editDeclaration?.declarationNo === value;
    setDeclNoDuplicate(!unchanged && isDeclarationNoDuplicate(value));
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!form.declarationNo.trim()) next.declarationNo = 'กรุณากรอกเลขที่ใบขน';
    if (!form.declarationDate) next.declarationDate = 'กรุณาเลือกวันที่ใบขน';
    if (!form.exporterName.trim()) next.exporterName = 'กรุณากรอกชื่อผู้ส่งออก';
    if (!form.destinationCountry.trim())
      next.destinationCountry = 'กรุณากรอกประเทศปลายทาง';
    if (!form.exportDate) next.exportDate = 'กรุณาเลือกวันที่ส่งออก';
    const fob = Number(form.fobValue);
    if (form.fobValue.trim() === '' || Number.isNaN(fob) || fob < 0)
      next.fobValue = 'กรุณากรอกมูลค่า FOB ที่ถูกต้อง';
    const cif = Number(form.cifValue);
    if (form.cifValue.trim() === '' || Number.isNaN(cif) || cif < 0)
      next.cifValue = 'กรุณากรอกมูลค่า CIF ที่ถูกต้อง';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setApiError(null);
    if (!validate()) return;
    setSaving(true);
    const payload: DeclarationInput = {
      declarationNo: form.declarationNo.trim(),
      declarationDate: dateInputToIso(form.declarationDate),
      status: form.status,
      fobValue: Number(form.fobValue),
      cifValue: Number(form.cifValue),
      currency: form.currency,
      exporterName: form.exporterName.trim(),
      destinationCountry: form.destinationCountry.trim(),
      exportDate: dateInputToIso(form.exportDate),
      containerNo: form.containerNo.trim() || null,
      vesselName: form.vesselName.trim() || null,
    };
    try {
      if (isEdit && editDeclaration) {
        await updateDeclaration(actor, editDeclaration.declarationNo, payload);
      } else {
        await createDeclaration(actor, payload);
      }
      onSaved();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'แก้ไขใบขน' : 'เพิ่มใบขน'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            {isEdit ? 'บันทึก' : 'เพิ่มใบขน'}
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
          value={form.declarationNo}
          onChange={handleDeclNoChange}
          error={errors.declarationNo}
          required
          placeholder="เช่น A012-2024-12345678"
        />
        {declNoDuplicate && (
          <Alert tone="warning" variant="inline">
            เลขที่ใบขนนี้มีอยู่แล้วในระบบ
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy-700">
              วันที่ใบขน <span className="text-danger-text">*</span>
            </label>
            <input
              type="date"
              value={form.declarationDate}
              onChange={(e) => set('declarationDate', e.target.value)}
              className="rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
            />
            {errors.declarationDate && (
              <span className="text-xs text-danger-text">{errors.declarationDate}</span>
            )}
          </div>
          <Dropdown
            label="สถานะใบขน"
            value={form.status}
            onChange={(v) => set('status', v as DeclarationStatus)}
            options={STATUS_OPTIONS}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <TextInput
            label="มูลค่า FOB"
            value={form.fobValue}
            onChange={(v) => set('fobValue', v)}
            error={errors.fobValue}
            required
            placeholder="0.00"
          />
          <TextInput
            label="มูลค่า CIF"
            value={form.cifValue}
            onChange={(v) => set('cifValue', v)}
            error={errors.cifValue}
            required
            placeholder="0.00"
          />
          <Dropdown
            label="สกุลเงิน"
            value={form.currency}
            onChange={(v) => set('currency', v)}
            options={CURRENCY_OPTIONS}
            required
          />
        </div>

        <TextInput
          label="ชื่อผู้ส่งออก"
          value={form.exporterName}
          onChange={(v) => set('exporterName', v)}
          error={errors.exporterName}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="ประเทศปลายทาง"
            value={form.destinationCountry}
            onChange={(v) => set('destinationCountry', v)}
            error={errors.destinationCountry}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy-700">
              วันที่ส่งออก <span className="text-danger-text">*</span>
            </label>
            <input
              type="date"
              value={form.exportDate}
              onChange={(e) => set('exportDate', e.target.value)}
              className="rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
            />
            {errors.exportDate && (
              <span className="text-xs text-danger-text">{errors.exportDate}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="เลขตู้คอนเทนเนอร์"
            value={form.containerNo}
            onChange={(v) => set('containerNo', v)}
            placeholder="หากไม่มี เว้นว่างได้"
          />
          <TextInput
            label="ชื่อเรือ / เที่ยวบิน"
            value={form.vesselName}
            onChange={(v) => set('vesselName', v)}
            placeholder="หากไม่มี เว้นว่างได้"
          />
        </div>
      </div>
    </Modal>
  );
}
