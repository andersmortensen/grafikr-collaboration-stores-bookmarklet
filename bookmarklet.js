/**
 * Grafikr Collaboration Stores — Shopify Dev Dashboard store launcher
 *
 * Bookmarklet that opens a Grafikr-branded command-palette modal on any page:
 *   - "Dashboard-søgning": opens the Dev Dashboard collaborations list
 *     filtered server-side via ?search_term= (verified deep link).
 *   - "Direkte til admin": treats input as store handle and opens
 *     admin.shopify.com/store/<handle> directly.
 *
 * Branding (v3): Grafikr mono palette — #0F0F0F card, white text,
 * #C2C2C2/#7A7A7A greys, #333 active segment, 4px corners, always dark,
 * Grafikr globe mark in the search row. Font stack mirrors grafikr.dk's
 * designated fallback (Helvetica Neue/Arial) — their licensed webfont is
 * not hotlinked.
 *
 * Mechanics (unchanged from v2):
 *   - Shadow DOM + constructed stylesheet (CSP-safe, no page style bleed).
 *   - Mode persisted in localStorage (per origin).
 *   - Enter opens in new tab; falls back to same tab if popup is blocked.
 *   - Esc, backdrop click, or clicking the bookmarklet again closes it.
 *
 * NOTE: The distributable one-liner lives in index.html (drag/demo link).
 * It is identical except '&' is written as the JS escape '&'
 * so the string can be embedded raw in HTML attributes without entity
 * escaping. Keep this file and index.html in sync.
 *
 * Why no store list in the modal: cross-origin fetches to dev.shopify.com
 * are blocked by CORS on arbitrary pages. Showing the live list requires a
 * Safari Web Extension (possible follow-up project).
 */

