import { OpenAPIV3 } from 'openapi-types';
import { getEnvironment } from '../config/environment';
import { logger } from './logger';

interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  parameters?: any[];
  requestBody?: any;
  responses: Record<string, any>;
}

class ApiDocsGenerator {
  private static instance: ApiDocsGenerator;
  private spec: OpenAPIV3.Document;

  private constructor() {
    this.spec = {
      openapi: '3.0.0',
      info: {
        title: 'Frontend API Documentation',
        version: getEnvironment().APP_VERSION,
        description: 'API documentation for the frontend application',
      },
      servers: [
        {
          url: getEnvironment().API_URL,
          description: 'API server',
        },
      ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    };
  }

  public static getInstance(): ApiDocsGenerator {
    if (!ApiDocsGenerator.instance) {
      ApiDocsGenerator.instance = new ApiDocsGenerator();
    }
    return ApiDocsGenerator.instance;
  }

  public addEndpoint(endpoint: ApiEndpoint): void {
    const { path, method, description, parameters, requestBody, responses } = endpoint;

    if (!this.spec.paths[path]) {
      this.spec.paths[path] = {};
    }

    this.spec.paths[path][method.toLowerCase()] = {
      description,
      parameters,
      requestBody,
      responses,
      security: [{ bearerAuth: [] }],
    };
  }

  public addSchema(name: string, schema: any): void {
    this.spec.components.schemas[name] = schema;
  }

  public generateDocs(): OpenAPIV3.Document {
    return this.spec;
  }

  public async exportDocs(format: 'json' | 'yaml' = 'json'): Promise<string> {
    try {
      if (format === 'yaml') {
        const yaml = await import('js-yaml');
        return yaml.dump(this.spec);
      }
      return JSON.stringify(this.spec, null, 2);
    } catch (error) {
      logger.error('Failed to export API docs', { error });
      throw error;
    }
  }

  public validateSpec(): boolean {
    try {
      // Implement OpenAPI specification validation
      return true;
    } catch (error) {
      logger.error('API spec validation failed', { error });
      return false;
    }
  }
}

export const apiDocsGenerator = ApiDocsGenerator.getInstance(); 