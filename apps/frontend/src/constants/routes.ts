export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  PROMPTS: '/prompts',
  PROMPT_DETAILS: '/prompts/:id',
  PROMPT_CREATE: '/prompts/create',
  PROMPT_EDIT: '/prompts/:id/edit',
  COLLECTIONS: '/collections',
  COLLECTION_DETAILS: '/collections/:id',
  COLLECTION_CREATE: '/collections/create',
  COLLECTION_EDIT: '/collections/:id/edit',
  NOT_FOUND: '*',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
  ROUTES.NOT_FOUND,
  ROUTES.SERVER_ERROR,
];

export const getRoute = (route: keyof typeof ROUTES, params?: Record<string, string>) => {
  let path = ROUTES[route];
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }
  return path;
};

export const getPromptDetailPath = (id: string) => 
  ROUTES.PROMPT_DETAILS.replace(':id', id);

export const getPromptEditPath = (id: string) =>
  ROUTES.PROMPT_EDIT.replace(':id', id);

export const getBreadcrumbsForPath = (pathname: string): string[] => {
  const paths = pathname.split('/').filter(Boolean);
  return paths.map((_, index) => '/' + paths.slice(0, index + 1).join('/'));
}; 