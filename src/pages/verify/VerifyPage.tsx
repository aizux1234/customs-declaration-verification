// src/pages/verify/VerifyPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchForm } from './SearchForm';
import { SummaryCard } from './SummaryCard';
import { TransactionTable } from './TransactionTable';
import { DocumentPreview } from './DocumentPreview';
import { Alert } from '../../components/Alert';
import { PageHeader } from '../../components/PageHeader';
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

  const actor: User | null =
    user ?? store.users.find((u) => u.role === 'CREDIT_OFFICER') ?? null;

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

    const exists = await hasHistory(result.declaration.declarationNo);
    setHistoryExists(exists);

    if (actor) {
      await recordSearch(actor, result.declaration, referenceNumber);
    }
    setLoading(false);
  }

  return (
    <div>
      <PageHeader
        title="ตรวจสอบข้อมูลใบขน"
        description="ค้นหาและตรวจสอบข้อมูลใบขนสินค้าจากระบบกรมศุลกากร"
      />

      <div className="flex flex-col gap-6">
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
          <TransactionTable declaration={declaration} />
          {actor && (
            <DocumentPreview
              open={previewOpen}
              declaration={declaration}
              actor={actor}
              onClose={() => setPreviewOpen(false)}
            />
          )}
        </>
      )}
      </div>
    </div>
  );
}
