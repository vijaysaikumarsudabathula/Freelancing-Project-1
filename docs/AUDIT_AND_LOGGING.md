# Audit & Activity Logging

## Overview
Every single transaction, login, card, address, order, and activity on the Deepthi platform is now automatically tracked and persisted to the database with timestamps.

## Tables for Audit & Logging

### 1. **login_history**
Tracks every login attempt (successful and failed) with timestamp and user info.

**Columns:**
- `id` (TEXT PRIMARY KEY) - Unique login event ID (format: `login-${timestamp}`)
- `userId` (TEXT) - User ID (customer or admin)
- `email` (TEXT) - Email address
- `loginTime` (TEXT) - ISO timestamp of login
- `status` (TEXT) - 'success' or 'failed'
- `device` (TEXT) - Device type (currently 'web')
- `notes` (TEXT) - Additional info (e.g., "Invalid credentials", "Admin login successful")

**Auto-logged when:**
- Customer logs in (success or failure)
- Admin logs in (success or failure)
- Customer signs up

### 2. **activity_log**
Records all significant user activities: signup, login, address changes, card saves, favorites, orders, etc.

**Columns:**
- `id` (TEXT PRIMARY KEY) - Unique activity ID (format: `activity-${timestamp}`)
- `userId` (TEXT) - User ID
- `activityType` (TEXT) - Type of activity (e.g., 'LOGIN', 'SIGNUP', 'ADDRESS_ADDED', 'CARD_SAVED', 'ORDER_PLACED', 'FAVORITE_ADDED', 'CART_SAVED')
- `description` (TEXT) - Human-readable description
- `timestamp` (TEXT) - ISO timestamp when activity occurred
- `details` (TEXT) - JSON object with additional context

**Activity Types:**
| Type | Triggered When | Example Details |
|------|---|---|
| SIGNUP | New customer account created | name, email |
| LOGIN | User logs in | email |
| ADDRESS_ADDED | New address saved | address, city, type |
| CARD_SAVED | Card details stored | brand, last4 |
| FAVORITE_ADDED | Product added to wishlist | productId |
| CART_SAVED | Shopping cart saved | cartName, itemCount |
| ORDER_CREATED | Order placed | orderId, total, itemCount |

### 3. **transaction_log**
Detailed payment and order transaction history with amounts and payment methods.

**Columns:**
- `id` (TEXT PRIMARY KEY) - Unique transaction ID (format: `txn-${timestamp}`)
- `orderId` (TEXT) - Associated order ID
- `userId` (TEXT) - Customer ID or email
- `amount` (REAL) - Transaction amount in ₹
- `paymentMethod` (TEXT) - 'upi', 'card', 'netbanking'
- `status` (TEXT) - 'pending', 'completed', 'failed'
- `timestamp` (TEXT) - ISO timestamp
- `notes` (TEXT) - Transaction notes (e.g., "Order placed", "Refund issued")

**Auto-logged when:**
- Order is placed (at checkout success)
- Order status changes (via admin update)
- Any payment-related transaction occurs

## Usage Examples

### View all logins for a user
```typescript
import { getLoginHistory } from '../services/database';
const logins = getLoginHistory(userId);
// Returns array of login events with timestamps
```

### View activity timeline for a user
```typescript
import { getActivityLog } from '../services/database';
const activities = getActivityLog(userId, 100); // Last 100 activities
// Returns array of all user activities with timestamps
```

### View transaction history
```typescript
import { getTransactionLog } from '../services/database';
const transactions = getTransactionLog(userId);
// Returns all transactions for user with amounts and payment methods
```

### Log a custom activity
```typescript
import { logActivity } from '../services/database';
logActivity(userId, 'CUSTOM_ACTION', 'Description', { customField: 'value' });
```

## Dashboard Integration

All audit logs are viewable in the **DB Console** under:
- User DB → `login_history` table
- User DB → `activity_log` table
- User DB → `transaction_log` table

Each record shows:
- **Timestamp** - When the event occurred
- **User Info** - Who performed the action
- **Action Type** - What happened
- **Details** - Contextual information (JSON format)

## Data Retention

- All audit logs are persisted to IndexedDB automatically
- Logs are included in database exports (.sqlite files)
- No automatic purging; older logs remain in the database indefinitely
- Use DB Console to delete specific audit records if needed

## Security Notes

⚠️ **Important:**
- Card details are logged as `brand` + `last4` only (never full card numbers)
- Passwords are never logged
- Sensitive information in details is sanitized before logging
- All timestamps are ISO format (UTC)

## Exporting Audit Logs

1. Go to **Admin Dashboard** → **DB Console**
2. Select **User DB**
3. Select any audit table: `login_history`, `activity_log`, or `transaction_log`
4. Click **Export** to download the entire database as `.sqlite`
5. Open in SQL browser or spreadsheet tool to analyze

## Example Queries (from DB Console)

**All logins in the last 24 hours:**
```sql
SELECT * FROM login_history 
WHERE datetime(loginTime) >= datetime('now', '-1 day')
ORDER BY loginTime DESC;
```

**All orders placed by a user:**
```sql
SELECT * FROM transaction_log 
WHERE userId = 'cust-xxxxx' AND activityType = 'ORDER_PLACED'
ORDER BY timestamp DESC;
```

**Failed login attempts:**
```sql
SELECT * FROM login_history 
WHERE status = 'failed'
ORDER BY loginTime DESC LIMIT 50;
```

## Future Enhancements

- Add IP address logging for logins
- Add geolocation tracking
- Create automated reports/dashboard
- Implement log rotation/archival policies
- Add user consent/GDPR compliance features
