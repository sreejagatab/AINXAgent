/// <reference types="node" />
/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_API_URL: string;
    VITE_WS_URL: string;
    VITE_STRIPE_PUBLIC_KEY: string;
    VITE_GOOGLE_ANALYTICS_ID: string;
    VITE_SENTRY_DSN: string;
  }
}

interface Window {
  Stripe: any;
  gtag: (...args: any[]) => void;
  dataLayer: any[];
  requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback: (handle: number) => void;
}

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
} 