// src/pages/borrowers/BorrowerFormModal.tsx
import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Dropdown } from '../../components/Dropdown';
import { Toggle } from '../../components/Toggle';
import { Alert } from '../../components/Alert';
import {
  validateTaxId,
  validatePhone,
  validateEmail,
  validateCreditLimit,
} from '../../utils/validators';
import {
  createBorrower,
  updateBorrower,
  isTaxIdDuplicate,
} from '../../api/borrowerApi';
import type { User, Borrower, BorrowerType } from '../../types';

const BORROWER_TYPE_OPTIONS: { value: BorrowerType; label: string }[] = [
  { value: 'JURISTIC', label: 'นิติบุคคล' },
  { value: 'INDIVIDUAL', label: 'บุคคลธรรมดา' },
];

type BorrowerFormModalProps = {
  open: boolean;
  actor: User;
  /** Pass a borrower to edit, or null to create a new borrower. */
  editBorrower: Borrower | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  nameTh: string;
  nameEn: string;
  taxId: string;
  borrowerType: BorrowerType;
  contactName: string;
  phone: string;
  email: string;
  creditLimit: string;
  consentGiven: boolean;
};

const EMPTY_FORM: FormState = {
  nameTh: '',
  nameEn: '',
  taxId: '',
  borrowerType: 'JURISTIC',
  contactName: '',
  phone: '',
  email: '',
  creditLimit: '',
  consentGiven: false,
};

type Errors = Partial<Record<keyof FormState, string>>;

export function BorrowerFormModal({
  open,
  actor,
  editBorrower,
  onClose,
  onSaved,
}: BorrowerFormModalProps) {
  const isEdit = editBorrower !== null;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [taxIdDuplicate, setTaxIdDuplicate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setApiError(null);
    setTaxIdDuplicate(false);
    setSaving(false);
    if (editBorrower) {
      setForm({
        nameTh: editBorrower.nameTh,
        nameEn: editBorrower.nameEn,
        taxId: editBorrower.taxId,
        borrowerType: editBorrower.borrowerType,
        contactName: editBorrower.contactName,
        phone: editBorrower.phone,
        email: editBorrower.email,
        creditLimit: String(editBorrower.creditLimit),
        consentGiven: editBorrower.consentGiven,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editBorrower]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTaxIdChange(value: string) {
    set('taxId', value);
    // When editing, the borrower's own taxId is expectedly present.
    const unchanged = isEdit && editBorrower?.taxId === value;
    setTaxIdDuplicate(!unchanged && isTaxIdDuplicate(value));
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!form.nameTh.trim()) next.nameTh = 'กรุณากรอกชื่อบริษัท (TH)';
    const taxIdErr = validateTaxId(form.taxId);
    if (taxIdErr) next.taxId = taxIdErr;
    if (!form.contactName.trim()) next.contactName = 'กรุณากรอกชื่อผู้ติดต่อหลัก';
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) next.phone = phoneErr;
    if (form.email.trim()) {
      const emailErr = validateEmail(form.email);
      if (emailErr) next.email = emailErr;
    }
    const creditLimit = Number(form.creditLimit);
    if (form.creditLimit.trim() === '' || Number.isNaN(creditLimit)) {
      next.creditLimit = 'กรุณากรอกวงเงินสินเชื่อ';
    } else {
      const creditErr = validateCreditLimit(creditLimit);
      if (creditErr) next.creditLimit = creditErr;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setApiError(null);
    if (!validate()) return;
    setSaving(true);
    const payload = {
      nameTh: form.nameTh.trim(),
      nameEn: form.nameEn.trim(),
      taxId: form.taxId.trim(),
      borrowerType: form.borrowerType,
      contactName: form.contactName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      creditLimit: Number(form.creditLimit),
      consentGiven: form.consentGiven,
    };
    try {
      if (isEdit && editBorrower) {
        await updateBorrower(actor, editBorrower.id, payload);
      } else {
        await createBorrower(actor, payload);
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
      title={isEdit ? 'แก้ไขผู้กู้' : 'เพิ่มผู้กู้'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            {isEdit ? 'บันทึก' : 'เพิ่มผู้กู้'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {apiError && (
          <Alert tone="error" variant="inline">
            {apiError}
          </Alert>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput
            label="ชื่อบริษัท (TH)"
            value={form.nameTh}
            onChange={(v) => set('nameTh', v)}
            error={errors.nameTh}
            required
          />
          <TextInput
            label="ชื่อบริษัท (EN)"
            value={form.nameEn}
            onChange={(v) => set('nameEn', v)}
            error={errors.nameEn}
          />
        </div>
        <TextInput
          label="เลขนิติบุคคล"
          value={form.taxId}
          onChange={handleTaxIdChange}
          error={errors.taxId}
          required
          placeholder="เลข 13 หลัก"
        />
        {taxIdDuplicate && (
          <Alert tone="warning" variant="inline">
            เลขนิติบุคคลนี้มีอยู่แล้วในระบบ
          </Alert>
        )}
        <Dropdown
          label="ประเภทผู้กู้"
          value={form.borrowerType}
          onChange={(v) => set('borrowerType', v as BorrowerType)}
          options={BORROWER_TYPE_OPTIONS}
          required
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput
            label="ชื่อผู้ติดต่อหลัก"
            value={form.contactName}
            onChange={(v) => set('contactName', v)}
            error={errors.contactName}
            required
          />
          <TextInput
            label="เบอร์โทรศัพท์"
            value={form.phone}
            onChange={(v) => set('phone', v)}
            error={errors.phone}
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput
            label="อีเมล"
            value={form.email}
            onChange={(v) => set('email', v)}
            error={errors.email}
          />
          <TextInput
            label="วงเงินสินเชื่อ (บาท)"
            value={form.creditLimit}
            onChange={(v) => set('creditLimit', v)}
            error={errors.creditLimit}
            required
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">
            การยินยอมให้ข้อมูล
          </span>
          <Toggle
            checked={form.consentGiven}
            onChange={(b) => set('consentGiven', b)}
            label={
              form.consentGiven
                ? 'ยินยอมให้เปิดเผยข้อมูล'
                : 'ยังไม่ได้ให้ความยินยอม'
            }
          />
        </div>
      </div>
    </Modal>
  );
}
