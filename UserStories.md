User Stories – SWR302
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
Version: v2.1

Revision History
Name
Date
Reason For Changes
Version
Đoàn Trọng Lực , Võ Hà Đông,Nguyễn Vũ Hoàng, Trần Thị Diễm Kiều, Nguyễn Thị Quỳnh Châu
27/10/2025
Created the initial draft of the User Stories document, including layout and table formatting.
v1
Trần Thị Diễm Kiều,Nguyễn Thị Quỳnh Châu, Võ Hà Đông
29/10/2025
Added detailed descriptions for Traveler and Administrator user stories.
v1.1

Đoàn Trọng Lực
30/10/2025
Completed the Non-Functional Requirements and Acceptance Criteria sections.
v1.2
Trần Thị Diễm Kiều
31/10/2025
Standardized terminology and updated the Actor definitions (Traveler, Guide, Admin, Agency).
v1.3
Đoàn Trọng Lực, Nguyễn Vũ Hoàng
1/11/2025
Integrated Business Rules and external API references across features.
v2
Đoàn Trọng Lực, Nguyễn Vũ Hoàng, Võ Hà Đông,Nguyễn Thị Quỳnh Châu, Trần Thị Diễm Kiều
2/11/2025
Reviewed and finalized formatting, ensuring overall consistency for submission.
V2.1

This document represents version 2.1 of the Travyy User Stories and replaces all previous versions.

I. Introduction

1. Project Overview
   This document provides the complete User Requirements Specification for the Travyy – Tourism Connection and Support Platform. The structure follows the principles of effective requirements documentation (often part of a Software Requirements Specification or SRS), emphasizing User Stories and Quality Attributes for Agile development projects.
   1.1. Project Overview and Scope
   Travyy operates as a Tourism Connection and Support Platform that aggregates data and elevates user experience with AI-powered discovery and custom itineraries. The project follows an Agile approach, using User Stories as the core unit of requirements specification.
   1.2. Actors and User Classes
   Actors are external entities (users, systems, or devices) that interact with the system. Defining User Classes is essential to ensure adequate coverage of stakeholder needs.
   ID
   User Class
   Role in System
   Scope and Interaction Type
   UC-T
   Traveler
   Primary Actor
   Interacts via Frontend (discovery, itinerary creation, booking, payment).
   UC-G
   Guide (HDV)
   Secondary Actor
   Provides guiding services. Manages personal profile, accepts or rejects custom tour requests from Travelers, and maintains service availability. Verification and access are controlled by the Administrator
   UC-A
   Administrator
   System Manager
   Acts as the central coordinator between Travelers, Guides, and Travel Agencies. Manages platform integrity, verifies user roles, oversees API integrations, and ensures smooth data exchange and fair interactions among all parties.
   UC-AG
   Travel Agency
   External System Actor
   Interacts programmatically via External Interface Requirements (API) to supply Tour/Employee data.

---

II. Business requirements
This section explains the high-level goals and limits of the Travyy project. It defines what the system should achieve and the boundaries it must stay within. These requirements guide the design and development of all later features.
2.1. Product Vision and Business Objectives
Vision Statement
Travyy is a tourism platform that helps people plan better trips. It connects travelers, guides, and travel agencies through a single system. It uses AI to understand user preferences and generate travel plans that fit their goals. Travyy aims to make travel planning simple, fast, and personal.
Business Objectives The following objectives describe what the system should accomplish and how success will be measured:
Reduce the time needed to plan a full itinerary from 30 minutes to under 5 minutes.

Reach at least 90% accuracy in matching users to zones and destinations that fit their interests.

Raise the number of completed trip bookings by 25% within the first six months after launch.

Allow at least 80% of users to create a custom itinerary without staff help.

Support integration with at least three travel agencies through API connectors in the first release.

These measurable goals give clear direction for planning and evaluation. They also show when the product has achieved its intended value.

2.2. Scope and Limitations
Defining the Scope is paramount to managing the risk of scope creep.
Item
Description (Based on Business Objectives)
Source Context
Product Vision
Travyy is designed as a connector platform, focusing on aggregating external tour data and enhancing user experience through advanced discovery and custom itineraries.
Travyy is not a tour management system.
In Scope
Development of core capabilities including AI Discovery & Zone Matching (FEAT-01), LLM & Route Optimization (FEAT-02), and Booking & Agency Connector (FEAT-04).
These are prioritized features (Epics) providing value to the user.
Limitations/Exclusions
Travyy shall not implement features related to the inventory management or scheduling tools typically required by external Travel Agencies.
Enforces the limitation of being a connector, reducing scope complexity.

