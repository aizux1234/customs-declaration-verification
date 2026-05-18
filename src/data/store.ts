// src/data/store.ts
import type {
  User, Borrower, Declaration, DeclarationLink,
  SearchHistoryRecord, ActivityLogEntry,
} from '../types';
import {
  buildUsers, buildBorrowers, buildDeclarations,
  buildDeclarationLinks, buildSearchHistory, buildActivityLog,
} from './seed';

export interface Store {
  users: User[];
  borrowers: Borrower[];
  declarations: Declaration[];
  declarationLinks: DeclarationLink[];
  searchHistory: SearchHistoryRecord[];
  activityLog: ActivityLogEntry[];
}

export const store: Store = {
  users: [], borrowers: [], declarations: [],
  declarationLinks: [], searchHistory: [], activityLog: [],
};

export function resetStore(): void {
  store.users = buildUsers();
  store.borrowers = buildBorrowers();
  store.declarations = buildDeclarations();
  store.declarationLinks = buildDeclarationLinks(store.declarations, store.borrowers);
  store.searchHistory = buildSearchHistory(store.declarations, store.users);
  store.activityLog = buildActivityLog(store.users);
}

resetStore(); // seed on first import
