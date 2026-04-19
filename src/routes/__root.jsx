import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SENTINEL Onboarding — Halcyon Capital Partners" },
      { name: "description", content: "SENTINEL Onboarding - Halcyon Capital Partners. Client onboarding risk classification and audit dashboard for wealth management." },
      { name: "author", content: "Halcyon Capital Partners" },
      { property: "og:title", content: "SENTINEL Onboarding — Halcyon Capital Partners" },
      { property: "og:description", content: "SENTINEL onboarding platform for comprehensive client risk assessment and compliance management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#1B2A4A" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><defs><linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%231B2A4A;stop-opacity:1' /><stop offset='100%' style='stop-color:%232D4A7B;stop-opacity:1' /></linearGradient></defs><circle cx='100' cy='100' r='95' fill='url(%23grad)'/><text x='100' y='115' font-size='140' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='Arial, sans-serif'>H</text></svg>",
        type: "image/svg+xml",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
