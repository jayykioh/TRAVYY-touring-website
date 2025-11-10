Business rules – SWR302
Project Name:
<< Travyy – Tourism Connection and Support Platform >>

Team Members:
Đoàn Trọng Lực ,
Võ Hà Đông,
Nguyễn Vũ Hoàng,
Trần Thị Diễm Kiều,
Nguyễn Thị Quỳnh Châu

Class: SE19B06
Supervisor: ThaoHT32

ID
Rule Definition
Type of Rule
Static or Dynamic
Source
AUTHENTICATION & ACCOUNT MANAGEMENT
BR-1
Users must register with a unique email or phone number. Duplicate email/phone is not allowed.  
Constraint
Static
User Registration Policy
BR-2
Passwords must meet security requirements: minimum 8 characters, include uppercase, lowercase, number, and special character.
Constraint
Static
Security Policy
BR-3
Users can sign up via email/password, Google OAuth, or Facebook OAuth. OAuth accounts do not require password.
Fact
Dynamic
Authentication Options
BR-4
Email verification is optional but when enabled, accounts must verify email before full access. Unverified accounts have limited privileges.
Constraint
Dynamic
Account Verification Policy
BR-5
Password reset links and OTP codes must expire after 30 minutes.
Constraint
Static
Security & Privacy Policy
BR-6
Password reset links can only be used once. After use, they become invalid.
Constraint
Static
Security & Privacy Policy
BR-7
Two-Factor Authentication (2FA) is optional. When enabled, users must provide TOTP code at login.
Action Enabler
Dynamic
Authentication Process
BR-8
Users can enable/disable 2FA only after confirming with current password and 2FA confirm token.
Constraint
Dynamic
Authentication Process
BR-9
Only authenticated users can initiate sign-out. The system must clear all session data and invalidate tokens.
Action Enabler
Dynamic
Session Management
BR-10
Users must agree to Terms of Service during registration before account creation.
Constraint
Static
Legal & Compliance Policy
BR-11
Each user account is assigned exactly one role: Traveler, TourGuide, TravelAgency, or Admin. Default role is null until set.
Fact
Static
Role Management Policy
BR-12
Role-based access control (RBAC) restricts users to functionalities designated for their role.
Constraint
Static
Access Control Policy
BR-13
Only Admin can change user roles or account status (active, banned, inactive, pending).
Constraint
Static
Administration Procedure
BR-14
Banned accounts cannot log in. The system must display ban reason and contact info.
Inference
Dynamic
Account Moderation Policy
BR-15
Account deletion is soft delete. Deleted accounts enter "inactive" status and can be restored within 30 days before permanent deletion.
Action Enabler
Dynamic
Data Retention Policy
BR-16
Only account owner (or Admin with special permissions) can delete or update their profile.
Constraint
Static
Data Privacy & Ownership Policy
BR-17
Profile updates must validate all fields (email format, phone format, required fields).
Constraint
Static
Data Validation Rules
BR-18
Users can view only their own profile, except Admins who can view all profiles.
Constraint
Static
Access Control Policy
BR-19
Password changes require current password confirmation.
Constraint
Dynamic
Security Policy
BR-20
All authentication actions (login, logout, password reset, 2FA) must be logged with timestamp and IP address for audit
Computation / Logging Rule
Static
Security Audit Policy
ITINERARY MANAGEMENT
BR-21
Only authenticated users can create itineraries. Guest users can only view sample itineraries.
Constraint
Dynamic
User Access Control Policy
BR-22
Each itinerary must have a unique name per user. Duplicate itinerary names for the same user are not allowed.
Constraint
Static
Itinerary Naming Convention
BR-23
Itinerary items must include: name, location (lat/lng), itemType (poi or tour). Missing required fields cause validation error.
Constraint
Static
Data Validation Rules
BR-24
Itinerary items can be POIs (points of interest) or Tours. Tours must reference valid tourId and agency data.
Fact
Static
Data Relationship Rules
BR-25
Users can add, edit, reorder, or delete itinerary items. All changes are autosaved or saved on explicit user action.
Action Enabler
Dynamic
Itinerary Editing Process
BR-26
AI optimization is optional. When triggered, the system must call AI service to optimize route, timing, and order.
Action Enabler
Dynamic
AI Optimization Workflow
BR-27
AI optimization must preserve user's original preferences (vibes, pace, budget, duration).
Constraint
Dynamic
AI Optimization Policy
BR-28
Users can send itinerary to a tour guide. This creates a Request with status "pending".
Action Enabler
Dynamic
User–Guide Interaction Process
BR-29
Sending itinerary requires at least 1 valid item in the itinerary. Empty itineraries cannot be sent.
Constraint
Dynamic
Itinerary Submission Validation
BR-30
When itinerary is sent, the system creates a notification for the assigned guide.
Action Enabler
Dynamic
Notification System Workflow
BR-31
Users can view a list of all their itineraries. The list displays: name, zone, creation date, status.
Fact
Static
Itinerary Overview Display Rules
BR-32
Users can delete their own itineraries. Deleted itineraries are soft-deleted and can be restored within 7 days.
Action Enabler
Dynamic
Itinerary Lifecycle Policy
BR-33
Itineraries linked to active bookings cannot be deleted until booking is completed or cancelled.
Constraint
Dynamic
Booking Dependency Policy
BR-34
Itinerary data must be updated in real-time when items are added/removed/reordered.
Action Enabler
Dynamic
Real-Time Sync Process
BR-35
Itinerary preferences (vibes, pace, budget, durationDays, bestTime) must be stored and used for AI recommendations.
Fact / Computation
Dynamic
AI Recommendation Engine
GUIDE REQUEST MANAGEMENT
BR-36
Only authenticated Tour Guides can view requests sent to them.  
Constraint
Dynamic
Guide Access Control Policy
BR-37
Requests are displayed in real-time. New requests appear immediately without page refresh.
Action Enabler
Dynamic
Real-Time Notification System
BR-38
Guides can Accept or Reject requests. Both actions require confirmation modal before execution.
Action Enabler
Dynamic
Request Handling Workflow
BR-39
Only requests with status "pending" can be accepted or rejected. Requests already processed cannot be modified.
Constraint
Static
Request Status Policy
BR-40
When a guide accepts a request, the status changes to "accepted" and a notification is sent to the user.
Action Enabler
Dynamic
Guide–User Communication Process
BR-41
When a guide rejects a request, the status changes to "rejected" and a notification with reason is sent to the user
Action Enabler
Dynamic
Guide–User Communication Process
BR-42
Accepted requests may trigger creation of a booking draft or further communication flow.
Action Enabler
Dynamic
Booking Initiation Process
BR-43
Request data must include: itinerary details, user info, contact info, request timestamp.
Fact
Static
Request Data Schema
BR-44
Guides can filter requests by status (pending, accepted, rejected) and date range.
Action Enabler
Dynamic
Request Management Interface
BR-45
Request list must support pagination and infinite scroll for large datasets.  
Constraint
Static
User Interface Performance Policy
BOOKING FLOW & PAYMENT
BR-46
Only authenticated users can create bookings. Guest checkout is not allowed.
Constraint
Dynamic
Booking Access Policy
BR-47
Bookings support multiple tour items in a single order. Each item tracks: tourId, date, adults, children, prices.
Fact
Static
Booking Data Model
BR-48
Booking must validate tour availability before creation. If tour is fully booked, booking is rejected with error message.
Constraint
Dynamic
Booking Validation Process
BR-49
Booking status follows state machine: pending_payment → processing → confirmed → completed or cancelled.
Fact
Static
Booking State Transition Rules
BR-50
Booking cannot transition to "confirmed" until payment is successfully completed.
Constraint
Dynamic
Payment Confirmation Policy
BR-51
Payment providers supported: PayPal, MoMo, Cash. Provider must be specified during booking creation.  
Fact
Static
Payment Provider Policy
BR-52
PaymentSession is created for each booking. It stores: orderId, transactionId, amount, currency, status, timestamps.
Fact
Static
Payment Data Model
BR-53
Payment must be completed within expiration time (default: 15 minutes). Expired payments are auto-cancelled.
Constraint
Dynamic
Payment Expiration Policy
BR-54
Payment webhooks (from PayPal/MoMo) must verify signature before processing. Invalid signatures are rejected.
Constraint
Static
Payment Security Policy
BR-55
When payment succeeds, booking status updates to "confirmed" and confirmation email/notification is sent.
Action Enabler
Dynamic
Payment Success Workflow
BR-56
When payment fails, booking status updates to "failed" and user is notified with retry option.
Action Enabler
Dynamic
Payment Failure Workflow
BR-57
Booking original amount, discount amount, and total amount must be calculated correctly. totalAmount = originalAmount - discountAmount.
Computation
Formula: totalAmount = originalAmount − discountAmount
Dynamic
Booking Calculation Rules
BR-58
If voucher/promotion is applied, the system must validate voucher code and apply discount. Invalid vouchers are rejected.
Constraint
Dynamic
Promotion Validation Process
BR-59
Each voucher can be used once per user (unless multi-use is allowed). System must track usedPromotions in User model.  
Constraint
Static
Promotion Usage Policy
BR-60
Currency conversion (if needed) must use real-time exchange rates from trusted provider.
Computation
Formula: convertedAmount = originalAmount × exchangeRate
Dynamic
Currency Conversion Policy
BR-61
Payment transactions must be logged with full details for audit and dispute resolution.
Fact / Logging Rule

