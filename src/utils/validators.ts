// src/utils/validators.ts
/** Each validator returns a Thai error message, or null when valid. */

export function validateUsername(v: string): string | null {
  return /^[A-Za-z0-9]{6,50}$/.test(v)
    ? null
    : 'Username ต้องมี 6-50 ตัวอักษร ไม่มีช่องว่าง';
}

export function validatePassword(v: string): string | null {
  const ok =
    v.length >= 8 &&
    /[A-Z]/.test(v) && /[a-z]/.test(v) &&
    /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
  return ok ? null : 'Password ไม่ตรงตามเงื่อนไขความปลอดภัย';
}

export function validateReferenceNumber(v: string): string | null {
  return /^[A-Za-z0-9]{1,20}$/.test(v)
    ? null
    : 'Reference Number ต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข ไม่เกิน 20 หลัก';
}

export function validateTaxId(v: string): string | null {
  return /^[0-9]{13}$/.test(v)
    ? null
    : 'เลขนิติบุคคลต้องเป็นตัวเลข 13 หลัก';
}

export function validatePhone(v: string): string | null {
  return /^[0-9]{9,10}$/.test(v)
    ? null
    : 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
}

export function validateCreditLimit(v: number): string | null {
  return v > 0 ? null : 'วงเงินสินเชื่อต้องมากกว่า 0';
}

export function validateEmail(v: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    ? null
    : 'รูปแบบอีเมลไม่ถูกต้อง';
}

export function validateDateRange(start: string, end: string): string | null {
  return new Date(start) <= new Date(end)
    ? null
    : 'วันเริ่มต้นต้องน้อยกว่าหรือเท่ากับวันสิ้นสุด';
}
