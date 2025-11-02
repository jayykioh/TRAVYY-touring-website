# Facebook OAuth Setup Guide

## Current Status

⚠️ Facebook OAuth is temporarily **DISABLED** due to missing credentials.

## To Enable Facebook Login:

### 1. Create Facebook App

1. Go to https://developers.facebook.com/apps
2. Create a new app
3. Choose "Consumer" app type
4. Add Facebook Login product

### 2. Get Credentials

From your Facebook App Dashboard:

- **App ID** → This is your `FACEBOOK_APP_ID`
- **App Secret** → This is your `FACEBOOK_APP_SECRET`

### 3. Configure OAuth Redirect

In Facebook App Settings → Facebook Login → Settings:

- Add Valid OAuth Redirect URI: `http://localhost:4000/api/auth/facebook/callback`
- For production, add: `https://yourdomain.com/api/auth/facebook/callback`

### 4. Add to .env file

Add these lines to `touring-be/.env`:

```env
# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_CALLBACK_URL=http://localhost:4000/api/auth/facebook/callback
```

### 5. Uncomment Facebook Strategy

In `middlewares/passport.js`:

- Remove the `/*` and `*/` comment markers around the Facebook Strategy code (lines ~96-152)

### 6. Restart Server

```bash
npm run dev
```

## Notes

- Facebook requires HTTPS for production
- Make sure to verify your domain in Facebook App Settings
- Test Mode apps only work with admin/developer/tester accounts
- Switch to Live Mode when ready for production
