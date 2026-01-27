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
- **tailus-ui**: Always prioritize using the components located in `src/components/tailus-ui` (e.g., `Button`, `Card`, `Input`, `Drawer`).
- **Consistency**:
  - Follow the existing design patterns found in `src/components/Header/Header.jsx` and `src/components/landing`.
  - Use `flex`, `grid`, and standard Tailwind spacing/color utilities.
  - Respect the dark/light mode toggle provided by `tailus-ui`.

## 4. "Do Not Change" Zones
Unless explicitly requested by the user, **DO NOT EDIT**:
- `src/components/tailus-ui/*` (Base UI library files)
- `src/lib/*` (Utils and configurations)
- `eslint.config.js`, `vite.config.js`, `postcss.config.js` (Build configs)

## 5. New Features
- When adding new pages, create them in `src/pages/` and import them into the router.
- When creating new components, place them in `src/components/` (create a subfolder if complex).

## 6. Design Philosophy
- **Neat & Clean**: The UI must remain **Neat and Clean**. Maintain a clutter-free interface with proper spacing and a professional aesthetic.

## Summary
**Keep it Simple**: Follow the current UI. Do not reinvent the wheel. Use the existing components and layout.
