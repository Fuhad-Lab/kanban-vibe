// Static smoke contract for the Kanban vibe-coding benchmark.
// Verifies the produced app satisfies the minimum shippable shape before
// the browser E2E verification runs.
const fs = require("fs");

function fail(msg) {
  console.error("SMOKE FAIL: " + msg);
  process.exit(1);
}

for (const f of ["index.html", "app.js", "styles.css"]) {
  if (!fs.existsSync(f)) fail("missing " + f);
}

const html = fs.readFileSync("index.html", "utf8");
const js = fs.readFileSync("app.js", "utf8");
const css = fs.readFileSync("styles.css", "utf8");

if (!html.includes('id="app"')) fail("index.html must mount at #app");
if (!html.includes("app.js")) fail("index.html must load app.js");
if (!html.includes("styles.css")) fail("index.html must load styles.css");
if (!html.includes('id="theme-toggle"')) fail("theme toggle button missing (#theme-toggle)");
for (const col of ["todo", "doing", "done"]) {
  if (!js.includes(`"${col}"`) && !js.includes(`'${col}'`)) fail("column missing in app.js: " + col);
}
for (const fn of ["login", "register", "logout", "createCard"]) {
  const found = new RegExp("function +" + fn + "|const +" + fn + "|(login|register|logout|createCard) *[:=(]").test(js) || js.includes(fn + "(");
  if (!found) fail("auth/board function missing in app.js: " + fn);
}
if (!js.includes("localStorage")) fail("auth must persist via localStorage");
if (!css.includes(":root") && !css.includes("body.dark") && !css.includes('[data-theme')) {
  fail("dark mode styles missing in styles.css");
}
console.log("SMOKE OK: static contract satisfied");
