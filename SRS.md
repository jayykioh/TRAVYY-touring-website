Capstone Project Report
Report 3 – Software Requirement Specification
<< Travyy – Tourism Connection and Support Platform >>
Team Members:
Đoàn Trọng Lực ,
Võ Hà Đông,
Nguyễn Vũ Hoàng,
Trần Thị Diễm Kiều,
Nguyễn Thị Quỳnh Châu

Class: SE19B06
Supervisor: ThaoHT32

– DaNang, Nov 2025 –

Table of Contents
I. Record of Changes 13

1. Product Overview 15
2. User Requirements 16
   2.1 Actors 16
   2.2 Use Cases 18
   2.2.1 Diagram(s) 18
   2.2.2 Descriptions 19
   UC-04: Search Tours 26
3. Functional Requirements 52
   3.1 System Functional Overview 52
   3.1.1 Screens Flow 53
   3.1.2 Screen Descriptions 53
   3.1.3 Screen Authorization 57
4. Home & Discovery (General) 57
5. Authentication 59
6. Booking & Payment 59
7. Traveler Dashboard 60
8. Tour Guide Dashboard (Bảng điều khiển Hướng dẫn viên) 63
9. Admin Dashboard (Bảng điều khiển Quản trị viên) 63
   3.1.4 Non-Screen Functions 67
   3.1.5 Entity Relationship Diagram 72
   Entities Description 73
   3.2 Feature: User Authentication & Profile Management 75
   3.2.1 Function: User Registration 75
   3.2.2 Function: User Login 76
   3.2.3 Function: View & Update Profile 76
   3.2.4 Function: Generate Custom Itinerary 76
   3.3 Feature: Tour Browsing & Booking 77
   3.3.1 Function: Search Tours 77
   3.3.2 Function: Book Tour 77
   3.3.3 Function: View Quotation 78
   3.4 Feature: Payment & Promotions 78
   3.4.1 Function: View Promotions 78
   3.4.2 Function: Validate Promotion Code 78
   3.4.3 Function: Payment (MoMo / PayPal) 78
   3.4.4 Function: Restore Cart on Failure 78
   3.5 Feature: Review & Feedback System 78
   3.5.1 Function: Write Review 78
   3.5.2 Function: Edit / Delete Review 79
   3.5.3 Function: Like / Respond to Review 79
   3.6 Feature: Help Center & Complaint Handling 79
   3.6.1 Function: View Help Articles 79
   3.6.2 Function: Submit Feedback / Complaint 79
   3.6.3 Function: Admin Respond to Complaints 79
   3.6.4 Function: Moderate Help Content 80
   3.7 Feature: Admin Dashboard & Management 80
   3.7.1 Function: Manage Users 80
   3.7.2 Function: Manage Tours & Agencies 80
   3.7.3 Function: Manage Content (Blogs, Promotions, Help Center) 80
   3.7.4 Function: View Bookings & Statistics 81
   3.7.5 Function: Manage AI Settings 81
   3.8 Feature: AI-Powered Itinerary 81
   3.8.1 Function: Send Custom Tour Request 81
   3.8.2 Function: Receive AI-Optimized Itinerary 82
   3.8.3 Function: Re-Optimize Itinerary 82
   3.8.4 Function: Manage AI Embeddings (Admin) 82
   4.1 External Interfaces 83
   4.1.1 User Interfaces 83
   4.1.2 Hardware Interfaces 83
   4.1.3 Software Interfaces 84
   4.1.4 Communication Interfaces 85
   4.2 Quality Attributes 86
   4.2.1 Usability 86
   4.2.2 Reliability 88
   4.2.3 Performance 90
10. Requirement Appendix 94
    5.1 Business Rules 94
    AUTHENTICATION & ACCOUNT MANAGEMENT 94
    ITINERARY MANAGEMENT 95
    GUIDE REQUEST MANAGEMENT 96
    BOOKING FLOW & PAYMENT 96
    REVIEWS & RATINGS 97
    PROMOTIONS & COUPONS 98
    NOTIFICATIONS 98
    CART & WISHLIST 98
    HELP CENTER 99
    SECURITY & SESSION MANAGEMENT 99
    ADMIN MANAGEMENT 100
    DATA INTEGRITY & BUSINESS LOGIC 100
    ZONES & LOCATION MANAGEMENT 101
    BLOGS & CONTENT MANAGEMENT 102
    TOUR AGENCY & TOURS MANAGEMENT 102
    TICKETS & E-TICKETS 103
    AI & RECOMMENDATIONS 104
    SEARCH & DISCOVERY 104
    PROFILE & AVATAR MANAGEMENT 104
    ADMIN ADVANCED FEATURES 105
    5.2 Common Requirements 105
    5.3 Application Messages List 108
    5.4 Other Requirements… 114

I. Record of Changes
Date
A\*
M, D
In charge
Change Description
20/10/2025
A
Đoàn Trọng Lực, Trần Thị Diễm Kiều, Võ Hà Đông, Nguyễn Thị Quỳnh Châu

Completed the Non-Functional Requirements and Acceptance Criteria sections.
21/10/2025
A
Đoàn Trọng Lực, Trần Thị Diễm Kiều, Võ Hà Đông, Nguyễn Thị Quỳnh Châu
Standardized terminology and updated actor definitions (Traveler, Guide, Admin, Agency).
22/10/2025
A
Võ Hà Đông, Nguyễn Thị Quỳnh Châu
Added Context Diagram, Actors Description, and Use Case Diagram.
23/10/2025
D
Đoàn Trọng Lực, Nguyễn Vũ Hoàng
Removed “System Role” section from Actors Description for clarity.
25/10/2025
A
Trần Thị Diễm Kiều, Võ Hà Đông
Added Activities Flow and Business Rules.
28/10/2025
M
Nguyễn Thị Quỳnh Châu, Võ Hà Đông
Updated Screen Flow and Screen Descriptions to match current UI/UX design..
29/10/2025
A
Đoàn Trọng Lực, Nguyễn Vũ Hoàng
Added Feature and Function Descriptions for System Functional Overview.
29/10/2025
A
Nguyễn Thị Quỳnh Châu
Added Feature and Function Descriptions section for System Functional Overview.
01/11/2025
M
Nguyễn Vũ Hoàng, Võ Hà Đông
Revised and unified all toast messages for clarity and consistency across the application.
02/11/2025
M
Đoàn Trọng Lực. Trần Thị Diễm Kiều
Updated Non-Functional Requirements to reflect new performance and security targets.
02/11/2025
A
Đoàn Trọng Lực, Trần Thị Diễm Kiều, Võ Hà Đông, Nguyễn Thị Quỳnh Châu
Fixed document format and applied consistent styling throughout the report.

\*A - Added M - Modified D - Deleted

II. Software Requirement Specification

1. Product Overview
   Travyy is a Tourism Connection and Support Platform that connects Travelers, Guides, and Travel Agencies through a unified system. The platform provides AI-powered discovery, route optimization, and booking services.
   It enables travelers to explore destinations based on their preferences, generate personalized itineraries, and make secure payments. Guides can manage their profiles, accept or reject custom tour requests, and maintain availability. Travel agencies can synchronize tour data and staff information via API integration. The administrator oversees system integrity and manages the lifecycle of all user roles and data exchange.

2. User Requirements
   2.1 Actors

#

Actor
Description
1
Guest
An unauthenticated user.
Interacts with the system to:
Search/View Zones & Tours
Read Blogs
View Promotions
Initiate the Register/Login process
2
Traveler
An authenticated (logged in) user.
Has all Guest permissions, plus:
Manage profile
Use AI Discovery
Create/Manage Itineraries
Book tours
Make Payments
Submit Reviews.
3
Tour Guide
A user with a verified Tour Guide role.
Interacts with the system to:
Manage their professional profile (upload certificates)
View assigned requests/schedules.
4
Admin
A user with the highest privileges.
Manages the entire platform, including:
Manage Users (Traveler, Guide)
Create / Publish Promotions/Vouchers
View Statistics.
5
Authentication System
(System Actor) Provides services to the system.
Handles registration logic.
Authenticates login credentials (Email/Pass & OAuth).
Issues/refreshes Tokens (JWT).
6
External Agency API
(System Actor) An external system that provides information to Travyy.
Our system connects to this actor to pull real-time tour data, pricing, and availability.
7
Payment Gateway
(System Actor) An external system (e.g., Paypal, MoMo).
Provides services to process, validate, and complete transactions when a Traveler books a tour.
8
AI Microservice
(System Actor) Provides AI services.
Receives requests from the Backend (e.g., user preferences) for processing (embeddings, FAISS).
Returns results (optimized itineraries, recommended zones).
Add Ai tracking users activities

2.2 Use Cases
2.2.1 Diagram(s)

2.2.2 Descriptions
ID
Use Case
Actors
Use Case Description
UC-01
View Home Page
Guest Traveler
Users can access the system's main homepage, which displays featured zones, popular tours, latest blogs, and promotions. They can navigate to other features from here.
UC-02
Register/Sign Up
Guest,Authentication System
New users create an account by providing email, password, name, and role selection (Traveler/Tour Guide). System validates input via Authentication System and sends email verification. User can also register via Google/Facebook OAuth.
UC-03
Login
GuestTraveler,Tour Guide
Admin
Authentication System
Users sign in by providing valid credentials (email/password) or using Google/Facebook OAuth. Authentication System validates credentials and issues JWT token. Successful login grants access to role-specific features.
UC-04
Search Tours
Guest
Traveler
External Agency API
Users can search for tours by destination, date range, price range, duration, tags, or keywords. System queries tours from External Agency API and displays matching results with filters and sorting options.
UC-05
View Tour Details
Guest
Traveler
External Agency API
Users can view detailed information about a specific tour. System fetches data from External Agency API including title, description, itinerary, pricing per departure date, images, location, reviews, and real-time availability.
UC-06
Browse Zones
Guest
TravelerAI Microservice
Users can explore geographic zones/destinations with map view, polygon boundaries, zone descriptions, popular activities, best time to visit, and associated tours. AI Microservice provides semantic recommendations based on user preferences.
UC-07
View Promotions
Traveler
Users can view active promotional codes, discount details (percentage/fixed/free tour), applicable tours, validity period, and usage conditions.
UC-08
View Profile
Traveler
Tour Guide
Admin
Authenticated users view their profile information including personal details, avatar, contact info, role, account status, and activity history.
UC-09
Update Profile
Traveler
Tour Guide
Admin
Users can edit their profile information (name, phone, address, avatar), update password, and manage email verification settings.
UC-10
Book Tour
Traveler
External Agency API
Traveler selects tour(s), departure date(s), number of adults/children, reviews cart summary with pricing, applies promotional code if available, provides contact info, and confirms booking. System verifies availability with External Agency API and creates booking record with pending payment status.
UC-11
Browse Tours (Promo Version)
Traveler
External Agency API
Similar to UC-04 but displays promotional pricing and highlights discounted tours from External Agency API. Traveler can filter by tours with active promotions.
UC-12
Payment
Traveler
Payment Gateway
After booking confirmation, Traveler selects payment method (Stripe/MoMo). System creates payment session and redirects to Payment Gateway. Gateway processes payment and sends webhook confirmation. System updates booking status to "paid" and generates QR code ticket.
UC-13
Write Feedback/Review
Traveler
After completing a tour (booking status = paid), Traveler can submit a review including overall rating (1-5 stars), detailed ratings (service, location, guide, value, accommodation, transportation), title, content, and optional images. System verifies booking before allowing review. Review is auto-approved for verified bookings.
UC-14
View Quotation
TravelerAI Microservice
Traveler views detailed price breakdown for custom tour request generated by AI Microservice. Shows itemized costs, total amount, validity period, and special conditions with AI-optimized itinerary.
UC-15
Send Custom Tour Request
TravelerAI Microservice
Traveler submits a custom tour request with preferences (destination, dates, budget, group size, special requirements). AI Microservice analyzes preferences to suggest optimal zones and itinerary. Request is saved for future processing.
UC-16
Receive Quotation
TravelerAI Microservice
After AI Microservice processes custom request, Traveler receives notification and can view AI-generated quotation with recommended itinerary. Traveler can accept or request modifications for re-processing.
UC-17
Manage Content System
Admin
Admin manages platform content including creating/editing/deleting zones, blogs, promotions. Includes content approval workflow, SEO settings, and media management.
UC-18
View User Info
Admin
Admin views comprehensive information about registered users (Travelers and Tour Guides) including profile details, verification status, activity logs, booking history, review history, and account status.
UC-19
Update Users
Admin
Admin can modify user information, change roles, verify/reject guide certificates, update account status (active/banned/inactive), and add admin notes.
UC-20
Manage Rates & Permissions
Admin
Admin configures system settings including role-based permissions, rate limits, API quotas, feature flags, and access control rules for different user types.
UC-21
Manage Resorts & Facilities
Admin
Admin maintains database of resorts, hotels, and facilities linked to tours including name, location, amenities, ratings, images, and contact information.
UC-22
Moderate Supports/Complaints
Admin
Admin reviews and responds to user support tickets and complaints. Can escalate issues, update ticket status, assign to team members, and maintain resolution history.
UC-23
Review Reported Content
Admin
Admin reviews flagged content (reviews, comments, tour descriptions) reported by users. Can approve, edit, hide, or delete content. Maintains moderation audit trail.
UC-24
Respond to Complaints
Admin
Admin provides official responses to user complaints, resolves disputes between travelers, and enforces platform policies.
UC-25
Edit User / Remove Content
Admin
Admin can edit any user profile, delete inappropriate content, remove tours violating policies, and ban users for terms violations. All actions are logged.
UC-26
Sync Tour Data
External Agency API
System automatically syncs tour data from External Agency API including tour listings, real-time pricing, availability updates, and booking confirmations. Runs on scheduled intervals or triggered by webhooks.
UC-27
View Bookings
Admin
Admin views all bookings in the system with filters (status, date, amount, user). Can view customer details, payment information, and export booking reports for analysis.
UC-28
View Statistics
Admin
Admin accesses analytics dashboard showing system-wide statistics including total users, bookings, revenue trends, popular tours, zone analytics, and performance metrics. Can export reports as CSV/PDF.
UC-29
Verify Tour Guide
Admin
Tour Guide
Admin reviews Tour Guide registration requests, verifies uploaded certificates and credentials, and approves or rejects applications. Tour Guide receives notification of verification status.
UC-30
Manage AI Settings
AdminAI Microservice
Admin configures AI Microservice parameters including embedding models, FAISS index settings, recommendation algorithms, and API integration settings. Changes are synced to AI Microservice.

