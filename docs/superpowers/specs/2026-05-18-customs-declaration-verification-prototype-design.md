# Design Spec — Verify Export Risk Intelligent (Frontend Prototype)

**วันที่:** 18 พฤษภาคม 2569 (2026)
**สถานะ:** Approved Design — พร้อมทำ Implementation Plan
**อ้างอิง:** SRS v1.1 Draft, UI Field Specification v1.0 Draft, Sitemap V.2, Workflow To-Be

---

## 1. ภาพรวม (Overview)

สร้าง **Frontend Prototype** ของระบบ "Verify Export Risk Intelligent" — ระบบตรวจสอบ
ข้อมูลใบขนสินค้าส่งออกเพื่อประกอบการปล่อยสินเชื่อของ Exim Bank

Prototype นี้ครอบคลุม UI ทั้งหมดตาม UI Field Specification ทำงานด้วย mock data
โดยไม่มี backend จริง เป้าหมายเพื่อใช้ demo flow การทำงานและรีวิว UI/UX ก่อน
พัฒนาระบบจริง

### เป้าหมาย
- แสดง flow การทำงานครบทุกโมดูล (login → ค้นหาใบขน → รายงาน → จัดการข้อมูล)
- UI สมจริง มี loading / error / empty state
- แยกชั้น data access ให้ชัดเจน เพื่อต่อ backend จริงได้ง่ายในอนาคต

### นอกขอบเขต (Out of Scope)
- Backend / database จริง, การ deploy
- API กรมศุลกากรจริง (ใช้ mock service แทน)
- Mobile app, การอนุมัติเงินกู้ (เป็นกระบวนการ manual ตาม SRS)
- Forgot Password (PENDING ในเอกสาร) — แสดงลิงก์แต่ขึ้นข้อความว่ายังไม่เปิดใช้
- หน้า Dashboard (ตัดออกตามการตัดสินใจ — SRS Open Question 10.9 ยังไม่ยืนยัน)
- การจัดเก็บข้อมูลถาวร — mock data เก็บใน memory, reset เมื่อ refresh

---

## 2. Tech Stack

| ส่วน | เทคโนโลยี | เหตุผล |
|---|---|---|
| Framework | React 18 + TypeScript | type-safe, component-based |
| Build tool | Vite | dev server เร็ว |
| Styling | Tailwind CSS | สไตล์ professional banking โทน navy/blue |
| Routing | React Router v6 | map ตาม URL path ใน UI FieldSpec |
| State | React Context + useReducer | global state เพียงพอ ไม่ต้องใช้ Redux |
| Excel Export | SheetJS (xlsx) | สร้างไฟล์ .xlsx จริงฝั่ง client |
| ภาษา | ไทยเป็นหลัก | ตาม NFR-08 |

---

## 3. สถาปัตยกรรม (Architecture)

ใช้แนวทาง **Mock Service Layer** — เขียน TypeScript modules จำลอง API ที่ return
Promise (พร้อมหน่วงเวลาเล็กน้อย) อ่าน/เขียน in-memory store วันที่มี backend จริง
แค่เปลี่ยน implementation ภายใน module เหล่านี้ให้ยิง HTTP จริง โดย UI ไม่ต้องแก้

### โครงสร้างโฟลเดอร์
```
src/
  api/          mock service modules
                  authApi, userApi, borrowerApi, declarationApi,
                  customsApi, historyApi, activityLogApi
  data/         seed data + in-memory stores + reset logic
  context/      AuthContext, DataContext
  components/   shared UI: Table, Modal, Badge, Pagination, TextInput,
                  Button, Dropdown, DateRangePicker, Toast, EmptyState,
                  ConfirmDialog, Alert
  layouts/      AppLayout (sidebar + header), AuthLayout
  pages/        1 โฟลเดอร์ต่อ 1 โมดูล (7 โมดูล)
  routes/       route config + ProtectedRoute (RBAC guard)
  utils/        validators, formatters (date, currency)
  types/        TypeScript interfaces
```

### Data flow
```
Page component → api module (Promise + latency) → in-memory store
                                ↓
                     เขียน Activity Log อัตโนมัติ
```

---

## 4. Mock Data & API Layer

