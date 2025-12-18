## Vibe Tags – College Adjectives Web App

Vibe Tags is a small Vite + React web app that lets college students send short, adjective-based “vibes” to each other. It’s a dark, dating-style UI (black + parrot green) with a big profile card and a simple inbox of received vibes.

### Features

- **Discover / Explore screen**:  
  - Shows a large profile card (photo, name, year, college, skills-as-role).  
  - Lets you tap an adjective button to send a “vibe” to the visible profile.  
  - Automatically moves to the next profile after sending a vibe.  
  - Lightweight “skip profile” link if you want to move on without sending.
- **Inbox screen**:  
  - Lists adjectives that the currently logged-in user has received.  
  - Shows who sent the vibe and when.
- **Accounts screen**:  
  - Switches between mock college users so you can see the app from different perspectives.

### Tech Stack

- **Frontend**: React 18
- **Build tool**: Vite
- **Styling**: Hand-written CSS in `src/styles.css`
- **Data**: Local mock data in `src/data/users.js` and adjective generator in `src/data/adjectives.js`

### Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Run the dev server**

```bash
npm run dev
```

Vite will print a local URL (by default something like `http://localhost:5173`) which you can open in your browser.

3. **Build for production**

```bash
npm run build
```

4. **Preview the production build**

```bash
npm run preview
```

### Project Structure (high level)

- `src/main.jsx` – React entry point, mounts the app and imports global styles.  
- `src/App.jsx` – Top-level layout, navigation tabs, and screen switching.  
- `src/components/DiscoverScreen.jsx` – Main profile / adjective sending view.  
- `src/components/InboxScreen.jsx` – Displays received vibes for the active user.  
- `src/components/AccountSwitcherScreen.jsx` – Switches between mock accounts.  
- `src/styles.css` – All global UI styling (dark theme, parrot green accents).  
- `src/data/users.js` – Mock college user profiles.  
- `src/data/adjectives.js` – Gender-aware adjective generator.

### Notes

- All data is in-memory; refreshing the page will reset notifications and follows.  
- This is a prototype meant for quick iteration on the interaction and visual design, not a production-ready app.