UC-01: View Home Page

Field
Description
Objective
Allow users to access and explore the main homepage.
Actor(s)
Guest, Traveler
Trigger
User visits the system’s homepage.
Pre-condition
System is online and accessible.
Post-condition
Homepage loaded with featured content and navigation options.

UC-02: Register / Sign Up
Field
Description
Objective
Allow new users to create an account in the system.
Actor(s)
Guest, Authentication System
Trigger
Guest clicks “Register” or “Sign Up.”
Pre-condition
User not logged in.
Post-condition
New account created, verification email sent.

UC-03: Login
Field
Description
Objective
Allow users to log in and access personalized features.
Actor(s)
Guest, Traveler, Tour Guide, Admin, Authentication System
Trigger
User clicks “Login” and enters credentials or uses OAuth.
Pre-condition
User already registered and account verified.
Post-condition
User authenticated and redirected to role-specific dashboard.

UC-04: Search Tours

Field
Description
Objective
Allow the user to search available tours by keyword, date, or destination.
Actor(s)
Guest, Traveler
Trigger
User enters search keywords or filters and clicks “Search”.
Pre-condition
System has available tour data.
Post-condition
System displays a list of matching tours.

UC-05: View Tour Details

Field
Description
Objective
Allow the user to view detailed information of a selected tour.
Actor(s)
Guest, Traveler
Trigger
User clicks a specific tour from the search results.
Pre-condition
Tour exists in the system.
Post-condition
System displays tour details successfully.

UC-06: Register / Log In

Field
Description
Objective
Allow the user to register a new account or log in to the system.
Actor(s)
Guest
Trigger
User clicks “Register” or “Login” button.
Pre-condition
None
Post-condition
User account is created or authenticated successfully.

UC-07: Book Tour
Field
Description
Objective
Allow a traveler to book a selected tour.
Actor(s)
Traveler
Trigger
User clicks “Book Now” on a tour detail page.
Pre-condition
Traveler is logged in.
Post-condition
Booking request is successfully created.

UC-08: Payment
Field
Description
Objective
Allow a traveler to make payment for a booked tour.
Actor(s)
Traveler
Trigger
User clicks “Proceed to Payment”.
Pre-condition
Booking exists and is confirmed.
Post-condition
Payment is completed and receipt is generated.

UC-09: Send Custom Tour Request
Field
Description
Objective
Allow travelers to send custom tour requests to travel agencies.
Actor(s)
Traveler
Trigger
User clicks “Request Custom Tour”.
Pre-condition
Traveler is logged in.
Post-condition
Custom tour request is submitted successfully.

UC-10: Receive Quotation
Field
Description
Objective
Allow travelers to receive and view quotations from travel agencies.
Actor(s)
Traveler
Trigger
System sends notification of quotation received.
Pre-condition
Traveler has submitted a custom tour request.
Post-condition
Traveler receives quotation successfully.

UC-11: View Profile
Field
Description
Objective
Allow the traveler to view their profile information.
Actor(s)
Traveler
Trigger
User clicks “My Profile”.
Pre-condition
Traveler is logged in.
Post-condition
Profile information is displayed.

UC-12: Update Profile
Field
Description
Objective
Allow travelers to update personal information.
Actor(s)
Traveler
Trigger
User clicks “Edit Profile” and submits new info.
Pre-condition
Traveler is logged in.
Post-condition
Profile information is updated successfully.

UC-13: Write Feedback
Field
Description
Objective
Allow travelers to write feedback after completing a tour.
Actor(s)
Traveler
Trigger
User clicks “Write Feedback” on completed booking.
Pre-condition
Traveler has a completed booking.
Post-condition
Feedback is submitted and stored successfully.

UC-14: View Quotation
Field
Description
Objective
Allow the traveler to view the AI-generated quotation for a custom tour.
Actor(s)
Traveler, AI Microservice
Trigger
Traveler opens the “Quotation” section.
Pre-condition
Traveler has already submitted a custom request.
Post-condition
Quotation details are displayed successfully.

UC-15: Send Custom Tour Request
Field
Description
Objective
Allow the traveler to submit a personalized tour request for AI processing.
Actor(s)
Traveler, AI Microservice
Trigger
User clicks “Create Custom Tour Request.”
Pre-condition
Traveler is logged in.
Post-condition
Custom request is saved and sent to AI Microservice.

UC-16: Receive Quotation
Field
Description
Objective
Allow the system to deliver the generated quotation from the AI Microservice to the traveler.
Actor(s)
Traveler, AI Microservice
Trigger
AI Microservice completes quotation generation.
Pre-condition
Traveler has an active custom request.
Post-condition
Traveler receives notification and can view the AI quotation.

UC-17: Manage Content System
Field
Description
Objective
Enable the Admin to manage system content such as zones, blogs, and promotions.
Actor(s)
Admin
Trigger
Admin accesses the content management panel.
Pre-condition
Admin is logged in with content permissions.
Post-condition
Content is successfully created, updated, or deleted.

UC-18: View User Info
Field
Description
Objective
Allow the Admin to view detailed information of users.
Actor(s)
Admin
Trigger
Admin opens “User Management” section.
Pre-condition
Admin is authenticated.
Post-condition
User information is displayed successfully.

UC-19: Update Users
Field
Description
Objective
Allow the Admin to modify user data or status.
Actor(s)
Admin
Trigger
Admin selects “Edit User.”
Pre-condition
User exists and Admin is authorized.
Post-condition
User information is updated.

UC-20: Manage Rates & Permissions
Field
Description
Objective
Allow the Admin to manage role-based permissions and rate limits.
Actor(s)
Admin
Trigger
Admin opens “System Settings.”
Pre-condition
Admin has system-level privileges.
Post-condition
Permissions and rate settings are saved.

UC-21: Manage Resorts & Facilities
Field
Description
Objective
Allow Admins to manage information about resorts and facilities.
Actor(s)
Admin
Trigger
Admin accesses “Resort Management.”
Pre-condition
Admin is authenticated.
Post-condition
Resort or facility details are updated.

UC-22: Moderate Supports / Complaints
Field
Description
Objective
Allow the Admin to moderate user complaints or support tickets.
Actor(s)
Admin
Trigger
Admin opens “Support Tickets.”
Pre-condition
Complaint exists in the system.
Post-condition
Ticket is reviewed and updated.

UC-23: Review Reported Content
Field
Description
Objective
Allow Admins to review and handle reported content.
Actor(s)
Admin
Trigger
Admin opens “Reported Content.”
Pre-condition
There are flagged items in the system.
Post-condition
Content is approved, hidden, or deleted.

UC-24: Respond to Complaints

Field
Description
Objective
Allow Admin to respond to user complaints and resolve disputes.
Actor(s)
Admin
Trigger
Admin opens the “User Complaints” section.
Pre-condition
User complaints exist in the system.
Post-condition
Complaint resolved, response logged, and user notified.

UC-25: Edit User / Remove Content
Field
Description
Objective
Allow Admin to edit user profiles, delete inappropriate content, or ban users.
Actor(s)
Admin
Trigger
Admin selects “User Management” or “Content Moderation.”
Pre-condition
Admin has edit and moderation privileges.
Post-condition
User/content updated, deleted, or banned; actions logged.

UC-26: Sync Tour Data
Field
Description
Objective
Automatically synchronize tour data from External Agency API.
Actor(s)
External Agency API
Trigger
Scheduled sync or webhook event.
Pre-condition
API credentials are configured.
Post-condition
Tour data updated in the system database.

UC-27: View Bookings
Field
Description
Objective
Allow Admin to view and analyze all bookings.
Actor(s)
Admin
Trigger
Admin opens “Booking Management.”
Pre-condition
Bookings exist in the system.
Post-condition
Bookings viewed or exported for reporting.

UC-28: View Statistics
Field
Description
Objective
Allow Admin to view system-wide analytics and export reports.
Actor(s)
Admin
Trigger
Admin opens “Analytics Dashboard.”
Pre-condition
System data is available for analysis.
Post-condition
Reports displayed or exported successfully.

UC-29: Verify Tour Guide
Field
Description
Objective
Allow Admin to verify Tour Guide credentials and notify results.
Actor(s)
Admin, Tour Guide
Trigger
Tour Guide submits verification request.
Pre-condition
Tour Guide uploaded certificates.
Post-condition
Application approved or rejected; notification sent.

UC-30: Manage AI Settings

Field
Description
Objective
Allow Admin to configure AI Microservice parameters.
Actor(s)
Admin, AI Microservice
Trigger
Admin opens “AI Configuration.”
Pre-condition
AI Microservice is connected and running.
Post-condition
Settings updated and synced to AI Microservice.

3. Functional Requirements
   3.1 System Functional Overview
   [Provide functionality overview of software system: screen flow, screen descriptions, system user roles, screen authorization, non-screen functions, ERD]
   The Travyy Platform is designed as an integrated tourism connector that links Travelers, Guides, and Travel Agencies through a unified web system. The platform combines intelligent discovery, itinerary generation, booking management, and external API connectivity to create a seamless travel planning experience.
   The system provides both frontend user interfaces and backend operational services. Users access different functional modules depending on their roles, while external systems communicate through secure APIs.

3.1.1 Screens Flow
[This part shows the system screens and the relationship among screens. You can draw the Screens Flow for the system in the form of diagram as below. Please note that beside the normal flat screen, we might have the oval notation for pop-up screen (Import Order) or a screen with multiple information tab (Order Details), etc. You may also use text or background format for different visuality purpose]

3.1.2 Screen Descriptions

#

