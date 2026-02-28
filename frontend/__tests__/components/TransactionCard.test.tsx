import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { Transaction } from '@/types/api';

// Mock the format utilities
jest.mock('@/utils/format', () => ({
  formatCurrency: (amount: number, currency: string) => `${amount} ${currency}`,
  formatDate: (date: string) => new Date(date).toLocaleDateString(),
}));

describe('TransactionCard', () => {
  const mockTransaction: Transaction = {
    id: 'test-id-123',
    type: 'expense',
    amount: 100,
    currency: 'USD',
    categoryId: 'category-1',
    description: 'Test transaction description that is quite long and should be truncated with line-clamp-2 when not expanded',
    transactionDate: '2024-01-15T00:00:00Z',
    isRecurring: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Requirement 8.2: Display all key data', () => {
    it('should display all key transaction data (date, category, amount, description)', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Check amount is displayed
      expect(screen.getByText(/100 USD/)).toBeInTheDocument();
      
      // Check category is displayed
      expect(screen.getByText(/Категория:/)).toBeInTheDocument();
      expect(screen.getByText(/category-1/)).toBeInTheDocument();
      
      // Check description is displayed
      expect(screen.getByText(/Test transaction description/)).toBeInTheDocument();
      
      // Check date is displayed
      expect(screen.getByText(new Date(mockTransaction.transactionDate).toLocaleDateString())).toBeInTheDocument();
    });

    it('should display income transactions with positive sign and green color', () => {
      const incomeTransaction: Transaction = {
        ...mockTransaction,
        type: 'income',
      };

      render(
        <TransactionCard
          transaction={incomeTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const amountElement = screen.getByLabelText(/Income amount/);
      expect(amountElement).toHaveTextContent('+100 USD');
      expect(amountElement).toHaveClass('text-green-600');
    });

    it('should display expense transactions with negative sign and red color', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const amountElement = screen.getByLabelText(/Expense amount/);
      expect(amountElement).toHaveTextContent('-100 USD');
      expect(amountElement).toHaveClass('text-red-600');
    });

    it('should display recurring indicator when transaction is recurring', () => {
      const recurringTransaction: Transaction = {
        ...mockTransaction,
        isRecurring: true,
      };

      render(
        <TransactionCard
          transaction={recurringTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Повторяющаяся/)).toBeInTheDocument();
    });

    it('should not display recurring indicator when transaction is not recurring', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/Повторяющаяся/)).not.toBeInTheDocument();
    });
  });

  describe('Requirement 8.3: Text truncation with line-clamp-2', () => {
    it('should apply line-clamp-2 class to description when not expanded', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const description = screen.getByText(/Test transaction description/);
      expect(description).toHaveClass('line-clamp-2');
    });

    it('should remove line-clamp-2 class when expanded', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', { name: /Transaction card/ });
      fireEvent.click(card);

      const description = screen.getByText(/Test transaction description/);
      expect(description).not.toHaveClass('line-clamp-2');
    });

    it('should not render description element when description is empty', () => {
      const transactionWithoutDescription: Transaction = {
        ...mockTransaction,
        description: undefined,
      };

      render(
        <TransactionCard
          transaction={transactionWithoutDescription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/Test transaction description/)).not.toBeInTheDocument();
    });
  });

  describe('Requirement 8.4: Click handler to display full information', () => {
    it('should expand card and show additional information when clicked', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Initially, additional info should not be visible
      expect(screen.queryByText(/ID:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Создано:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Обновлено:/)).not.toBeInTheDocument();

      // Click the card
      const card = screen.getByRole('button', { name: /Transaction card/ });
      fireEvent.click(card);

      // Additional info should now be visible
      expect(screen.getByText(/ID:/)).toBeInTheDocument();
      expect(screen.getByText(/test-id-123/)).toBeInTheDocument();
      expect(screen.getByText(/Создано:/)).toBeInTheDocument();
      expect(screen.getByText(/Обновлено:/)).toBeInTheDocument();
    });

    it('should collapse card when clicked again', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', { name: /Transaction card/ });
      
      // Expand
      fireEvent.click(card);
      expect(screen.getByText(/ID:/)).toBeInTheDocument();

      // Collapse
      fireEvent.click(card);
      expect(screen.queryByText(/ID:/)).not.toBeInTheDocument();
    });

    it('should expand card when Enter key is pressed', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', { name: /Transaction card/ });
      
      fireEvent.keyDown(card, { key: 'Enter' });
      
      expect(screen.getByText(/ID:/)).toBeInTheDocument();
    });

    it('should expand card when Space key is pressed', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', { name: /Transaction card/ });
      
      fireEvent.keyDown(card, { key: ' ' });
      
      expect(screen.getByText(/ID:/)).toBeInTheDocument();
    });

    it('should not toggle expansion when clicking on edit button', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText(/Edit transaction/);
      fireEvent.click(editButton);

      // Card should not be expanded
      expect(screen.queryByText(/ID:/)).not.toBeInTheDocument();
      
      // Edit callback should be called
      expect(mockOnEdit).toHaveBeenCalledWith(mockTransaction);
    });

    it('should not toggle expansion when clicking on delete button', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByLabelText(/Delete transaction/);
      fireEvent.click(deleteButton);

      // Card should not be expanded
      expect(screen.queryByText(/ID:/)).not.toBeInTheDocument();
      
      // Delete callback should be called
      expect(mockOnDelete).toHaveBeenCalledWith(mockTransaction.id);
    });

    it('should have proper ARIA attributes for accessibility', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', { name: /Transaction card/ });
      
      // Initially not expanded
      expect(card).toHaveAttribute('aria-expanded', 'false');
      expect(card).toHaveAttribute('tabIndex', '0');

      // After clicking, should be expanded
      fireEvent.click(card);
      expect(card).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Action buttons', () => {
    it('should call onEdit when edit button is clicked', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText(/Edit transaction/);
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(mockTransaction);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByLabelText(/Delete transaction/);
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(mockTransaction.id);
    });
  });
});
