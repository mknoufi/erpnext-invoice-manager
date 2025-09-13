export interface DataEncryption {
  enabled: boolean;
  algorithm: 'aes-256-gcm' | 'aes-128-gcm';
  keyRotationDays: number;
}