Feature
Screen
Description
1
Home & Discovery
Landing/Homepage
Main entry point displaying hero section, featured zones, popular tours, latest blogs, active promotions, and navigation menu. Public access.
2
Home & Discovery
Tour Search Results
Displays list of tours matching search criteria with filters (destination, date, price, duration, tags), sorting options, and pagination. Shows tour cards with image, title, price, rating, location.
3
Home & Discovery
Tour Details
Comprehensive tour information including title, description, itinerary by day, departure dates with pricing, gallery, location map, reviews, availability, and booking button. Fetches real-time data from External Agency API.
4
Home & Discovery
Browse Zones Map
Interactive map showing geographic zones with polygon boundaries, zone descriptions, popular activities, best time to visit. AI-powered semantic search for zone recommendations.
5
Home & Discovery
Zone Details
Detailed information about a specific zone including description, coordinates, associated tours, activities, images, and statistics.
6
Home & Discovery
Promotions List
Displays all active promotional codes with discount details (percentage/fixed/free tour), applicable tours, validity period, usage conditions, and usage limits.
7
Home & Discovery
Blog List
List of published blog posts with featured image, title, excerpt, author, publish date, tags, and read more link. Supports pagination and filtering by tags.
8
Home & Discovery
Blog Details
Full blog post content with images, author info, publish date, tags, related posts, and social sharing options.
9
Authentication
Login/Register
Combined authentication screen with tabs for login (email/password, Google OAuth, Facebook OAuth) and registration (email, password, name, phone, role selection). Supports 2FA for login.
10
Authentication
Forgot Password (Modal)
Pop-up form to request password reset link via email.
11
Authentication
Reset Password
Screen to set new password after clicking reset link from email.
12
Authentication
Email Verification
Screen shown after registration prompting user to verify email. Displays status of verification.
13
Booking & Payment
Booking Cart
Shopping cart showing selected tours, departure dates, number of passengers (adults/children), subtotal, discount input field, total amount, and proceed to checkout button.
1L
Booking & Payment
Checkout Form
Form collecting contact information (name, email, phone), special requests, promotional code input, pricing summary, and confirm booking button.
15
Booking & Payment
Payment Gateway
Integrated payment interface showing payment options (PayPal, MoMo), total amount, order reference, and payment buttons. Redirects to external payment provider.
16
Booking & Payment
Booking Success
Confirmation screen displaying booking reference number, QR code, booking details, payment receipt, and download ticket button. Email sent automatically.
17
Traveler Dashboard
Traveler Dashboard
Personal dashboard showing overview statistics (total bookings, upcoming tours, past tours), quick links to bookings, reviews, profile, and AI discovery.
18
Traveler Dashboard
My Bookings
List of all user bookings with filters (status, date) showing order reference, tour name, date, passengers, amount, status, and action buttons (view, cancel, write review).
19
Traveler Dashboard
Booking Details
Detailed view of a specific booking including tour information, departure date, passengers, contact info, payment details, booking timeline, QR code, and cancel button (if eligible).
20
Traveler Dashboard
My Profile
User profile information display including name, email, phone, address, avatar, role, account status, registration date, and edit button.
21
Traveler Dashboard
Edit Profile
Form to update user information: name, phone, address, avatar upload, language preference, and save button.
22
Traveler Dashboard
Change Password
Form with current password, new password, confirm password fields, and password strength indicator.
23
Traveler Dashboard
2FA Settings
Enable/disable two-factor authentication, view TOTP QR code, backup codes, and test 2FA functionality.
24
Traveler Dashboard
Write Review (Modal)
Pop-up form to submit tour review including overall rating (1-5 stars), detailed ratings (service, location, guide, value, accommodation, transportation), title, content, photo upload, anonymous option, and submit button. Only for completed bookings.
25
Traveler Dashboard
My Reviews
List of reviews written by user showing tour name, rating, date, content preview, status, and edit/delete buttons.
26
Traveler Dashboard
Edit Review (Modal)
Pop-up form to edit existing review with same fields as write review.
27
Traveler Dashboard
AI Discovery
AI-powered tour discovery interface where users input preferences (destination, dates, budget, group size, interests) and receive personalized zone recommendations and itinerary suggestions from AI Microservice.
28
Traveler Dashboard
Custom Tour Request
Form to submit custom tour request with detailed preferences. AI analyzes and suggests optimal zones/itinerary. Saved for future reference.
29
Traveler Dashboard
View Quotation
Display AI-generated quotation for custom tour request showing itemized costs, total amount, validity period, AI-optimized itinerary, and accept/modify buttons.
30
Tour Guide Dashboard
Tour Guide Dashboard
Dashboard for verified tour guides showing profile verification status, uploaded certificates, upcoming assignments, and profile management links.
31
Tour Guide Dashboard
Guide Profile
Display tour guide professional profile including name, bio, certifications, languages, experience, ratings, and certificate uploads.
32
Tour Guide Dashboard
Upload Certificates (Modal)
Pop-up form to upload professional certificates (PDF/JPG) for admin verification.
33
Tour Guide Dashboard
My Assignments
List of assigned tours showing tour name, dates, group size, status, and contact information.
34
Admin Dashboard
Admin Dashboard
Central admin control panel showing system-wide statistics (total users, bookings, revenue, active tours), recent activities, and navigation to all admin features.
35
Admin Dashboard
Manage Users
Searchable, filterable table of all users (Travelers, Tour Guides) with columns: name, email, role, status, registration date, and action buttons (view, edit, ban, delete).
36
Admin Dashboard
User Details
Comprehensive user information including profile details, verification status, activity logs, booking history, review history, login history, and admin notes.
37
Admin Dashboard
Ban/Activate User (Modal)
Pop-up form to ban or activate user account with reason field and confirmation.
38
Admin Dashboard
Manage Content - Zones
List of geographic zones with add/edit/delete functionality. Form includes zone name, description, coordinates (polygon), images, tags, and status.
39
Admin Dashboard
Manage Content - Blogs
Blog post management with WYSIWYG editor, featured image upload, SEO settings (title, description, keywords), tags, publish date, and status (draft/published).
40
Admin Dashboard
Manage Content - Promotions
Create/edit promotional campaigns with code, discount type (percentage/fixed/free tour), discount value, applicable tours, min order value, usage limits, validity dates, and status.
41
Admin Dashboard
Manage Resorts & Facilities
Database of accommodations with name, location, amenities, ratings, images, contact info, and link to tours.
42
Admin Dashboard
View Statistics
Analytics dashboard with charts and graphs showing booking trends, revenue analysis, popular tours, zone analytics, user growth, seasonal performance, and export functionality.
43
Admin Dashboard
View All Bookings
Comprehensive booking list with advanced filters (status, date range, amount, user) showing all system bookings with payment info and export options.
44
Admin Dashboard
Booking Reports
Generate and download reports (CSV/PDF) for bookings, revenue, user statistics, tour performance with custom date ranges and filters.
45
Admin Dashboard
Moderate Reviews
List of reported/flagged reviews with original content, report reason, reporter info, and actions (approve, edit, hide, delete) maintaining audit trail.
46
Admin Dashboard
Support Tickets
User support ticket management showing ticket ID, user, subject, status, priority, date, and response functionality.
47
Admin Dashboard
Manage Permissions
Configure role-based permissions, rate limits, API quotas, feature flags, and access control rules for different user types.
48
Admin Dashboard
AI Settings
Configure AI Microservice parameters: embedding models, FAISS index settings, recommendation algorithms, sync intervals, and API integration settings.
49
Common
404 Error Page
User-friendly error page for not found resources with navigation links back to homepage.
50
Common
500 Error Page
Server error page with message and support contact information.
51
Common
Maintenance Page
Displayed during scheduled maintenance with expected restoration time.

3.1.3 Screen Authorization

1. Home & Discovery (General)
   Screen / Action
   Guest
   Traveler
   Tour Guide
   Admin
   Landing/Homepage
   X
   X

-
- Tour Search Results
- X
-
- Tour Details
  X
  X
-
- Browse Zones Map
- X
-
- Zone Details
- X
  X
  X
  Promotions List
- X
- X
  Blog List
  X
  X
-
- Blog Details
  X
  X
-
-

2. Authentication

Screen / Action
Guest
Traveler
Tour Guide
Admin
Login/Register
X
X
X
X
Forgot Password

- X
-
- Reset Password
- X
  X
  X

3. Booking & Payment

Screen / Action
Guest
Traveler
Tour Guide
Admin
Booking Cart

- X
-
- • Add to Cart
- X
-
- • Remove from Cart
- X
-
- • Update Quantity
- X
-
- • Apply Promotion Code
- X
-
- Checkout Form
- X
-
- • Enter Contact Info
- X
-
- • Confirm Booking
- X
-
- Payment Gateway
- X
-
- • Process Payment
- X
-
- Booking Success
- X
-
- • Download Ticket
- X
-
-

4. Traveler Dashboard
   Screen / Action
   Guest
   Traveler
   Tour Guide
   Admin
   Traveler Dashboard

- X
-
- My Bookings
- X
-
- • View Own Bookings
- X
-
- • Cancel Booking
- X
-
- • Download Invoice
- X
-
- Booking Details
- X
-
- • View Own Booking Details
- X
-
- My Profile
- X
  X
  X
  • View Own Profile
- X
  X
  X
  Edit Profile
- X
  X
  X
  • Update Own Profile
- X
  X
  X
  • Upload Avatar
- X
  X
  X
  Change Password
- X
  X
  X
  2FA Settings
- X
  X
  X
  • Enable/Disable 2FA
- X
  X
  X
  Write Review
- X
-
- • Submit Review
- X
-
- • Upload Review Images
- X
-
- My Reviews
- X
-
- • View Own Reviews
- X
-
- • Edit Own Reviews
- X
-
- • Delete Own Reviews
- X
-
- AI Discovery
- X
-
- • Input Preferences
- X
-
- • Get Recommendations
- X
-
- Custom Tour Request
- X
-
- • Submit Request
- X
-
- View Quotation
- X
-
- • Accept Quotation
- X
-
- • Request Modifications
- X
-
-

5. Tour Guide Dashboard (Bảng điều khiển Hướng dẫn viên)

Screen / Action
Guest
Traveler
Tour Guide
Admin
Tour Guide Dashboard

-
- X
- Guide Profile
-
- X
- • View Own Profile
-
- X
- • Edit Own Profile
-
- X
- Upload Certificates
-
- X
- My Assignments
-
- X
- • View Own Assignments
-
- X
-

6. Admin Dashboard (Bảng điều khiển Quản trị viên)

Screen / Action
Guest
Traveler
Tour Guide
Admin
Admin Dashboard

-
-
- X
  • View System Statistics
-
-
- X
  Manage Users
-
-
- X
  • View All Users
-
-
- X
  • Search/Filter Users
-
-
- X
  • View User Details
-
-
- X
  • Edit Any User
-
-
- X
  • Ban/Activate Users
-
-
- X
  • Delete Users
-
-
- X
  Manage Content - Promotions
-
-
- X
  • Create Promotion
-
-
- X
  • Edit Promotion
-
-
- X
  Delete Promotion
-
-
- X
  Activate/Deactivate Promotion
-
-
- X
  View Statistics
-
-
- X
  • View All Analytics
-
-
- X
  • Export Reports
-
-
- X
  View All Bookings
-
-
- X
  • View All System Bookings
-
-
- X
  • Filter/Search Bookings
-
-
- X
  • Export Booking Data
-
-
- X
  Moderate Reviews
-
-
- X
  • View Reported Reviews
-
-
- X
  • Approve/Reject Reviews
-
-
- X
  • Edit Any Review
-
-
- X
  • Delete Any Review
-
-
- X
  Support Tickets
-
-
- X
  • View All Tickets
-
-
- X
  • Respond to Tickets
-
-
- X
  • Close/Escalate Tickets
-
-
- X

  3.1.4 Non-Screen Functions

#

