import { ReactNode } from 'react';

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  errorMessage?: string;
  allowedValues?: string[];
  minDate?: string;
  maxDate?: string;
  precision?: number;
}

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export interface FieldMapping {
  localField: string;
  erpnextField: string;
  dataType: string;
  required: boolean;
  label?: string;
  description?: string;
  placeholder?: string;
  group?: string;
  defaultValue?: any;
  isReadOnly?: boolean;
  isHidden?: boolean;
  isComputed?: boolean;
  computeExpression?: string;
  validation?: FieldValidation;
  controlType?: 'input' | 'select' | 'checkbox' | 'date' | 'datetime' | 'time' | 'textarea' | 'autocomplete';
  options?: FieldOption[];
  dependsOn?: string[];
  showIf?: Record<string, any>;
  transformIn?: (value: any) => any;
  transformOut?: (value: any) => any;
  meta?: Record<string, any>;
}
