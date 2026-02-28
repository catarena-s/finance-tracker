import React from 'react';
import { render, screen } from '@testing-library/react';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Transaction } from '@/types/api';

// Mock the useBreakpoint hook
jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: jest.fn(),
}));

// Mock the TransactionTable component
jest.mock('@/components/transactions/TransactionTable', () => ({
  TransactionTable: jest.fn(() => <div data-testid="transaction-table">Table View</div>),
}));

// Mock the TransactionCard component
jest.mock('@/components/transactions/TransactionCard', () => ({
  TransactionCard: jest.fn(({ transaction }) => (
    <div data-testid={`transaction-card-${transaction.id}`}>Card View</div>
  )),
}));

// Mock the Pagination component
jest.mock('@/components/ui', () => ({
  Pagination: jest.fn(() => <div data-testid="pagination">Pagination</div>),
}));

import { useBreakpoint } from '@/hooks/useBreakpoint';

describe('TransactionList', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      type: 'expense',
      amount: 100,
      currency: 'USD',
      categoryId: 'cat-1',
      description: 'Test transaction 1',
      transactionDate: '2024-01-15T00:00:00Z',
      isRecurring: false,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'tx-2',
      type: 'income',
      amount: 200,
      currency: 'USD',
      categoryId: 'cat-2',
      description: 'Test transaction 2',
      transactionDate: '2024-01-16T00:00:00Z',
      isRecurring: false,
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
    },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    loading: false,
    currentPage: 1,
    totalPages: 1,
    totalItems: 2,
    pageSize: 10,
    onPageChange: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Requirement 8.1: Conditional rendering based on viewport width', () => {
    it('should render table view on desktop (viewport >= 768px)', () => {
      // Mock desktop viewport
      (useBreakpoint as jest.Mock).mockReturnValue({
        width: 1024,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        currentBreakpoint: 'lg',
      });

      render(<TransactionList {...defaultProps} />);

      // Should render table view
      expect(screen.getByTestId('transaction-table')).toBeInTheDocument();
      
      // Should not render card views
      expect(screen.queryByTestId('transaction-card-tx-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('transaction-card-tx-2')).not.toBeInTheDocument();
    });

    it('should render card view on mobile (viewport < 768px)', () => {
      // Mock mobile viewport
      (useBreakpoint as jest.Mock).mockReturnValue({
        width: 375,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        currentBreakpoint: 'xs',
      });

      render(<TransactionList {...defaultProps} />);

      // Should render card views
      expect(screen.getByTestId('transaction-card-tx-1')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-card-tx-2')).toBeInTheDocument();
      
      // Should not render table view
      expect(screen.queryByTestId('transaction-table')).not.toBeInTheDocument();
    });

    it('should render table view at exactly 768px breakpoint', () => {
      // Mock viewport at exactly 768px (md breakpoint)
      (useBreakpoint as jest.Mock).mockReturnValue({
        width: 768,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        currentBreakpoint: 'md',
      });

      render(<TransactionList {...defaultProps} />);

      // Should render table view (>= 768px)
      expect(screen.getByTestId('transaction-table')).toBeInTheDocument();
      expect(screen.queryByTestId('transaction-card-tx-1')).not.toBeInTheDocument();
    });

    it('should render card view at 767px (just below breakpoint)', () => {
      // Mock viewport at 767px (just below md breakpoint)
      (useBreakpoint as jest.Mock).mockReturnValue({
        width: 767,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        currentBreakpoint: 'sm',
      });

      render(<TransactionList {...defaultProps} />);

      // Should render card view (< 768px)
      expect(screen.getByTestId('transaction-card-tx-1')).toBeInTheDocument();
      expect(screen.queryByTestId('transaction-table')).not.toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should show loading skeleton on mobile when loading', () => {
      (useBreakpoint as jest.Mock).mockReturnValue({
        width: 375,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        currentBreakpoint: 'xs',
      });

      render(<TransactionList {...defaultProps} loading={true} />);

      // Should show loading skeletons
      const loadingElements = screen.getAllByRole('status', { name: /Loading/ });
      expect(loadingElements).toHaveLength(5);
    });

    it('should delegate loading state to table view on desktop', () => {
      (useBreakpoint as jest.Mock).mockReturnValue({
        width: 1024,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        currentBreakpoint: 'lg',
      });

      render(<TransactionList {...defaultProps} loading={true} />);

      // Should render table view (which handles its own loading state)
      expect(screen.getByTestId('transaction-table')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show empty state on mobile when no transactions', () => {
      (useBreakpoint as jest.Mock).mockReturnValue({
        width: 375,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        currentBreakpoint: 'xs',
      });

      render(<TransactionList {...defaultProps} transactions={[]} />);

      expect(screen.getByText('Нет транзакций')).toBeInTheDocument();
      expect(screen.getByText('Начните с создания новой транзакции')).toBeInTheDocument();
    });

    it('should delegate empty state to table view on desktop', () => {
      (useBreakpoint as jest.Mock).mockReturnValue({
        width: 1024,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        currentBreakpoint: 'lg',
      });

      render(<TransactionList {...defaultProps} transactions={[]} />);

      // Should render table view (which handles its own empty state)
      expect(screen.getByTestId('transaction-table')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should show pagination on mobile when multiple pages exist', () => {
      (useBreakpoint as jest.Mock).mockReturnValue({
        width: 375,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        currentBreakpoint: 'xs',
      });

      render(<TransactionList {...defaultProps} totalPages={3} />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should not show pagination on mobile when only one page', () => {
      (useBreakpoint as jest.Mock).mockReturnValue({
        width: 375,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        currentBreakpoint: 'xs',
      });

      render(<TransactionList {...defaultProps} totalPages={1} />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });
});
