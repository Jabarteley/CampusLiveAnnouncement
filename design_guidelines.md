# Design Guidelines: Campus Digital Noticeboard

## Design Approach

**Reference-Based Approach**: Drawing inspiration from modern productivity and communication platforms (Notion, Linear, Discord) combined with contemporary glassmorphic design trends. This approach balances visual appeal with functional clarity for real-time campus communication.

**Core Design Principle**: Create an engaging, visually striking interface that feels modern and premium while maintaining excellent readability and usability for quick information scanning.

---

## Typography System

**Font Stack**: 
- Primary: Inter or DM Sans via Google Fonts (clean, modern sans-serif)
- Accent: Plus Jakarta Sans for headings (optional personality layer)

**Hierarchy**:
- Page Titles: 3xl to 4xl, font-bold (48-56px)
- Section Headers: 2xl to 3xl, font-semibold (32-40px)
- Card Titles: lg to xl, font-semibold (18-24px)
- Body Text: base, font-normal (16px)
- Metadata/Timestamps: sm to xs, font-medium (12-14px)
- Button Text: sm to base, font-medium

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistency
- Tight spacing: p-2, gap-2
- Standard spacing: p-4, gap-4, m-6
- Section spacing: p-8, py-12, py-16
- Large spacing: p-12, py-20

**Grid Structure**:
- Public Board: Masonry-style grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Admin Dashboard: Two-column split (lg:grid-cols-3, with 2-column main + 1-column sidebar)
- Mobile: Always single column with full-width cards

**Container Management**:
- Max width: max-w-7xl for main content
- Padding: px-4 md:px-8 lg:px-12
- Cards: Full width with internal padding p-6 md:p-8

---

## Glassmorphic Implementation

**Glass Card Structure**:
- Semi-transparent backgrounds with backdrop blur (backdrop-blur-lg to backdrop-blur-xl)
- Subtle borders with light opacity (border border-opacity-20)
- Layered depth using shadows and multiple glass panels
- Frosted effect on overlays and modals

**Glass Layers**:
1. **Background Layer**: Gradient mesh or subtle animated patterns
2. **Content Cards**: Primary glass elements with backdrop-blur-lg
3. **Floating Elements**: Secondary glass with backdrop-blur-md
4. **Modals/Overlays**: Strongest blur backdrop-blur-2xl

**Card Treatment**:
- Rounded corners: rounded-xl to rounded-2xl
- Padding: p-6 for compact, p-8 for spacious
- Shadow: Soft, elevated shadows (shadow-lg to shadow-2xl)
- Hover state: Subtle lift with increased shadow

---

## Component Library

### Navigation (Public View)
- Sticky glass navigation bar at top
- Logo/title on left, search bar center, category filters right
- Height: h-16 md:h-20
- Backdrop blur with border-bottom

### Announcement Cards
**Card Structure**:
- Glass container with rounded-2xl
- Category badge (top-left, small pill with backdrop blur)
- Announcement title (text-xl font-semibold)
- Timestamp and author (text-sm, muted)
- Summary text (if AI-generated, with "Smart Summary" indicator)
- Full text preview (truncated with "Read more")
- Image thumbnail (if attached, aspect-video, rounded-lg)
- Action buttons (floating at bottom-right on hover)

**Card Variations**:
- Academic: Distinct visual treatment
- Events: Includes date badge
- General: Standard treatment

### Admin Dashboard
**Layout Sections**:
1. **Header Bar**: Welcome message, logout button, stats overview
2. **Sidebar** (left or right): Quick stats, recent activity, category breakdown
3. **Main Content**: Form for creating/editing announcements
4. **Preview Pane**: Live preview of announcement card

**Admin Form**:
- Large glass panel (p-8 to p-10)
- Input fields with glass treatment (backdrop-blur-md, rounded-lg)
- Rich text editor area for announcement body
- Image upload with drag-drop zone (dashed border, hover state)
- Category selector (pill buttons or dropdown)
- Action buttons: Primary (Publish), Secondary (Save Draft, Cancel)

