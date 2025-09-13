import React from 'react';
import MuiGrid, { GridProps as MuiGridProps, GridSize } from '@mui/material/Grid';

// Define the props that our GridContainer will accept
type GridContainerProps = {
  children: React.ReactNode;
  spacing?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  xs?: boolean | GridSize;
  sm?: boolean | GridSize;
  md?: boolean | GridSize;
  lg?: boolean | GridSize;
  xl?: boolean | GridSize;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any; // For any other MUI Grid props
};

const GridContainer: React.FC<GridContainerProps> = (props) => {
  const { children, ...rest } = props;
  return (
    <MuiGrid container {...rest}>
      {children}
    </MuiGrid>
  );
};

export default GridContainer;
