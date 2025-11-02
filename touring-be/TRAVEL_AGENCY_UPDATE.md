# Travel Agency Model Update

## 📋 Tổng quan

Đã cập nhật model `TravelAgency` với cấu trúc mới bao gồm thông tin chi tiết về nhân viên (employees).

## 🔧 Thay đổi Model

### Employee Schema (Sub-document)

```javascript
{
  employeeId: ObjectId,          // Reference to User
  name: String,                  // Tên nhân viên
  avatarUrl: String,            // Link avatar
  rating: Number (0-5),         // Đánh giá
  experienceYears: Number,      // Số năm kinh nghiệm
  email: String,                // Email
  phone: String,                // SĐT
  stats: {
    tours: Number,              // Tổng số tour
    completed: Number,          // Tour hoàn thành
    revenue: Number,            // Doanh thu
    currency: String            // Đơn vị tiền tệ
  },
  languages: [String],          // Ngôn ngữ
  specializations: [String],    // Chuyên môn
  status: String                // active/inactive/suspended
}
```

## 🚀 Cách sử dụng

### 1. Seed dữ liệu mẫu

```bash
cd touring-be
npm run seed:agencies
```

### 2. API Endpoints (Admin only)

**Lấy tất cả agencies:**

```
GET /api/admin/agencies
Query params: ?search=keyword
```

**Lấy chi tiết agency:**

```
GET /api/admin/agencies/:id
```

**Tạo agency mới:**

```
POST /api/admin/agencies
Body: { name, contact, phone, address, image, employees }
```

**Cập nhật agency:**

```
PUT /api/admin/agencies/:id
Body: { name, contact, phone, address, image }
```

**Xóa agency:**

```
DELETE /api/admin/agencies/:id
```

**Thêm nhân viên:**

```
POST /api/admin/agencies/:id/employees
Body: { employeeId, name, email, phone, ... }
```

**Cập nhật nhân viên:**

```
PUT /api/admin/agencies/:id/employees/:employeeId
Body: { name, rating, stats, ... }
```

**Xóa nhân viên:**

```
DELETE /api/admin/agencies/:id/employees/:employeeId
```

**Thống kê:**

```
GET /api/admin/agencies/stats
```

## 📊 Dữ liệu mẫu

### Công ty 1: Khát vọng Việt

- 5 nhân viên
- Chuyên tour miền Bắc
- Tổng doanh thu: ~1.65 tỷ VNĐ

### Công ty 2: Tây Bắc

- 5 nhân viên
- Chuyên tour Tây Bắc
- Tổng doanh thu: ~1.65 tỷ VNĐ

## 🔑 Lưu ý

1. **employeeId** có thể reference đến User collection (nếu nhân viên có tài khoản)
2. **stats** được tính tự động khi query
3. Tất cả endpoints yêu cầu **admin authentication**
4. Model sử dụng **agencyConn** (kết nối riêng cho agency database)

## 📝 Example Response

```json
{
  "success": true,
  "data": {
    "_id": "68ee1a650d63b3a633728632",
    "name": "Công ty du lịch Khát vọng Việt",
    "contact": "dulichkhatvongviet@gmail.com",
    "phone": "0934507489",
    "address": "Số 14 Nguyễn Vĩnh Bảo...",
    "image": "https://...",
    "employees": [...],
    "stats": {
      "totalEmployees": 5,
      "activeEmployees": 5,
      "totalTours": 550,
      "completedTours": 525,
      "totalRevenue": 1650000000,
      "averageRating": "4.7"
    }
  }
}
```

## 🎯 Next Steps

1. Chạy seed script để import dữ liệu
2. Test các API endpoints
3. Tích hợp vào admin frontend
4. Thêm validation và error handling nếu cần