Static
Payment Audit Policy
BR-62
Refunds are processed only for confirmed bookings. Refund amount depends on cancellation policy.
Constraint
Dynamic
Refund Management Process
BR-63
Cancellation policy rules: >14 days: 90% refund, 7-14 days: 50% refund, <7 days: no refund.
Computation
Formula:
Refund Rate =
90% if daysUntilDeparture > 14
50% if 7 <= daysUntilDeparture <= 14
0% if daysUntilDeparture < 7

Refund Amount = Total Amount × Refund Rate
Static
Cancellation Policy
BR-64
Refund requests are processed manually by Admin or automatically via payment provider API.
Action Enabler
Dynamic
Refund Workflow
BR-65
Booking confirmation must generate a unique booking reference code for user tracking.
Computation
Formula:
Booking Reference = Prefix + Timestamp + RandomCode
Dynamic
Booking Identification Process
REVIEWS & RATINGS
BR-66
Only users who completed a booking can write a review for that tour.
Constraint
Dynamic
Review Eligibility Policy
BR-67
Reviews can only be submitted after the tour end date has passed.
Constraint
Dynamic
Post-Tour Review Policy
BR-68
Each user can submit one review per booking. Multiple reviews for the same booking are not allowed.
Constraint
Static
Review Submission Policy
BR-69
Review must include a rating (1-5 stars). Comment text is optional.  
Fact
Static
Review Data Schema
BR-70
Rating must be an integer between 1 and 5. Invalid ratings are rejected.
Constraint
Static
Rating Validation Rule
BR-71
Review content must be validated for inappropriate language. System may flag or auto-reject offensive content.
Action Enabler
Dynamic
Content Moderation Process
BR-72
Reviews are publicly visible on tour detail pages after submission.
Action Enabler
Dynamic
Review Display Policy
BR-73
Tour guides can view reviews related to their tours but cannot edit or delete them.
Constraint
Static
Access Control Policy
BR-74
Admin can delete reviews if they violate community guidelines. Deletion reason must be logged.
Action Enabler / Logging Rule
Dynamic
Moderation Workflow
BR-75
Average tour rating is calculated automatically from all reviews and updated in real-time.  
Computation
Formula: avgRating = (Σ all review ratings) / (total number of reviews)
Dynamic
Rating Calculation Process
PROMOTIONS & COUPONS
BR-76
Promotions must have: code, discount type (percentage or fixed), discount value, start/end dates, usage limits.
Fact
Static
Promotion Data Schema
BR-77
Coupon codes must be unique. Duplicate codes are not allowed.
Constraint
Static
Coupon Validation Rule
BR-78
Coupons can only be applied if current date is within start and end dates. Expired coupons are rejected.
Constraint
Dynamic
Promotion Validity Policy
BR-79
Minimum purchase amount (if set) must be met before coupon can be applied.
Constraint
Dynamic
Promotion Application Rule
BR-80
Coupons can be limited to specific tours, zones, or categories. System validates applicability before applying.
Constraint
Dynamic
Promotion Target Policy
BR-81
Usage limits (total uses or per-user uses) must be enforced. Exceeding limits rejects coupon.
Constraint
Static
Promotion Usage Control Policy
BR-82
When coupon is applied, discount amount is calculated and stored in booking. Original amount and total amount are tracked separately.
Computation
Formula: totalAmount = originalAmount − discountAmount
Dynamic
Discount Calculation Process
BR-83
Users can view their used promotions history in their profile.
Action Enabler
Dynamic
User Promotion History Feature
BR-84
Admin can create, edit, or deactivate promotions. Deactivated promotions cannot be used.
Action Enabler
Dynamic
Promotion Management Workflow
BR-85
System must log all coupon usage with userId, bookingId, code, and timestamp for analytics.
Fact / Logging Rule
Static
Promotion Analytics Policy
NOTIFICATIONS
BR-86
Notifications are sent in real-time to users and guides for key events (booking confirmed, request accepted, payment success, etc.).
Action Enabler
Dynamic
Notification Delivery Workflow
BR-87
Notification types: booking, payment, request, review, promotion, system alert.
Fact
Static
Notification Type Schema
BR-88
Users can view their notifications in a dedicated Notifications page.  
Action Enabler
Dynamic
User Interface / Notification Page
BR-89
Unread notifications are displayed with a badge count in the header.  
Computation
Formula: badgeCount = count(unreadNotifications)
Dynamic
UI Badge Display
BR-90
Users can mark notifications as read. Read notifications no longer count toward badge count.
Action Enabler
Dynamic
Notification Status Update Process
BR-91
Notifications can be dismissed (deleted) by the user. Dismissed notifications are soft-deleted.
Action Enabler
Dynamic
Notification Deletion Policy
BR-92
System must support notification preferences: email, in-app, push (if enabled). Users can opt-in/opt-out.  
Constraint
Dynamic
User Notification Preferences
BR-93
Notification delivery must be logged for audit. Failed deliveries should retry with exponential backoff.
Fact / Constraint
Dynamic
Notification Logging & Retry Policy
BR-94
Notifications older than 30 days are archived. Archived notifications are not displayed in main list but can be accessed via history.
Constraint
Dynamic
Notification Archival Policy
CART & WISHLIST
BR-95
Only authenticated users can add items to cart. Guest users must log in first.
Constraint
Dynamic
Cart Access Control Policy
BR-96
Cart items must reflect real-time tour availability. If tour becomes unavailable, cart item is flagged.
Constraint
Dynamic
Cart Availability Validation
BR-97
Users can add, update quantity, or remove cart items. Changes are saved immediately.
Action Enabler
Dynamic
Cart Management Workflow
BR-98
Cart must display: item details, quantity, unit price, total price per item, and grand total.
Computation
Formula:
itemTotal = unitPrice \* quantity; grandTotal = sum(itemTotal)
Dynamic
Cart Calculation
BR-99
Cart items expire after 24 hours of inactivity. Expired items are auto-removed.
Constraint / Action Enabler
Dynamic
Cart Expiration Policy
BR-100
Users can add tours to Wishlist for later viewing. Wishlist items are persistent across sessions.
Action Enabler
Dynamic
Wishlist Persistence Policy
BR-101
Wishlist items do not reserve tour availability. They are for bookmarking only.
Constraint
Static
Wishlist Availability Policy
BR-102
Users can move items from Wishlist to Cart with a single action.
Action Enabler
Dynamic
Wishlist-to-Cart Workflow
BR-103
Users can remove items from Wishlist. Removed items are deleted immediately.
Action Enabler
Dynamic
Wishlist Management Workflow
BR-104
Cart and Wishlist are user-specific. Users cannot view or modify other users' carts/wishlists.
Constraint
Static
User Data Isolation Policy
HELP CENTER
BR-105
Help articles are publicly accessible. No authentication required to view articles.
Constraint
Static
Help Center Access Policy
BR-106
Help articles are categorized by topic (Account, Booking, Payment, etc.). Category filter is required.
Fact
Static
Help Article Schema
BR-107
Users can search help articles by keyword. Search results rank by relevance.
Action Enabler / Computation
Formula:
rank = relevanceScore(keyword, articleContent)
Dynamic
Help Search Feature
BR-108
Users can provide feedback on help articles (Helpful/Not Helpful). Feedback is tracked for quality improvement.
Action Enabler
Dynamic
Help Article Feedback Tracking
BR-109
Admin can create, edit, or delete help articles. All changes are versioned and logged.
Action Enabler
Dynamic
Help Article Management Workflow
SECURITY & SESSION MANAGEMENT

