import React from 'react';
import { styled } from '@mui/material/styles';
import MuiGrid from '@mui/material/Grid';

interface GridItemProps {
  children: React.ReactNode;
  xs?: number | 'auto' | boolean;
  sm?: number | 'auto' | boolean;
  md?: number | 'auto' | boolean;
  lg?: number | 'auto' | boolean;
  xl?: number | 'auto' | boolean;
  className?: string;
  style?: React.CSSProperties;
}

const GridItem = styled(({ children, className, ...props }: any) => (
  <MuiGrid item className={className} {...props}>
    {children}
  </MuiGrid>
))<GridItemProps>(({ theme }) => ({}));

GridItem.displayName = 'GridItem';

export default GridItem;
