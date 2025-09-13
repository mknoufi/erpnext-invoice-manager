import React from 'react';
import { Box, Skeleton, Card, CardContent, CardHeader } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'invoice' | 'card' | 'table' | 'list';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'card', 
  count = 3 
}) => {
  const renderInvoiceSkeleton = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="text" width={120} height={24} />
          <Skeleton variant="text" width={80} height={20} />
        </Box>
        <Skeleton variant="text" width="60%" height={20} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="text" width={80} height={20} />
        </Box>
      </CardContent>
    </Card>
  );

  const renderCardSkeleton = () => (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={<Skeleton variant="circular" width={40} height={40} />}
        title={<Skeleton variant="text" width="60%" height={24} />}
        subheader={<Skeleton variant="text" width="40%" height={20} />}
      />
      <CardContent>
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="60%" height={20} />
      </CardContent>
    </Card>
  );

  const renderTableSkeleton = () => (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Skeleton variant="rectangular" width="25%" height={40} />
        <Skeleton variant="rectangular" width="25%" height={40} />
        <Skeleton variant="rectangular" width="25%" height={40} />
        <Skeleton variant="rectangular" width="25%" height={40} />
      </Box>
      {Array.from({ length: 5 }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <Skeleton variant="text" width="25%" height={40} />
          <Skeleton variant="text" width="25%" height={40} />
          <Skeleton variant="text" width="25%" height={40} />
          <Skeleton variant="text" width="25%" height={40} />
        </Box>
      ))}
    </Box>
  );

  const renderListSkeleton = () => (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
          <Skeleton variant="text" width={80} height={20} />
        </Box>
      ))}
    </Box>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'invoice':
        return renderInvoiceSkeleton();
      case 'card':
        return renderCardSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'list':
        return renderListSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index}>
          {renderSkeleton()}
        </Box>
      ))}
    </Box>
  );
};

export default LoadingSkeleton;
