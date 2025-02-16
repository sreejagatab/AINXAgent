import { ReactNode } from 'react';

export interface RouteConfig {
  path: string;
  element: ReactNode;
  children?: RouteConfig[];
  meta?: {
    requiresAuth: boolean;
    roles?: string[];
    title?: string;
    layout?: 'default' | 'auth' | 'blank';
  };
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface RouteParams {
  [key: string]: string;
}

export interface LocationState {
  from?: {
    pathname: string;
  };
} 