Feature
System Function
Description
1
External API Integration
Tour Data Sync
Type: Cron Job
Frequency: Every 30 minutes
Purpose: Synchronizes tour listings, pricing, and availability from External Agency API to local cache
Process: Calls External Agency API endpoints, validates data, updates MongoDB collections, handles errors with retry logic
Triggers: Scheduled cron job + manual admin trigger
Logging: All sync operations logged with timestamp and status
2
External API Integration
Real-time Availability Check
Type: API Service
Trigger: On-demand when user views tour details or attempts booking
Purpose: Fetches real-time seat availability from External Agency API
Process: Calls GET /availability/{tourId}, caches result for 5 minutes, returns availability statusPerformance: < 500ms response time
Fallback: Uses cached data if API unavailable
3
External API Integration
Booking Confirmation Service
Type: API Service
Trigger: After successful payment
Purpose: Sends booking confirmation to External Agency API
Process: POST booking data, receives confirmation, updates local booking status, handles webhooks
Retry: 3 attempts with exponential backoff
Notification: Admin alerted on failure
4
Payment Processing
Payment Webhook Handler
Type: API Endpoint
Routes: /api/payments/paypal/webhook, /api/payments/momo/ipn
Purpose: Receives payment notifications from Payment Gateways
Process: Verifies webhook signature, validates payment status, updates booking, generates QR code, sends confirmation email
Security: HMAC signature verification
Logging: All webhook events logged
5
Payment Processing
Payment Status Poller
Type: Cron Job
Frequency: Every 5 minutes
Purpose: Checks pending payments that haven't received webhook
Process: Queries Payment Gateway API for payment status, updates bookings
Timeout: Marks as expired after 30 minutes
Cleanup: Archives old pending payments after 24 hours
6
Payment Processing
Refund Processing Service
Type: API Service
Trigger: Admin/system-initiated refund request
Purpose: Processes refunds through Payment Gateway
Process: Validates refund eligibility, calls Payment Gateway refund API, updates booking status, sends notification
Rules: Full refund if > 7 days before tour, 50% if 3-7 days, no refund if < 3 days
7
AI/ML Services
AI Zone Embedding Generator
Type: Batch Job
Frequency: Daily at 2:00 AM + on-demand
Purpose: Generates embeddings for zones using Vietnamese text embedding model
Process: Extracts zone descriptions, calls AI Microservice, stores embeddings in FAISS index
Model: HuggingFace Vietnamese embedding model
Performance: ~1000 zones processed in 10 minutes
8
AI/ML Services
Custom Tour Recommendation Engine
Type: API Service
Trigger: User submits custom tour request
Purpose: Analyzes user preferences and recommends optimal zones/itinerary
Process: Converts preferences to embeddings, performs FAISS similarity search, ranks results, generates itinerary
Response Time: < 3 secondsCaching: Results cached for 1 hour per unique request
9
AI/ML Services
AI Quotation Generator
Type: API Service
Trigger: After custom tour request analyzed
Purpose: Generates detailed cost quotation for custom itinerary
Process: Calculates costs based on zones, duration, group size, applies pricing rules, generates PDF
Output: Itemized quotation with total, validity period, terms
10
Email Services
Email Queue Processor
Type: Background Job
Frequency: Continuous (processes queue every 10 seconds)
Purpose: Sends queued emails asynchronously
Process: Reads from email queue, sends via SMTP, retries on failure, logs results
Rate Limit: 500 emails per hour
Templates: Verification, booking confirmation, password reset, notifications
11
Email Services
Booking Reminder Scheduler
Type: Cron Job
Frequency: Daily at 8:00 AM
Purpose: Sends reminder emails for upcoming tours
Process: Queries bookings with tour date in 3 days, sends reminder with details and QR code
Personalization: Includes traveler name, tour details, weather forecast
12
Email Services
Review Request Sender
Type: Cron Job
Frequency: Daily at 10:00 AM
Purpose: Requests reviews from travelers after tour completion
Process: Queries bookings completed 1 day ago without review, sends personalized review request
Link: Direct link to write review form
13
Notifications
Real-time Notification Service
Type: WebSocket Service (Optional)
Technology: Socket.ioPurpose: Pushes real-time notifications to connected users
Events: Booking confirmation, payment success, review response, tour guide assignment, admin actions
Fallback: Email notification if user offline
14
Notifications
Push Notification Dispatcher
Type: API Service
Trigger: Various system events
Purpose: Creates and dispatches notifications to usersProcess: Validates recipient, formats message, stores in DB, sends via WebSocket/email
Types: Info, warning, error, successRetention: 30 days
15
Database Maintenance
Database Backup Job
Type: Cron Job
Frequency: Daily at 3:00 AM
Purpose: Creates full backup of MongoDB databases
Process: Uses mongodump, compresses backup, uploads to cloud storage (S3/Azure Blob)
Retention: 30 days rollingVerification: Tests restore on backup
16
Database Maintenance
Database Indexing Optimizer
Type: Cron Job
Frequency: Weekly on Sunday at 4:00 AM
Purpose: Analyzes query patterns and optimizes database indexes
Process: Reviews slow query logs, suggests index improvements, rebuilds fragmented indexes
Alert: Notifies admin of recommendations
17
Database Maintenance
Old Data Archiver
Type: Cron Job
Frequency: Monthly on 1st at 2:00 AM
Purpose: Archives old completed bookings and logs
Process: Moves bookings older than 2 years to archive collection, compresses logs older than 3 months
Retention: Archive for 5 years
18
Security
Session Cleanup Service
Type: Cron Job
Frequency: Every hour
Purpose: Removes expired sessions and tokens
Process: Deletes expired JWT refresh tokens, clears Redis session cache, removes old password reset tokensPerformance: < 1 second execution
19
Security
Rate Limiter Service
Type: Middleware
Purpose: Prevents API abuse and DDoS attacks
Process: Tracks requests per IP, enforces rate limits (100 req/min), blocks excessive requestsRules: Login (5/15min), Register (3/hour), API (100/min), Payment (10/min)Storage: Redis for fast lookups
20
Security
Suspicious Activity Monitor
Type: Background Service
Frequency: Continuous
Purpose: Detects and alerts on suspicious user activities
Patterns: Multiple failed logins, unusual booking patterns, API abuse, SQL injection attempts
Action: Auto-locks account, alerts admin, logs incident
21
Analytics
Statistics Aggregator
Type: Cron Job
Frequency: Every 15 minutes
Purpose: Pre-calculates statistics for admin dashboard
Process: Aggregates booking count, revenue, popular tours, user growth
Storage: Cached in Redis for fast dashboard loading
Metrics: Daily, weekly, monthly, yearly
22
Analytics
Tour Performance Analyzer
Type: Cron Job
Frequency: Daily at 1:00 AM
Purpose: Analyzes tour performance metrics
Process: Calculates conversion rate, revenue per tour, booking trends, seasonal patterns
Output: Report stored in MongoDB, visualized in admin dashboard
23
Analytics
User Behavior Tracker
Type: API Middleware
Purpose: Tracks user interactions for analytics
Process: Logs page views, search queries, booking funnel, abandoned carts
Privacy: Anonymized data, GDPR compliantStorage: MongoDB with TTL index (90 days)
24
Cache Management
Redis Cache Warmer
Type: Cron Job
Frequency: Every 5 minutes
Purpose: Pre-loads frequently accessed data into Redis
Data: Homepage content, popular tours, active promotions
TTL: Homepage (5min), Tours (10min), Zones (1hr)
25
Cache Management
Cache Invalidation Service
Type: API Service
Trigger: Data update events
Purpose: Invalidates stale cache when data changes
Process: Listens to data change events, clears related cache keys
Pattern: Uses cache tags for efficient invalidation
26
File Management
Image Optimization Service
Type: API Service
Trigger: Image upload
Purpose: Optimizes uploaded images for web
Process: Resizes to multiple sizes (thumbnail, medium, large), converts to WebP, compresses, uploads to CDNLimits: Max 5MB per image, supports JPG/PNGCDN: Cloudflare or AWS CloudFront
27
File Management
QR Code Generator
Type: API Service
Trigger: Successful booking payment
Purpose: Generates unique QR code for booking verification
Process: Creates QR code with booking reference, embeds in ticket PDF
Format: PNG, 300x300px
Data: Order ref, traveler name, tour details, verification URL
28
File Management
Report Generator
Type: API Service
Trigger: Admin/agency report request
Purpose: Generates CSV/PDF reports
Types: Booking reports, revenue reports, user statistics, tour performance
Process: Queries data, formats into CSV/PDF, stores temporarily, returns download linkCleanup: Auto-delete after 24 hours
29
Health Monitoring
Health Check Endpoint
Type: API Endpoint
Route: /api/health
Purpose: Provides system health status for monitoring
Checks: Database connection, Redis connection, External API availability, disk space, memory usage
Response: JSON with status and metricsUsed By: Load balancer, monitoring tools
30
Health Monitoring
Error Logger Service
Type: Background Service
Purpose: Centralized error logging and reporting
Process: Captures all application errors, logs to MongoDB with stack trace, sends critical errors to admin
Integration: Sentry or custom logging service
Retention: 90 days

3.1.5 Entity Relationship Diagram

Entities Description

#

Entity
Description
1
User
Represents a registered user in the system. Stores authentication information (email, password, role), personal details (name, phone, avatar, location), and account status (active, banned, pending). Each user can make bookings, write reviews, manage itineraries, and receive notifications.
2
TravelAgency
Represents a travel agency that publishes tours. Includes agency contact info, address, and a list of employees who are linked to user accounts.
3
Tour
Contains information about a travel tour including title, description, pricing, duration, departure schedules, and linked zones/locations. Each tour belongs to a TravelAgency.
4
Zone
Represents a geographic area (e.g., Da Nang, Hue, Phong Nha) that groups related tours. Contains coordinates, polygon boundaries, description, and tags to describe the travel vibe and recommended activities.
5
Booking
Records user bookings for one or multiple tours. Includes customer contact info, selected tours, applied promotions, payment details, total amount, and booking status (pending/confirmed/paid/refunded).
6
PaymentSession
Stores transaction session information for payments (MoMo, PayPal, etc.). Used to track payment status (pending, paid, failed, expired). Linked to a user and related tours.
7
Promotion
Defines discount campaigns with code, discount type (fixed/percentage), value, usage limit, start/end dates, and creator (user/admin). Applied in bookings and tracked via user’s used promotions.
8
Cart
Temporary storage of tours that the user intends to book. Each cart belongs to one user and contains multiple cart items.
9
CartItem
Represents a single tour item in a cart, including selected date, number of adults/children, and snapshot pricing.
10
Review
User-generated feedback for tours they have booked. Includes rating, text content, images, and moderation status. Linked to user, tour, and booking.
11
Itinerary
Represents a custom trip plan created by a user (optionally AI-assisted). Contains travel preferences, selected tours, zones, and optimized routes.
12
Notification
Stores notifications sent to users (e.g., booking confirmation, payment success, password reset). Contains title, message, type, and status.
13
Wishlist
Stores tours that a user has favorited for future booking. Each record is unique per (user, tour).
14
Location
Contains city or region info linked to tours (latitude, longitude, region, country). Used for mapping and filtering tours by region.
15
Blog
Stores travel blogs and articles about destinations, tips, and activities. Each blog has title, content, region, and metadata.
16
Help Article
Stores help center content (FAQs, guides, tutorials). Each article has category, content, tags, and publication status.
17
Help Feedback
Captures user feedback on help articles, including helpful flag, comment, and support resolution status.

3.2 Feature: User Authentication & Profile Management
3.2.1 Function: User Registration
Function Trigger:
Navigation: Home Page → Sign Up

Triggered when a Guest clicks the “Register” button.

Can also be initiated via OAuth (Google/Facebook).

Function Description:
Actors: Guest, Authentication System

Purpose: Allows new users to create accounts to access booking, wishlist, and payment features.

Interface: Registration form (Name, Email, Password, Confirm Password, Phone).

Backend: POST /api/auth/register with MongoDB validation and bcrypt hashing.

Data Processing: Check duplicates, validate password ≥ 8 chars, hash password, send verification email, optionally create temporary JWT.

Function Details:
Normal Flow: Valid data → account created → verification email sent → redirect to login.

Abnormal Flow: Duplicate email → “Email already used.”; invalid input → highlight fields; server error → generic toast.

3.2.2 Function: User Login
Function Trigger: Home Page → Login / auto-refresh token.
Function Description:
Actors: Guest, Traveler, Tour Guide, Admin, Authentication System

Purpose: Authenticate users and issue JWT access/refresh tokens for role-based access.

Interface: Login form (email, password) + social logins.

Backend: POST /api/auth/login validates credentials, status, and creates tokens.

Function Details:
Normal: Valid login → redirect to Home.

Abnormal: Wrong password → “Login failed.”; locked account → “Tài khoản bị khóa.”; server error → toast.

3.2.3 Function: View & Update Profile
Function Trigger: Profile → “My Account” (only for logged-in users).
Function Description:
Actors: Traveler, Guide, Admin

Purpose: Display and update profile information.

Backend: GET /api/users/me, PUT /api/users/me, PATCH /api/users/avatar.

Function Details:
Validation: Name letters only; verified email; image ≤ 2 MB.

Normal: Saved → toast “Profile updated.”

Abnormal: Bad file → “Upload failed.”

3.2.4 Function: Generate Custom Itinerary
Function Trigger: Navigation → Custom Tour → “Generate My Trip.”
Function Description:
Actors: Traveler, AI Microservice

Purpose: Use Vietnamese embedding model to create personalized trip plans.

Backend: POST /api/ai/itinerary → Python FastAPI (FAISS embeddings).

Input: Text preferences (e.g., “I want beach and seafood vacation”).

Output: JSON itinerary + recommended tours.

Function Details:
Normal: Generate plan → display results.

Abnormal: Empty input → prompt user; AI timeout → error notice.

3.3 Feature: Tour Browsing & Booking
3.3.1 Function: Search Tours
Function Trigger: Home → Search bar / filter selection.
Function Description:
Actors: Guest, Traveler

Purpose: Find tours by destination and criteria.

Backend: GET /api/tours?query=&zone=&minPrice=&maxPrice=&sort=.

AI Integration: FAISS semantic search for Vietnamese queries.

Function Details:
Filters by destination, price, rating; sort by popularity, price, rating; 10 results per page.
Normal: Results rendered successfully.
Abnormal: No match → “No tours found.”

3.3.2 Function: Book Tour
Function Trigger: Tour Details → “Book Now” / “Add to Cart.”
Function Description:
Actors: Traveler

Purpose: Create booking linked to user and tour IDs, initiate payment.

Backend: POST /api/bookings; then POST /api/payment/momo|paypal.

Function Details:
Validate seat availability and payment status.
Normal Flow: Select date → confirm quote → redirect gateway → save booking.
Abnormal: Tour full, payment failed, timeout → error.

3.3.3 Function: View Quotation
Trigger: Cart / Booking page → “View Quotation.”
Description: Compute adult/child pricing and discounts.
Backend: POST /api/quotation.
Normal: Show total; Abnormal: Expired promotion → “Cannot calculate quote.”

3.4 Feature: Payment & Promotions
3.4.1 Function: View Promotions
Trigger: Header → “Promotions” / Home → “View All.”
Description: List active promo codes from GET /api/promotions/active.
Filters expired and ineligible codes.
Normal: Displayed → user applies at checkout.
Abnormal: API error or no codes → show message.

3.4.2 Function: Validate Promotion Code
Trigger: Checkout → “Apply Promotion.”
Description: POST /api/promotions/validate checks expiry and eligibility.
Normal: Discount applied; Abnormal: Invalid code → error alert.

3.4.3 Function: Payment (MoMo / PayPal)
Trigger: Checkout → “Proceed to Payment.”
Description: POST /api/payment/momo|paypal; confirm via IPN.
Normal: Success → update booking to “Paid”; email sent.
Abnormal: Canceled or timeout → cart restored.

3.4.4 Function: Restore Cart on Failure
Triggered automatically after failed payment.
POST /api/cart/restore rebuilds previous cart.
Normal: Tours restored; Abnormal: session missing → notify user.

3.5 Feature: Review & Feedback System
3.5.1 Function: Write Review
Trigger: Profile → My Bookings → completed tour → “Write Review.”
Description: POST /api/reviews (valid only for paid bookings).
Normal: Saved → “Thank you for feedback.”
Abnormal: No eligible booking / invalid input → error.

3.5.2 Function: Edit / Delete Review
Trigger: Profile → “My Reviews.”
PUT or DELETE /api/reviews/:id.
Normal: Update/Delete → confirmation toast.
Abnormal: Unauthorized → “Only your own reviews.”

3.5.3 Function: Like / Respond to Review
Trigger: Tour Details → Reviews section.
Travelers like; Admins respond.
POST /api/reviews/:id/like / respond.
Normal: Like count updates / reply visible.
Abnormal: Duplicate like or unauthorized reply.

3.6 Feature: Help Center & Complaint Handling
3.6.1 Function: View Help Articles
Trigger: Footer → Help Center or Header → Support.
Description: GET /api/help/articles / :id displays FAQs and guides.
Normal: Content displayed; Abnormal: article missing → error message.

