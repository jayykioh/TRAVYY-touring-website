# Admin Module Structure

## 📁 Folder Structure

```
touring-be/
├── controller/
│   ├── admin/
│   │   ├── admin.auth.controller.js    # Admin authentication (login, logout)
│   │   └── admin.stats.controller.js   # Dashboard statistics & analytics
│   └── ... (other controllers)
├── routes/
│   ├── admin/
│   │   ├── index.js                    # Main admin router (combines all admin routes)
│   │   ├── auth.routes.js              # Authentication routes
│   │   └── stats.routes.js             # Statistics routes
│   └── ... (other routes)
```

## 🛣️ Available Admin Endpoints

### Authentication

- **POST** `/api/admin/login` - Admin login (Public)
- **POST** `/api/admin/logout` - Admin logout (Private)

### Statistics & Analytics

- **GET** `/api/admin/revenue-stats?year=2025` - Monthly revenue statistics (Private)
- **GET** `/api/admin/dashboard-stats` - Dashboard summary stats (Private)

## 🔐 Authentication

All private routes require JWT token in header:

```
Authorization: Bearer <token>
```

Token is stored in `sessionStorage` with key `admin_token` after login.

## 📝 Adding New Admin Routes

1. Create controller in `controller/admin/`:

   ```javascript
   // controller/admin/admin.tours.controller.js
   exports.getTours = async (req, res) => { ... }
   exports.createTour = async (req, res) => { ... }
   ```

2. Create route in `routes/admin/`:

   ```javascript
   // routes/admin/tours.routes.js
   const router = require("express").Router();
   const authJwt = require("../../middlewares/authJwt");
   const {
     getTours,
     createTour,
   } = require("../../controller/admin/admin.tours.controller");

   router.get("/", authJwt, getTours);
   router.post("/", authJwt, createTour);

   module.exports = router;
   ```

3. Register in `routes/admin/index.js`:
   ```javascript
   const tourRoutes = require("./tours.routes");
   router.use("/tours", tourRoutes);
   ```

## 🎯 Benefits of This Structure

✅ **Separation of Concerns** - Each feature has its own file
✅ **Scalability** - Easy to add new admin features
✅ **Maintainability** - Clear organization, easy to find code
✅ **Modularity** - Controllers and routes are decoupled
✅ **Team Collaboration** - Multiple developers can work on different modules

## 🔄 Migration from Old Structure

**Old:**

```javascript
// routes/admin.routes.js (single file)
const {
  adminLogin,
  getRevenueStats,
} = require("../controller/admin.controller");
router.post("/login", adminLogin);
router.get("/revenue-stats", authJwt, getRevenueStats);
```

**New:**

```javascript
// routes/admin/index.js (main router)
const authRoutes = require("./auth.routes");
const statsRoutes = require("./stats.routes");
router.use("/", authRoutes);
router.use("/", statsRoutes);
```

All existing endpoints remain the same, just organized better!
