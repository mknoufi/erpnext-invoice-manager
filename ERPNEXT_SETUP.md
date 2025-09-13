# 🔗 ERPNext Integration Setup Guide

## 📊 Current Status: **TEST DATA MODE**

The application is currently running with **mock/test data** for demonstration purposes.

## 🔄 How to Switch to Real ERPNext Data

### Step 1: Configure ERPNext Connection

1. **Go to Settings**: http://localhost:3000/settings
2. **Enter your ERPNext details**:
   - **ERPNext URL**: `https://your-erpnext-instance.com`
   - **API Key**: Your ERPNext API key
   - **API Secret**: Your ERPNext API secret
   - **Company**: Your company name

### Step 2: Enable Real Data Mode

1. **Open**: `src/api/invoiceService.ts`
2. **Change line 12**:
   ```typescript
   const USE_REAL_ERPNEXT_DATA = true; // Change from false to true
   ```
3. **Uncomment line 1**:
   ```typescript
   import api from './client'; // Uncomment this line
   ```

### Step 3: Configure API Client

1. **Open**: `src/api/client.ts`
2. **Update the base URL** to match your ERPNext instance
3. **Configure authentication** with your API credentials

### Step 4: Restart Application

```bash
npm start
```

## 🔧 Configuration Files to Modify

### 1. Invoice Service (`src/api/invoiceService.ts`)
- Set `USE_REAL_ERPNEXT_DATA = true`
- Uncomment the import statement

### 2. API Client (`src/api/client.ts`)
- Update base URL
- Configure authentication headers

### 3. Socket Service (`src/api/socket.ts`)
- Update ERPNext URL for real-time updates

### 4. POS Service (`src/api/posService.ts`)
- Configure for real ERPNext POS integration

## 📋 Required ERPNext Setup

### API Access
1. **Enable API access** in ERPNext
2. **Create API Key/Secret** in User settings
3. **Set proper permissions** for the API user

### Required DocTypes
- Sales Invoice
- Customer
- Payment Entry
- POS Profile (for cashier module)

### Required Permissions
- Read access to Sales Invoice
- Write access to Payment Entry
- Access to Customer data

## 🧪 Testing Real Integration

1. **Test Connection**: Use the "Test Connection" button in Settings
2. **Verify Data**: Check if real invoices appear
3. **Test Actions**: Try marking invoices as paid
4. **Check Logs**: Monitor browser console for errors

## 🔄 Switching Back to Test Data

If you need to switch back to test data:

1. **Set**: `USE_REAL_ERPNEXT_DATA = false`
2. **Comment out**: `import api from './client';`
3. **Restart**: `npm start`

## 📞 Support

If you encounter issues with real ERPNext integration:

1. **Check ERPNext logs** for API errors
2. **Verify API credentials** and permissions
3. **Test API endpoints** directly with curl/Postman
4. **Check network connectivity** between app and ERPNext

## 🎯 Current Test Data

The application currently shows these sample invoices:
- INV-2024-001: ABC Company Ltd - $1,500.00 (Unpaid)
- INV-2024-002: XYZ Corporation - $2,500.00 (Unpaid)
- INV-2024-003: Tech Solutions Inc - $3,200.00 (Paid)
- INV-2024-004: Global Enterprises - $1,800.00 (Overdue)
- INV-2024-005: Startup Ventures - $950.00 (Unpaid)

---

**Note**: The application is designed to work seamlessly with both test data and real ERPNext data. Simply toggle the configuration flag to switch between modes.
