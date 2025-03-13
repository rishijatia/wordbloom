import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 30px 0;
  width: 100%;
`;

const DesktopPagination = styled.div`
  display: none;
  align-items: center;
  gap: 10px;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const MobilePagination = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const PageButton = styled.button<{$active?: boolean}>`
  padding: 8px 12px;
  background-color: ${props => props.$active ? '#4f46e5' : 'white'};
  color: ${props => props.$active ? 'white' : '#4b5563'};
  border: 1px solid ${props => props.$active ? '#4f46e5' : '#d1d5db'};
  border-radius: 6px;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  cursor: ${props => props.$active ? 'default' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.$active ? '#4f46e5' : '#f3f4f6'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin: 0 10px;
`;

const LoadMoreButton = styled.button`
  padding: 12px 24px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  max-width: 300px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4338ca;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RemainingCount = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
`;

// Calculate total pages
const getTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.max(1, Math.ceil(totalItems / itemsPerPage));
};

// Generate array of page numbers to display
const getPageNumbers = (currentPage: number, totalPages: number): number[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
};

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLoadMore,
  hasMore,
  loading
}) => {
  const totalPages = getTotalPages(totalItems, itemsPerPage);
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  
  // Calculate remaining items for mobile "Load More" button
  const displayedItems = Math.min(currentPage * itemsPerPage, totalItems);
  const remainingItems = totalItems - displayedItems;

  return (
    <Container>
      {/* Desktop pagination with page numbers */}
      <DesktopPagination>
        <PageButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          ◀ Previous
        </PageButton>
        
        {pageNumbers[0] > 1 && (
          <>
            <PageButton
              onClick={() => onPageChange(1)}
              disabled={loading}
            >
              1
            </PageButton>
            {pageNumbers[0] > 2 && <PageInfo>...</PageInfo>}
          </>
        )}
        
        {pageNumbers.map(number => (
          <PageButton
            key={number}
            $active={number === currentPage}
            onClick={() => onPageChange(number)}
            disabled={number === currentPage || loading}
          >
            {number}
          </PageButton>
        ))}
        
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <PageInfo>...</PageInfo>}
            <PageButton
              onClick={() => onPageChange(totalPages)}
              disabled={loading}
            >
              {totalPages}
            </PageButton>
          </>
        )}
        
        <PageButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || !hasMore || loading}
        >
          Next ▶
        </PageButton>
        
        <PageInfo>
          Page {currentPage} of {totalPages === 0 ? 1 : totalPages} ({totalItems} total)
        </PageInfo>
      </DesktopPagination>
      
      {/* Mobile "Load More" pagination */}
      <MobilePagination>
        {hasMore && (
          <>
            <LoadMoreButton 
              onClick={onLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </LoadMoreButton>
            
            {remainingItems > 0 && (
              <RemainingCount>
                {remainingItems} more challenge{remainingItems !== 1 ? 's' : ''} remaining
              </RemainingCount>
            )}
          </>
        )}
      </MobilePagination>
    </Container>
  );
};

export default Pagination;