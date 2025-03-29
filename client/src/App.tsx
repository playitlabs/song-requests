import React from 'react';
import { 
  Link, 
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from '@tanstack/react-router';
import { TrackList } from './TrackList';
import { AdminPage } from './AdminPage';

// Define root layout route
const rootRoute = createRootRoute({
  component: () => (
    <div className="flex flex-col items-center min-h-screen font-sans bg-gray-50">
      <nav className="w-full bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-800">Song Requests</Link>
        </div>
      </nav>
      <Outlet />
    </div>
  )
});

// Define index route for home page
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TrackList
});

// Define admin route
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage
});

// Create route tree
const routeTree = rootRoute.addChildren([indexRoute, adminRoute]);

// Create router instance
const router = createRouter({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
