// src/data/seed.ts
import type {
  User,
  Borrower,
  Declaration,
  LineItem,
  DeclarationLink,
  SearchHistoryRecord,
  ActivityLogEntry,
  Role,
  LogModule,
} from '../types';

/**
 * Seed builders for the in-memory prototype store.
 *
 * Every builder returns a FRESH array on each call (no shared mutable state)
 * and uses FIXED, deterministic values (no Math.random) so that counts and
 * content are stable across runs and reseeds.
 */

// Fixed "now" anchor for deterministic relative dates (2026-05-18T09:00:00.000Z).
const NOW = Date.parse('2026-05-18T09:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;

/** ISO string `days` days before the NOW anchor, offset by `hours`/`minutes`. */
function daysAgo(days: number, hours = 0, minutes = 0): string {
  return new Date(NOW - days * DAY + hours * 60 * 60 * 1000 + minutes * 60 * 1000).toISOString();
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function buildUsers(): User[] {
  const base = {
    password: 'Passw0rd!',
    status: 'ACTIVE' as const,
    failedLoginCount: 0,
    lockedUntil: null,
    lastLoginAt: null,
  };
  const createdAt = '2025-01-15T03:00:00.000Z';
  const updatedAt = '2025-06-01T03:00:00.000Z';

  const defs: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    position: string;
    role: Role;
  }> = [
    {
      id: 'U-001',
      username: 'superadmin',
      firstName: 'ธนพล',
      lastName: 'ศรีสุวรรณ',
      position: 'ผู้ดูแลระบบสูงสุด',
      role: 'SUPER_ADMIN',
    },
    {
      id: 'U-002',
      username: 'admin01',
      firstName: 'วราภรณ์',
      lastName: 'เจริญทรัพย์',
      position: 'ผู้ดูแลระบบ',
      role: 'ADMIN',
    },
    {
      id: 'U-003',
      username: 'officer01',
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      position: 'เจ้าหน้าที่สินเชื่อ',
      role: 'CREDIT_OFFICER',
    },
    {
      id: 'U-004',
      username: 'officer02',
      firstName: 'ปิยะนุช',
      lastName: 'แก้วมณี',
      position: 'เจ้าหน้าที่สินเชื่ออาวุโส',
      role: 'CREDIT_OFFICER',
    },
    {
      id: 'U-005',
      username: 'bde01',
      firstName: 'อนุชา',
      lastName: 'พงษ์พานิช',
      position: 'เจ้าหน้าที่บันทึกข้อมูลผู้กู้',
      role: 'BORROWER_DATA_ENTRY',
    },
    {
      id: 'U-006',
      username: 'cde01',
      firstName: 'กมลทิพย์',
      lastName: 'รัตนกุล',
      position: 'เจ้าหน้าที่บันทึกข้อมูลศุลกากร',
      role: 'CUSTOMS_DATA_ENTRY',
    },
    {
      id: 'U-007',
      username: 'auditor01',
      firstName: 'ประเสริฐ',
      lastName: 'วงศ์อนันต์',
      position: 'ผู้ตรวจสอบภายใน',
      role: 'AUDITOR',
    },
    {
      id: 'U-008',
      username: 'admin02',
      firstName: 'นภาพร',
      lastName: 'สุขเกษม',
      position: 'ผู้ดูแลระบบ',
      role: 'ADMIN',
    },
  ];

  return defs.map((d, i) => ({
    id: d.id,
    username: d.username,
    firstName: d.firstName,
    lastName: d.lastName,
    email: `${d.username}@eximbank.co.th`,
    phone: `02${String(2000000 + i * 111111).padStart(8, '0')}`,
    position: d.position,
    role: d.role,
    status: base.status,
    password: base.password,
    failedLoginCount: base.failedLoginCount,
    lockedUntil: base.lockedUntil,
    lastLoginAt: base.lastLoginAt,
    createdAt,
    updatedAt,
  }));
}

// ---------------------------------------------------------------------------
// Borrowers
// ---------------------------------------------------------------------------

const BORROWER_DEFS: Array<{
  nameTh: string;
  nameEn: string;
  type: Borrower['borrowerType'];
  contactName: string;
}> = [
  { nameTh: 'บริษัท ไทยรุ่งเรือง อุตสาหกรรม จำกัด', nameEn: 'Thai Rungrueang Industry Co., Ltd.', type: 'JURISTIC', contactName: 'สุรชัย มั่นคง' },
  { nameTh: 'บริษัท สยามอิเล็กทรอนิกส์ เอ็กซ์ปอร์ต จำกัด', nameEn: 'Siam Electronics Export Co., Ltd.', type: 'JURISTIC', contactName: 'จันทร์เพ็ญ ทองคำ' },
  { nameTh: 'นายวิชัย ตั้งใจค้า', nameEn: 'Mr. Wichai Tangjaika', type: 'INDIVIDUAL', contactName: 'วิชัย ตั้งใจค้า' },
  { nameTh: 'บริษัท เอเชียฟู้ดส์ โปรดักส์ จำกัด', nameEn: 'Asia Foods Products Co., Ltd.', type: 'JURISTIC', contactName: 'มานพ เกษมสุข' },
  { nameTh: 'ห้างหุ้นส่วนจำกัด ภาคใต้ยางพารา', nameEn: 'South Rubber Limited Partnership', type: 'JURISTIC', contactName: 'อรุณ แสงทอง' },
  { nameTh: 'นางสาวพรทิพย์ ค้าไกล', nameEn: 'Ms. Pornthip Khaiklai', type: 'INDIVIDUAL', contactName: 'พรทิพย์ ค้าไกล' },
  { nameTh: 'บริษัท บางกอกการ์เมนท์ อินเตอร์ จำกัด', nameEn: 'Bangkok Garment Inter Co., Ltd.', type: 'JURISTIC', contactName: 'สมหญิง วัฒนกุล' },
  { nameTh: 'บริษัท เจริญชัย เคมีภัณฑ์ จำกัด', nameEn: 'Charoenchai Chemicals Co., Ltd.', type: 'JURISTIC', contactName: 'ธีระ ชัยพัฒน์' },
  { nameTh: 'นายอำนาจ เพิ่มพูน', nameEn: 'Mr. Amnat Permpoon', type: 'INDIVIDUAL', contactName: 'อำนาจ เพิ่มพูน' },
  { nameTh: 'บริษัท ไทยเฟอร์นิเจอร์ เอ็กซ์ปอร์ต จำกัด', nameEn: 'Thai Furniture Export Co., Ltd.', type: 'JURISTIC', contactName: 'นิภา ศรีประเสริฐ' },
  { nameTh: 'บริษัท อีสานข้าวหอม จำกัด', nameEn: 'Isan Jasmine Rice Co., Ltd.', type: 'JURISTIC', contactName: 'บุญมี นาทอง' },
  { nameTh: 'บริษัท แปซิฟิก ซีฟู้ด จำกัด', nameEn: 'Pacific Seafood Co., Ltd.', type: 'JURISTIC', contactName: 'สมพร ทะเลกว้าง' },
  { nameTh: 'นางมาลี รุ่งโรจน์', nameEn: 'Mrs. Malee Rungroj', type: 'INDIVIDUAL', contactName: 'มาลี รุ่งโรจน์' },
  { nameTh: 'บริษัท ออโต้พาร์ท แมนูแฟคเจอริ่ง จำกัด', nameEn: 'Autopart Manufacturing Co., Ltd.', type: 'JURISTIC', contactName: 'เอกชัย ยนตรกิจ' },
  { nameTh: 'บริษัท กรีนเอ็นเนอร์จี โซลูชั่น จำกัด', nameEn: 'Green Energy Solution Co., Ltd.', type: 'JURISTIC', contactName: 'วีระพงษ์ พลังงาน' },
];

export function buildBorrowers(): Borrower[] {
  // Indices that should be INACTIVE (exactly 2). Rest are ACTIVE.
  const inactiveIdx = new Set([4, 12]);

  return BORROWER_DEFS.map((d, i) => {
    const seq = i + 1;
    // Unique deterministic 13-digit tax id.
    const taxId = `1${String(100000000000 + seq * 7654321).slice(0, 12)}`;
    return {
      id: `BR-${String(seq).padStart(5, '0')}`,
      nameTh: d.nameTh,
      nameEn: d.nameEn,
      taxId,
      borrowerType: d.type,
      contactName: d.contactName,
      phone:
        d.type === 'INDIVIDUAL'
          ? `08${String(10000000 + seq * 234567).slice(0, 8)}`
          : `02${String(3000000 + seq * 123456).padStart(8, '0')}`,
      email: `contact${seq}@${d.nameEn
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .slice(0, 12)}.com`,
      creditLimit: 5_000_000 + seq * 1_250_000,
      // Mixed consent: roughly every other borrower gives consent.
      consentGiven: seq % 3 !== 0,
      status: inactiveIdx.has(i) ? 'INACTIVE' : 'ACTIVE',
      createdAt: daysAgo(300 - seq * 5),
      updatedAt: daysAgo(60 - (seq % 30)),
    };
  });
}

// ---------------------------------------------------------------------------
// Declarations
// ---------------------------------------------------------------------------

const PRODUCT_CATALOG: Array<{
  productName: string;
  hsCode: string;
  unit: string;
  unitPrice: number;
  weightPerUnit: number;
  origin: string;
}> = [
  { productName: 'ข้าวหอมมะลิ 100% เกรดเอ', hsCode: '1006.30.99', unit: 'KG', unitPrice: 1.2, weightPerUnit: 1, origin: 'TH' },
  { productName: 'ยางแผ่นรมควันชั้น 3', hsCode: '4001.21.00', unit: 'KG', unitPrice: 1.85, weightPerUnit: 1, origin: 'TH' },
  { productName: 'กุ้งแช่แข็งปอกเปลือก', hsCode: '0306.17.00', unit: 'KG', unitPrice: 9.5, weightPerUnit: 1, origin: 'TH' },
  { productName: 'เสื้อยืดผ้าฝ้ายสำเร็จรูป', hsCode: '6109.10.00', unit: 'PCS', unitPrice: 4.75, weightPerUnit: 0.25, origin: 'TH' },
  { productName: 'ชิ้นส่วนอิเล็กทรอนิกส์ (แผงวงจร)', hsCode: '8534.00.00', unit: 'PCS', unitPrice: 12.4, weightPerUnit: 0.1, origin: 'TH' },
  { productName: 'เฟอร์นิเจอร์ไม้ยางพารา (เก้าอี้)', hsCode: '9401.69.00', unit: 'PCS', unitPrice: 38.0, weightPerUnit: 6.5, origin: 'TH' },
  { productName: 'ชิ้นส่วนยานยนต์ (ชุดเบรก)', hsCode: '8708.30.00', unit: 'SET', unitPrice: 55.25, weightPerUnit: 3.2, origin: 'TH' },
  { productName: 'น้ำมันปาล์มดิบ', hsCode: '1511.10.00', unit: 'KG', unitPrice: 0.95, weightPerUnit: 1, origin: 'TH' },
  { productName: 'แผงโซลาร์เซลล์ขนาด 450W', hsCode: '8541.43.00', unit: 'PCS', unitPrice: 145.0, weightPerUnit: 23.0, origin: 'TH' },
  { productName: 'สับปะรดกระป๋องในน้ำเชื่อม', hsCode: '2008.20.00', unit: 'CTN', unitPrice: 18.6, weightPerUnit: 12.0, origin: 'TH' },
];

const EXPORTERS = [
  'Thai Rungrueang Industry Co., Ltd.',
  'Siam Electronics Export Co., Ltd.',
  'Asia Foods Products Co., Ltd.',
  'Bangkok Garment Inter Co., Ltd.',
  'Pacific Seafood Co., Ltd.',
  'Thai Furniture Export Co., Ltd.',
  'Isan Jasmine Rice Co., Ltd.',
];

const DEST_COUNTRIES = ['US', 'JP', 'CN', 'DE', 'SG', 'AU', 'GB', 'NL'];
const VESSELS = ['MV BANGKOK STAR', 'MV PACIFIC GLORY', 'MV ASIA TRADER', 'MV SIAM EXPRESS'];
const DECL_STATUSES: Declaration['status'][] = ['RELEASED', 'HOLD', 'IN_PROCESS'];

export function buildDeclarations(): Declaration[] {
  const declarations: Declaration[] = [];

  for (let i = 0; i < 30; i++) {
    const seq = i + 1;
    const declarationNo = `A012-6505180000${String(seq).padStart(2, '0')}`;

    // 1-4 line items, deterministic.
    const lineCount = (i % 4) + 1;
    const lineItems: LineItem[] = [];
    for (let j = 0; j < lineCount; j++) {
      const p = PRODUCT_CATALOG[(i + j) % PRODUCT_CATALOG.length];
      const quantity = 100 + ((i * 7 + j * 13) % 50) * 10; // 100..590
      const unitPrice = p.unitPrice;
      const totalValue = Number((quantity * unitPrice).toFixed(2));
      const weight = Number((quantity * p.weightPerUnit).toFixed(2));
      lineItems.push({
        productName: p.productName,
        hsCode: p.hsCode,
        quantity,
        unit: p.unit,
        weight,
        unitPrice,
        totalValue,
        originCountry: p.origin,
      });
    }

    const fobValue = Number(lineItems.reduce((s, li) => s + li.totalValue, 0).toFixed(2));
    // CIF = FOB + freight + insurance (deterministic, always > FOB).
    const cifValue = Number((fobValue * 1.08 + 250).toFixed(2));

    const declarationDate = daysAgo(90 - i * 2, 1);
    const exportDate = daysAgo(90 - i * 2 - 3, 2);

    declarations.push({
      declarationNo,
      declarationDate,
      status: DECL_STATUSES[i % DECL_STATUSES.length],
      fobValue,
      cifValue,
      currency: 'USD',
      exporterName: EXPORTERS[i % EXPORTERS.length],
      destinationCountry: DEST_COUNTRIES[i % DEST_COUNTRIES.length],
      exportDate,
      // Some declarations have null container/vessel.
      containerNo: i % 5 === 0 ? null : `TCLU${String(1000000 + seq * 4321).slice(0, 7)}`,
      vesselName: i % 5 === 0 ? null : VESSELS[i % VESSELS.length],
      lineItems,
    });
  }

  return declarations;
}

// ---------------------------------------------------------------------------
// Declaration links
// ---------------------------------------------------------------------------

export function buildDeclarationLinks(
  declarations: Declaration[],
  borrowers: Borrower[],
): DeclarationLink[] {
  const consenting = borrowers.filter((b) => b.consentGiven);
  const links: DeclarationLink[] = [];
  const seen = new Set<string>();

  if (consenting.length === 0) return links;

  const linkers = ['officer01', 'officer02', 'bde01'];
  // Link the first ~20 declarations.
  const target = Math.min(20, declarations.length);

  for (let i = 0; i < target; i++) {
    const declaration = declarations[i];
    const borrower = consenting[i % consenting.length];
    const pairKey = `${borrower.id}::${declaration.declarationNo}`;
    if (seen.has(pairKey)) continue;
    seen.add(pairKey);

    links.push({
      id: crypto.randomUUID(),
      borrowerId: borrower.id,
      declarationNo: declaration.declarationNo,
      linkedAt: daysAgo(25 - (i % 25), 3, i),
      linkedByUsername: linkers[i % linkers.length],
      documentFileName: `decl-${String(i + 1).padStart(3, '0')}.pdf`,
    });
  }

  return links;
}

// ---------------------------------------------------------------------------
// Search history
// ---------------------------------------------------------------------------

export function buildSearchHistory(
  declarations: Declaration[],
  users: User[],
): SearchHistoryRecord[] {
  const records: SearchHistoryRecord[] = [];

  for (let i = 0; i < 40; i++) {
    const declaration = declarations[i % declarations.length];
    const user = users[i % users.length];
    // Spread over the last 30 days deterministically.
    const dayOffset = i % 30;

    records.push({
      id: crypto.randomUUID(),
      declarationNo: declaration.declarationNo,
      referenceNumber: `REF${String(i + 1).padStart(3, '0')}`,
      searchedByUserId: user.id,
      searchedByUsername: user.username,
      searchedByFullName: `${user.firstName} ${user.lastName}`,
      searchedByRole: user.role,
      declarationStatus: declaration.status,
      fobValue: declaration.fobValue,
      currency: declaration.currency,
      searchedAt: daysAgo(dayOffset, (i % 9) + 8, (i * 7) % 60),
    });
  }

  return records;
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

const LOG_MODULES: LogModule[] = [
  'AUTH',
  'USER_MGMT',
  'BORROWER',
  'DECLARATION',
  'VERIFICATION',
  'REPORT',
  'SYSTEM',
];

// Per-module action templates. UPDATE-type actions carry before/after values.
const LOG_ACTIONS: Record<
  LogModule,
  Array<{ actionType: string; detail: string; isUpdate?: boolean }>
> = {
  AUTH: [
    { actionType: 'LOGIN_SUCCESS', detail: 'เข้าสู่ระบบสำเร็จ' },
    { actionType: 'LOGIN_FAILED', detail: 'เข้าสู่ระบบไม่สำเร็จ: รหัสผ่านไม่ถูกต้อง' },
    { actionType: 'SESSION_EXPIRED', detail: 'เซสชันหมดอายุ ระบบออกจากระบบอัตโนมัติ' },
  ],
  USER_MGMT: [
    { actionType: 'USER_CREATED', detail: 'สร้างบัญชีผู้ใช้งานใหม่' },
    { actionType: 'USER_UPDATED', detail: 'แก้ไขข้อมูลผู้ใช้งาน', isUpdate: true },
    { actionType: 'USER_STATUS_CHANGED', detail: 'เปลี่ยนสถานะผู้ใช้งาน', isUpdate: true },
  ],
  BORROWER: [
    { actionType: 'BORROWER_CREATED', detail: 'เพิ่มข้อมูลผู้กู้' },
    { actionType: 'BORROWER_UPDATED', detail: 'แก้ไขข้อมูลผู้กู้', isUpdate: true },
    { actionType: 'BORROWER_CONSENT_UPDATED', detail: 'ปรับปรุงสถานะความยินยอมของผู้กู้', isUpdate: true },
  ],
  DECLARATION: [
    { actionType: 'DECLARATION_CREATED', detail: 'บันทึกใบขนสินค้าใหม่' },
    { actionType: 'DECLARATION_LINKED', detail: 'เชื่อมโยงใบขนสินค้ากับผู้กู้' },
    { actionType: 'DECLARATION_UPDATED', detail: 'แก้ไขข้อมูลใบขนสินค้า', isUpdate: true },
  ],
  VERIFICATION: [
    { actionType: 'DECLARATION_SEARCHED', detail: 'ค้นหาและตรวจสอบใบขนสินค้า' },
    { actionType: 'VERIFICATION_VIEWED', detail: 'เปิดดูผลการตรวจสอบใบขนสินค้า' },
  ],
  REPORT: [
    { actionType: 'REPORT_EXPORTED', detail: 'ส่งออกรายงานเป็นไฟล์ Excel' },
    { actionType: 'REPORT_VIEWED', detail: 'เปิดดูรายงานสรุป' },
  ],
  SYSTEM: [
    { actionType: 'SYSTEM_CONFIG_CHANGED', detail: 'ปรับปรุงการตั้งค่าระบบ', isUpdate: true },
    { actionType: 'DATA_BACKUP', detail: 'สำรองข้อมูลระบบ' },
  ],
};

export function buildActivityLog(users: User[]): ActivityLogEntry[] {
  const entries: ActivityLogEntry[] = [];

  for (let i = 0; i < 60; i++) {
    const module = LOG_MODULES[i % LOG_MODULES.length];
    const actions = LOG_ACTIONS[module];
    const action = actions[Math.floor(i / LOG_MODULES.length) % actions.length];
    const user = users[i % users.length];
    const isUpdate = action.isUpdate === true;

    entries.push({
      id: crypto.randomUUID(),
      timestamp: daysAgo(i % 30, (i % 10) + 7, (i * 11) % 60),
      userId: user.id,
      username: user.username,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      actionType: action.actionType,
      module,
      detail: action.detail,
      beforeValue: isUpdate ? `{"status":"ACTIVE"}` : null,
      afterValue: isUpdate ? `{"status":"INACTIVE"}` : null,
      ipAddress: `192.168.1.${(i % 250) + 1}`,
    });
  }

  return entries;
}
