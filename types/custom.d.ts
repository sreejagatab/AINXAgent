declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
      isActive: boolean;
    };
    startTime?: number;
    requestId?: string;
  }
}

declare module 'swagger-jsdoc' {
  interface Options {
    definition: {
      openapi: string;
      info: {
        title: string;
        version: string;
        description?: string;
        license?: {
          name: string;
          url: string;
        };
        contact?: {
          name: string;
          email: string;
        };
      };
      servers?: Array<{
        url: string;
        description?: string;
      }>;
      components?: {
        securitySchemes?: Record<string, any>;
        schemas?: Record<string, any>;
      };
      security?: Array<Record<string, any>>;
    };
    apis: string[];
  }
}

declare module '*.json' {
  const value: any;
  export default value;
} 