(function () {
  var ID = 'collab-sog';

  // Acts as a toggle: clicking the bookmarklet while open closes it.
  var old = document.getElementById(ID);
  if (old) { old.remove(); return; }

  var DASH = 'https://dev.shopify.com/dashboard/129422981/stores?store_type=collaborations';

  var css = '.bd{position:fixed;inset:0;background:rgba(0,0,0,.6);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:flex;align-items:flex-start;justify-content:center;padding-top:16vh;opacity:0;transition:opacity .18s ease}.bd.on{opacity:1}.card{width:min(540px,calc(100vw - 48px));background:rgb(15,15,15);border:1px solid rgba(255,255,255,.1);border-radius:4px;box-shadow:0 32px 90px rgba(0,0,0,.55),0 2px 10px rgba(0,0,0,.3);transform:translateY(10px) scale(.985);transition:transform .18s ease;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;overflow:hidden}.bd.on .card{transform:none}.row{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08)}.ic{flex:none;width:24px;height:14px;fill:rgb(194,194,194)}.in{flex:1;border:0;outline:0;background:transparent;font:inherit;font-size:17px;font-weight:400;color:rgb(255,255,255)}.in::placeholder{color:rgba(255,255,255,.35)}.foot{display:flex;align-items:center;gap:12px;padding:11px 18px}.seg{display:flex;background:rgba(255,255,255,.07);border-radius:4px;padding:2px;flex:none}.seg button{appearance:none;-webkit-appearance:none;border:0;background:transparent;font:inherit;font-size:12.5px;font-weight:400;padding:5px 11px;border-radius:3px;color:rgb(194,194,194);cursor:pointer}.seg button.on{background:rgb(51,51,51);color:rgb(255,255,255)}.prev{flex:1;text-align:right;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:rgb(122,122,122);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}';

  var host = document.createElement('div');
  host.id = ID;
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647';
  var sh = host.attachShadow({ mode: 'open' });

  // Constructed stylesheet is immune to page CSP style-src; <style> fallback for older engines.
  try {
    var ss = new CSSStyleSheet();
    ss.replaceSync(css);
    sh.adoptedStyleSheets = [ss];
  } catch (e) {
    var st = document.createElement('style');
    st.textContent = css;
    sh.appendChild(st);
  }

  var bd = document.createElement('div'); bd.className = 'bd';
  var card = document.createElement('div'); card.className = 'card';
  var row = document.createElement('div'); row.className = 'row';

  // Grafikr globe mark (globe-g.svg) built via createElementNS — no innerHTML,
  // so no quote/entity issues. Fill is set on .ic in the stylesheet.
  var ns = 'http://www.w3.org/2000/svg';
  var sv = document.createElementNS(ns, 'svg');
  sv.setAttribute('viewBox', '0 0 32 18');
  sv.setAttribute('class', 'ic');
  var pa = document.createElementNS(ns, 'path');
  pa.setAttribute('d', 'M15.75,0 C7.06,0 0,4.03 0,9 C0,13.97 7.06,18 15.75,18 C24.44,18 31.5,13.97 31.5,9 C31.5,4.03 24.43,0 15.75,0 Z M30.39,8.49 L24.14,8.49 C24.14,8.36 24.11,8.23 24.09,8.11 L26.27,8.11 C26.14,7.11 25.24,6.29 23.54,5.72 C22.88,3.94 21.73,2.43 20.23,1.41 C25.84,2.39 29.97,5.17 30.37,8.49 L30.39,8.49 Z M21.89,10.07 C21.79,10.68 20.11,11.57 15.93,11.57 C10.32,11.57 9.53,10.04 9.53,9.05 C9.53,8.06 10.3,6.58 15.93,6.58 C20.5,6.58 21.65,7.5 21.89,8.11 L23.06,8.11 C23.08,8.31 23.09,8.51 23.1,8.72 L15.61,8.72 L15.61,10.08 L21.89,10.08 L21.89,10.07 Z M22.3,5.38 C20.68,5.02 18.57,4.83 15.92,4.83 C13.13,4.83 10.85,5.08 9.11,5.55 C10.3,2.89 12.82,1.04 15.73,1.04 C18.64,1.04 21.06,2.81 22.29,5.4 L22.3,5.38 Z M11.24,1.41 C9.68,2.47 8.48,4.07 7.85,5.96 C6.35,6.57 5.47,7.42 5.26,8.49 L1.1,8.49 C1.49,5.17 5.62,2.4 11.24,1.41 Z M1.1,9.51 L5.25,9.51 C5.46,10.6 6.37,11.47 7.86,12.09 C8.5,13.96 9.69,15.53 11.24,16.59 C5.63,15.61 1.5,12.83 1.1,9.51 Z M9.15,12.51 C10.75,12.94 12.8,13.17 15.21,13.17 C18.58,13.17 21,12.67 22.59,11.92 C21.51,14.87 18.85,16.97 15.75,16.97 C12.86,16.97 10.35,15.15 9.15,12.51 L9.15,12.51 Z M20.25,16.59 C21.52,15.73 22.55,14.5 23.23,13.06 L26.28,13.06 L26.28,9.51 L30.38,9.51 C29.99,12.83 25.86,15.6 20.24,16.59 L20.25,16.59 Z');
  sv.appendChild(pa);

  var inp = document.createElement('input');
  inp.className = 'in';
  inp.type = 'text';
  inp.setAttribute('autocomplete', 'off');
  inp.setAttribute('spellcheck', 'false');

  var foot = document.createElement('div'); foot.className = 'foot';
  var seg = document.createElement('div'); seg.className = 'seg';
  var b1 = document.createElement('button'); b1.type = 'button'; b1.textContent = 'Dashboard-søgning';
  var b2 = document.createElement('button'); b2.type = 'button'; b2.textContent = 'Direkte til admin';
  var prev = document.createElement('div'); prev.className = 'prev';

  // Restore last used mode (per origin — localStorage can throw in private mode).
  var mode = 'dash';
  try { if (localStorage.getItem('collabSogMode') === 'admin') mode = 'admin'; } catch (e) {}

  function paint() {
    var q = inp.value.trim();
    if (mode === 'admin') {
      b2.className = 'on'; b1.className = '';
      inp.placeholder = 'Store-handle, fx rains-global';
      prev.textContent = 'admin.shopify.com/store/' + (q ? q : '…');
    } else {
      b1.className = 'on'; b2.className = '';
      inp.placeholder = 'Søg collaboration stores…';
      prev.textContent = 'dev.shopify.com · collaborations' + (q ? ' · ' + q : '');
    }
  }

  function setMode(m) {
    mode = m;
    try { localStorage.setItem('collabSogMode', m); } catch (e) {}
    paint();
    inp.focus();
  }

  b1.onclick = function () { setMode('dash'); };
  b2.onclick = function () { setMode('admin'); };
  inp.oninput = paint;

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
  }

  function close() {
    host.remove();
    document.removeEventListener('keydown', onKey, true);
  }

  function go() {
    var q = inp.value.trim();
    var u;
    if (mode === 'admin') {
      if (!q) return; // admin mode needs a handle
      u = 'https://admin.shopify.com/store/' + encodeURIComponent(q);
    } else {
      u = DASH;
      if (q) u = u + '&search_term=' + encodeURIComponent(q);
    }
    close();
    // New tab when allowed; same tab if the popup blocker interferes.
    var w = window.open(u, '_blank');
    if (!w) location.href = u;
  }

  // Capture phase so Esc beats the host page's own shortcuts.
  document.addEventListener('keydown', onKey, true);
  inp.addEventListener('keydown', function (e) {
    e.stopPropagation(); // keep keystrokes away from page-level hotkeys
    if (e.key === 'Enter') go();
    if (e.key === 'Escape') close();
  });
  bd.addEventListener('mousedown', function (e) {
    if (e.target === bd) close(); // backdrop click closes, card clicks don't
  });

  row.appendChild(sv); row.appendChild(inp);
  seg.appendChild(b1); seg.appendChild(b2);
  foot.appendChild(seg); foot.appendChild(prev);
  card.appendChild(row); card.appendChild(foot);
  bd.appendChild(card);
  sh.appendChild(bd);
  (document.body ? document.body : document.documentElement).appendChild(host);

  paint();
  requestAnimationFrame(function () { bd.className = 'bd on'; inp.focus(); });
  setTimeout(function () { inp.focus(); }, 80); // Safari sometimes needs a second nudge
})();
