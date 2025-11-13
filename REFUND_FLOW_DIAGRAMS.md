# Refund System Flow Diagrams

## Pre-Trip Cancellation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER JOURNEY                                │
└─────────────────────────────────────────────────────────────────────┘

1. User Access
   ┌──────────────┐
   │ Booking List │
   └──────┬───────┘
          │ Click "Request Refund"
          ▼
   ┌──────────────────┐
   │ Refund Request   │
   │ Page             │
   └──────┬───────────┘
          │
          ▼
2. System Auto-Detection
   ┌─────────────────────────────────┐
   │ Is tour date > current date?    │
   └────────┬────────────────────────┘
            │ YES
            ▼
   ┌─────────────────────────────────┐
   │ Select: Pre-Trip Cancellation   │
   └────────┬────────────────────────┘
            │
            ▼
3. Auto Calculation
   ┌─────────────────────────────────┐
   │ Calculate days before tour:     │
   │ Tour Date - Today = X days      │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Apply Cancellation Policy:      │
   │ • 30+ days    → 90% refund      │
   │ • 14-29 days  → 70% refund      │
   │ • 7-13 days   → 50% refund      │
   │ • 3-6 days    → 25% refund      │
   │ • 1-2 days    → 10% refund      │
   │ • < 1 day     → 0% refund       │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Calculate Final Amount:         │
   │ Original Amount: 10,000,000 VND │
   │ Refund %: 70% (15 days before)  │
   │ Refundable: 7,000,000 VND       │
   │ Processing Fee (2%): -140,000   │
   │ Final: 6,860,000 VND            │
   └────────┬────────────────────────┘
            │
            ▼
4. Preview & Submit
   ┌─────────────────────────────────┐
   │ Show Refund Preview to User     │
   │ [Add optional note]             │
   │ [Submit Request]                │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Status: PENDING                 │
   │ Notification sent to Admin      │
   └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────┘

1. Admin Review
   ┌─────────────────────────────────┐
   │ View Refund Request             │
   │ • User info                     │
   │ • Booking details               │
   │ • Refund calculation            │
   │ • Days before tour              │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Decision                         │
   ├─────────────┬───────────────────┤
   │ APPROVE     │ REJECT            │
   └──────┬──────┴──────┬────────────┘
          │             │
          ▼             ▼
   ┌──────────┐   ┌──────────────┐
   │ Optional │   │ Add reason   │
   │ Adjust   │   │ Status:      │
   │ Amount   │   │ REJECTED     │
   └────┬─────┘   └──────────────┘
        │
        ▼
   ┌─────────────────────────────────┐
   │ Status: APPROVED                │
   │ Add review note                 │
   └────────┬────────────────────────┘
            │
            ▼
2. Process Payment
   ┌─────────────────────────────────┐
   │ Select Refund Method:           │
   │ • Original Payment              │
   │ • Bank Transfer                 │
   │ • Wallet                        │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Status: PROCESSING              │
   │ Enter transaction ID            │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Process Refund via Gateway      │
   │ Update Booking Status           │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Status: COMPLETED               │
   │ Notification sent to User       │
   └─────────────────────────────────┘
