// src/pages/verify/VerifyPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchForm } from './SearchForm';
import { SummaryCard } from './SummaryCard';
import { Alert } from '../../components/Alert';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../data/store';
import { searchDeclaration } from '../../api/customsApi';
import { recordSearch, hasHistory } from '../../api/historyApi';
import type { Declaration, User } from '../../types';

type SearchError = 'none' | 'NOT_FOUND' | 'TIMEOUT';

export function VerifyPage() {
  const { user } = useAuth();

  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [error, setError] = useState<SearchError>('none');
  const [loading, setLoading] = useState(false);
  const [referenceUsed, setReferenceUsed] = useState('');
  const [lastDeclarationNo, setLastDeclarationNo] = useState('');
  const [historyExists, setHistoryExists] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function resolveActor(): User | null {
    return user ?? store.users.find((u) => u.role === 'CREDIT_OFFICER') ?? null;
  }

  async function runSearch(referenceNumber: string, declarationNo: string) {
    setLoading(true);
    setError('none');
    setDeclaration(null);
    setHistoryExists(false);
    setPreviewOpen(false);
    setReferenceUsed(referenceNumber);
    setLastDeclarationNo(declarationNo);

    const result = await searchDeclaration(declarationNo);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setDeclaration(result.declaration);

    const actor = resolveActor();
    if (actor) {
      await recordSearch(actor, result.declaration, referenceNumber);
    }
    const exists = await hasHistory(result.declaration.declarationNo);
    setHistoryExists(exists);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold text-navy">
          ตรวจสอบใบขนสินค้า
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          ค้นหาและตรวจสอบข้อมูลใบขนสินค้าจากระบบกรมศุลกากร
        </p>
      </header>

      <SearchForm loading={loading} onSearch={runSearch} />

      {error === 'NOT_FOUND' && (
        <Alert tone="error" variant="banner">
          ไม่พบข้อมูลใบขนนี้ในระบบ
        </Alert>
      )}

      {error === 'TIMEOUT' && (
        <Alert
          tone="error"
          variant="banner"
          onRetry={() => runSearch(referenceUsed, lastDeclarationNo)}
        >
          ไม่สามารถเชื่อมต่อระบบศุลกากรได้ กรุณาลองใหม่
        </Alert>
      )}

      {declaration && (
        <>
          {historyExists && (
            <Alert tone="info" variant="banner">
              ใบขนนี้เคยถูกค้นหามาก่อน ดูรายละเอียดได้ที่{' '}
              <Link
                to="/reports/search-history"
                className="font-medium underline"
              >
                รายงานประวัติการค้นหา
              </Link>
            </Alert>
          )}
          <SummaryCard
            declaration={declaration}
            referenceNumber={referenceUsed}
            onPreview={() => setPreviewOpen((v) => !v)}
          />
          {previewOpen && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
              ตัวอย่างเอกสารจะแสดงที่นี่
            </div>
          )}
        </>
      )}
    </div>
  );
}