3.6.2 Function: Submit Feedback / Complaint
Trigger: Help Center → “Send Feedback.”
Description: POST /api/help/feedback creates record.
Validation: Subject and description required; image ≤ 2 MB.
Normal: Saved → toast confirmation.
Abnormal: Network failure → retry message.

3.6.3 Function: Admin Respond to Complaints
Trigger: Admin Dashboard → Help Center → Feedback.
GET /api/help/feedback; POST /api/help/feedback/:id/reply.
Normal: Reply saved → email sent to user.
Abnormal: Unauthorized → “Permission denied.”

3.6.4 Function: Moderate Help Content
Trigger: Admin Dashboard → Help Center → “Manage Articles.”
POST /PUT/DELETE /api/help/articles.
Normal: Saved → “Article updated.”
Abnormal: Duplicate title → “Already exists.”
3.7 Feature: Admin Dashboard & Management
3.7.1 Function: Manage Users
Function Trigger:
Navigation: Admin Dashboard → “Users Management.”
Triggered when an admin views or edits a user profile.
Function Description:
Actors: Admin
Purpose: View and control registered users’ roles and statuses.
Interface: Tabular list with search and filters.
Backend: GET /api/admin/users, PATCH /api/admin/users/:id
Data Processing: Admins activate, lock, ban accounts; changes recorded in audit log.

Function Details:
Validation: Admin role required.
Normal Flow: Edit → “User updated successfully.”
Abnormal Flow: Unauthorized → “Access denied.”; DB error → “Update failed.”

3.7.2 Function: Manage Tours & Agencies
Function Trigger: Admin Dashboard → “Tours Management” or “Agencies Management.”
Function Description:
Actors: Admin
Purpose: CRUD tours and agency information.
Backend: GET/POST/PUT/DELETE /api/admin/tours
Processing: Update internal Tour/Agency collections and sync embeddings.
Function Details:
Validation: title, zone, price required.
Normal: Saved → “Tour updated.”
Abnormal: Duplicate → “Tour already exists.”

3.7.3 Function: Manage Content (Blogs, Promotions, Help Center)
Function Trigger: Admin Dashboard → “Content Management.”
Function Description:
Actors: Admin
Purpose: Maintain marketing and support materials.
Backend: /api/admin/blogs, /api/admin/promotions, /api/help/articles
Function Details:
Validation: title and content required; promotion expiry > current date.
Normal: Updated → live instantly.
Abnormal: Missing fields → “Fields required.”

3.7.4 Function: View Bookings & Statistics
Function Trigger: Admin Dashboard → “Bookings” or “Statistics.”
Function Description:
Actors: Admin
Purpose: Monitor performance and revenue.
Backend: GET /api/admin/bookings, GET /api/admin/statistics
Function Details:
Validation: Admin role only.
Normal: Display data, allow CSV export.
Abnormal: API timeout → “Unable to load analytics.”

3.7.5 Function: Manage AI Settings
Function Trigger: Admin Dashboard → “AI Configuration.”
Function Description:
Actors: Admin, AI Microservice
Purpose: Configure AI models and embedding sync.
Backend: GET /api/ai/config, POST /api/ai/sync
Function Details:
Validation: Model name required; threshold 0–1.
Normal: Save → “AI service updated.”
Abnormal: Service down → “Sync failed.”

3.8 Feature: AI-Powered Itinerary
3.8.1 Function: Send Custom Tour Request
Function Trigger: Header → “Custom Itinerary” → “Generate My Trip.”
Function Description:
Actors: Traveler, AI Microservice
Purpose: Collect preferences (vibe, duration, budget) to generate AI itinerary.
Backend: POST /api/ai/itinerary → FAISS service (Vietnamese_Embedding_v2).
Function Details:
Validation: preferences required.
Normal: Generated → displayed to user.
Abnormal: Empty → “Please describe your trip.”

3.8.2 Function: Receive AI-Optimized Itinerary
Function Trigger: Auto after AI response.
Function Description:
Actors: Traveler, AI Microservice
Purpose: Return zones, tours, and daily schedule to traveler.
Backend: Stores result in itinerary collection.
Function Details:
Validation: ≥ 1 zone required.
Normal: Display and save plan.
Abnormal: No data → “No itinerary found.”

3.8.3 Function: Re-Optimize Itinerary
Function Trigger: Itinerary Page → “Re-Optimize.”
Function Description:
Actors: Traveler, AI Microservice
Purpose: Regenerate itinerary with new preferences.
Backend: POST /api/ai/reoptimize
Function Details:
Validation: Existing itinerary ID needed.
Normal: New plan → “Itinerary updated.”
Abnormal: AI unavailable → “Re-optimization failed.”

3.8.4 Function: Manage AI Embeddings (Admin)
Function Trigger: Admin Dashboard → “AI Settings.”
Function Description:
Actors: Admin, AI Microservice
Purpose: Sync embedding indexes for zones and tours.
Backend: GET /api/ai/status, POST /api/ai/sync/zones
Function Details:

Validation: Admin privilege.
Normal: Sync success.
Abnormal: Timeout → “Embedding update failed.”

4. Non-Functional Requirements
   4.1 External Interfaces
   This section provides information to ensure that the Travyy system will communicate properly with users and with external hardware or software/system elements.
   4.1.1 User Interfaces
   Web Application Interface
   Frontend Framework: React 18.3.1 with Vite 7.1.2
   UI Framework: Tailwind CSS 4.1.13 for responsive design
   Supported Browsers:
   Chrome (latest 2 versions)
   Firefox (latest 2 versions)
   Safari (latest 2 versions)
   Edge (latest 2 versions)
   Screen Resolutions:
   Mobile: 320px - 768px (responsive)
   Tablet: 768px - 1024px
   Desktop: 1024px and above
   Accessibility: WCAG 2.1 Level AA compliant
   Languages: Vietnamese (primary), English (secondary)
   User Interface Components
   Navigation menu with role-based access
   Interactive map view for zone browsing (Leaflet/Mapbox)
   Tour search with filters and sorting
   Booking cart with real-time pricing
   Payment checkout forms
   User profile dashboard
   Admin control panel
   Toast notifications for user feedback
   Loading skeletons for better UX
   4.1.2 Hardware Interfaces
   Server Infrastructure
   Production Servers: Cloud-based infrastructure
   Minimum Server Specs:
   CPU: 4 cores minimum
   RAM: 8GB minimum
   Storage: 100GB SSD minimum
   Database Server:
   MongoDB Atlas cluster (M10 or higher)
   Storage: Auto-scaling with 100GB initial allocation
   Client Devices
   Desktop: Windows 10+, macOS 10.15+, Linux (modern distributions)
   4.1.3 Software Interfaces
   Backend System
   Node.js Runtime: Version 18.x or higher
   Express Framework: Version 5.1.0
   MongoDB Database: Version 6.0 or higher (Mongoose 8.18.2)
   API Protocol: RESTful HTTP/HTTPS
   AI Microservice
   Python Runtime: Version 3.9 or higher
   FastAPI Framework: Latest stable version
   FAISS Library: For vector similarity search
   HuggingFace Transformers: Vietnamese embedding models
   Communication: HTTP REST API calls from Backend to AI service
   External Agency API Integration
   Protocol: RESTful HTTP/HTTPS
   Authentication: API key-based or OAuth 2.0
   Data Format: JSON
   Rate Limiting: Configurable per external API provider
   Endpoints Required:
   GET /tours - Fetch tour listings
   GET /tours/{id} - Get tour details
   POST /bookings - Create booking
   GET /availability/{tourId} - Check real-time availability
   PATCH /bookings/{id} - Update booking status
   Webhook Support: For real-time updates on pricing/availability
   Payment Gateway Integration
   PayPal
   SDK: @paypal/checkout-server-sdk
   API Version: v2
   Endpoints: Create Order API, Capture Order API, Webhook notifications
   Authentication: Client ID + Secret
   Supported Currencies: USD, VND
   MoMo E-Wallet
   API Version: Latest stable
   Protocol: HTTPS with HMAC-SHA256 signature
   Endpoints: Payment creation, Payment status query, IPN (Instant Payment Notification)
   Authentication: Partner Code + Access Key + Secret Key
   Currency: VND only
   Authentication Services
   Passport.js: For OAuth integration
   Google OAuth 2.0: For Google sign-in
   Facebook OAuth 2.0: For Facebook sign-in
   JWT (JSON Web Tokens): For session management
   Speakeasy: For 2FA TOTP generation
   Email Service
   Provider: Nodemailer with SMTP
   Supported Providers: Gmail, SendGrid, AWS SES
   Protocol: SMTP/TLS
   Email Types:
   Verification emails
   Password reset
   Booking confirmations
   Payment receipts
   Notifications
   4.1.4 Communication Interfaces
   API Communication
   Protocol: HTTP/HTTPS (TLS 1.2 or higher)
   Port: 443 (HTTPS), 80 (HTTP redirect to HTTPS)
   Data Format: JSON (application/json)
   Character Encoding: UTF-8
   API Versioning: URL-based (e.g., /api/v1/)
   WebSocket (Optional)
   Protocol: WSS (WebSocket Secure)
   Use Cases: Real-time booking updates, live notifications
   Library: Socket.io (if implemented)
   Database Communication
   MongoDB Connection: MongoDB connection string with authentication
   Connection Pool: 10-50 concurrent connections
   Protocol: MongoDB wire protocol
   Network Requirements
   Bandwidth: Minimum 100 Mbps for server
   Latency: < 50ms for database connections
   CDN: Cloudflare or AWS CloudFront for static assets
   4.2 Quality Attributes
   4.2.1 Usability
   The Travyy system prioritizes user-friendly design to ensure ease of use for all user types.
   Training Requirements
   Normal Users (Travelers):
   No training required
   First-time users should be able to search and view tours within 2 minutes
   Complete a booking within 5 minutes without assistance
   Intuitive UI with tooltips and helper text
   Tour Guides:
   Profile setup: < 10 minutes
   Certificate upload: < 5 minutes
   No formal training needed due to simple interface
   Admin Users:
   Initial training: 2 hours for full platform overview
   Content management: < 30 minutes to become proficient
   User management: < 15 minutes to understand workflows
   Documentation and video tutorials provided

Task
Target Time
User Type
Search for a tour
< 30 seconds
Guest/Traveler
View tour details
< 10 seconds
Guest/Traveler
Complete registration
< 2 minutes
Guest
Login to account
< 15 seconds
All users
Add tour to cart
< 10 seconds
Traveler
Complete booking & payment
< 3 minutes
Traveler
Write a review
< 2 minutes
Traveler
Admin approve user
< 30 seconds
Admin
Admin create promotion
< 3 minutes
Admin

Task Time RequirementsUsability Standards Compliance
Responsive Design: Mobile-first approach using Tailwind CSS
Accessibility: WCAG 2.1 Level AA compliance
Keyboard navigation support
Screen reader compatibility
Adequate color contrast (minimum 4.5:1)
Text resize support up to 200%
Consistency: Uniform UI components across all pages
Error Prevention: Input validation with clear error messages
User Feedback:
Toast notifications for actions
Loading indicators for async operations
Confirmation dialogs for critical actions
Language Support: Vietnamese (primary) and English
Help & Documentation:
Inline help text
FAQ section
Contact support functionality
Usability Metrics
User Satisfaction: Target score > 4.0/5.0 (via surveys)
Task Success Rate: > 95% for primary tasks
Error Rate: < 5% for form submissions
Learnability: 90% of users complete first booking without help

4.2.2 Reliability
The Travyy system must maintain high reliability to ensure continuous service availability.
Availability
Target Uptime: 99.9% (8.76 hours downtime per year maximum)
Service Hours: 24/7/365 continuous operation
Scheduled Maintenance:
Maximum 2 hours per month during off-peak hours (2:00 AM - 4:00 AM Vietnam time)
Advance notice: 48 hours minimum
Degraded Mode Operations:
Read-only mode during database maintenance
Cached content served if External Agency API is unavailable
Payment processing queued if Payment Gateway is temporarily down
Mean Time Between Failures (MTBF)
Target MTBF: 720 hours (30 days)
Critical Components:
Backend API: 1,440 hours (60 days)
Database: 2,160 hours (90 days)
Payment system: 720 hours (30 days)
Mean Time To Repair (MTTR)
Critical Failures (payment, data loss): < 1 hour
Major Failures (API down): < 2 hours
Minor Failures (UI issues): < 4 hours
24/7 On-call Support: For critical issues
Accuracy
Price Calculations: Accurate to 2 decimal places for all currencies
Geospatial Data: Coordinate precision to 6 decimal places (~0.1 meters)
Time Stamps: UTC with millisecond precision
Financial Transactions: 100% accuracy required (zero tolerance)
Booking Availability: Real-time sync with External Agency API (< 30 seconds delay)
Maximum Bugs or Defect Rate
Overall Target: < 1 bug per 1,000 lines of code (< 1 bug/KLOC)
Critical Bugs: 0 bugs/KLOC (zero tolerance for production)
Function Point: < 0.5 bugs per function point

Bug Categorization
Severity
Definition
Allowed Rate
Resolution Time
Critical
Complete data loss, system crash, payment failure, security breach
0%
< 4 hours
Significant
Feature completely broken, incorrect calculations, data corruption
< 0.1%
< 24 hours
Minor
UI glitches, performance degradation, non-critical features affected
< 1%
< 7 days
Trivial
Cosmetic issues, typos, minor UX improvements
< 5%
< 30 days