```

## Post-Trip Issue Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER JOURNEY                                │
└─────────────────────────────────────────────────────────────────────┘

1. User Access (After Tour)
   ┌──────────────┐
   │ Booking List │
   └──────┬───────┘
          │ Click "Request Refund"
          ▼
   ┌──────────────────┐
   │ Refund Request   │
   │ Page             │
   └──────┬───────────┘
          │
          ▼
2. System Auto-Detection
   ┌─────────────────────────────────┐
   │ Is tour date < current date?    │
   └────────┬────────────────────────┘
            │ YES
            ▼
   ┌─────────────────────────────────┐
   │ Select: Post-Trip Issue         │
   └────────┬────────────────────────┘
            │
            ▼
3. Report Issue
   ┌─────────────────────────────────┐
   │ Select Issue Category:          │
   │ [ ] Service Quality             │
   │ [ ] Safety Concern              │
   │ [ ] Itinerary Deviation         │
   │ [ ] Guide Issue                 │
   │ [ ] Accommodation Problem       │
   │ [ ] Transportation Issue        │
   │ [ ] Other                       │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Select Severity:                │
   │ ( ) Minor - 20% refund          │
   │ ( ) Moderate - 40% refund       │
   │ ( ) Major - 70% refund          │
   │ (•) Critical - 100% refund      │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Describe Issue:                 │
   │ ┌─────────────────────────────┐ │
   │ │ The hotel was not as        │ │
   │ │ described in the listing... │ │
   │ └─────────────────────────────┘ │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Upload Evidence:                │
   │ [Photo 1] [Photo 2] [Document]  │
   └────────┬────────────────────────┘
            │
            ▼
4. Calculate & Preview
   ┌─────────────────────────────────┐
   │ Original Amount: 10,000,000 VND │
   │ Severity: Critical              │
   │ Refund %: 100%                  │
   │ Processing Fee: 0 VND           │
   │ Final: 10,000,000 VND           │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Status: PENDING                 │
   │ Requires Admin Review           │
   └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────┘

1. Admin Investigation
   ┌─────────────────────────────────┐
   │ View Issue Details:             │
   │ • Category                      │
   │ • Severity (suggested)          │
   │ • Description                   │
   │ • Evidence files                │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Review Evidence                 │
   │ • View photos                   │
   │ • Check documents               │
   │ • Verify claims                 │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ May Contact User for More Info  │
   └────────┬────────────────────────┘
            │
            ▼
2. Admin Decision
   ┌─────────────────────────────────┐
   │ Decision                         │
   ├─────────────┬───────────────────┤
   │ APPROVE     │ REJECT            │
   └──────┬──────┴──────┬────────────┘
          │             │
          ▼             ▼
   ┌──────────────┐   ┌──────────────┐
   │ Can adjust:  │   │ Add detailed │
   │ • Severity   │   │ reason why   │
   │ • Amount     │   │ rejected     │
   └──────┬───────┘   └──────────────┘
          │
          ▼
   ┌─────────────────────────────────┐
   │ Example Adjustment:             │
   │ User claimed: Critical (100%)   │
   │ Admin reviews: Actually Major   │
   │ Adjusted to: 70% refund         │
   └────────┬────────────────────────┘
            │
            ▼
3. Process & Complete
   Same as Pre-Trip flow
   (Status: APPROVED → PROCESSING → COMPLETED)
```

## Status Transition Diagram

```
                    ┌─────────────┐
                    │   PENDING   │ ◄── Initial state
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │                         │
              ▼                         ▼
      ┌───────────────┐        ┌──────────────┐
      │ UNDER_REVIEW  │        │  CANCELLED   │ ◄── User cancels
      └───────┬───────┘        └──────────────┘
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
┌──────────┐    ┌──────────┐
│ APPROVED │    │ REJECTED │
└────┬─────┘    └──────────┘
     │
     ▼
┌────────────┐
│ PROCESSING │
└─────┬──────┘
      │
      ▼
┌───────────┐
│ COMPLETED │ ◄── Final success state
└───────────┘
```

## Timeline Example

```
┌─────────────────────────────────────────────────────────────────┐
│ Refund Timeline - REF-ABC123                                     │
└─────────────────────────────────────────────────────────────────┘

Nov 10, 2025 10:30 AM
├─ ● PENDING
│  └─ "Refund request created" by User (John Doe)

Nov 10, 2025 02:15 PM
├─ ● UNDER_REVIEW
│  └─ "Under review by admin" by Admin (Jane Smith)

Nov 11, 2025 09:00 AM
├─ ● APPROVED
│  └─ "Approved with 70% refund. Policy applied: 14-29 days"
│     by Admin (Jane Smith)

Nov 11, 2025 10:30 AM
├─ ● PROCESSING
│  └─ "Processing refund payment via PayPal"
│     by Admin (Jane Smith)

Nov 11, 2025 11:00 AM
└─ ● COMPLETED
   └─ "Refund completed successfully. Transaction ID: TXN-789456"
      by System
```

## Database Relationships

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Booking   │◄───────│   Refund    │────────►│    User     │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │
      │                       │
      │                 ┌─────▼─────┐
      │                 │ Timeline  │
      │                 │  Entry    │
      │                 └───────────┘
      │
      ▼
┌─────────────┐
│    Tour     │
└─────────────┘
```

## Refund Statistics Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    Refund Statistics                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Total Refunds│  │   Pending    │  │  Completed   │          │
│  │     150      │  │      12      │  │     120      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Refund Amount by Type                                  │    │
│  │                                                         │    │
│  │ Pre-Trip:  ████████████████░░░░░░░░  60% (90M VND)    │    │
│  │ Post-Trip: ████████░░░░░░░░░░░░░░░░  40% (60M VND)    │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Recent Refunds                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ REF-001 | John Doe    | Pre-Trip  | 6.8M | Completed  │    │
│  │ REF-002 | Jane Smith  | Post-Trip | 10M  | Processing │    │
│  │ REF-003 | Bob Wilson  | Pre-Trip  | 4.5M | Pending    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

These diagrams show the complete flow of both refund types, status transitions,
and how everything connects together in the system.
