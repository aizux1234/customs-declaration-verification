# Design Spec — UI Refinement (Refined Corporate)

**วันที่:** 18 พฤษภาคม 2569 (2026)
**สถานะ:** Approved — พร้อมทำ Implementation Plan
**อ้างอิง:** โปรเจค Verify Export Risk Intelligent (frontend prototype, เสร็จแล้ว 26 tasks)

---

## 1. ภาพรวม

ยกระดับ UI ของ prototype ที่มีอยู่ทั้งระบบ (ทุกหน้า + ทุก shared component) ให้ดูเป็น
ระดับ production แนว **Refined Corporate** — ธนาคารมืออาชีพ สะอาด เป็นระเบียบ
น่าเชื่อถือ คงโทน navy เดิมแต่ขัดให้เนียบขึ้น

### หลักการ
- ใช้แนวทาง **Design tokens + restyle shared components** — ตั้ง design system ที่
  Tailwind theme แล้วปรับ 15 shared component ครั้งเดียว ทุกหน้าได้อานิสงส์อัตโนมัติ
  จากนั้นเก็บรายละเอียดระดับหน้า
- **ปรับ visual ล้วน — ไม่เปลี่ยน behavior/logic ใด ๆ**

### ขอบเขตที่ไม่แตะ (Out of Scope)
- ไม่เปลี่ยน business logic, API, routing, RBAC, state
- ไม่เพิ่ม dark mode (YAGNI)
- ข้อความ/label ที่ test ผูกอยู่ต้องคงไว้ — **65 tests เดิมต้องผ่านครบ**

---

## 2. Design Tokens (Tailwind theme — `tailwind.config.js`)

### สี
- **navy** — primary scale 50/100/200/.../900 (ฐานจาก `#1e3a5f`)
- **neutral** — gray scale สำหรับพื้นหลัง, เส้นขอบ, ข้อความรอง
- **semantic** — `success` (เขียว), `danger` (แดง), `warning` (เหลือง/อำพัน), `info` (น้ำเงิน) แต่ละตัวมีเฉด bg อ่อน + text เข้ม สำหรับ badge/alert
- ใช้ token เหล่านี้แทนค่า hardcoded ที่กระจายอยู่ใน component

### Typography
- ติดตั้งฟอนต์ไทย **IBM Plex Sans Thai** ผ่าน `@fontsource` (ติดตั้ง offline ผ่าน npm
  — ไม่พึ่ง Google Fonts CDN), fallback เป็น system-ui
- กำหนด scale: heading (page title, section), body, caption, mono (สำหรับเลขที่ใบขน/Reference Number)

### Spacing / Radius / Shadow
- ใช้ spacing scale ของ Tailwind อย่างสม่ำเสมอ
- radius: ปุ่ม/อินพุต `rounded-md`, การ์ด/modal `rounded-lg`
- shadow: subtle layered — `shadow-sm` การ์ด, `shadow-lg` modal/dropdown

### ไอคอน
- ติดตั้ง **lucide-react** ใช้แทน emoji (👁/🙈 ใน PasswordInput, ไอคอน sidebar,
  ไอคอนปุ่ม action ในตาราง)

---

## 3. Shared Components (15 ตัว) — restyle

ปรับ visual ของแต่ละตัว โดย **คง prop contract เดิมทุกตัว** (Task 16 ของโปรเจคหลัก
กำหนดไว้ — ห้ามเปลี่ยน signature):

