import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PromptsPage } from '../pages/prompts/PromptsPage';
import { PromptDetailPage } from '../pages/prompts/PromptDetailPage';
import { CreatePromptPage } from '../pages/prompts/CreatePromptPage';
import { ToolsPage } from '../pages/tools/ToolsPage';
import { ToolDetailPage } from '../pages/tools/ToolDetailPage';
import { CreateToolPage } from '../pages/tools/CreateToolPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'prompts',
        element: (
          <ProtectedRoute>
            <PromptsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'prompts/create',
        element: (
          <ProtectedRoute>
            <CreatePromptPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'prompts/:id',
        element: (
          <ProtectedRoute>
            <PromptDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tools',
        element: (
          <ProtectedRoute>
            <ToolsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tools/create',
        element: (
          <ProtectedRoute>
            <CreateToolPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tools/:id',
        element: (
          <ProtectedRoute>
            <ToolDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
} 