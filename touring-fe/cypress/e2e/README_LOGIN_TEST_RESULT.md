# Kết quả chạy test Cypress cho Login UI

## Cách chạy test

1. Chạy server frontend (ở thư mục touring-fe):
   ```sh
   npm run dev
   ```
2. Chạy server backend (ở thư mục touring-be):
   ```sh
   node server.js
   ```
3. Mở một terminal mới, chạy test với Cypress:
   ```sh
   npx cypress open
   ```
   hoặc chạy headless:
   ```sh
   npx cypress run --spec "cypress/e2e/login.cy.js"
   ```

## Kết quả test case (sample)

## Traveler Login UI

| Test case                                                    | Kết quả thực tế | Mong muốn | Đúng với mong muốn? | Ghi chú                                                                     |
| ------------------------------------------------------------ | :-------------: | :-------: | :-----------------: | --------------------------------------------------------------------------- |
| should render traveler login form                            |     failed      |   pass    |         ❌          | Không tìm thấy input name="email" trên trang /login.                        |
| should show error for empty or invalid input                 |     failed      |   pass    |         ❌          | Không tìm thấy button submit hoặc form không render đúng trên trang /login. |
| should login successfully and redirect to traveler dashboard |     passed      |   pass    |         ✅          |                                                                             |
| should show error for incorrect credentials                  |     failed      |   pass    |         ❌          | Không tìm thấy input name="email" trên trang /login.                        |

---

## Admin Login UI

| Test case                                                            | Kết quả thực tế | Mong muốn | Đúng với mong muốn? | Ghi chú                                                                          |
| -------------------------------------------------------------------- | :-------------: | :-------: | :-----------------: | -------------------------------------------------------------------------------- |
| should render login form with email and password fields              |     passed      |   pass    |         ✅          |                                                                                  |
| should show error if email or password is empty                      |     passed      |   pass    |         ✅          |                                                                                  |
| should show error for invalid email format                           |     failed      |   pass    |         ❌          | Không tìm thấy nội dung "Email không hợp lệ" sau khi submit email sai định dạng. |
| should show/hide password when toggle is clicked                     |     failed      |   pass    |         ❌          | Sau khi click nút hiện/ẩn password, thuộc tính type vẫn là "password".           |
| should show loading state when submitting                            |     failed      |   pass    |         ❌          | Không tìm thấy nội dung "Đang đăng nhập..." khi submit.                          |
| should login successfully with correct credentials                   |     failed      |   pass    |         ❌          | Không chuyển hướng sang /admin/dashboard.                                        |
| should remember email if "Ghi nhớ đăng nhập" is checked              |     failed      |   pass    |         ❌          | localStorage không lưu giá trị adminRemember.                                    |
| should redirect to verify page if 2FA or email verification required |     failed      |   pass    |         ❌          | Không chuyển hướng sang /admin/login/verify.                                     |

- Lý do: Không tìm thấy nội dung "Email không hợp lệ" sau khi submit email sai định dạng.
  should show/hide password when toggle is clicked: **failed**
- Lý do: Sau khi click nút hiện/ẩn password, thuộc tính type vẫn là "password".
  should show loading state when submitting: **failed**
- Lý do: Không tìm thấy nội dung "Đang đăng nhập..." khi submit.
  should login successfully with correct credentials: **failed**
- Lý do: Không chuyển hướng sang /admin/dashboard.
  should remember email if "Ghi nhớ đăng nhập" is checked: **failed**
- Lý do: localStorage không lưu giá trị adminRemember.
  should redirect to verify page if 2FA or email verification required: **failed**
- Lý do: Không chuyển hướng sang /admin/login/verify.
- Lý do: Không tìm thấy input name="email" trên trang /login.

---

> Lưu ý: Để tất cả test pass, cần đảm bảo UI, logic frontend và backend hoạt động đúng hoặc mock API response trong test.
