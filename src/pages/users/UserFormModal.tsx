// src/pages/users/UserFormModal.tsx
import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { PasswordInput } from '../../components/PasswordInput';
import { Dropdown } from '../../components/Dropdown';
import { Toggle } from '../../components/Toggle';
import { Alert } from '../../components/Alert';
import {
  validateUsername,
  validatePassword,
  validateEmail,
  validatePhone,
} from '../../utils/validators';
import { createUser, updateUser } from '../../api/userApi';
import type { User, Role, EntityStatus } from '../../types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'ผู้ดูแลระบบสูงสุด' },
  { value: 'ADMIN', label: 'ผู้ดูแลระบบ' },
  { value: 'CREDIT_OFFICER', label: 'เจ้าหน้าที่สินเชื่อ' },
  { value: 'BORROWER_DATA_ENTRY', label: 'เจ้าหน้าที่บันทึกข้อมูลผู้กู้' },
  { value: 'CUSTOMS_DATA_ENTRY', label: 'เจ้าหน้าที่บันทึกข้อมูลใบขน' },
  { value: 'AUDITOR', label: 'ผู้ตรวจสอบ' },
];

type UserFormModalProps = {
  open: boolean;
  actor: User;
  /** Pass a user to edit, or null to create a new user. */
  editUser: User | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  role: Role;
  password: string;
  confirmPassword: string;
  status: EntityStatus;
};

const EMPTY_FORM: FormState = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  position: '',
  role: 'CREDIT_OFFICER',
  password: '',
  confirmPassword: '',
  status: 'ACTIVE',
};

type Errors = Partial<Record<keyof FormState, string>>;

export function UserFormModal({
  open,
  actor,
  editUser,
  onClose,
  onSaved,
}: UserFormModalProps) {
  const isEdit = editUser !== null;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setApiError(null);
    setSaving(false);
    if (editUser) {
      setForm({
        username: editUser.username,
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        phone: editUser.phone,
        position: editUser.position,
        role: editUser.role,
        password: '',
        confirmPassword: '',
        status: editUser.status,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editUser]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Errors = {};
    const usernameErr = validateUsername(form.username);
    if (usernameErr) next.username = usernameErr;
    if (!form.firstName.trim()) next.firstName = 'กรุณากรอกชื่อ';
    if (!form.lastName.trim()) next.lastName = 'กรุณากรอกนามสกุล';
    const emailErr = validateEmail(form.email);
    if (emailErr) next.email = emailErr;
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) next.phone = phoneErr;
    if (!form.position.trim()) next.position = 'กรุณากรอกตำแหน่ง';
    if (!isEdit) {
      const passwordErr = validatePassword(form.password);
      if (passwordErr) next.password = passwordErr;
      if (form.confirmPassword !== form.password) {
        next.confirmPassword = 'รหัสผ่านยืนยันไม่ตรงกัน';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setApiError(null);
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit && editUser) {
        await updateUser(actor, editUser.id, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          position: form.position.trim(),
          role: form.role,
          status: form.status,
        });
      } else {
        await createUser(actor, {
          username: form.username.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          position: form.position.trim(),
          role: form.role,
          password: form.password,
        });
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
      title={isEdit ? 'แก้ไขผู้ใช้งาน' : 'สร้างผู้ใช้งาน'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            {isEdit ? 'บันทึก' : 'สร้างผู้ใช้'}
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
          label="Username"
          value={form.username}
          onChange={(v) => set('username', v)}
          error={errors.username}
          required={!isEdit}
          readOnly={isEdit}
          placeholder="ชื่อผู้ใช้สำหรับเข้าระบบ"
        />
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="ชื่อ"
            value={form.firstName}
            onChange={(v) => set('firstName', v)}
            error={errors.firstName}
            required
          />
          <TextInput
            label="นามสกุล"
            value={form.lastName}
            onChange={(v) => set('lastName', v)}
            error={errors.lastName}
            required
          />
        </div>
        <TextInput
          label="อีเมล"
          value={form.email}
          onChange={(v) => set('email', v)}
          error={errors.email}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="เบอร์โทรศัพท์"
            value={form.phone}
            onChange={(v) => set('phone', v)}
            error={errors.phone}
            required
          />
          <TextInput
            label="ตำแหน่ง"
            value={form.position}
            onChange={(v) => set('position', v)}
            error={errors.position}
            required
          />
        </div>
        <Dropdown
          label="บทบาท (Role)"
          value={form.role}
          onChange={(v) => set('role', v as Role)}
          options={ROLE_OPTIONS}
          required
        />
        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <PasswordInput
              label="รหัสผ่าน"
              value={form.password}
              onChange={(v) => set('password', v)}
              error={errors.password}
              required
            />
            <PasswordInput
              label="ยืนยันรหัสผ่าน"
              value={form.confirmPassword}
              onChange={(v) => set('confirmPassword', v)}
              error={errors.confirmPassword}
              required
            />
          </div>
        )}
        {isEdit && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-navy-700">สถานะ</span>
            <Toggle
              checked={form.status === 'ACTIVE'}
              onChange={(b) => set('status', b ? 'ACTIVE' : 'INACTIVE')}
              label={form.status === 'ACTIVE' ? 'ใช้งาน' : 'ปิดใช้งาน'}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
