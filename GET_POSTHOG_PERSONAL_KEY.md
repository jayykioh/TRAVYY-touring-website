# 🔑 Getting PostHog Personal API Key

## Why You Need It

The **Project API Key** (`phc_...`) can only **send** events to PostHog.

To **fetch** events from PostHog (for the weekly sync), you need a **Personal API Key**.

## Steps to Get Personal API Key

### 1. Go to PostHog Settings
- Open [https://app.posthog.com/settings/user-api-keys](https://app.posthog.com/settings/user-api-keys)
- Or: Click your profile (bottom left) → Settings → Personal API Keys

### 2. Create New Key
- Click **"+ Create personal API key"**
- Name it: `Travyy Backend Sync`
- Click **"Create key"**

### 3. Copy the Key
- Copy the generated key (looks like: `phx_abc123...` or just a random string)
- **Save it immediately** - you can't see it again!

### 4. Update Backend .env

Add this line to `touring-be/.env`:

```env
# PostHog Personal API Key (for fetching events)
POSTHOG_PERSONAL_API_KEY=YOUR_PERSONAL_KEY_HERE
```

Keep the existing keys:
```env
# PostHog Project API Key (for sending events)
POSTHOG_API_KEY=phc_N7jl9t4aTB8zhYhRzh0wWUxRxTcTnRu8O7hTwAj39ds
POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_ID=249196
```

### 5. Restart Backend

```bash
cd touring-be
npm start
```

### 6. Test Again

```bash
cd touring-be
node tests/posthog-pipeline.test.js
```

---

## Summary

You need **2 keys** from PostHog:

| Key | Purpose | Format | Where Used |
|-----|---------|--------|------------|
| **Project API Key** | Send events | `phc_...` | ✅ Already have |
| **Personal API Key** | Fetch events | `phx_...` or random | ❌ Need to get |

Get your Personal API Key here: [PostHog Settings](https://app.posthog.com/settings/user-api-keys)