2.3. Core Business Rules (BRs)
Business Rules are policies or computations that constrain some aspect of the business. They are the origin of many subsequent functional requirements.
Rule ID
Type of Rule
Specification
Source Context
BR-CALC-1
Computation
The finalScore for Zone Matching shall be calculated as: 0.6×cosine_score+0.4×keywordMatch.
Defines how existing data is transformed into new data using a mathematical formula.
BR-SEC-1
Constraint
Any Lock (Ban) action performed by the Administrator (UC-A) shall trigger the recording of a Lock History with the specific reason.
Imposes a restriction on system operation based on corporate policy.

III. FEATURE ARCHITECTURE
Features are logically related system capabilities that provide value to a user
ID
Feature / Epic Title
Description
FEAT-01
AI Discovery & Zone Matching
AI interprets user intent and recommends suitable travel zones using hybrid embedding scores.
FEAT-02
AI Route Optimization & Custom Itinerary
Builds optimized itineraries using Map APIs (Map4D DistanceMatrix, Goong Nearby Search, and Weather API) for route generation and itinerary refinement.
FEAT-03
User & Access Management
Manages account registration, roles, verification, and access enforcement for all user classes.
FEAT-04
Booking & Agency Connector
Manages bookings, payments (PayPal, MoMo), and connects with partner agency data sources.
FEAT-05
Gamification & Reward System
Adds reward points, vouchers, and discount logic tied to booking flow.
FEAT-06
Review & Feedback Management
Collects traveler feedback and integrates it into AI discovery to improve recommendations.

IV. DETAILED USER STORIES
User Stories capture user goals and are written in a concise format to serve as a placeholder for future conversations. They are the direct source from which Functional Requirements are derived.

1. Traveler (UC-T)
   Story ID
   Epic
   User Story
   US-T101
   FEAT-01
   As a Traveler, I want to input my preferences using free-text so that the LLM can parse my intent and constraints (e.g., budget, pace, avoid).
   US-T102
   FEAT-01
   As a Traveler, I want to receive a ranked list of Zones so that I can select a destination with the highest suitability score (finalScore).
   US-T103
   FEAT-02
   As a Traveler, I want to automatically optimize the sequence of selected POIs so that the itinerary minimizes total travel time and respects operational hours.
   US-T104
   FEAT-04
   As a Traveler, I want to pay for tours using PayPal so that I can complete transactions securely.
   US-T105
   FEAT-02
   As a Traveler, I want to download the optimized itinerary as a GPX file so that I can use the route with external offline map applications.
   US-T106
   FEAT-02
   As a Traveler, I want to check the weather forecast for my selected zone so that I can adjust my itinerary accordingly.
   US-T107
   FEAT-05
   As a Traveler, I want to earn reward points when I book tours so that I can redeem them for future discounts.
   US-T108
   FEAT-06
   As a Traveler, I want to leave a review and rating after my trip so that others can benefit from my experience.
   US-T109
   FEAT-02
   As a Traveler, I want to save or share my generated itinerary so that I can reuse or send it to friends.
   US-T110
   FEAT-01
   As a Traveler, I want to see nearby attractions and points of interest (POIs) using Map4D and Goong APIs so that I can explore more options
   US-T111
   FEAT-05
   As a Traveler, I want to join seasonal travel challenges so that I can earn extra reward points.

2. Guide (UC-G)
   Story ID
   Epic
   User Story
   US-G101
   FEAT-03
   As a Guide, I want to submit my credentials and profile details so that I can initiate the verification process.
   US-G102
   FEAT-03
   As a Guide, I want to view my current account status (Pending/Verified/Locked) and the reason for a status change so that I know whether I am authorized to receive tour requests.
   US-G103
   FEAT-04
   As a Guide, I want to receive notifications when a Traveler requests a custom tour so that I can accept or decline promptly.
   US-G104
   FEAT-03
   As a Guide, I want to update my service availability schedule so that Travelers can only book me when I’m free.
   US-G105
   FEAT-05
   As a Guide, I want to earn reward points based on my completed tours so that I can increase my visibility on the platform.
   US-G106
   FEAT-06
   As a Guide, I want to view the feedback and ratings left by Travelers so that I can improve my services.