### In-memory store (seed ตอนแอปโหลด)
| Store | ปริมาณ seed | หมายเหตุ |
|---|---|---|
| users | ~8 คน | ครบ 6 roles อย่างน้อย role ละ 1 |
| borrowers | ~15 ราย | นิติบุคคล + บุคคลธรรมดา, มีทั้ง Active/Inactive |
| declarations | ~30 ใบ | ผูกกับ borrower, สถานะ Released/Hold/In Process |
| searchHistory | ~40 records | จับคู่ใบขน + Reference Number + ผู้ค้นหา + เวลา |
| activityLog | ~60 records | ครอบคลุม action type หลากหลาย |

### customsApi (จำลอง API กรมศุลกากร)
- มี mock dataset ใบขน พร้อมข้อมูลระดับ Transaction (line items, HS Code, น้ำหนัก, ราคา)
- จำลอง latency ~1–2 วินาที
- จำลอง edge case: ไม่พบใบขน, API timeout/error, ใบขนสถานะ Hold
- ทุก response คือข้อมูลจำลอง — มี comment ระบุชัดว่าเป็น mock

---

## 5. Authentication & RBAC

### Login
- หน้า `/login` — ไม่มี self-register (Admin สร้าง account)
- ตรวจ username/password กับ mock users
- นับ login ผิดต่อเนื่อง — ครบ 5 ครั้งล็อก account (แสดง counter "เหลือ X ครั้ง")
- บันทึก LOGIN_SUCCESS / LOGIN_FAILED / ACCOUNT_LOCKED ใน Activity Log

### RBAC
- `AuthContext` เก็บ user + role ปัจจุบัน
- `ProtectedRoute` ตรวจสิทธิ์ตาม **Permissions Matrix (SRS 2.4)** ก่อนเข้าแต่ละ route
- Sidebar แสดงเฉพาะเมนูที่ role นั้นเข้าถึงได้
- ปุ่ม/action ภายในหน้า แสดง/ซ่อนตามสิทธิ์ (เช่น ปุ่ม Deactivate เห็นเฉพาะ Admin)

### 6 Roles
Super Admin, Admin, Credit Officer, Borrower Profile Data Entry,
Customs Declaration Data Entry, Auditor

### Demo helper
- มี **role switcher** บน header (เฉพาะโหมด demo) สลับมุมมอง role ได้เร็ว
- หลัง login redirect ตาม role: Credit Officer/Auditor → `/verify`,
  Admin/Super Admin → `/users`, Data Entry roles → `/borrowers`

---

## 6. โมดูล / หน้าจอ (7 โมดูล)

| # | Route | โมดูล | สิทธิ์เข้าถึง |
|---|---|---|---|
| 1 | `/login` | Authentication | ทุกคน |
| 2 | `/verify` | Search & Verification | Super Admin, Credit Officer, Auditor (view) |
| 3 | `/reports/search-history` | Search History Report | Super Admin, Credit Officer, Auditor |
| 4 | `/users` | User Management | Super Admin, Admin |
| 5 | `/borrowers` | Borrower Management | Super Admin, Borrower Data Entry, Auditor (view) |
| 6 | `/borrowers/:id/declarations` | Data & Linkage | Super Admin, Customs Data Entry, Auditor (view) |
| 7 | `/activity-log` | Activity Log | Super Admin, Auditor |

### 6.1 Authentication (`/login`)
ฟอร์ม username + password, show/hide password, lock counter, error inline,
ลิงก์ Forgot Password (disabled — PENDING)

### 6.2 Search & Verification (`/verify`)
- **Search Form** — Reference Number (regex `^[A-Za-z0-9]{1,20}$`) + เลขที่ใบขน, ทั้งคู่ required
- **Summary Card** — ผลค้นหา: เลขที่ใบขน, วันที่, สถานะ (badge), มูลค่า FOB/CIF, ผู้ส่งออก, ปลายทาง
- **Transaction Detail** — ตาราง line items: ชื่อสินค้า, HS Code, จำนวน, น้ำหนัก, ราคา, มูลค่ารวม
- **Preview เอกสาร** — render หน้าเอกสารใบขนจำลองเป็น HTML (รองรับ zoom / สั่งพิมพ์)
- **Search History Banner** — แจ้งถ้าใบขนนี้เคยถูกค้นหามาแล้ว
- บันทึก Search History ทุกครั้งที่ค้นหา (แม้ค้นซ้ำ) + Activity Log DECLARATION_SEARCHED

