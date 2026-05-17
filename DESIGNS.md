# TicketRush — UI/UX Design

## Visual Language

**Colors (OKLCH):**
- Background: off-white (`oklch(97.02% 0 81.92)`) / near-black in dark mode
- Surface: white / dark gray for cards, panels
- Accent: warm gold/amber (`oklch(83.77% 0.1655 81.92)`) — all CTAs, active states, highlights
- Danger: red / Success: green / Warning: amber
- Muted text, borders, field backgrounds use desaturated tones

**Typography:** Inter (body), Nunito (logo "ticketrush"), system fallback.

**Radius:** `0.5rem` (8px) default, `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for prominent surfaces.

**Dark booking/payment theme:** `#0a0a0a` bg, `#111` headers, `#1a1a1a` cards, white/5 borders.

---

## Pages & User Flows

### Home (`/`)
- **Promotion carousel** — 2-up auto-sliding hero cards (4s interval, pauses on hover). Gradient overlay + "View details" button. Infinite-loop illusion with silent position reset.
- **Trending events** — Horizontal snap-scroll row of fixed-width cards (250px). Hover: lift 4px + shadow. Skeleton loading.
- **Floating navbar** — Appears when scrolling past top navbar: `rounded-full`, `backdrop-blur`, slides down with fade.

### Event Detail (`/events/:eventId`)
- **Hero:** Two-column (breadcrumbs, title, date/venue with icons, price, buy button) + cover image.
- **Description:** Expandable card, collapses at 240px with gradient fade, ChevronDown toggle.
- **Schedule:** Showtimes with collapsible ticket tiers.
- **Organizer card:** Logo + name + description.
- All buy CTAs navigate to `/events/:eventId/booking`.

### Login (`/login`)
Centered card (max-w-md): email + password inputs, submit button (disabled "Logging in..." while submitting), "Forgot password?" link, Google OAuth button (placeholder — no backend integration yet).

### Register (`/register`)
Centered card: display name, phone, gender dropdown, email, password, confirm password, D.O.B, address. Terms checkbox gates submit. Inline validation on blur.

### OTP (`/otp`)
6-digit input grid (48x80px boxes). Auto-advance, backspace-nav, arrow-keys, paste support. Auto-submits when all 6 filled. Success: redirects to `/login` after 2s. Error: clears all, shows red message.

### NotFound (`*`)
Centered "404" in 9xl bold muted text + "Back to Home" button.

---

## Booking Flow (4 pages, shared dark theme)

All four share: header (back + logo + step indicator + countdown timer), scrolling marquee with event info, bottom action bar.

**Step indicator:** 3 circles — Select Ticket (1) → Enter Info (2) → Payment (3). Completed = green check, Active = accent, Incomplete = dimmed.

**Countdown:** 10 minutes from seat selection. MM:SS in accent. Red pulsing when expired. Auto-redirects to booking page.

### 1. Booking / Seat Selection (`/events/:eventId/booking`)
- **Tier selection:** Stagger-animated cards (color strip + icon + name + dimensions + price). Hover: scale 1.015. Tap: 0.985.
- **Seat map:** Row-letter labels + 24x24px seat buttons. Available (surface) / Selected (accent + glow) / Booked (orange dimmed). Hover: scale 1.25 spring. Tap: 0.85. Max 10 seats.
- **Info panel:** Desktop sticky bottom with count + total + "Continue" (disabled when 0 selected).

### 2. Booking Details (`/events/:eventId/booking-details`)
- Two-column: event summary + recipient form (name, email, phone, ID document). Delivery method: e-ticket radio (pre-selected, accent glow).
- Validation triggers on first submit. Continue saves to BookingContext.

### 3. Payment (`/events/:eventId/payment`)
- Bank transfer / Credit card radio cards with animated dot selection.
- Discount code input (placeholder, non-functional).
- "Pay Now" → bank transfer goes to checkout, credit card logs "not implemented".

### 4. Checkout / Confirmation (`/checkout/:sessionId`)
- VietQR code (API-generated) + bank account details (BIDV). Account number has hover-copy button.
- "Confirm Payment" → mock confirmation with green checkmark animation + "Back to Home".

---

## Organizer Section

### Layout
Sidebar (252px fixed, gradient background, `NavLink` active state) + header (dynamic title + "Create Event" button + account menu) + content area.

### Events List (`/organizer/events`)
Search bar + 4 tabs (Upcoming, Past, Pending, Draft) as segmented control. Motion-animated event cards: poster, title, status badge, dates, 6-action button grid (Overview, Members, Orders, Seat Map, Edit, Delete). Pagination. Empty state: dashed border card.

### Create/Edit Event (4-step wizard)
Step indicators (numbered circles, active = accent, completed = checkmark). Steps:

1. **Event Info** — Image uploads (drag-to-upload with preview), name (100 char), category dropdown, offline/online toggle (MapPin/Wifi icons), province/ward searchable dropdowns, rich markdown editor (toolbar: bold, italic, headers, lists, quote, image, link; live preview toggle), organizer logo + name + description.
2. **Time & Tickets** — Showtime cards (inline-rename, datetime pickers), ticket types (drag-handle, edit/delete buttons, modal with name/price/quantity/per-order limits/sale period/image).
3. **Settings** — URL slug preview, public/private radio cards, confirmation message.
4. **Payment Info** — Bank account (holder, number, bank, branch), invoice (business type dropdown, name, address, tax code).

### Seat Config (`/organizer/events/:eventId/seats`)
Full dark screen. Per-tier dimension steppers (rows 1-26, cols 1-40). Row label preview. Save button with animated checkmark (2s). Persisted to localStorage.

---

## Navigation

### Public NavBar
Desktop: hamburger drawer trigger + centered logo + language dropdown (flag icons) + account button (login or avatar with badge + dropdown menu: Account, My Tickets, My Events, Notifications, Settings, Logout). Mobile: drawer replaces sidebar.

### Organizer Sidebar
Fixed left. Logo + "Organizer Center" label. Links: My Events (CalendarDays), Reports (FolderOpen), Terms (FileText). Language switch at bottom (desktop) or page bottom (mobile).

---

## Micro-Interactions

| Element | Animation | Trigger |
|---|---|---|
| Top navbar | Slide y:-80 + fade | Scroll past |
| Scroll-to-top button | Slide x:80 | Scroll position |
| Promotion carousel | TranslateX 500ms | Auto 4s or click |
| Trending cards | Lift 4px + shadow / image scale 1.05 | Hover |
| Tier cards | Scale 1.015 / 0.985 | Hover / Tap |
| Seat buttons | Scale 1.25 spring / 0.85 | Hover / Tap |
| Selection summary | Height 0↔auto | Seats change |
| Save button icon | Swap Save→Checkmark, y:-10 | Click |
| Payment method dot | Scale 0→1 spring | Select |
| OTP boxes | Border accent | Filled |
| Stagger list items | Opacity 0→1, y:12→0 | Mount |
| Wizard steps | Opacity + y transition | Step nav |

---

## States

| State | Pattern |
|---|---|
| Loading | Skeleton cards (HeroUI `Skeleton`), ~1200ms simulated delay |
| Empty | Dashed border card with descriptive text |
| Error | Red `--danger` text inline below forms |
| Submitting | Button disabled + "Logging in..." / "Confirming..." |
| Success | Green checkmark (Checkout) / green border (saved seat config) |
| Expired | Countdown red pulse → auto-redirect |
| Validation | First-submit-triggered, inline below each field |
| Not found | Centered message with link back |
