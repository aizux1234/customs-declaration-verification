// src/components/components.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import { Badge } from './Badge';
import { DataTable } from './DataTable';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

describe('shared components', () => {
  it('Button renders its label', () => {
    render(<Button variant="primary">บันทึก</Button>);
    expect(screen.getByText('บันทึก')).toBeInTheDocument();
  });
  it('Badge renders its text', () => {
    render(<Badge text="Active" tone="green" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
  it('DataTable renders rows', () => {
    render(
      <DataTable
        columns={[{ key: 'name', header: 'ชื่อ' }]}
        rows={[{ name: 'ทดสอบ' }]}
        rowKey={(r) => r.name}
      />,
    );
    expect(screen.getByText('ทดสอบ')).toBeInTheDocument();
  });
  it('EmptyState renders its message', () => {
    render(<EmptyState message="ไม่มีข้อมูล" />);
    expect(screen.getByText('ไม่มีข้อมูล')).toBeInTheDocument();
  });
  it('Pagination shows the range summary', () => {
    render(
      <Pagination page={1} pageSize={20} total={45} pageSizeOptions={[20, 50, 100]}
        onPageChange={() => {}} onPageSizeChange={() => {}} />,
    );
    expect(screen.getByText(/1-20 of 45/)).toBeInTheDocument();
  });
});
