# TRAVYY Backend - Coverage Report Summary

## 📊 Overall Coverage Statistics

- **Statements**: 49.89% (1533/3077)
- **Branches**: 36.29% (599/1651)
- **Functions**: 46.56% (137/295)
- **Lines**: 51.22% (1508/2946)

## 📁 File-by-File Breakdown

### Tested Files (with coverage > 0%)

| File | Statements | Branches | Functions | Lines | Status |
|------|------------|----------|-----------|-------|--------|
| `controller/auth.controller.js` | 62.98% | 45.68% | 90.9% | 64.62% | ✅ Tested |
| `controller/bookingController.js` | 98.14% | 77.35% | 100% | 98% | ✅ Well Tested |
| `controller/cart.controller.js` | 74.58% | 65.54% | 94.73% | 75.14% | ✅ Tested |
| `controller/helpController.js` | 77.27% | 80% | 100% | 77.64% | ✅ Tested |
| `controller/notifyController.js` | 30.64% | 11.53% | 30% | 30.64% | ⚠️ Partially Tested |
| `controller/payment.controller.js` | 69.26% | 58.33% | 93.33% | 71.35% | ✅ Tested |
| `controller/paypal.controller.js` | 7.28% | 1.62% | 0% | 7.73% | ❌ Mostly Untested |
| `controller/profile.controller.js` | 79.72% | 48.78% | 50% | 84.37% | ✅ Tested |
| `controller/reviewController.js` | 25.89% | 15.62% | 26.66% | 26.31% | ⚠️ Partially Tested |
| `controller/wishlistController.js` | 41.79% | 21.42% | 55.55% | 40.62% | ⚠️ Partially Tested |
| `models/Blogs.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `models/Bookings.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `models/Carts.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `models/Location.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `models/PaymentSession.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `models/Tours.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `models/TravelAgency.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `models/Wishlist.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `models/HelpArticle.js` | 0% | 100% | 100% | 0% | ❌ Schema Only |
| `models/HelpCategory.js` | 0% | 100% | 100% | 0% | ❌ Schema Only |
| `models/HelpFeedback.js` | 0% | 100% | 100% | 0% | ❌ Schema Only |
| `models/Notification.js` | 35.55% | 0% | 0% | 40% | ⚠️ Partially Tested |
| `models/Review.js` | 32.69% | 0% | 0% | 38.63% | ⚠️ Partially Tested |
| `models/Tickets.js` | 0% | 100% | 100% | 0% | ❌ Schema Only |
| `models/Users.js` | 0% | 100% | 0% | 0% | ❌ Schema Only |
| `routes/auth.routes.js` | 29.16% | 0% | 0% | 30.88% | ⚠️ Partially Tested |
| `routes/blogs.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `routes/bookingRoutes.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `routes/carts.routes.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `routes/help.routes.js` | 0% | 0% | 0% | 0% | ❌ Not Tested |
| `routes/location.routes.js` | 16.41% | 0% | 0% | 20.75% | ⚠️ Partially Tested |
| `routes/notifyRoutes.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `routes/payment.routes.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `routes/paypal.routes.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `routes/profile.routes.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `routes/reviewRoutes.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `routes/tour.routes.js` | 22.22% | 0% | 0% | 23.25% | ⚠️ Partially Tested |
| `routes/wishlist.routes.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `utils/emailService.js` | 90.9% | 75% | 100% | 90.9% | ✅ Well Tested |
| `utils/jwt.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `utils/paymentHelpers.js` | 19.67% | 5.55% | 33.33% | 20% | ⚠️ Partially Tested |

### Untested Files (0% coverage)

| File | Statements | Branches | Functions | Lines | Reason |
|------|------------|----------|-----------|-------|--------|
| `controller/admin/` | 0/407 | 0/232 | 0/58 | 0/395 | No unit tests written |
| `models/agency/` | 0/24 | 0/0 | 0/1 | 0/24 | No model tests written |
| `routes/admin/` | 0/77 | 0/0 | 0/0 | 0/77 | No integration tests |

## 🔍 Uncovered Lines Analysis

### Primary Reasons for Current Coverage Level:

1. **Significant Test Coverage**: 49.89% overall with many controllers and models tested
2. **Test Failures**: Some tests are failing due to mocking issues and implementation bugs
3. **Partial Implementation**: Some controllers have incomplete test coverage
4. **Model Schema Testing**: Many models only have schema definitions without method testing

### Specific Uncovered Areas:

#### Controller Layer (Remaining ~47% uncovered)
- PayPal controller: 92.72% uncovered (mostly webhook handling)
- Review controller: 74.11% uncovered (getReviews, getReviewStats functions)
- Notify controller: 69.36% uncovered (email sending and notification creation)
- Wishlist controller: 58.21% uncovered (bulk operations and error handling)
- Payment helpers: 80.33% uncovered (complex payment logic)

#### Model Layer (Remaining ~56% uncovered)
- User model: Schema only, no method testing
- Help-related models: Schema definitions without functionality
- Notification model: Partial method testing
- Review model: Partial method testing

#### Route Layer (Remaining ~54% uncovered)
- Auth routes: Partial integration testing
- Location routes: Basic route testing
- Tour routes: Partial CRUD testing
- Help routes: No testing