Data Integrity
Backup Frequency: Automated daily backups at 3:00 AM
Backup Retention: 30 days rolling retention
Recovery Point Objective (RPO): < 24 hours (maximum data loss)
Recovery Time Objective (RTO): < 4 hours (maximum downtime for recovery)
Data Validation: All user inputs validated and sanitized
Transaction Integrity: ACID compliance for critical operations using MongoDB transactions
Error Handling
Graceful Degradation: System continues operating with limited functionality if external services fail
Error Logging: All errors logged with stack traces to monitoring system
User-Friendly Errors: Technical errors translated to user-understandable messages
Automatic Retry: 3 retry attempts with exponential backoff for transient failures
Monitoring & Alerting
Health Checks: API endpoint health checks every 60 seconds
Performance Monitoring: Real-time monitoring of response times, error rates
Alert Thresholds:
API response time > 500ms: Warning
Error rate > 5%: Critical alert
CPU usage > 80%: Warning
Memory usage > 85%: Critical alert
On-Call Rotation: 24/7 engineering on-call for critical issues

4.2.3 Performance
The Travyy system must deliver fast, responsive performance to ensure optimal user experience.
Response Time Requirements
Operation
Average Response Time
Maximum Response Time
Related Use Case
Page Load (Homepage)
< 1.5 seconds
< 3 seconds
UC-01: View Home Page
Search Tours
< 500ms
< 1 second
UC-04: Search Tours
View Tour Details
< 300ms
< 800ms
UC-05: View Tour Details
User Login
< 400ms
< 1 second
UC-03: Login
User Registration
< 800ms
< 2 seconds
UC-02: Register/Sign Up
Add to Cart
< 200ms
< 500ms
UC-10: Book Tour
Create Booking
< 1 second
< 3 seconds
UC-10: Book Tour
Payment Processing
< 2 seconds
< 5 seconds
UC-12: Payment
Submit Review
< 500ms
< 1.5 seconds
UC-13: Write Feedback/Review
Admin Dashboard Load
< 1 second
< 2 seconds
UC-18: View User Info
API Endpoint Response
< 200ms (95th percentile)
< 500ms
All API calls

Throughput
Concurrent Users: Support 1,000 simultaneous active users
Peak Load: Support 5,000 concurrent users during high traffic (holidays, promotions)
API Requests:
Normal load: 100 requests per second (RPS)
Peak load: 500 RPS
Database Operations:
Read operations: 1,000 queries per second
Write operations: 200 transactions per second
Payment Transactions: 50 concurrent payment processes
Capacity
Resource
Capacity
Scalability
Registered Users
100,000 users initially
Scalable to 1,000,000+
Tours (from External API)
10,000 tours
Unlimited (API-dependent)
Bookings per Day
5,000 bookings
Auto-scaling enabled
Reviews
50,000 reviews
Scalable with sharding
Zones
500 geographic zones
5,000+ with optimization
Concurrent Sessions
1,000 active sessions
Horizontal scaling to 10,000+
File Storage
100GB initial
Auto-scaling to 1TB+
Database Size
50GB initial
Sharding for 1TB+

Resource Utilization
Memory Usage
Backend Server:
Normal operation: 40-60% of allocated RAM (3-4GB of 8GB)
Peak load: < 80% of allocated RAM
Alert threshold: > 85% sustained for 5 minutes
AI Microservice:
Normal operation: 2-4GB RAM for embeddings
FAISS index: 1-3GB depending on zone count
Database:
Working set: Should fit in RAM for optimal performance
Connection pool: 50 max connections
CPU Usage
Backend Server:
Normal operation: 20-40% CPU utilization
Peak load: < 70% CPU utilization
Alert threshold: > 80% sustained for 5 minutes
AI Microservice:
Embedding generation: 60-80% CPU during processing
Idle state: < 10% CPU
Disk Usage
Backend Server:
Application: 2GB
Logs: 10GB (with log rotation)
Temporary files: 5GB
Growth rate: ~5GB per month
Database:
Initial size: 50GB
Growth rate: ~10GB per month
Auto-scaling: Enabled for cloud deployments
File Storage (Images/Documents):
Initial: 20GB
Growth rate: ~15GB per month (user-generated content)
Network Utilization
Bandwidth:
Inbound: Average 50 Mbps, Peak 200 Mbps
Outbound: Average 100 Mbps, Peak 500 Mbps
API Calls to External Services:
External Agency API: 100 requests/minute average
Payment Gateway: 50 requests/minute peak
Email Service: 500 emails/hour
CDN Usage: 80% of static assets served via CDN to reduce origin load
Caching Strategy
Redis Cache:
Memory: 2GB allocated
Cache hit rate: > 80% target
TTL (Time To Live):
Homepage data: 5 minutes
Tour listings: 10 minutes
Tour details: 15 minutes
Zone data: 1 hour
User sessions: 15 minutes (access token)
Browser Cache: Static assets cached for 7 days (with versioning)
Database Performance
Query Execution Time:
Simple queries (by ID): < 10ms
Complex queries (aggregations): < 100ms
Full-text search: < 200ms
Indexing:
All foreign keys indexed
Compound indexes for common query patterns
Geospatial indexes for zone queries
Text indexes for search functionality
Connection Pooling: 10-50 connections maintained
Scalability Metrics
Horizontal Scaling:
Add backend instances in < 5 minutes
Load balancer distributes traffic evenly
Database Scaling:
MongoDB sharding enabled for datasets > 100GB
Read replicas for read-heavy operations
CDN:
Global edge locations for low latency worldwide
90% of static content served from CDN
Performance Testing Requirements
Load Testing: Monthly load tests simulating 2x normal traffic
Stress Testing: Quarterly stress tests to find breaking point
Spike Testing: Test ability to handle sudden traffic spikes (10x normal)
Endurance Testing: 72-hour continuous load test for memory leaks
Performance Monitoring
Real-time Metrics:
Response time percentiles (50th, 75th, 95th, 99th)
Request rate per endpoint
Error rate percentage
Active user count
Performance Dashboards: Grafana or similar for visualization
Alerting: Automated alerts when thresholds exceeded
APM (Application Performance Monitoring): New Relic or Datadog integration
Optimization Strategies
Code Optimization:
Minimize database queries (N+1 problem elimination)
Lazy loading for images
Code splitting for frontend
Database Optimization:
Query optimization with explain plans
Proper indexing strategy
Data denormalization where appropriate
Network Optimization:
Gzip compression for API responses
Image optimization (WebP format, lazy loading)
HTTP/2 support
DNS prefetching for external domains

5. Requirement Appendix
   5.1 Business Rules

ID
Rule Definition

AUTHENTICATION & ACCOUNT MANAGEMENT
BR-1
Users must register with a unique email or phone number. Duplicate email/phone is not allowed.  
BR-2
Passwords must meet security requirements: minimum 8 characters, include uppercase, lowercase, number, and special character.
BR-3
Users can sign up via email/password, Google OAuth, or Facebook OAuth. OAuth accounts do not require password.
BR-4
Email verification is optional but when enabled, accounts must verify email before full access. Unverified accounts have limited privileges.
BR-5
Password reset links and OTP codes must expire after 30 minutes.
BR-6
Password reset links can only be used once. After use, they become invalid.
BR-7
Two-Factor Authentication (2FA) is optional. When enabled, users must provide TOTP code at login.
BR-8
Users can enable/disable 2FA only after confirming with current password and 2FA confirm token.
BR-9
Only authenticated users can initiate sign-out. The system must clear all session data and invalidate tokens.
BR-10
Users must agree to Terms of Service during registration before account creation.
BR-11
Each user account is assigned exactly one role: Traveler, TourGuide, TravelAgency, or Admin. Default role is null until set.
BR-12
Role-based access control (RBAC) restricts users to functionalities designated for their role.
BR-13
Only Admin can change user roles or account status (active, banned, inactive, pending).
BR-14
Banned accounts cannot log in. The system must display ban reason and contact info.
BR-15
Account deletion is soft delete. Deleted accounts enter "inactive" status and can be restored within 30 days before permanent deletion.
BR-16
Only account owner (or Admin with special permissions) can delete or update their profile.
BR-17
Profile updates must validate all fields (email format, phone format, required fields).
BR-18
Users can view only their own profile, except Admins who can view all profiles.
BR-19
Password changes require current password confirmation.

ITINERARY MANAGEMENT
BR-21
Only authenticated users can create itineraries. Guest users can only view sample itineraries.
BR-22
Each itinerary must have a unique name per user. Duplicate itinerary names for the same user are not allowed.
BR-23
Itinerary items must include: name, location (lat/lng), itemType (poi or tour). Missing required fields cause validation error.
BR-24
Itinerary items can be POIs (points of interest) or Tours. Tours must reference valid tourId and agency data.
BR-25
Users can add, edit, reorder, or delete itinerary items. All changes are autosaved or saved on explicit user action.
BR-26
AI optimization is optional. When triggered, the system must call AI service to optimize route, timing, and order.
BR-27
AI optimization must preserve user's original preferences (vibes, pace, budget, duration).
BR-28
Users can send itinerary to a tour guide. This creates a Request with status "pending".
BR-29
Sending itinerary requires at least 1 valid item in the itinerary. Empty itineraries cannot be sent.
BR-30
When itinerary is sent, the system creates a notification for the assigned guide.
BR-31
Users can view a list of all their itineraries. The list displays: name, zone, creation date, status.
BR-32
Users can delete their own itineraries. Deleted itineraries are soft-deleted and can be restored within 7 days.
BR-33
Itineraries linked to active bookings cannot be deleted until booking is completed or cancelled.
BR-34
Itinerary data must be updated in real-time when items are added/removed/reordered.
BR-35
Itinerary preferences (vibes, pace, budget, durationDays, bestTime) must be stored and used for AI recommendations.

GUIDE REQUEST MANAGEMENT
BR-36
Only authenticated Tour Guides can view requests sent to them.  
BR-37
Requests are displayed in real-time. New requests appear immediately without page refresh.
BR-38
Guides can Accept or Reject requests. Both actions require confirmation modal before execution.
BR-39
Only requests with status "pending" can be accepted or rejected. Requests already processed cannot be modified.
BR-40
When a guide accepts a request, the status changes to "accepted" and a notification is sent to the user.
BR-41
When a guide rejects a request, the status changes to "rejected" and a notification with reason is sent to the user
BR-42
Accepted requests may trigger creation of a booking draft or further communication flow.
BR-43
Request data must include: itinerary details, user info, contact info, request timestamp.
BR-44
Guides can filter requests by status (pending, accepted, rejected) and date range.
BR-45
Request list must support pagination and infinite scroll for large datasets.

BOOKING FLOW & PAYMENT
BR-46
Only authenticated users can create bookings. Guest checkout is not allowed.
BR-47
Bookings support multiple tour items in a single order. Each item tracks: tourId, date, adults, children, prices.
BR-48
Booking must validate tour availability before creation. If tour is fully booked, booking is rejected with error message.
BR-49
Booking status follows state machine: pending_payment → processing → confirmed → completed or cancelled.
BR-50
Booking cannot transition to "confirmed" until payment is successfully completed.
BR-51
Payment providers supported: PayPal, MoMo, Cash. Provider must be specified during booking creation.  
BR-52
PaymentSession is created for each booking. It stores: orderId, transactionId, amount, currency, status, timestamps.
BR-53
Payment must be completed within expiration time (default: 15 minutes). Expired payments are auto-cancelled.
BR-54
Payment webhooks (from PayPal/MoMo) must verify signature before processing. Invalid signatures are rejected.
BR-55
When payment succeeds, booking status updates to "confirmed" and confirmation email/notification is sent.
BR-56
When payment fails, booking status updates to "failed" and user is notified with retry option.
BR-57
Booking original amount, discount amount, and total amount must be calculated correctly. totalAmount = originalAmount - discountAmount.
BR-58
If voucher/promotion is applied, the system must validate voucher code and apply discount. Invalid vouchers are rejected.
BR-59
Each voucher can be used once per user (unless multi-use is allowed). System must track usedPromotions in User model.  
BR-60
Currency conversion (if needed) must use real-time exchange rates from trusted provider.
BR-61
Payment transactions must be logged with full details for audit and dispute resolution.
BR-62
Refunds are processed only for confirmed bookings. Refund amount depends on cancellation policy.
BR-63
Cancellation policy rules: >14 days: 90% refund, 7-14 days: 50% refund, <7 days: no refund.
BR-64
Refund requests are processed manually by Admin or automatically via payment provider API.
BR-65
Booking confirmation must generate a unique booking reference code for user tracking.

REVIEWS & RATINGS
BR-66
Only users who completed a booking can write a review for that tour.
BR-67
Reviews can only be submitted after the tour end date has passed.
BR-68
Each user can submit one review per booking. Multiple reviews for the same booking are not allowed.
BR-69
Review must include a rating (1-5 stars). Comment text is optional.  
BR-70
Rating must be an integer between 1 and 5. Invalid ratings are rejected.
BR-71
Review content must be validated for inappropriate language. System may flag or auto-reject offensive content.
BR-72
Reviews are publicly visible on tour detail pages after submission.
BR-73
Tour guides can view reviews related to their tours but cannot edit or delete them.
BR-74
Admin can delete reviews if they violate community guidelines. Deletion reason must be logged.
BR-75
Average tour rating is calculated automatically from all reviews and updated in real-time.

