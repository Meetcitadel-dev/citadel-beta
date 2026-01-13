# How to Clear Cached Data

## Method 1: Using Browser Console (Recommended)

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Paste and run this command:

```javascript
// Clear all app cache
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
localStorage.removeItem('citadel_auth_user');
localStorage.removeItem('citadel_is_premium');
localStorage.removeItem('citadel_users');
localStorage.removeItem('citadel_notifications');
localStorage.removeItem('citadel_matches');
localStorage.removeItem('citadel_messages');
localStorage.removeItem('citadel_message_requests');
localStorage.removeItem('citadel_current_user_id');
console.log('✅ All cached data cleared!');
location.reload();
```

## Method 2: Clear All localStorage

1. Open Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click on **Local Storage** → `http://localhost:5173`
4. Right-click and select **Clear** or delete individual items
5. Refresh the page

## Method 3: Clear Browser Data

1. Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
2. Select "Cached images and files" and "Cookies and other site data"
3. Choose time range: "All time"
4. Click "Clear data"
5. Refresh the page

## Method 4: Use Incognito/Private Window

Open the app in an incognito/private window - this will have no cached data.