3. Administrator (UC-A)
   Story ID
   Epic
   User Story
   US-A201
   FEAT-03
   As an Administrator, I want to access a unified Guide Management Page at /admin/guides so that all guide-related tasks are consolidated.
   US-A202
   FEAT-03
   As an Administrator, I want to Lock (Ban) any user account and record the Lock History (with reason) so that I can enforce the real-time access control policy (BR-SEC-1).
   US-A203
   FEAT-03
   As an Administrator, I want to export the Guide list to CSV so that I can use the data for external reporting and analysis.
   US-A204
   FEAT-03
   As an Administrator, I want to view a dashboard summarizing user statistics (active users, guides, agencies) so that I can monitor platform performance.
   US-A205
   FEAT-05
   As an Administrator, I want to define reward point rules and expiration policies so that the gamification system stays fair and controlled
   US-A207
   FEAT-06
   As an Administrator, I want to review all Traveler feedback and flag inappropriate content so that the platform maintains quality standards.
   US-A208
   FEAT-03
   As an Administrator, I want to assign different permission levels to staff so that internal management is controlled.

4. Travel Agency (External System Actor - UC-AG)
   Story ID
   Epic
   User Story
   US-AG301
   FEAT-04
   As a Travel Agency (External System), I want Travyy to provide standardized RESTful API endpoints so that my tour inventory can be automatically synchronized.
   US-AG302
   FEAT-04
   As a Travel Agency (External System), I want APIs to manage my Employee Schema so that I can accurately track and update the personnel responsible for operating tours.
   US-AG303
   FEAT-04
   As a Travel Agency, I want to receive booking notifications via API so that I can update my tour availability automatically.
   US-AG304
   FEAT-04
   As a Travel Agency, I want to submit promotional tour data periodically so that my offers appear in user discovery results.
   US-AG305
   FEAT-04
   As a Travel Agency, I want to generate a synchronization report so that I can verify that my data is up-to-date in Travyy.
   US-AG306
   FEAT-04
   As a Travel Agency, I want to receive analytics on user interest by region so that I can plan new tours.

Feature Traceability Matrix (FTM)
The Feature Traceability Matrix (FTM) ensures that every feature (Epic) has corresponding User Stories. This guarantees full coverage of functional requirements and helps trace design, implementation, and testing activities.
Feature ID
Epic / Feature Title
Linked User Stories
Primary Actor(s)
Purpose / Core Value
FEAT-01
AI Discovery & Zone Matching
US-T101, US-T102, US-T110
Traveler
Enables AI-driven zone discovery using hybrid embedding and keyword matching.
FEAT-02
AI Route Optimization & Custom Itinerary
US-T103, US-T105, US-T106, US-T109
Traveler
Builds optimized itineraries with real-time map, distance, and weather data.
FEAT-03
User & Access Management
US-G101, US-G102, US-A201, US-A202, US-A203, US-A204, US-A208
Guide, Administrator
Manages user accounts, verification, and role-based access control.
FEAT-04
Booking & Agency Connector
US-T104, US-G103, US-AG301–US-AG306
Traveler, Guide, Travel Agency
Handles secure booking, payment (PayPal/MoMo), and API synchronization with partner agencies.
FEAT-05
Gamification & Reward System
US-T107, US-T111, US-G105, US-A205
Traveler, Guide, Administrator
Promotes engagement through points, vouchers, and seasonal challenges.
FEAT-06
Review & Feedback Management
US-T108, US-G106, US-A207
Traveler, Guide, Administrator
Collects and moderates feedback to improve AI recommendations and service quality.

V. Acceptance Criteria
Each User Story shall include specific measurable conditions for completion.
Story: US-T103 (Route Optimization)
Given I have selected multiple POIs,
When I click “Optimize Itinerary”,
Then the system shall return an ordered list minimizing total travel time and display route details via Map4D API.

Story: US-T104 (Payment)
Given I choose PayPal as a payment option,
When the transaction succeeds,
Then the system shall display confirmation and update booking history.

Story: US-T108 (Review)
Given I completed a tour,
When I submit a review,
Then it shall appear under that tour with my rating and timestamp.

VI. Non-Functional Requirements (NFR)
Non-Functional Requirements define the system’s quality attributes — the “how” rather than the “what.” They ensure the Travyy platform is reliable, usable, and scalable under real-world conditions.
Category
Requirement Description
Performance
90% of API responses shall complete within 2 seconds under normal usage.
Reliability
The system shall maintain ≥99% uptime per calendar month, excluding scheduled maintenance.
Security
All communication shall use HTTPS; authentication shall rely on JWT tokens; sensitive data shall be encrypted in transit and at rest.
Scalability
The system shall handle ≥500 concurrent active users without service degradation.
Usability
At least 95% of test participants shall be able to complete itinerary creation within 5 minutes.
Compatibility
The system shall support Chrome, Edge, and Safari (latest stable versions) on both desktop and mobile.
Maintainability
Source code shall follow the MVC pattern for backend and component-based React structure for frontend; major modules should be independently upgradable.
Availability & Recovery
Critical services (Booking, Payment, AI Discovery) shall automatically recover within 1 minute after a crash or restart event.

    			 _______END________

