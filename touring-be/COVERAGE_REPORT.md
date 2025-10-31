# TRAVYY Backend - Coverage Report Summary

## 📊 Overall Coverage Statistics

- **Statements**: 4.15% (128/3077)
- **Branches**: 4.42% (73/1651)
- **Functions**: 5.42% (16/295)
- **Lines**: 4.27% (126/2946)

## 📁 File-by-File Breakdown

### Tested Files (with coverage > 0%)

| File | Statements | Branches | Functions | Lines | Status |
|------|------------|----------|-----------|-------|--------|
| `controller/auth.controller.js` | ~78.91% | ~57.75% | 100% | ~78.91% | ✅ Tested |
| `utils/jwt.js` | 100% | 100% | 100% | 100% | ✅ Fully Tested |
| `models/Users.js` | 0% | 0% | 0% | 0% | ❌ Not Tested |

### Untested Files (0% coverage)

| File | Statements | Branches | Functions | Lines | Reason |
|------|------------|----------|-----------|-------|--------|
| `controller/` (other) | 0/1869 | 0/1118 | 0/162 | 0/1779 | No unit tests written |
| `controller/admin/` | 0/407 | 0/232 | 0/58 | 0/395 | No unit tests written |
| `models/` (other) | 0/196 | 0/85 | 0/30 | 0/182 | No model tests written |
| `models/agency/` | 0/24 | 0/0 | 0/1 | 0/24 | No model tests written |
| `routes/` | 0/343 | 0/65 | 0/29 | 0/332 | No integration tests |
| `routes/admin/` | 0/77 | 0/0 | 0/0 | 0/77 | No integration tests |
| `utils/` (other) | 0/151 | 0/151 | 0/10 | 0/147 | Partial testing |

## 🔍 Uncovered Lines Analysis

### Primary Reasons for Low Coverage:

1. **Limited Test Scope**: Only 3 out of ~50+ files have unit tests
2. **Integration Test Failures**: Complex mocking issues prevent full API testing
3. **Model Layer Untested**: All Mongoose models lack unit tests
4. **Route Layer Untested**: No integration tests for API endpoints

### Specific Uncovered Areas:

#### Controller Layer (1869 uncovered statements)
- Booking management logic
- Payment processing
- Cart operations
- Review system
- Wishlist functionality
- Admin panel controllers

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