# Check Refund Script

Quick CLI tool to check refund details from the database.

## Usage

```bash
node check-refund.js <REFUND_REFERENCE or REFUND_ID>
```

## Examples

### Using Refund Reference (Recommended)

```bash
node check-refund.js REF-MHVN1BG0-EST0
```

### Using MongoDB ObjectId

```bash
node check-refund.js 69142d85abe22de48abc321c
```

## Output

The script will display:

- ✅ Refund reference and ID
- 📊 Status and type
- 💰 Refund amount and percentage
- 👤 User information
- 📦 Booking details (with orderRef)
- 💳 Payment provider and status
- 📅 Timeline (created, reviewed, completed)
- 💡 Whether it can be processed

## Sample Output

```
📋 Refund Details:
────────────────────────────────────────────────────────────
Reference: REF-MHVN1BG0-EST0
ID: new ObjectId('69142d85abe22de48abc321c')
Status: completed
Type: pre_trip_cancellation
Amount: 3,944,500 VND
Percentage: 70%

👤 User: N/A
   Email: vohadong208@gmail.com

📦 Booking: TRAV-2931359431-4075
   Total: 5,750,000 VND
   Payment: momo
   Payment Status: completed

📅 Created: 2025-11-12T06:47:33.939Z
   Reviewed: 2025-11-12T06:47:45.656Z
   Completed: 2025-11-12T06:47:49.024Z

💡 Can process? ❌ NO
   Current status: completed
   Required status: approved
────────────────────────────────────────────────────────────
```

## Notes

- Script uses independent MongoDB connection (safe to run while server is running)
- Supports both refund reference (REF-XXX) and MongoDB ObjectId
- Automatically disconnects after displaying information