### 6.3 Search History Report (`/reports/search-history`)
- Filter: ช่วงวันที่, ชื่อผู้ค้นหา, เลขที่ใบขน, Reference Number
- ตาราง: วันเวลา, ผู้ค้นหา, role, เลขที่ใบขน, Reference Number, สถานะ, มูลค่า FOB
- Pagination 20/50/100, Empty state, Total count
- **Export Excel** — สร้าง .xlsx จากข้อมูลที่ filter แล้ว (มี header, จัด format)

### 6.4 User Management (`/users`)
- List: ค้นหา, filter role/status, ตารางผู้ใช้, pagination
- Create/Edit form (modal): username, ชื่อ-สกุล, email, role, password (create), status
- Deactivate confirmation modal (ห้าม deactivate ตัวเอง, ไม่มีปุ่ม Delete)

### 6.5 Borrower Management (`/borrowers`)
- List: ค้นหา, filter status/ประเภท, ตาราง, pagination
- Detail / View: ข้อมูลผู้กู้ + รายการใบขนที่เชื่อมโยง + สถานะ consent
- Create/Edit form: ชื่อบริษัท TH/EN, เลขนิติบุคคล 13 หลัก (duplicate check), ประเภท,
  ผู้ติดต่อ, เบอร์, email, วงเงินสินเชื่อ, consent

### 6.6 Data & Linkage (`/borrowers/:id/declarations`)
- Tab ภายในหน้า Borrower Detail
- ตารางใบขนที่เชื่อมโยง + filter
- Link Declaration modal: กรอกเลขที่ใบขน, upload เอกสาร, preview, confirm link
- Unlink เฉพาะ Super Admin — บันทึก Activity Log

### 6.7 Activity Log (`/activity-log`)
- Filter: ช่วงวันที่, username, action type, module
- ตาราง read-only เรียงตาม timestamp ล่าสุด, expand row ดู before/after
- Pagination 50/100/200 — ห้ามแก้ไข/ลบทุกกรณี

---

## 7. Shared Components

Table, Modal, ConfirmDialog, Badge (สีตามสถานะ/role), Pagination, TextInput,
PasswordInput, Dropdown, DateRangePicker, Toggle, Button (primary/secondary/danger),
Alert (inline/banner), Toast, EmptyState, Loading spinner

---

## 8. Validation Rules (ตาม Appendix UI FieldSpec)

| Field | Rule |
|---|---|
| Username | ตัวอักษร/ตัวเลข 6–50 ตัว ไม่มีช่องว่าง |
| Password | 8+ ตัว มีพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข อักขระพิเศษ |
| Reference Number | `^[A-Za-z0-9]{1,20}$` (case-sensitive) |
| เลขนิติบุคคล | ตัวเลข 13 หลัก, unique |
| เบอร์โทรศัพท์ | ตัวเลข 9–10 หลัก |
| วงเงินสินเชื่อ | ตัวเลขทศนิยม > 0 |
| Date Range | วันเริ่มต้น ≤ วันสิ้นสุด |
| Email | format `xxx@xxx.xxx` |

---

## 9. Activity Log Action Types

ทุก action เขียน log อัตโนมัติ ครอบคลุม module: AUTH, USER_MGMT, BORROWER,
DECLARATION, VERIFICATION, REPORT, SYSTEM (รายละเอียดตาม Appendix UI FieldSpec)

---

## 10. แผนการพัฒนาแบบเฟส (จะลงรายละเอียดใน Implementation Plan)

1. **Foundation** — setup project, types, mock store + seed, mock api layer, shared components
2. **Auth & RBAC** — login, AuthContext, ProtectedRoute, layout + sidebar
3. **Verification** — search, summary, transaction detail, preview เอกสาร
4. **Reports** — search history report + Export Excel
5. **Management** — user, borrower, data & linkage
6. **Activity Log** — หน้า log + การเขียน log อัตโนมัติทั่วระบบ
7. **Polish** — edge cases, error states, responsive, ตรวจความครบตาม FieldSpec
