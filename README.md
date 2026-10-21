# CineMovies Client (`Movies.Client`)

Modern, signal-driven **Angular 20** frontend for **CineMovies** — a cinema archive, trailer theater, and community film rating platform.

- **Live Web Application**: [https://cinemovies.tryasp.net](https://cinemovies.tryasp.net)
- **Live Backend API**: [https://cinemovies.runasp.net](https://cinemovies.runasp.net)

---

## Key Features

- **Cinema Discovery & Filtering**:
  - Featured Spotlight Hero highlighting the highest-rated film in the catalog with one-click trailer playback.
  - Debounced real-time title search, interactive genre filter chips, release year filter, sort controls (Title, Release Year, ascending/descending), and server-side pagination.
- **Official Trailers & Synopses**:
  - Embedded 16:9 widescreen **YouTube Theater Player** (`youtube-nocookie.com`) on both the catalog cards (modal view) and movie detail pages (inline theater view).
  - Automatic high-resolution YouTube poster thumbnail extraction with fallback monogram gradients.
  - Full theatrical plot synopses on detail pages and two-line previews on catalog cards.
- **Authentication & Role-Based UI**:
  - Tabbed **Sign In / Create Account** modal with real-time validation and 1-click demo login buttons for **Admin**, **Trusted Critic**, and **Member** roles.
  - Role-aware controls:
    - **Members**: Interactive 5-star ratings and personal ratings dashboard (`/ratings/me`).
    - **Trusted Critics (`TrustedMember`)**: Add new movies and edit existing titles, synopses, trailers, and genres.
    - **Admins (`Admin`)**: Full catalog management including film deletion with confirmation dialogs and 1-click backend catalog seeding.
- **Resilient UX & Design System**:
  - Custom obsidian-and-gold cinema theme with dark/light mode toggle persisted in `localStorage`.
  - Complete coverage of loading skeletons, empty states, error banners with retry actions, and toast notifications.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Angular 20 (Standalone Components, Signals, `@if` / `@for` control flow) |
| **State Management** | Reactive Signal Store (`MoviesStore`, `AuthService`, `LoadingService`) |
| **HTTP & Resilience** | Angular `HttpClient` with functional interceptors (`auth`, `loading`, `error`) |
| **Styling** | Scoped CSS with custom design tokens (`--bg-canvas`, `--accent-gold`, etc.) |
| **Deployment** | Static SPA bundle with IIS URL Rewrite (`public/web.config`) on MonsterASP |

---

## Project Architecture

```text
Movies.Client/
├── public/
│   ├── favicon.svg                           # Vector CineMovies gold film-strip icon
│   ├── favicon.ico                           # Legacy 32x32 fallback icon
│   └── web.config                            # IIS SPA URL rewrite & MIME configuration
└── src/
    ├── environments/
    │   ├── environment.ts                    # Production API configuration
    │   └── environment.development.ts        # Local development API configuration
    └── app/
        ├── core/
        │   ├── auth/                         # AuthService, AuthModalComponent, role guards & models
        │   ├── config/                       # APP_CONFIG injection token
        │   ├── http/                         # JWT auth, global loading, and API error interceptors
        │   ├── layout/                       # HeaderComponent, ThemeService, ToastService
        │   └── models/                       # Standardized ApiError contract
        ├── features/
        │   ├── movies/
        │   │   ├── components/               # MovieCard, MovieFilters, MovieFormModal, TrailerModal
        │   │   ├── data-access/              # MoviesStore (Signals) & MoviesApiService
        │   │   ├── models/                   # Movie DTOs & YouTube URL parser helpers
        │   │   └── pages/                    # MovieListPage & MovieDetailPage
        │   └── ratings/
        │       └── pages/                    # MyRatingsPage (/ratings/me)
        └── shared/
            └── ui/                           # Reusable Badge, StarRating, Modal, ConfirmDialog, Skeletons
```

---

## Getting Started Locally

### Prerequisites
- [Node.js 20+](https://nodejs.org/) and `npm`
- Running instance of `Movies.Api` (defaults to `http://localhost:5211/api` in development)

### 1. Install Dependencies
```bash
cd Movies.Client
npm install
```

### 2. Run the Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`. The app automatically proxies/connects to the API URL configured in `src/environments/environment.development.ts`.

### 3. Build for Production
```bash
npm run build
```
The production artifacts (including `index.html`, `favicon.svg`, `favicon.ico`, and `web.config`) are emitted to `dist/Movies.Client/browser/`.

---

## Demo Credentials

Use the **Sign In** modal in the header to test role-specific features with one click, or enter:

- **Admin**: `admin@cinemovies.io` / `Admin123!`
- **Trusted Critic**: `critic@cinemovies.io` / `Critic123!`
- **Member**: `member@cinemovies.io` / `Member123!`

---

## Author

Developed by **Alber Ashraf**
