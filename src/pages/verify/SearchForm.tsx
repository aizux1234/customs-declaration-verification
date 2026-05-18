// src/pages/verify/SearchForm.tsx
import { useState } from 'react';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { validateReferenceNumber } from '../../utils/validators';

type SearchFormProps = {
  loading: boolean;
  onSearch: (referenceNumber: string, declarationNo: string) => void;
};

export function SearchForm({ loading, onSearch }: SearchFormProps) {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [declarationNo, setDeclarationNo] = useState('');

  const refError =
    referenceNumber.trim() !== '' ? validateReferenceNumber(referenceNumber) : null;
  const canSearch =
    referenceNumber.trim() !== '' &&
    declarationNo.trim() !== '' &&
    refError === null;

  function handleSearch() {
    if (!canSearch || loading) return;
    onSearch(referenceNumber.trim(), declarationNo.trim());
  }

  function handleClear() {
    setReferenceNumber('');
    setDeclarationNo('');
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <h2 className="text-base font-semibold text-navy">ค้นหาใบขนสินค้า</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Reference Number"
          value={referenceNumber}
          onChange={setReferenceNumber}
          error={refError ?? undefined}
          required
          placeholder="เช่น REF001"
        />
        <TextInput
          label="เลขที่ใบขน"
          value={declarationNo}
          onChange={setDeclarationNo}
          required
          placeholder="เช่น A012-650518000001"
        />
      </div>
      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!canSearch}
        >
          ค้นหา
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleClear}
          disabled={loading}
        >
          ล้างข้อมูล
        </Button>
      </div>
    </form>
  );
}
