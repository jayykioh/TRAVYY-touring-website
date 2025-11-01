# 📝 Test Prompts History

> This document tracks all prompts used to guide AI in writing and fixing tests for the TRAVYY Touring Website project.  
> Each entry shows the **Input** (your prompt) and **Output** (what was accomplished).

---

## 🚀 Initial Setup

### **Prompt #1: Project Test Setup**

**📥 INPUT:**
```
tôi cần test unit và integration cho project của tôi hãy tạo cho tôi và setup môi trường test
```

**📤 OUTPUT:**
- ✅ Created Jest configuration (`jest.config.js`)
- ✅ Set up test directory structure (`test/unit/`, `test/integration/`)
- ✅ Installed testing dependencies (jest, supertest, @types/jest)
- ✅ Created `test/setup.js` for global test configuration
- ✅ Added npm scripts for running tests

---

### **Prompt #2: Typo Correction**

**📥 INPUT:**
```
tieeps
```

**📤 OUTPUT:**
- ℹ️ Clarification requested

---

## 🎯 Coverage Requirements

### **Prompt #3: High Coverage Target**

**📥 INPUT:**
```
tôi cần tất cả các file nó có độ thành công là trên 80%
```

**📤 OUTPUT:**
- ✅ Set coverage threshold to 80% in `jest.config.js`
- ✅ Configured coverage reporters (text, lcov, html)
- ✅ Added coverage collection paths
- 📊 Target: 80% coverage for statements, branches, functions, lines

---

### **Prompt #4: Documentation Request**

**📥 INPUT:**
```
ghi lại những prompt tôi dùng để làm test đi bỏ vào file md nnàoddos
```

**📤 OUTPUT:**
- ✅ Created `TEST_PROMPTS_HISTORY.md`
- ✅ Documented all previous prompts
- ✅ Set up tracking system for future prompts

---

## 🧪 Unit Tests Creation

### **Prompt #5: Controller Tests**

**📥 INPUT:**
```
tôi cần test unit cho cart.controller.js, bookingController.js, wishlistController.js, payment.controller.js
```

**📤 OUTPUT:**
- ✅ Created `test/unit/cart.controller.test.js`
- ✅ Created `test/unit/bookingController.test.js`
- ✅ Created `test/unit/wishlistController.test.js`
- ✅ Created `test/unit/payment.controller.test.js`
- 📊 Initial test coverage: ~60-70%

---

## 🐛 Bug Fixes - Mongoose Mocking

### **Prompt #6: Mongoose Mock Issues**

**📥 INPUT:**
```
hãy sửa lỗi mock mongoose cho các test unit
```

**📤 OUTPUT:**
- ✅ Fixed mongoose mock in `__mocks__/mongoose.js`
- ✅ Added proper Schema and model mocking
- ✅ Mocked mongoose.Types.ObjectId
- ✅ Fixed connection mock

---

### **Prompt #7: Booking Controller Retest**

**📥 INPUT:**
```
hãy chạy lại test unit cho bookingController
```

**📤 OUTPUT:**
- ✅ Verified bookingController tests pass
- 📊 Coverage: 98%+ for bookingController.js
- ✅ All test cases passing

---

## 🐛 Bug Fixes - Module Issues

### **Prompt #8: ESM Import Error**

**📥 INPUT:**
```
hãy sửa lỗi Cannot use import statement outside a module khi test payment.controller.js
```

**📤 OUTPUT:**
- ✅ Converted ES6 imports to CommonJS require()
- ✅ Updated jest.config.js transform settings
- ✅ Fixed module resolution for payment controller tests

**🔧 Solution:**
```javascript
// Before: import { function } from 'module';
// After:  const { function } = require('module');
```

---

### **Prompt #9: Session Mock Error**

**📥 INPUT:**
```
hãy sửa lỗi TypeError: mongoose.startSession is not a function trong test cart.controller.js
```

**📤 OUTPUT:**
- ✅ Added mongoose.startSession mock
- ✅ Mocked session transaction methods
- ✅ Implemented withTransaction callback

**🔧 Solution:**
```javascript
jest.mock('mongoose', () => ({
  startSession: jest.fn().mockResolvedValue({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
    withTransaction: jest.fn((callback) => callback())
  })
}));
```

---

### **Prompt #10: Model Method Mock Error**

**📥 INPUT:**
```
hãy sửa lỗi TypeError: Cannot read properties of undefined (reading 'find') trong test helpController.test.js
```

