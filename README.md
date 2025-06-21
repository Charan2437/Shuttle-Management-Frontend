# Shuttle-Management-Frontend

A comprehensive, Next.js-based developer toolkit for building scalable and maintainable transportation management systems. This project features a modular architecture, standardized UI components, robust API integrations, and strict TypeScript typing for enhanced reliability.

---

## Overview

Shuttle-Management-Frontend streamlines front-end development for complex transportation platforms. The core features include:

- 🎨 **Component Architecture:** Consistent UI patterns with reusable, styled components for a cohesive user experience.
- 🔗 **Seamless API Integration:** Well-defined API endpoints for admin and user workflows.
- ⚙️ **Customizable Styling:** Tailwind CSS configuration for a unified, responsive design system supporting dark mode.
- 🔐 **Role-Based Dashboards:** Dedicated interfaces for admins and students, enhancing security and usability.
- 🛠️ **Type Safety & Maintainability:** Strict TypeScript rules, reducing bugs and improving code quality.
- 📱 **Responsive & Device-Aware:** Built with responsiveness in mind for seamless experience across devices.

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, SSR, API routes)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** Custom + [Lucide React Icons](https://lucide.dev/)
- **State Management:** React Hooks
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (JWT strategy)
- **API Integration:** RESTful APIs (fetch)
- **Other:**
  - [Shadcn UI](https://ui.shadcn.com/) (UI primitives)
  - [Razorpay](https://razorpay.com/) (for wallet recharge)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or above recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd shuttle-management-system
   ```

2. **Install dependencies:**
   ```sh
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`

4. **Run the development server:**
   ```sh
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/                # Next.js app directory (pages, layouts, API routes)
components/         # Reusable UI components
backend/            # (If present) Backend API mocks or helpers
hooks/              # Custom React hooks
lib/                # Utilities, authentication, and helpers
public/             # Static assets
styles/             # Global and Tailwind CSS files
types/              # TypeScript type definitions
docs/               # API and project documentation
```

---

## Scripts

- `pnpm dev` / `npm run dev` / `yarn dev` — Start development server
- `pnpm build` / `npm run build` / `yarn build` — Build for production
- `pnpm start` / `npm start` / `yarn start` — Start production server

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [NextAuth.js](https://next-auth.js.org/)

---

**For more details, see the `docs/` folder.**
