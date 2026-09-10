# Mission bench-kanban

## Task: Zero-to-deployed: Kanban board app

Build a complete single-page Kanban board web app in this repository (static files only, no server, no build step): index.html, app.js, styles.css. Requirements: (1) three columns todo/doing/done with drag-and-drop cards between them; (2) user authentication entirely via localStorage — register (username+password), login, logout, and a logged-out state that shows a login form; (3) a dark-mode toggle button with id='theme-toggle' that flips a CSS class/data attribute and persists the choice; (4) the app mounts at #app and every dynamic element is created by app.js; (5) cards and column state persist per user in localStorage. The verification gate is `node tests/smoke.js` — make it pass, and keep it passing. Style it well: modern, clean, responsive.

Acceptance criteria: 