BR-110
All API endpoints requiring authentication must validate JWT token in Authorization header.
Constraint
Dynamic
API Security Policy
BR-111
Expired or invalid tokens are rejected with 401 Unauthorized status.  
Constraint
Dynamic
JWT Validation Policy
BR-112
JWT tokens expire after 24 hours. Users must re-authenticate after expiration.
Constraint
Dynamic
JWT Expiration Policy
BR-113
Refresh tokens are issued for long-term sessions. Refresh tokens expire after 30 days.
Constraint
Dynamic
Refresh Token Policy
BR-114
Sensitive actions (password change, profile deletion, 2FA toggle) require current password confirmation.
Constraint
Dynamic
Sensitive Action Verification Policy
BR-115
Rate limiting is enforced on login, registration, and password reset endpoints (max 5 attempts per 15 minutes per IP).
Constraint
Dynamic
API Rate Limiting Policy
BR-116
All user inputs must be sanitized to prevent XSS, SQL injection, and other attacks.
Constraint
Dynamic
Input Validation & Security Policy
BR-117
HTTPS is required for all production traffic. HTTP requests are redirected to HTTPS.
Constraint
Static
HTTPS Enforcement Policy
BR-118
CORS policy allows only trusted frontend origins. Unauthorized origins are blocked.
Constraint
Static
CORS Security Policy
BR-119
Failed login attempts are logged. After 5 consecutive failures, account is temporarily locked for 15 minutes.
Constraint / Action Enabler
Dynamic
Login Security & Lockout Policy
ADMIN MANAGEMENT
BR-120
Only Admin role can access admin dashboard and management features.
Constraint
Static
Role-Based Access Control (RBAC) Policy
BR-121
Admin can view all user accounts with filters (role, status, registration date).  
Action Enabler
Dynamic
Admin User Management Workflow
BR-122
Admin can ban/unban user accounts. Ban action requires reason. Banned users cannot log in.
Action Enabler / Constraint
Dynamic
User Account Control Policy
BR-123
Admin can view all bookings with filters (status, date range, user, tour).
Action Enabler
Dynamic
Admin Booking Management Workflow
BR-124
Admin can manually update booking status (e.g., mark as completed, cancel, refund).
Action Enabler
Dynamic
Booking Status Management Workflow
BR-125
Admin can view and edit all tours. Tour edits include: name, description, price, availability.  
Action Enabler
Dynamic
Tour Management Workflow
BR-126
Admin can create new tours or delete existing tours. Tours linked to active bookings cannot be deleted.
Action Enabler / Constraint
Dynamic
Tour Creation & Deletion Policy
BR-127
Admin can view and delete reviews. Deletion requires reason and is logged.
Action Enabler
Dynamic
Review Management Workflow
BR-128
Admin can create, edit, or deactivate promotions. Active promotions are immediately available to users.
Action Enabler
Dynamic
Promotion Management Workflow
BR-129
Admin can view system reports: total users, total bookings, revenue, popular tours, conversion rates.
Action Enabler
Dynamic
System Reporting Feature
BR-130
Admin reports must reflect real-time data. Data is aggregated from database on demand.
Constraint / Computation
Formula: aggregatedData = queryDatabase(filters)
Dynamic
Real-Time Reporting
BR-131
Admin can create staff accounts (TourGuide, TravelAgency roles). Email must be unique.
Action Enabler / Constraint
Dynamic
Staff Account Management Policy
BR-132
Admin can delete staff accounts. Staff linked to active tours/bookings must be reassigned before deletion.
Action Enabler / Constraint
Dynamic
Staff Account Deletion Policy
BR-133
Admin can send broadcast announcements to all users or filtered groups.
Action Enabler
Dynamic
Announcement Management Workflow
BR-134
All admin actions are logged in audit trail with: adminId, action type, target entity, timestamp.
Fact / Logging Rule
Static
Admin Audit Logging Policy
BR-135
Admin can view audit logs to track system changes and user activities.
Action Enabler
Dynamic
Audit Log Viewer Feature
BR-136
Admin dashboard must display key metrics: active users, pending bookings, revenue this month, average rating.
Computation
Formula:
metrics = aggregate(database)
Dynamic
Admin Dashboard Metric
BR-137
Admin can export data (users, bookings, reviews) to CSV or Excel format.
Action Enabler
Dynamic
Data Export Feature
BR-138
Admin settings page allows configuration of: email templates, payment providers, system maintenance mode.
Action Enabler
Dynamic
Admin Settings Configuration
DATA INTEGRITY & BUSINESS LOGIC
BR-139
All database writes must validate data before saving. Invalid data is rejected with descriptive error message.
Constraint
Dynamic
Database Validation Policy
BR-140
Foreign key references (userId, tourId, bookingId) must exist in database. Referential integrity is enforced.
Constraint
Static
Referential Integrity Policy
BR-141
Soft delete is used for user-generated data (itineraries, reviews, accounts). Hard delete is only for admin-approved cleanup.
Constraint
Static
Data Deletion Policy
BR-142
All timestamps (createdAt, updatedAt) are automatically managed by database.  
Fact
Static
Timestamp Management Policy
BR-143
Concurrent updates to same entity must be handled with optimistic locking or version control.
Constraint
Dynamic
Concurrency Control Policy
BR-144
Database transactions are used for multi-step operations (booking + payment + notification). Partial failures trigger rollback.
Constraint
Dynamic
Transaction Management Policy
BR-145
Archived data (old notifications, expired carts) is moved to archive collection after retention period.
Constraint
Dynamic
Data Archival Policy
BR-146
System must support data export for GDPR compliance. Users can request full data export.
Action Enabler
Dynamic
GDPR Data Export Feature
BR-147
Personal data deletion (GDPR right to erasure) must remove all user data except anonymized audit logs.
Constraint
Dynamic
GDPR Data Erasure Policy
BR-148
System must log all data access for sensitive entities (user profiles, payment details) for security audit.
Fact / Logging Rule
Static
Data Access Logging Policy
ZONES & LOCATION MANAGEMENT
BR-149
Zones must have unique ID (string format like "hue-thien-mu"). Duplicate zone IDs are not allowed.
Constraint
Static
Zone Schema Validation
BR-150
Each zone must define center coordinates (lat, lng) and radius in meters. Missing coordinates invalidate the zone
Constraint
Static
Zone Schema Validation
BR-151
Zones can optionally define a polygon boundary (poly field) with at least 3 coordinate pairs.
Constraint
Static
Zone Polygon Policy
BR-152
Zones support semantic tags (tags, vibeKeywords) for AI recommendation and search filtering.
Fact
Static
Zone Metadata Schema
BR-153
Zones must belong to a province. Province field is required and indexed for fast lookup.
Constraint
Static
Zone-Provinces Policy
BR-154
Users can search zones by province. Results are filtered by isActive=true zones only.
Constraint / Computation
Formula:
results = filter(isActive=true)
Dynamic
Zone Search Feature
BR-155
Zone POI discovery uses Map4D API with zone center and radius. POIs are cached for 30 minutes.
Action Enabler
Dynamic
Zone POI Integration Policy
BR-156
POI search within zone supports category filtering (accommodation, food, views, activities).
Action Enabler / Constraint
Dynamic
POI Search Filtering Policy
BR-157
POI autocomplete requires minimum 2 characters query. Results are limited to 10 suggestions.
Constraint
Dynamic
POI Autocomplete Policy
BR-158
Zone details page displays: name, description, hero image, gallery, tips, best time, must-see attractions.
Action Enabler
Dynamic
Zone Details Page Feature
BR-159
Tours can be linked to multiple zones via zoneIds array. Tours appear in zone tour listings.
Action Enabler
Dynamic
Zone-Tour Linking Policy
BR-160
Zone tour listing filters by isHidden=false and sorts by usageCount descending.
Computation
Formula:
Filter: isHidden = false
Sort: usageCount DESC, createdAt DESC
Dynamic
Zone Tour Listing
BR-161
Zone priority POIs are pre-loaded for fast rendering. Priority determined by rating and scorePriority.
Computation
Formula: normalizedUsage = min(usageCount / 1000 × 100, 100)
normalizedRating = (rating / 5) × 100
normalizedReviews = min(reviewCount / 500 × 100, 100)