### Search & Filter Bar
- Prominent position below main header
- Search input with glass styling (rounded-full, backdrop-blur)
- Category filter chips (toggleable, active state with stronger glass effect)
- Sort dropdown (Date, Category, Relevance)

### Login Page
- Centered glass card on gradient/animated background
- Logo and title at top
- Clean form inputs (glass style)
- Single CTA button: "Admin Login"
- Subtle floating elements in background

---

## Animation Strategy

**Entry Animations**:
- Stagger fade-in for announcement cards (delay based on index)
- Slide-up animation on page load (translate-y with opacity)
- Duration: 400-600ms with ease-out timing

**Interaction Animations**:
- Smooth hover lift on cards (transform scale-105, duration-300)
- Backdrop blur intensity increase on hover
- Button press: subtle scale-95 on active state

**Real-time Updates**:
- New announcement: Gentle pulse animation then slide-in from top
- Badge notification: Subtle bounce when new content arrives
- Auto-refresh indicator: Spinning icon or progress bar (top of page)

**Background Animations**:
- Subtle gradient shift or floating orbs in background (CSS keyframes)
- Parallax effect on hero/header section (if used)

**Avoid**: Excessive motion, spinning elements except loaders, aggressive transitions

---

## Layout Sections

### Public Noticeboard Page

**Hero Section** (Optional but Recommended):
- Height: 40vh to 50vh
- Large glass panel with page title: "Campus Noticeboard"
- Subtitle: Real-time updates tagline
- Search bar integrated into hero
- Background: Gradient or abstract campus imagery

**Filter Bar Section**:
- Sticky position below header
- Category chips, search, sort controls
- Height: auto, py-4

**Announcement Grid**:
- Masonry/grid layout with gap-6 md:gap-8
- Infinite scroll or pagination
- Empty state: Large glass card with illustration and message

### Admin Dashboard Page

**Stats Overview Section**:
- Three to four stat cards in row (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Glass cards showing: Total Announcements, Active Categories, This Week, Pending

**Create/Edit Section**:
- Prominent glass form panel
- Side-by-side layout on desktop: Form (left) + Preview (right)
- Mobile: Stacked with toggle between form/preview

**Recent Announcements List**:
- Compact card list below main form
- Quick edit/delete actions
- Pagination

---

## Images

**Hero Background** (Public Page):
- Abstract gradient mesh or blurred campus scene
- Use as full-page background with overlay
- Should support glass effect layering

**Announcement Thumbnails**:
- Aspect ratio: 16:9 (aspect-video)
- Rounded corners (rounded-lg)
- Object-fit: cover
- Display above or beside announcement text within cards

**Admin Illustrations**:
- Empty states: Friendly illustrations (undraw.co style)
- Login page: Optional decorative graphics

**Button Treatment on Images**:
- Buttons overlaid on images: backdrop-blur-md background
- No custom hover states beyond standard button behavior

---

## Accessibility & Polish

- Focus states: Prominent ring with glass-compatible styling
- Keyboard navigation: Logical tab order
- ARIA labels: All interactive elements properly labeled
- Form validation: Clear error states with glass error cards
- Loading states: Skeleton screens with glass styling
- Touch targets: Minimum 44x44px for mobile

---

## Responsive Breakpoints

- Mobile: Single column, simplified filters, bottom nav if needed
- Tablet: Two-column grid, compact admin sidebar
- Desktop: Three-column grid, full admin layout

**Mobile-Specific Adjustments**:
- Reduce glass blur intensity for performance
- Simplify animations (prefer transforms over blur changes)
- Bottom sheet for filters instead of top bar

---

This design creates a premium, modern campus noticeboard that feels engaging and alive while maintaining excellent usability for both quick scanning and content management.