- **Button** — 3 variant สีคมขึ้น, hover/active/focus-visible/disabled states ครบ, spinner ตอน loading เนียน
- **Badge** — เม็ดสี bg อ่อน + text เข้มตาม semantic token, ขนาดพอดี
- **TextInput / PasswordInput / Dropdown** — label ชัด, focus ring navy, error state แดงชัด, PasswordInput ใช้ไอคอน lucide
- **Toggle** — switch เนียน มี transition
- **Modal** — fade-in + scale, overlay เบลอเบา, header/footer จัดวางสะอาด
- **ConfirmDialog** — สืบทอด Modal ที่ปรับแล้ว
- **Alert** — 4 tone ใช้ semantic token, ไอคอนนำ, inline vs banner ชัด
- **Toast** — slide-in จากขวาล่าง + auto-fade
- **DataTable** — header เนียน, zebra/hover row, เส้นขอบเบา, cell padding สม่ำเสมอ
- **Pagination** — ปุ่มและ select ดูดีขึ้น, สถานะ disabled ชัด
- **EmptyState** — ไอคอน + ข้อความ จัดกึ่งกลางสวยขึ้น
- **Spinner** — ปรับให้เนียน + เพิ่ม **Skeleton** component ใหม่ (โครงเทา shimmer) สำหรับ loading ของตาราง/การ์ด
- **DateRangePicker** — input คู่จัดวางดีขึ้น

> หมายเหตุ: เพิ่ม `Skeleton` เป็น component ใหม่ตัวที่ 16 — เป็นส่วนเสริม ไม่กระทบ contract เดิม

---

## 4. Layout

- **AppLayout — Sidebar:** เพิ่มไอคอน lucide ต่อเมนู, active state เด่นชัด (แถบ +
  พื้นเน้น), โลโก้/ชื่อระบบเนียน, ระยะห่างเป็นจังหวะ
- **AppLayout — Header:** sticky, สะอาด, role switcher + user chip (avatar ตัวอักษร +
  ชื่อ + role badge) ดูเป็นระเบียบ, ปุ่ม logout ชัด
- **AuthLayout:** หน้า login แบบ card มืออาชีพบนพื้น navy gradient — จัดวาง โลโก้/
  ฟอร์ม/เวอร์ชัน ให้ดูน่าเชื่อถือ

---

## 5. Page polish (ทั้ง 7 หน้า)

- **Page header pattern สม่ำเสมอ:** ชื่อหน้า + คำอธิบายสั้น + ปุ่ม action หลัก (มุมขวา)
- **การ์ดคอนเทนต์:** filter panel, ตาราง, ฟอร์ม ห่อใน card ที่มี spacing เป็นจังหวะ
- **Loading:** ใช้ `Skeleton` แทน spinner เปล่าในตารางหลัก
- **Empty state:** ใช้ EmptyState ที่ปรับแล้ว
- **เอกสารใบขนจำลอง (DocumentPreview):** ขัด layout ให้ดูเหมือนเอกสารราชการเนียนขึ้น

---

## 6. Micro-interactions

- hover/focus transitions บนปุ่ม ลิงก์ แถวตาราง เมนู (transition สั้น ~150ms)
- modal fade+scale, toast slide
- ทั้งหมดเนียนแต่ไม่หวือหวา — เหมาะกับ tone ธนาคาร

---

## 7. การยืนยันคุณภาพ

- หลังปรับทุกเฟส: `npx vitest run` ต้องผ่าน **65/65 เท่าเดิม**, `npx tsc --noEmit`
  สะอาด, `npm run build` สำเร็จ
- ถ้าการ restyle ทำให้ test ใด fail (เช่น query ผูกกับโครง DOM/ข้อความ) → ถือเป็น
  สัญญาณว่าเปลี่ยน behavior เกินขอบเขต ต้องแก้ที่ visual ให้คงโครงเดิม **ห้าม**
  แก้/ลด test

---

## 8. แผนการทำแบบเฟส (รายละเอียดใน Implementation Plan)

1. **Tokens & fonts** — Tailwind theme, ติดตั้งฟอนต์ + lucide-react, global CSS
2. **Shared components รอบ 1** — primitives: Button, Badge, inputs, Toggle, Spinner, Skeleton
3. **Shared components รอบ 2** — composite: Modal, ConfirmDialog, Alert, Toast, DataTable, Pagination, EmptyState, DateRangePicker
4. **Layout** — AppLayout (sidebar + header), AuthLayout
5. **Pages** — ขัดทั้ง 7 หน้าให้เข้ากับ pattern (page header, card, skeleton)
6. **Verify polish** — ขัด DocumentPreview / SummaryCard / TransactionTable
7. **ตรวจรับ** — full test, build, ตรวจ visual ครบ