priorityScore =
(normalizedUsage × 0.40) +
(normalizedRating × 0.25) +
(normalizedReviews × 0.15) +
(verified ? 10 : 0) +
(featured ? 15 : 0)
Max Score = 100
Dynamic
POI Priority Computation
BR-162
Zone polygon (if defined) is used for map boundary visualization in frontend.
Action Enabler
Dynamic
Map Boundary Rendering Policy
BR-163
Zones can be deactivated (isActive=false). Deactivated zones do not appear in public listings.
Action Enabler / Constraint
Dynamic
Zone Activation Policy
BR-164
Zone search endpoint supports geocoding and reverse geocoding via Map4D integration.
Action Enabler
Dynamic
Zone Search API Feature
BR-165
POI detail fetch uses placeId and returns full details: name, address, phone, website, rating, photos.
Action Enabler
Dynamic
Zone Search API Feature
BR-166
Zone avoidTags and avoidKeywords filter out unwanted POI types from recommendations.
Constraint / Computation
Formula: exclude(tags ∈ avoidTags ∨ keywords ∈ avoidKeywords)
Dynamic
POI Recommendation Filter
BR-167
Zone bestTime field (morning/afternoon/evening/night/anytime) influences itinerary AI optimization.
Computation
Formula: adjustSchedule(bestTime)
Dynamic
Itinerary AI Optimization
BR-168
All zone API endpoints support caching with max-age 30-120 seconds for performance.
Constraint
Dynamic
API Caching Policy
BLOGS & CONTENT MANAGEMENT
BR-169
Blog posts must have unique slug. Duplicate slugs are rejected.
Constraint
Static
Blog Slug Validation
BR-170
Blog title and description are required fields. Missing fields cause validation error.
Constraint
Static
Blog Schema Validation
BR-171
Blog location (lat, lng, address) is required for map display and zone association.
Constraint
Static
Blog Schema Validation
BR-172
Blogs support structured content: activities, sightseeing, transport, hotels with names and prices.
Fact
Static
Blog Content Schema
BR-173
Blog quickInfo section includes: weather, bestSeason, duration, language, distance. All optional.
Fact
Static
Blog Metadata Schema
BR-174
Blog FAQ section stores question-answer pairs. Unlimited FAQs allowed.
Fact
Static
Blog FAQ Schema
BR-175
Blog banner image is optional but recommended. Image URL must be valid and accessible.
Constraint
Static
Blog Media Policy
BR-176
Blogs are publicly accessible. No authentication required to view blog content.
Constraint
Static
Blog Access Policy
BR-177
Blog region field associates blog with province/zone for filtering and recommendations.
Fact
Static
Blog Region Metadata
BR-178
Admin can create, edit, or delete blogs. All changes are timestamped (createdAt, updatedAt).
Action Enabler
Dynamic
Blog Management Workflow
TOUR AGENCY & TOURS MANAGEMENT
BR-179
Tours must be linked to a valid TravelAgency. AgencyId is required on tour creation.
Constraint
Dynamic
Tour Creation Validation
BR-180
Tour title, description, basePrice, and duration (days/nights) are required fields.
Constraint
Static
Tour Schema Validation
BR-181
Tour departures define: date, priceAdult, priceChild, seatsTotal, seatsLeft, status (open/closed/soldout).
Fact
Static
Tour Departure Schema
BR-182
Tour departure date must be in YYYY-MM-DD format. Invalid dates are rejected.
Constraint
Dynamic
Tour Departure Validation
BR-183
Tour seatsLeft is decremented on each booking. When seatsLeft=0, departure status becomes "soldout".
Computation
Formula:
if seatsLeft = 0 then status = 'soldout'
if seatsLeft > 0 AND status = 'soldout' then status = 'open'
Dynamic
Tour Booking Calculation
BR-184
Tours can be linked to multiple zones via zoneIds array for zone-based tour discovery.
Action Enabler
Dynamic
Tour-Zone Linking Policy
BR-185
Tours can be hidden (isHidden=true). Hidden tours do not appear in public listings.
Constraint
Dynamic
Tour Visibility Policy
BR-186
Tour itinerary is an array of objects with: part, day, title, description. Supports multi-day tours.
Fact
Static
Tour Itinerary Schema
BR-187
Tour usageCount tracks popularity. Incremented on each view/booking for ranking.
Computation
Formula:
Usage Count += 1
Last Used At = Current Timestamp
Dynamic
Tour Ranking Calculation
BR-187
Tours support tags (array of strings) for categorization and filtering.
Fact
Static
Tour Tag Schema
BR-188
Tour images are stored as imageItems array with imageUrl. First image is used as thumbnail.
Fact
Static
Tour Media Schema
BR-189
TravelAgency employees are stored as array with: name, email, phone, rating, stats, status.
Fact
Static
Agency Employee Schema
BR-190
Agency employees can have status: active, inactive, suspended. Only active employees appear publicly.
Constraint
Dynamic
Employee Visibility Policy
BR-191
Agency total field tracks aggregate statistics (total tours, revenue). Updated via analytics jobs.
Computation
Formula:
totalTours = sum(tours); revenue=sum(revenue)
Dynamic
Agency Analytics Calculation
BR-192
Agency contact info (phone, address) is required for customer inquiries.
Constraint
Static
Agency Contact Validation
BR-193
Tours are stored in separate agencyConn database for data isolation.
Fact
Static
Data Isolation Policy
BR-194
Tour locations reference Location model. Location must exist before linking to tour.
Constraint
Static
Location Reference Validation
BR-195
Tour update/delete requires agency ownership verification. Users cannot modify other agency tours.
Constraint
Dynamic
Tour Ownership Verification Policy
BR-196
Tour search filters by: zone, price range, duration, date, availability.
Computation
Formula: filter(zone, price, duration, date, availability)
Dynamic
Tour Search Filtering
BR-197
Tour detail page displays: full itinerary, agency info, reviews, availability calendar, booking button.
Action Enabler
Dynamic
Tour Detail Page Feature
TICKETS & E-TICKETS
BR-198
Tickets are generated automatically when booking is confirmed.
Action Enabler
Dynamic
Ticket Generation Workflow
BR-199
Each ticket has unique code and QR payload. Duplicate codes are not allowed.
Constraint
Static
Ticket Code Policy
BR-200
Ticket must reference valid bookingId, tourId, and userId. Foreign keys are enforced.
Constraint
Static
Ticket Foreign Key Validation
BR-201
Ticket status: issued, used, refunded. Status transitions follow business logic.
Constraint / Computation
Dynamic
Ticket Status Workflow
BR-202
Tickets can have expiration date (expiredAt). Expired tickets cannot be used.
Constraint
Dynamic
Ticket Expiration Policy
BR-203
QR code payload contains: ticketCode, bookingId, tourId, userId, timestamp. Payload is encrypted.
Computation
Formula:
QR Payload = Encrypt(ticketCode | bookingId | tourId | userId | timestamp)
Dynamic
QR Payload Generation
BR-204
Ticket scanning validates: ticket exists, status=issued, not expired, matches tour/user.
Constraint / Computation
Formula:
isValid = (status = 'issued') AND (currentDate <= expiredAt) AND (booking.status = 'paid')
Dynamic
Ticket Scanning Validation
BR-205
Once ticket is scanned/used, status changes to "used". Used tickets cannot be scanned again.
Computation
Formula:
After successful scan:
ticket.status = 'used'
scannedAt = currentTimestamp
Dynamic
Ticket Usage Update
BR-206
Refunded tickets have status="refunded". Refunded tickets are invalidated and cannot be used.
Computation
Formula:
cancellation:
status = 'refunded'
Dynamic
Ticket Refund Update
BR-207
Ticket amount and currency track payment details for accounting and refunds.
Fact
Static
Ticket Payment Details
AI & RECOMMENDATIONS

