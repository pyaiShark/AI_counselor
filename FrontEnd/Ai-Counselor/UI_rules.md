# AI Counselor - UI Rules & Project Specifications

This document outlines the mandatory rules for any agent working on this project. Follow these instructions strictly to maintain the integrity of the application's design and structure.

## 1. Core Technology Stack
- **Framework**: React (Vite)
- **Styling**: TailwindCSS v4
- **UI Library**: Tailus Themer & Tailus UI Components
- **Icons**: Lucide React

## 2. Layout & Structure Rules
- **Global Layout**: You **MUST** use the existing `Layout.jsx` (`src/Layout.jsx`) which includes the `Header` and `Footer`.
- **Do Not Break**:
  - Do NOT remove `<Header />` or `<Footer />` from the layout.
  - Do NOT alter `src/index.css` unless specifically adding a necessary global utility that cannot be achieved with Tailwind classes.
  - Do NOT modify `src/main.jsx` or the routing configuration unless explicitly instructed to add a new route.

## 3. UI Components & Styling
- **tailus-ui Imports**: Always use the `@tailus-ui` alias for imports (e.g., `import { Button } from "@tailus-ui/button"`) to avoid casing-related issues on different operating systems.
- **Component Priority**: Always prioritize using the components located in `src/components/tailus-ui`.
- **Consistency**:
  - Follow existing design patterns in `src/components/Header/Header.jsx` and `src/components/landing`.
  - Use `flex`, `grid`, and standard Tailwind spacing/color utilities.
  - **Dark/Light Mode**: Respect the dark/light mode toggle. Always verify that new UI elements are legible and visually appealing in **both** themes.

## 4. Specific Design Patterns
- **Mobile First**: All dashboard components and complex views must be fully responsive. Use vertical layouts for cards or indicators (like `StageIndicator`) on mobile screens.
- **Currency**: Use **USD ($)** as the standard currency symbol for all financial displays (Budget, Tuition, etc.).
- **Dynamic Inputs**: For AI chat or counselor inputs, implement auto-growing textareas that expand as the user types.
- **Application Flow**: Maintain the `StageIndicator` logic to reflect the user's progress through the application milestones.

## 5. "Do Not Change" Zones
Unless explicitly requested by the user, **DO NOT EDIT**:
- `src/components/tailus-ui/*` (Base UI library files)
- `src/lib/*` (Utils and configurations)
- `eslint.config.js`, `vite.config.js`, `postcss.config.js` (Build configs)

## 6. Project Organization
- **Pages**: Create new pages in `src/pages/` and register them in the router.
- **Components**: Place new components in `src/components/` (use subfolders for complex features).
- **Neat & Clean**: Maintain a professionally spaced, clutter-free interface. Avoid "cheap" or generic looking colors.

## Summary
**Keep it Simple**: Follow the current UI. Do not reinvent the wheel. Use the existing components and layout. Ensure mobile responsiveness and dual-theme compatibility for every change.