PROMOTIONS & COUPONS
BR-76
Promotions must have: code, discount type (percentage or fixed), discount value, start/end dates, usage limits.
BR-77
Coupon codes must be unique. Duplicate codes are not allowed.
BR-78
Coupons can only be applied if current date is within start and end dates. Expired coupons are rejected.
BR-79
Minimum purchase amount (if set) must be met before coupon can be applied.
BR-80
Coupons can be limited to specific tours, zones, or categories. System validates applicability before applying.
BR-81
Usage limits (total uses or per-user uses) must be enforced. Exceeding limits rejects coupon.
BR-82
When coupon is applied, discount amount is calculated and stored in booking. Original amount and total amount are tracked separately.
BR-83
Users can view their used promotions history in their profile.
BR-84
Admin can create, edit, or deactivate promotions. Deactivated promotions cannot be used.
BR-85
System must log all coupon usage with userId, bookingId, code, and timestamp for analytics.

NOTIFICATIONS
BR-86
Notifications are sent in real-time to users and guides for key events (booking confirmed, request accepted, payment success, etc.).
BR-87
Notification types: booking, payment, request, review, promotion, system alert.
BR-88
Users can view their notifications in a dedicated Notifications page.  
BR-89
Unread notifications are displayed with a badge count in the header.  
BR-90
Users can mark notifications as read. Read notifications no longer count toward badge count.
BR-91
Notifications can be dismissed (deleted) by the user. Dismissed notifications are soft-deleted.
BR-92
System must support notification preferences: email, in-app, push (if enabled). Users can opt-in/opt-out.  
BR-93
Notification delivery must be logged for audit. Failed deliveries should retry with exponential backoff.
BR-94
Notifications older than 30 days are archived. Archived notifications are not displayed in main list but can be accessed via history.

CART & WISHLIST
BR-95
Only authenticated users can add items to cart. Guest users must log in first.
BR-96
Cart items must reflect real-time tour availability. If tour becomes unavailable, cart item is flagged.
BR-97
Users can add, update quantity, or remove cart items. Changes are saved immediately.
BR-98
Cart must display: item details, quantity, unit price, total price per item, and grand total.
BR-99
Cart items expire after 24 hours of inactivity. Expired items are auto-removed.
BR-100
Users can add tours to Wishlist for later viewing. Wishlist items are persistent across sessions.
BR-101
Wishlist items do not reserve tour availability. They are for bookmarking only.
BR-102
Users can move items from Wishlist to Cart with a single action.
BR-103
Users can remove items from Wishlist. Removed items are deleted immediately.
BR-104
Cart and Wishlist are user-specific. Users cannot view or modify other users' carts/wishlists.
HELP CENTER
BR-105
Help articles are publicly accessible. No authentication required to view articles.
BR-106
Help articles are categorized by topic (Account, Booking, Payment, etc.). Category filter is required.
BR-107
Users can search help articles by keyword. Search results rank by relevance.
BR-108
Users can provide feedback on help articles (Helpful/Not Helpful). Feedback is tracked for quality improvement.
BR-109
Admin can create, edit, or delete help articles. All changes are versioned and logged.

SECURITY & SESSION MANAGEMENT
BR-110
All API endpoints requiring authentication must validate JWT token in Authorization header.
BR-111
Expired or invalid tokens are rejected with 401 Unauthorized status.  
BR-112
JWT tokens expire after 24 hours. Users must re-authenticate after expiration.
BR-113
Refresh tokens are issued for long-term sessions. Refresh tokens expire after 30 days.
BR-114
Sensitive actions (password change, profile deletion, 2FA toggle) require current password confirmation.
BR-115
Rate limiting is enforced on login, registration, and password reset endpoints (max 5 attempts per 15 minutes per IP).
BR-116
All user inputs must be sanitized to prevent XSS, SQL injection, and other attacks.
BR-117
HTTPS is required for all production traffic. HTTP requests are redirected to HTTPS.
BR-118
CORS policy allows only trusted frontend origins. Unauthorized origins are blocked.
BR-119
Failed login attempts are logged. After 5 consecutive failures, account is temporarily locked for 15 minutes.

ADMIN MANAGEMENT
BR-120
Only Admin role can access admin dashboard and management features.
BR-121
Admin can view all user accounts with filters (role, status, registration date).  
BR-122
Admin can ban/unban user accounts. Ban action requires reason. Banned users cannot log in.
BR-123
Admin can view all bookings with filters (status, date range, user, tour).
BR-124
Admin can manually update booking status (e.g., mark as completed, cancel, refund).
BR-125
Admin can view and edit all tours. Tour edits include: name, description, price, availability.  
BR-126
Admin can create new tours or delete existing tours. Tours linked to active bookings cannot be deleted.
BR-127
Admin can view and delete reviews. Deletion requires reason and is logged.
BR-128
Admin can create, edit, or deactivate promotions. Active promotions are immediately available to users.
BR-129
Admin can view system reports: total users, total bookings, revenue, popular tours, conversion rates.
BR-130
Admin reports must reflect real-time data. Data is aggregated from database on demand.
BR-131
Admin can create staff accounts (TourGuide, TravelAgency roles). Email must be unique.
BR-132
Admin can delete staff accounts. Staff linked to active tours/bookings must be reassigned before deletion.
BR-133
Admin can send broadcast announcements to all users or filtered groups.
BR-134
All admin actions are logged in audit trail with: adminId, action type, target entity, timestamp.
BR-135
Admin can view audit logs to track system changes and user activities.
BR-136
Admin dashboard must display key metrics: active users, pending bookings, revenue this month, average rating.
BR-137
Admin can export data (users, bookings, reviews) to CSV or Excel format.
BR-138
Admin settings page allows configuration of: email templates, payment providers, system maintenance mode.

DATA INTEGRITY & BUSINESS LOGIC
BR-139
All database writes must validate data before saving. Invalid data is rejected with descriptive error message.
BR-140
Foreign key references (userId, tourId, bookingId) must exist in database. Referential integrity is enforced.
BR-141
Soft delete is used for user-generated data (itineraries, reviews, accounts). Hard delete is only for admin-approved cleanup.
BR-142
All timestamps (createdAt, updatedAt) are automatically managed by database.  
BR-143
Concurrent updates to same entity must be handled with optimistic locking or version control.
BR-144
Database transactions are used for multi-step operations (booking + payment + notification). Partial failures trigger rollback.
BR-145
Archived data (old notifications, expired carts) is moved to archive collection after retention period.
BR-146
System must support data export for GDPR compliance. Users can request full data export.
BR-147
Personal data deletion (GDPR right to erasure) must remove all user data except anonymized audit logs.
BR-148
System must log all data access for sensitive entities (user profiles, payment details) for security audit.

ZONES & LOCATION MANAGEMENT
BR-149
Zones must have unique ID (string format like "hue-thien-mu"). Duplicate zone IDs are not allowed.
BR-150
Each zone must define center coordinates (lat, lng) and radius in meters. Missing coordinates invalidate the zone
BR-151
Zones can optionally define a polygon boundary (poly field) with at least 3 coordinate pairs.
BR-152
Zones support semantic tags (tags, vibeKeywords) for AI recommendation and search filtering.
BR-153
Zones must belong to a province. Province field is required and indexed for fast lookup.
BR-154
Users can search zones by province. Results are filtered by isActive=true zones only.
BR-155
Zone POI discovery uses Map4D API with zone center and radius. POIs are cached for 30 minutes.
BR-156
POI search within zone supports category filtering (accommodation, food, views, activities).
BR-157
POI autocomplete requires minimum 2 characters query. Results are limited to 10 suggestions.
BR-158
Zone details page displays: name, description, hero image, gallery, tips, best time, must-see attractions.
BR-159
Tours can be linked to multiple zones via zoneIds array. Tours appear in zone tour listings.
BR-160
Zone tour listing filters by isHidden=false and sorts by usageCount descending.
BR-161
Zone priority POIs are pre-loaded for fast rendering. Priority determined by rating and scorePriority.
BR-162
Zone polygon (if defined) is used for map boundary visualization in frontend.
BR-163
Zones can be deactivated (isActive=false). Deactivated zones do not appear in public listings.
BR-164
Zone search endpoint supports geocoding and reverse geocoding via Map4D integration.
BR-165
POI detail fetch uses placeId and returns full details: name, address, phone, website, rating, photos.
BR-166
Zone avoidTags and avoidKeywords filter out unwanted POI types from recommendations.
BR-167
Zone bestTime field (morning/afternoon/evening/night/anytime) influences itinerary AI optimization.
BR-168
All zone API endpoints support caching with max-age 30-120 seconds for performance.

BLOGS & CONTENT MANAGEMENT
BR-169
Blog posts must have unique slug. Duplicate slugs are rejected.
BR-170
Blog title and description are required fields. Missing fields cause validation error.
BR-171
Blog location (lat, lng, address) is required for map display and zone association.
BR-172
Blogs support structured content: activities, sightseeing, transport, hotels with names and prices.
BR-173
Blog quickInfo section includes: weather, bestSeason, duration, language, distance. All optional.
BR-174
Blog FAQ section stores question-answer pairs. Unlimited FAQs allowed.
BR-175
Blog banner image is optional but recommended. Image URL must be valid and accessible.
BR-176
Blogs are publicly accessible. No authentication required to view blog content.
BR-177
Blog region field associates blog with province/zone for filtering and recommendations.
BR-178
Admin can create, edit, or delete blogs. All changes are timestamped (createdAt, updatedAt).

TOUR AGENCY & TOURS MANAGEMENT
BR-179
Tours must be linked to a valid TravelAgency. AgencyId is required on tour creation.
BR-180
Tour title, description, basePrice, and duration (days/nights) are required fields.
BR-181
Tour departures define: date, priceAdult, priceChild, seatsTotal, seatsLeft, status (open/closed/soldout).
BR-182
Tour departure date must be in YYYY-MM-DD format. Invalid dates are rejected.
BR-183
Tour seatsLeft is decremented on each booking. When seatsLeft=0, departure status becomes "soldout".
BR-184
Tours can be linked to multiple zones via zoneIds array for zone-based tour discovery.
BR-185
Tours can be hidden (isHidden=true). Hidden tours do not appear in public listings.
BR-186
Tour itinerary is an array of objects with: part, day, title, description. Supports multi-day tours.
BR-187
Tour usageCount tracks popularity. Incremented on each view/booking for ranking.
BR-187
Tours support tags (array of strings) for categorization and filtering.
BR-188
Tour images are stored as imageItems array with imageUrl. First image is used as thumbnail.
BR-189
TravelAgency employees are stored as array with: name, email, phone, rating, stats, status.
BR-190
Agency employees can have status: active, inactive, suspended. Only active employees appear publicly.
BR-191
Agency total field tracks aggregate statistics (total tours, revenue). Updated via analytics jobs.
BR-192
Agency contact info (phone, address) is required for customer inquiries.
BR-193
Tours are stored in separate agencyConn database for data isolation.
BR-194
Tour locations reference Location model. Location must exist before linking to tour.
BR-195
Tour update/delete requires agency ownership verification. Users cannot modify other agency tours.
BR-196
Tour search filters by: zone, price range, duration, date, availability.
BR-197
Tour detail page displays: full itinerary, agency info, reviews, availability calendar, booking button.

TICKETS & E-TICKETS
BR-198
Tickets are generated automatically when booking is confirmed.
BR-199
Each ticket has unique code and QR payload. Duplicate codes are not allowed.
BR-200
Ticket must reference valid bookingId, tourId, and userId. Foreign keys are enforced.
BR-201
Ticket status: issued, used, refunded. Status transitions follow business logic.
BR-202
Tickets can have expiration date (expiredAt). Expired tickets cannot be used.
BR-203
QR code payload contains: ticketCode, bookingId, tourId, userId, timestamp. Payload is encrypted.
BR-204
Ticket scanning validates: ticket exists, status=issued, not expired, matches tour/user.
BR-205
Once ticket is scanned/used, status changes to "used". Used tickets cannot be scanned again.
BR-206
Refunded tickets have status="refunded". Refunded tickets are invalidated and cannot be used.
BR-207
Ticket amount and currency track payment details for accounting and refunds.

AI & RECOMMENDATIONS
BR-208
AI itinerary optimization requires valid itinerary with at least 2 items.
BR-209
AI optimization considers: user preferences (vibes, pace, budget), item locations, travel time.
BR-210
AI service calls external Python AI endpoint. Timeout set to 30 seconds.
BR-211
AI optimization returns: reordered items, travel distances, duration estimates, time slots.
BR-212
If AI service fails, system falls back to simple time-based ordering.
BR-213
AI recommendations use zone embeddings for semantic similarity matching.
BR-214
Zone embeddings are synced periodically from MongoDB to vector database.
BR-215
POI recommendations filtered by user vibe preferences (relax, adventure, culture, nature, etc.).
BR-216
AI itinerary optimization logs are stored for analytics and model improvement.
BR-217
AI features are optional. Users can opt-out and manually arrange itinerary.