Dynamic

BR-208
AI itinerary optimization requires valid itinerary with at least 2 items.
Constraint
Dynamic
AI Input Validation
BR-209
AI optimization considers: user preferences (vibes, pace, budget), item locations, travel time.
Computation
Dynamic
AI Optimization Inputs & Rules
BR-210
AI service calls external Python AI endpoint. Timeout set to 30 seconds.
Action Enabler
Dynamic
AI Service Integration
BR-211
AI optimization returns: reordered items, travel distances, duration estimates, time slots.
Computation
Dynamic
AI Output Structure
BR-212
If AI service fails, system falls back to simple time-based ordering.
Action Enabler / Computation
Dynamic
AI Fallback Policy
BR-213
AI recommendations use zone embeddings for semantic similarity matching.
Computation
Dynamic
AI Recommendation Logic
BR-214
Zone embeddings are synced periodically from MongoDB to vector database.
Action Enabler
Dynamic
Embedding Sync Process
BR-215
POI recommendations filtered by user vibe preferences (relax, adventure, culture, nature, etc.).
Computation
Formula: filter(vibePreferences)
Dynamic
POI Recommendation Filter
BR-216
AI itinerary optimization logs are stored for analytics and model improvement.
Fact / Logging Rule
Static
AI Analytics Logging
BR-217
AI features are optional. Users can opt-out and manually arrange itinerary.
Action Enabler
Dynamic
AI Opt-Out Feature
SEARCH & DISCOVERY
BR-218
Search supports natural language parsing. System extracts location, dates, preferences from query.
Computation
Dynamic
Search NLP Parsing
BR-219
Autocomplete suggestions appear after 2 characters typed. Results cached for 5 minutes.
Constraint / Computation
Dynamic
Search Autocomplete Policy
BR-220
Search results sorted by relevance score: matching tags, rating, popularity, proximity.
Computation
Formula:
score = f(tags, rating, popularity, proximity)
Dynamic
Search Ranking Formula
BR-221
Discover endpoint parses user input and returns: zones, tours, POIs matching criteria.
Action Enabler
Dynamic
Discover API Workflow
BR-222
Search filters: price range, duration, date availability, zone, category.
Constraint
Dynamic
Search Filtering Policy
BR-223
Search results paginated with default limit=20. Max limit=100 per page.
Constraint / Computation
Dynamic
Search Pagination Policy
BR-224
Empty search query returns popular/trending tours and zones.
Computation
Dynamic
Search Default Results Policy
BR-225
Search history is tracked per user for personalized recommendations (optional feature).
Fact / Logging Rule
Dynamic
Search History Tracking
BR-226
Search analytics track: query terms, result clicks, conversion rate for optimization.
Fact / Logging Rule
Dynamic
Search Analytics Tracking
PROFILE & AVATAR MANAGEMENT
BR-227
Users can upload avatar image. Supported formats: JPEG, PNG, GIF. Max size: 5MB.
Constraint
Dynamic
Avatar Upload Policy
BR-228
Avatar stored in MongoDB as binary data (Buffer) with contentType.
Fact
Static
Avatar Storage Schema
BR-229
Users can delete their avatar. Deleted avatar reverts to default placeholder.
Action Enabler
Dynamic
Avatar Delete Workflow
BR-230
Avatar endpoint `/profile/avatar/:userId` is public for displaying user images.
Constraint
Static
Avatar Display Policy
BR-231
Profile updates (name, phone, location) require authentication. Changes are validated before saving.
Constraint / Action Enabler
Dynamic
Profile Update Validation
ADMIN ADVANCED FEATURES
BR-232
Admin can view system-wide statistics: total users, bookings, revenue, active tours.
Action Enabler
Dynamic
Admin Stats Dashboard
BR-233
Admin stats endpoint aggregates data in real-time from database.
Computation
Dynamic
Admin Real-Time Aggregation
BR-234
Admin can export reports to CSV/Excel format. Export includes filters by date range.
Action Enabler
Dynamic
Admin Report Export
BR-235
Admin can manage agency accounts: create, update, suspend, delete agencies.
Action Enabler
Dynamic
Admin Agency Management
BR-236
Admin can assign employees to agencies. Employee role and permissions are validated.
Action Enabler
Dynamic
Employee Assignment Validation
BR-237
Admin can view detailed audit logs: user actions, booking changes, payment transactions.
Fact / Logging Rule
Dynamic
Audit Log Access
BR-238
Admin can send system-wide announcements/notifications to all users or filtered groups.
Action Enabler
Dynamic
Admin Broadcast Workflow
BR-239
Admin dashboard displays real-time metrics: pending bookings, failed payments, low-stock tours.
Computation
Dynamic
Admin Dashboard Metrics Calculation
BR-240
Admin can manually override booking status for customer service escalations.
Action Enabler
Dynamic
Booking Override Workflow
BR-241
Admin actions require additional confirmation for critical operations (delete user, refund, ban).
Constraint / Action Enabler
Dynamic
Admin Critical Action Confirmation
LOCATION & GEOCODING
BR-242
Location data includes: provinces, wards with IDs and names. Used for address autocomplete.
Fact
Static
Location Data Schema
BR-243
Province/ward endpoints return structured data from Vietnamese address database.
Action Enabler
Dynamic
Location API Response
BR-244
Location coordinates (lat, lng) validated for valid ranges: lat [-90, 90], lng [-180, 180].
Constraint
Static
Coordinate Validation Policy
BR-245
Reverse geocoding converts coordinates to human-readable address via Map4D API.
Action Enabler
Dynamic
Reverse Geocoding Workflow
BR-246
Location autocomplete supports Vietnamese diacritics and partial matching.
Computation / Constraint
Dynamic
Location Autocomplete Policy