**📤 OUTPUT:**
- ✅ Added complete model method mocks (find, findOne, create, etc.)
- ✅ Fixed model import and mock order
- ✅ Ensured mocks are defined before controller import

---

### **Prompt #11: Jest Token Error**

**📥 INPUT:**
```
hãy sửa lỗi Jest encountered an unexpected token trong test auth.controller.test.js
```

**📤 OUTPUT:**
- ✅ Fixed file encoding issues (removed BOM)
- ✅ Verified jest babel configuration
- ✅ Ensured proper syntax in test files

---

### **Prompt #12: ObjectId Mock Error**

**📥 INPUT:**
```
hãy sửa lỗi TypeError: Cannot read properties of undefined (reading 'ObjectId') trong test Bookings.model.test.js
```

**📤 OUTPUT:**
- ✅ Added mongoose.Types.ObjectId mock
- ✅ Mocked Schema.Types.ObjectId for model definitions
- ✅ Fixed ObjectId references in tests

**🔧 Solution:**
```javascript
mongoose.Types = {
  ObjectId: jest.fn((id) => id || 'mock-object-id')
};
```

---

### **Prompt #13: Module Path Error**

**📥 INPUT:**
```
hãy sửa lỗi Cannot find module '../../models/agency/Tours' from 'test/unit/paymentHelpers.test.js'
```

**📤 OUTPUT:**
- ✅ Corrected module path from `models/agency/Tours` to `models/Tours`
- ✅ Updated all Tour model imports in tests
- ✅ Verified file structure matches imports

---

## 🐛 Bug Fixes - Test Assertions

### **Prompt #14: Jest Mock Assertion Error**

**📥 INPUT:**
```
hãy sửa lỗi expect(jest.fn()).toHaveBeenCalledWith(...expected) trong test addToCart
```

**📤 OUTPUT:**
- ✅ Fixed mock function expectations
- ✅ Added proper mock data matching actual function calls
- ✅ Used `expect.objectContaining()` for flexible matching

**🔧 Solution:**
```javascript
expect(mockFunction).toHaveBeenCalledWith(
  expect.objectContaining({
    expectedProp: expectedValue
  })
);
```

---

### **Prompt #15: Object Equality Error**

**📥 INPUT:**
```
hãy sửa lỗi expect(received).toBe(expected) // Object.is equality trong test payment.routes.integration.test.js
```

**📤 OUTPUT:**
- ✅ Changed `.toBe()` to `.toEqual()` for object comparison
- ✅ Fixed deep equality checks
- ✅ Updated date/timestamp comparisons

**🔧 Solution:**
```javascript
// Before: expect(result).toBe(expected);
// After:  expect(result).toEqual(expected);
```

---

### **Prompt #16: Blog Routes Mock Error**

**📥 INPUT:**
```
hãy sửa lỗi TypeError: Cannot read properties of undefined (reading 'findOne') trong test blogs.routes.integration.test.js
```

**📤 OUTPUT:**
- ✅ Added Blog model mock with findOne method
- ✅ Fixed model method chain (populate, select, exec)
- ✅ Ensured mock returns proper structure

---

## 🔧 Advanced Mock Fixes

### **Prompt #17: General Mock Issues**

**📥 INPUT:**
```
hãy sửa lỗi test bị failed do mock chưa đúng
```

**📤 OUTPUT:**
- ✅ Reviewed and fixed all model mocks
- ✅ Ensured mock functions return correct data types
- ✅ Added missing mock methods
- ✅ Fixed async/await in mocks

---

### **Prompt #18: ESM/CommonJS Conflict**

**📥 INPUT:**
```
hãy sửa lỗi test bị failed do import/export không đồng nhất giữa ESM và CommonJS
```

**📤 OUTPUT:**
- ✅ Standardized all imports to CommonJS (require/module.exports)
- ✅ Updated jest.config.js for proper module handling
- ✅ Fixed mixed module syntax in controllers and tests

---

### **Prompt #19: Mock Order Error**

**📥 INPUT:**
```
hãy sửa lỗi test bị failed do require controller trước khi mock model
```

**📤 OUTPUT:**
- ✅ Reordered test files: mocks BEFORE controller imports
- ✅ Added comments to prevent future ordering mistakes
- ✅ Created test template with proper order

**🔧 Best Practice:**
```javascript
// 1. Mock dependencies FIRST
jest.mock('../../models/User');
jest.mock('bcrypt');

// 2. THEN require the controller
const controller = require('../../controller/auth.controller');
```

