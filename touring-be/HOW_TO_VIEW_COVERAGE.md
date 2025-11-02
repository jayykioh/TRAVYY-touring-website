# 📊 Hướng dẫn xem Test Coverage

## 🚀 Cách chạy tests với coverage

### 1. Chạy tests với coverage report
```powershell
npm test -- --coverage --runInBand
```

Hoặc sử dụng script có sẵn:
```powershell
npm run test:coverage
```

### 2. Các file coverage được tạo ra

Sau khi chạy, các file sau sẽ được tạo trong thư mục `coverage/`:

```
coverage/
├── lcov-report/          # HTML report chi tiết
│   ├── index.html        # Trang chính
│   └── ...               # Các file HTML khác
├── coverage-final.json   # Coverage data dạng JSON
└── lcov.info            # Coverage data dạng LCOV
```

---

## 🌐 Xem Coverage Report

### Cách 1: Trang tổng quan đẹp (Khuyến nghị)
```powershell
# Mở coverage summary trang overview
ii .\coverage-summary.html
```

Hoặc double-click vào file `coverage-summary.html` trong thư mục `touring-be/`

**Trang này hiển thị:**
- ✅ Tổng quan coverage (77.21% statements)
- ✅ Biểu đồ progress bars đẹp mắt
- ✅ Bảng chi tiết từng module
- ✅ Test statistics
- ✅ Link đến detailed report

### Cách 2: Detailed HTML Report (Chi tiết từng file)
```powershell
# Mở detailed coverage report
ii .\coverage\lcov-report\index.html
```

**Report chi tiết này cho phép:**
- 🔍 Click vào từng file để xem code coverage
- 🎨 Highlight các dòng code:
  - 🟢 Xanh = Covered
  - 🔴 Đỏ = Not covered
  - 🟡 Vàng = Partial coverage
- 📊 Coverage % chi tiết cho mỗi file

---

## 📖 Xem Test Cases Documentation

```powershell
# Xem chi tiết test cases, input/output, flow
code .\TEST_CASES_DOCUMENTATION.md
```

Hoặc:
```powershell
notepad .\TEST_CASES_DOCUMENTATION.md
```

---

## 🎯 Coverage Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Statements | 77.21% | 85% | 🟡 In Progress |
| Branches | 59.93% | 70% | 🟡 In Progress |
| Functions | 84.02% | 85% | 🟢 Almost There |
| Lines | 77.83% | 85% | 🟡 In Progress |

---

## 🔧 Các lệnh hữu ích

### Chạy test cho một file cụ thể
```powershell
npm test -- llm.test.js
```

### Chạy tests theo pattern
```powershell
npm test -- --testPathPattern=routes
```

### Chạy tests với watch mode
```powershell
npm test -- --watch
```

### Chạy tests với verbose output
```powershell
npm test -- --verbose
```

### Chạy tests và kiểm tra open handles
```powershell
npm test -- --detectOpenHandles
```

---

## 📂 Cấu trúc Test Files

```
touring-be/
├── coverage-summary.html          # 🌐 Overview page (mở file này!)
├── TEST_CASES_DOCUMENTATION.md    # 📖 Chi tiết test cases
├── README_TESTS.md                # 📝 Test setup & mock table
├── jest.config.cjs                # ⚙️ Jest configuration
├── jest.setup.js                  # 🔧 Global test setup
│
├── coverage/                      # 📊 Coverage reports
│   ├── lcov-report/
│   │   └── index.html            # Chi tiết từng file
│   ├── coverage-final.json
│   └── lcov.info
│
└── [modules]/
    └── __tests__/                # 🧪 Test files
        ├── llm.test.js
        ├── goong.test.js
        ├── poi-finder.test.js
        └── ...
```

---

## 🐛 Troubleshooting

### Lỗi: "coverage: The term 'coverage' is not recognized"

❌ **SAI:**
```powershell
ii .\coverage\lcov-report\index.html ( coverage )
```

✅ **ĐÚNG:**
```powershell
ii .\coverage\lcov-report\index.html
```

Hoặc:
```powershell
ii .\coverage-summary.html
```

### Lỗi: Coverage chưa được tạo

Chạy lệnh sau để tạo coverage mới:
```powershell
npm test -- --coverage --runInBand
```

### Lỗi: Port already in use (khi test routes)

```powershell
# Kill process đang sử dụng port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📱 Screenshots

### Coverage Summary Page
![Coverage Summary](docs/coverage-summary-screenshot.png)

### Detailed Report
![Detailed Report](docs/coverage-detailed-screenshot.png)

---

## 📚 Tài liệu liên quan

- 📖 [TEST_CASES_DOCUMENTATION.md](./TEST_CASES_DOCUMENTATION.md) - Chi tiết input/output/flow
- 📝 [README_TESTS.md](./README_TESTS.md) - Test setup và mock strategies
- 🎯 [PROMPTS.md](./PROMPTS.md) - AI prompts documentation
- 📊 [DELIVERY.md](./DELIVERY.md) - Delivery checklist

---

## 🎨 Coverage Color Coding

Trong detailed HTML report:

| Color | Meaning | Percentage |
|-------|---------|------------|
| 🟢 **Green** | Excellent | 80% - 100% |
| 🟡 **Yellow** | Good | 50% - 79% |
| 🔴 **Red** | Needs work | 0% - 49% |

---

## 💡 Tips

1. **Xem overview nhanh**: Mở `coverage-summary.html` để xem tổng quan
2. **Debug test failures**: Sử dụng `npm test -- --verbose` để xem chi tiết
3. **Focus vào module cụ thể**: Click vào module trong detailed report để xem code coverage
4. **Kiểm tra branch coverage**: Các branches (if/else) cần được test đầy đủ
5. **Cập nhật coverage**: Mỗi lần thêm tests mới, chạy lại `npm test -- --coverage`

---

## 🔗 Quick Links

- 🌐 [Coverage Summary (Pretty)](./coverage-summary.html) ← **MỞ FILE NÀY!**
- 📊 [Detailed HTML Report](./coverage/lcov-report/index.html)
- 📖 [Test Cases Documentation](./TEST_CASES_DOCUMENTATION.md)
- 📝 [Test Setup Guide](./README_TESTS.md)

---

**Last Updated**: November 1, 2025  
**Current Coverage**: 77.21% statements  
**Status**: ✅ Running smoothly
