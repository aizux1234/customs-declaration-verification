// src/types/index.ts
export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CREDIT_OFFICER'
  | 'BORROWER_DATA_ENTRY'
  | 'CUSTOMS_DATA_ENTRY'
  | 'AUDITOR';

export type EntityStatus = 'ACTIVE' | 'INACTIVE';
export type DeclarationStatus = 'RELEASED' | 'HOLD' | 'IN_PROCESS';
export type BorrowerType = 'JURISTIC' | 'INDIVIDUAL';
export type LogModule =
  | 'AUTH' | 'USER_MGMT' | 'BORROWER' | 'DECLARATION'
  | 'VERIFICATION' | 'REPORT' | 'SYSTEM';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  role: Role;
  status: EntityStatus;
  password: string;            // mock only — never do this in production
  failedLoginCount: number;
  lockedUntil: string | null;  // ISO string
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Borrower {
  id: string;                  // BR-00001
  nameTh: string;
  nameEn: string;
  taxId: string;               // 13 digits
  borrowerType: BorrowerType;
  contactName: string;
  phone: string;
  email: string;
  creditLimit: number;
  consentGiven: boolean;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  productName: string;
  hsCode: string;
  quantity: number;
  unit: string;
  weight: number;
  unitPrice: number;
  totalValue: number;
  originCountry: string;
}

export interface Declaration {
  declarationNo: string;
  declarationDate: string;
  status: DeclarationStatus;
  fobValue: number;
  cifValue: number;
  currency: string;
  exporterName: string;
  destinationCountry: string;
  exportDate: string;
  containerNo: string | null;
  vesselName: string | null;
  lineItems: LineItem[];
}

export interface DeclarationLink {
  id: string;
  borrowerId: string;
  declarationNo: string;
  linkedAt: string;
  linkedByUsername: string;
  documentFileName: string;
}

export interface SearchHistoryRecord {
  id: string;
  declarationNo: string;
  referenceNumber: string;
  searchedByUserId: string;
  searchedByUsername: string;
  searchedByFullName: string;
  searchedByRole: Role;
  declarationStatus: DeclarationStatus;
  fobValue: number;
  currency: string;
  searchedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  fullName: string;
  role: Role;
  actionType: string;
  module: LogModule;
  detail: string;
  beforeValue: string | null;
  afterValue: string | null;
  ipAddress: string;
}

/** Discriminated result for the mock Customs API. */
export type CustomsSearchResult =
  | { ok: true; declaration: Declaration }
  | { ok: false; error: 'NOT_FOUND' | 'TIMEOUT' };
