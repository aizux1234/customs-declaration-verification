// src/api/customsApi.ts
import { store } from '../data/store';
import { delay } from './_helpers';
import type { CustomsSearchResult } from '../types';

/** Mock of the Thai Customs Department API — all data is simulated. */
export function searchDeclaration(declarationNo: string): Promise<CustomsSearchResult> {
  if (declarationNo.trim() === 'TIMEOUT000000') {
    return delay<CustomsSearchResult>({ ok: false, error: 'TIMEOUT' }, 1200);
  }
  const found = store.declarations.find((d) => d.declarationNo === declarationNo.trim());
  if (found) return delay<CustomsSearchResult>({ ok: true, declaration: found }, 1000);
  return delay<CustomsSearchResult>({ ok: false, error: 'NOT_FOUND' }, 800);
}