SEARCH & DISCOVERY
BR-218
Search supports natural language parsing. System extracts location, dates, preferences from query.
BR-219
Autocomplete suggestions appear after 2 characters typed. Results cached for 5 minutes.
BR-220
Search results sorted by relevance score: matching tags, rating, popularity, proximity.
BR-221
Discover endpoint parses user input and returns: zones, tours, POIs matching criteria.
BR-222
Search filters: price range, duration, date availability, zone, category.
BR-223
Search results paginated with default limit=20. Max limit=100 per page.
BR-224
Empty search query returns popular/trending tours and zones.
BR-225
Search history is tracked per user for personalized recommendations (optional feature).
BR-226
Search analytics track: query terms, result clicks, conversion rate for optimization.

PROFILE & AVATAR MANAGEMENT
BR-227
Users can upload avatar image. Supported formats: JPEG, PNG, GIF. Max size: 5MB.
BR-228
Avatar stored in MongoDB as binary data (Buffer) with contentType.
BR-229
Users can delete their avatar. Deleted avatar reverts to default placeholder.
BR-230
Avatar endpoint `/profile/avatar/:userId` is public for displaying user images.
BR-231
Profile updates (name, phone, location) require authentication. Changes are validated before saving.

ADMIN ADVANCED FEATURES
BR-232
Admin can view system-wide statistics: total users, bookings, revenue, active tours.
BR-233
Admin stats endpoint aggregates data in real-time from database.
BR-234
Admin can export reports to CSV/Excel format. Export includes filters by date range.
BR-235
Admin can manage agency accounts: create, update, suspend, delete agencies.
BR-236
Admin can assign employees to agencies. Employee role and permissions are validated.
BR-237
Admin can view detailed audit logs: user actions, booking changes, payment transactions.
BR-238
Admin can send system-wide announcements/notifications to all users or filtered groups.
BR-239
Admin dashboard displays real-time metrics: pending bookings, failed payments, low-stock tours.
BR-240
Admin can manually override booking status for customer service escalations.
BR-241
Admin actions require additional confirmation for critical operations (delete user, refund, ban).

LOCATION & GEOCODING
BR-242
Location data includes: provinces, wards with IDs and names. Used for address autocomplete.
BR-243
Province/ward endpoints return structured data from Vietnamese address database.
BR-244
Location coordinates (lat, lng) validated for valid ranges: lat [-90, 90], lng [-180, 180].
BR-245
Reverse geocoding converts coordinates to human-readable address via Map4D API.
BR-246
Location autocomplete supports Vietnamese diacritics and partial matching.

5.2 Common Requirements

ID
Common Requirement Description
CR-01
All users must authenticate via JWT token or OAuth (Google/Facebook) before accessing protected routes using authJwt middleware.
CR-02
Frontend must use responsive design with TailwindCSS breakpoints (sm/md/lg) for desktop (≥1024px), tablet (768px–1023px), and mobile (≤767px).
CR-03
Guide dashboard sidebar must collapse to bottom navigation bar on mobile devices (viewport width ≤768px).
CR-04
All drop-down lists (zones, locations, provinces, wards) must auto-populate from database with caching for performance.
CR-05
Tour guide requests must persist in Itinerary model with status tracking and tourGuideRequest nested object.
CR-06
Loading states must include visual feedback (spinners, skeletons) using framer-motion animations.
CR-07
Error messages must be localized in Vietnamese and provide actionable guidance through consistent message IDs.
CR-08
Database queries must use indexes on frequently searched fields (userId, tourId, zoneId, status, createdAt, rating).
CR-09
Tour guide request notifications must use polling (15-second intervals) with localStorage persistence for unread badges.
CR-10
Notification system must track read/unread status with compound indexes (userId, type, createdAt).
CR-11
Payment transactions must integrate with PayPal and MoMo gateways with IPN callback handling.
CR-12
Payment sessions must track order ID, provider, amount, status with TTL expiration in PaymentSession model.
CR-13
Tour bookings must maintain referential integrity between Users, Tours, Agencies using Mongoose ref with populate support.
CR-14
AI-generated itineraries must use embedding service from services/ai/libs/embedding-client.js for semantic zone matching.
CR-15
Zone embeddings must sync from MongoDB using sync-zones-embedding.js script for recommendation accuracy.
CR-16
API responses must follow consistent JSON structure with success/error status, message, and data fields.
CR-17
Backend API must implement CORS with configurable origins using cors middleware in server.js.
CR-18
Environment variables must be used for sensitive configuration (JWT secrets, DB connections, OAuth credentials, payment keys) and never committed.
CR-19
Production server must include health check endpoint returning database status, AI service status, and embedding availability.
CR-20
All user-facing content must be displayed in Vietnamese language with UTF-8 encoding support.
CR-21
Help & Support system must provide text search using MongoDB text indexes on title, content, and tags fields.
CR-22
User passwords must be hashed using bcrypt with salt rounds of 10 in Users model setPassword method.
CR-23
Reviews must use compound indexes (tourId, rating, createdAt) for efficient filtering and sorting.

5.3 Application Messages List

#

Message Code
Message Type
Context
Content
1
MSG 01
In line
No search results
No search found.
2
MSG 02
In red, under the text box
Input-required fields are empty
The {field} is required.
3
MSG 03
Toast message
Updating profile/itinerary successfully
Update successfully.
4
MSG 04
Toast message
Adding new entity successfully
Add successfully.
5
MSG 05
Toast message
Sending verification/reset email
A verification email has been sent to {email_address}.
6
MSG 06
Toast message
Password reset completed
Password reset successfully.
7
MSG 07
Toast message
Delete/Remove succeeded
Removed successfully.
8
MSG10
Toast message
Login (user)
Welcome, {name}!
9
MSG11
Toast message
Login (admin)
Admin login successful.
10
MSG12
Toast message
Login
Login failed. Please check your credentials.
11
MSG13
Toast message
Auth required (wishlist/cart/POI/itinerary)
You need to log in to continue.
12
MSG20
Toast message
Register
Registration successful!
13
MSG21
Toast message
Register
Email has already been used.
14
MSG22
Toast message
Register
Phone number has already been used.
15
MSG23
Toast message
Register
Username has already been used.
16
MSG24
Toast message
Register
Invalid data. Please check and try again.
17
MSG30
Toast message
Forgot password
Invalid email address.
18
MSG31
Toast message
Forgot password
If the email exists, we have sent password reset instructions.
19
MSG32
Toast message
Reset password
Invalid or expired token.
20
MSG33
Toast message
Reset password
The new password must be at least 8 characters long.
21
MSG34
Toast message
Reset password
Password confirmation does not match.
22
MSG35
Toast message
Reset password
Password reset successful. You can now log in.
23
MSG36
Toast message
Change password
Password changed successfully.
24
MSG37
Toast message
Change password
Current password is incorrect or request is invalid.
25
MSG38
Toast message
Change password
Password confirmation does not match.
26
MSG39
Toast message
Change password
The new password must be different from the current one.
27
MSG40
Toast message
Email verification
Missing verification token.
28
MSG41
Toast message
Email verification
You need to log in to continue.
29
MSG42
Toast message
Email verification
Email verified successfully.
30
MSG43
Toast message
Email verification
Email verification failed. Please try again.
31
MSG50
Toast message
2FA enable/verify
Missing verification token.
32
MSG51
Toast message
2FA enable/verify
You must log in to enable 2FA.
33
MSG52
Toast message
2FA enable
Two-factor authentication enabled successfully.
34
MSG53
Toast message
2FA enable
Failed to enable 2FA. Please try again.
35
MSG54
Toast message
2FA verify
Invalid or missing authentication code.
36
MSG60
Toast message
Payment (processing)
Processing your payment…
37
MSG61
Toast message
Payment (PayPal)
PayPal payment successful!
38
MSG62
Toast message
Payment (MoMo)
MoMo payment successful!
39
MSG63
Toast message
Payment (MoMo)
MoMo payment failed: {message}
40
MSG64
Toast message
Payment callback
Missing parameters for payment result.
41
MSG70
Toast message
Tour booking
Please select a valid departure date.
42
MSG71
Toast message
Tour booking
At least one adult is required.
43
MSG72
Toast message
Tour booking
Exceeded the remaining available slots.
44
MSG73
Toast message
Promotion
Code copied: {code}
45
MSG74
Toast message
Cart
Added to cart successfully.
46
MSG75
Toast message
Wishlist login
Please log in to use the wishlist.
47
MSG80
Toast message
Wishlist
Unable to update wishlist.
48
MSG81
Toast message
Wishlist
An error occurred. Please try again.
49
MSG82
Toast message
Wishlist
Wishlist updated successfully.
50
MSG90
Toast message
Itinerary (AI optimize)
Itinerary optimized successfully.
51
MSG91
Toast message
Itinerary (AI optimize)
Invalid data. Please check again.
52
MSG 92
Toast message
Itinerary (AI optimize)
Server error. Please try again later.
53
MSG 93
Toast message
Itinerary
You need to log in to continue.
54
MSG 94
Toast message
Itinerary
Itinerary not found.
55
MSG 95
Toast message
Itinerary
At least two points are required for optimization.
56
MSG 96
Toast message
Itinerary
Link copied successfully!
57
MSG 100
Toast message
POI add/remove
Please log in first.
58
MSG 101
Toast message
POI add/remove
An error occurred. Please try again.
59
MSG 110
Toast message
OAuth callback
Signing in…
60
MSG 111
Toast message
Account locked
Account has been locked.
61
MSG 112
Toast message
Account locked
You cannot access because your account is locked.
62
MSG 113
Toast message
Account locked
Reason: {reason}
63
MSG 114
Toast message
Account locked
If you believe this is a mistake, please contact support.
64
MSG 120
Toast message
Discover results
No data found. Please go back and search again.
65
MSG 121
Toast message
Vibes select
Please select at least one vibe OR provide a clearer description!
66
MSG 122
Toast message
Vibes select
Description too short! Tell us what you like (e.g., beach, mountains, cuisine…).
67
MSG 123
Toast message
Vibes preview
Unable to analyze. Please try again.
68
MSG 130
Toast message
Wishlist page
No tours in your wishlist yet.
69
MSG 131
Toast message
Wishlist page
Failed to remove from wishlist. Please try again.
70
MSG 140
Toast message
Guide request
Tour guide request sent successfully!
71
MSG 141
Toast message
Guide request
Failed to send request: {message}
72
MSG142
Toast message
Guide request
Tour guide request has been sent.
73
MSG 143
Toast message
Guide request
No requests found.

5.4 Other Requirements…

ID
Other Requirement Description
OR-01
User passwords must be hashed using bcrypt with salt rounds of 10 before storage.
OR-02
The system must support OAuth authentication via Google and Facebook providers using Passport.js strategies.
OR-03
Backend API must implement CORS with configurable origins (currently http://localhost:5173 for development).
OR-04
Payment gateway must integrate with PayPal for international transactions.
OR-05
Payment system must support MoMo wallet for Vietnam domestic payments with IPN callback handling.
OR-06
Email service must be configured with SMTP (nodemailer) for sending transactional emails (booking, registration, password reset).
OR-07
Email notifications must be sent for: registration, booking success, payment confirmation, password changes, and tour updates.
OR-08
AI itinerary generation must use embedding service for semantic zone matching and recommendation.
OR-09
Zone embeddings must sync from MongoDB to AI service to maintain search and recommendation accuracy.
OR-10
Environment variables must be used for all sensitive configuration (API keys, database connections, OAuth secrets, payment gateway credentials).
OR-11
The system must support Vietnamese language as primary for all user-facing content with UTF-8 encoding.
OR-12
Tour bookings must maintain referential integrity between Users, Tours, Agencies, and Payment collections.
OR-13
Itinerary system must support: create, read, update, delete operations with items (POIs), reordering, and AI optimization.
OR-14
Tour guide request workflow must support: user requests tour guide → guide receives notification → guide can accept/decline.
OR-15
Wishlist feature must allow users to save/unsave tours with toggle and bulk check operations.
OR-16
Cart system must support: add items, update quantities, sync across sessions, and checkout with multiple payment methods.
OR-17
Review system must allow: create reviews, update, delete, like/unlike, and guide response (only users with completed bookings can review).
OR-18
Promotion system must validate discount codes with: expiration date, usage limit, minimum order value, and applicable tours.
OR-19
Notification system must track: user notifications, read/unread status, and notification stats (unread count).
OR-20
Profile management must support: view profile, update info, upload/delete avatar with file validation.
OR-21
Security features must include: 2FA (TOTP), email verification toggle, password change with current password verification.
OR-22
Help & Support system must provide: categorized articles, search, featured articles, and user feedback collection.
OR-23
Zone/Location system must provide: zone details, POIs by category, priority POIs, place search, and Google Maps integration.
OR-24
Tour discovery must support: natural language query parsing with AI to match zones and generate itinerary suggestions.
OR-25
Booking system must support: price quote calculation, user booking history, and payment-to-booking lookup.
OR-26
Payment sessions must be tracked with: order ID, provider (PayPal/MoMo), amount, status, and TTL expiration.
OR-27
Admin routes must be protected and provide: user management, tour approval, promotion management, and help article moderation.
OR-28
API must implement consistent error responses with: success boolean, message, and data fields.
OR-29
Production server must include health check endpoint returning: database status, AI service status, and embedding service availability.
OR-30
Vietnam address data must be available via API: provinces list, wards by district/province with caching.

—-END—