#### Utils Layer (Remaining ~61% uncovered)
- Payment helpers: Complex business logic not fully tested

## 📈 Coverage Improvement Plan

### Phase 1: Fix Failing Tests (Target: 60% coverage)
1. **Fix Test Failures**
   - Resolve mocking issues in reviewController tests
   - Fix notifyController method calls
   - Correct auth.controller.test.js encoding issues
   - Fix integration test expectations

2. **Complete Controller Tests**
   - Add missing test cases for error scenarios
   - Test edge cases and validation
   - Improve mocking strategies

3. **Model Method Testing**
   - Add method tests for User, Notification, Review models
   - Test custom static methods and instance methods

### Phase 2: Integration Tests Enhancement (Target: 80% coverage)
1. **Complete Route Testing**
   - Fix failing integration tests
   - Add comprehensive API endpoint testing
   - Test authentication and authorization flows

2. **Database Integration**
   - Test actual database operations (with test DB)
   - Transaction and rollback testing
   - Data consistency across operations

### Phase 3: Advanced Testing (Target: 90%+ coverage)
1. **E2E Test Suite**
   - Full user journey testing
   - Cross-service integration testing
   - Performance and load testing

2. **Edge Case Coverage**
   - Network failure scenarios
   - Database connection issues
   - External service failures

## 🛠️ Technical Challenges

### Current Issues
- **Test Encoding Problems**: auth.controller.test.js has encoding issues
- **Mocking Complexity**: Complex interdependencies between models and controllers
- **Failing Tests**: 34 failed tests out of 154 total need fixing
- **Integration Test Flakiness**: Date serialization and expectation mismatches

### Test Environment Setup
- Database mocking strategy needs improvement
- External service mocking (PayPal, email) requires better utilities
- Test data management and seeding

### Async Operation Testing
- Email sending verification needs better mocking
- Payment gateway integration testing
- File upload and processing testing

## 📋 Recommendations

1. **Fix Failing Tests First**: Address the 34 failing tests to stabilize coverage
2. **Improve Test Quality**: Focus on meaningful assertions and edge cases
3. **Modular Testing Approach**: Break down complex tests into smaller units
4. **CI/CD Integration**: Automate coverage reporting and failure alerts
5. **Test Documentation**: Document testing patterns and mocking strategies

## 📊 Coverage Report Files

- **HTML Report**: `coverage/index.html` - Interactive coverage browser
- **LCOV Report**: `coverage/lcov-report/index.html` - Detailed line-by-line coverage
- **JSON Summary**: `coverage/coverage-summary.json` - Machine-readable statistics

---

*Report generated on: November 1, 2025*
*Test Framework: Jest with Istanbul coverage*

#### Model Layer (220 uncovered statements)
- All Mongoose schemas and methods
- Data validation logic
- Database query methods

#### Route Layer (420 uncovered statements)
- API endpoint handlers
- Middleware chains
- Error response formatting

#### Utils Layer (151 uncovered statements)
- Email service implementation
- Payment helpers
- File upload utilities

## 📈 Coverage Improvement Plan

### Phase 1: Unit Tests (Target: 60% coverage)
1. **Complete Controller Tests**
   - Write unit tests for all controllers
   - Mock external dependencies properly
   - Test error scenarios

2. **Model Tests**
   - Test all Mongoose models
   - Validate schema definitions
   - Test custom methods

3. **Utils Tests**
   - Complete email service tests
   - Test payment utilities
   - File handling tests

### Phase 2: Integration Tests (Target: 80% coverage)
1. **API Route Testing**
   - Fix mocking issues
   - Test complete request/response cycles
   - Authentication middleware testing

2. **Database Integration**
   - Test database operations
   - Transaction testing
   - Data consistency validation

### Phase 3: E2E Tests (Target: 90%+ coverage)
1. **Full Application Testing**
   - End-to-end user flows
   - Cross-service integration
   - Performance testing

## 🛠️ Technical Challenges

### Mocking Complexity
- Mongoose Schema instantiation issues
- Circular dependency problems
- External service mocking (PayPal, email)

### Test Environment Setup
- Database connection mocking
- Environment variable management
- Test data seeding

### Async Operation Testing
- Email sending verification
- File upload testing
- Payment gateway integration

## 📋 Recommendations

1. **Prioritize Unit Tests**: Focus on isolated function testing first
2. **Improve Mocking Strategy**: Develop better mocking utilities
3. **Gradual Coverage Increase**: Aim for 10-15% coverage improvement per sprint
4. **Test-Driven Development**: Write tests before implementing new features
5. **CI/CD Integration**: Automate coverage checks in build pipeline

## 📊 Coverage Report Files

- **HTML Report**: `coverage/index.html` - Interactive coverage browser
- **LCOV Report**: `coverage/lcov-report/index.html` - Detailed line-by-line coverage
- **JSON Summary**: `coverage/coverage-summary.json` - Machine-readable statistics

---

*Report generated on: October 30, 2025*
*Test Framework: Jest with Istanbul coverage*</content>
<parameter name="filePath">d:\FPT\Ky5\SWP391\TRAVYY-touring-website\touring-be\COVERAGE_REPORT.md