---

### **Prompt #20: Transaction Mock Error**

**📥 INPUT:**
```
hãy sửa lỗi test bị failed do chưa mock startSession, withTransaction
```

**📤 OUTPUT:**
- ✅ Added complete session mock with all transaction methods
- ✅ Implemented withTransaction callback execution
- ✅ Mocked commit, abort, and endSession

**🔧 Complete Solution:**
```javascript
const mockSession = {
  startTransaction: jest.fn().mockResolvedValue({}),
  commitTransaction: jest.fn().mockResolvedValue({}),
  abortTransaction: jest.fn().mockResolvedValue({}),
  endSession: jest.fn().mockResolvedValue({}),
  withTransaction: jest.fn(async (callback) => {
    await callback(mockSession);
  })
};

mongoose.startSession = jest.fn().mockResolvedValue(mockSession);
```

---

### **Prompt #21: Comprehensive Mock Fix**

**📥 INPUT:**
```
hãy sửa lỗi test bị failed do chưa mock đúng các method của model, mongoose, các thư viện bên ngoài, controller, utils, service, helper, middleware, route, config, constant, enum, schema, validator, transformer, formatter, parser, serializer, deserializer, adapter, provider, repository, dao, entity, aggregate, value object, domain service, application service, infrastructure service, external service
```

**📤 OUTPUT:**
- ✅ Created comprehensive mocking guide
- ✅ Added mock templates for all common dependencies:
  - 📦 Models (User, Booking, Cart, etc.)
  - 🗄️ Mongoose (Schema, Types, Session)
  - 🔐 External libs (bcrypt, jwt, nodemailer, stripe, cloudinary)
  - 🛠️ Utils & Helpers
  - 🚪 Middleware (auth, upload)
  - 📡 Services
  - ⚙️ Config & Constants
- ✅ Documented mock patterns and best practices
- ✅ Created troubleshooting checklist

---

## 📊 Current Test Status

### **Coverage Summary:**
```
Statements   : 47.57% ( 950/1997 )
Branches     : 33.68% ( 347/1030 )
Functions    : 42.51% ( 88/207 )
Lines        : 48.96% ( 922/1883 )
```

### **Test Results:**
- ✅ **120 tests passing**
- ❌ **34 tests failing** (being fixed)
- 📁 **20 test suites** total

### **Files with 70%+ Coverage:**
- 🏆 `bookingController.js` - **98%**
- 🏆 `profile.controller.js` - **84.38%**
- ✅ `helpController.js` - **77.65%**
- ✅ `cart.controller.js` - **75.15%**
- ✅ `payment.controller.js` - **71.36%**
- 🏆 All Models - **100%**
- 🏆 All Routes - **100%**
- 🏆 `emailService.js` - **90.91%**
- 🏆 `jwt.js` - **100%**

---

## 📝 Notes & Learnings

### **Key Takeaways:**
1. 🔑 Always mock dependencies BEFORE importing modules
2. 🔄 Use `jest.clearAllMocks()` in `beforeEach()`
3. 🎯 Mock chain methods with `.mockReturnThis()`
4. ⚡ Async functions need `.mockResolvedValue()` or `.mockRejectedValue()`
5. 📦 Keep mocks consistent with actual implementation
6. 🧪 Test both success and error cases
7. 📊 Aim for meaningful coverage, not just high numbers

### **Common Patterns:**
- Mock Model: `jest.mock('../../models/Model', () => ({ find: jest.fn(), ... }))`
- Mock Session: Create mockSession object with all transaction methods
- Mock External Libs: Mock at module level with factory functions
- Assertions: Use `.toEqual()` for objects, `.toBe()` for primitives

---

## 🎯 Next Steps

- [ ] Fix remaining 34 failing tests
- [ ] Increase coverage for low-coverage files:
  - `paypal.controller.js` (7.28%)
  - `reviewController.js` (25.89%)
  - `notifyController.js` (30.64%)
  - `wishlistController.js` (41.79%)
- [ ] Add integration tests for critical flows
- [ ] Set up CI/CD pipeline with test automation
- [ ] Reach 70%+ overall coverage

---

**📅 Last Updated:** November 1, 2025  
**👨‍💻 Project:** TRAVYY Touring Website  
**🔗 Branch:** TestCase

---

*Add new prompts below this line* ⬇️

