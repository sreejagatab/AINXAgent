import { OpenAPIV3 } from 'openapi-types';
import { Router } from 'express';
import { readdirSync } from 'fs';
import { join } from 'path';
import { logger } from './logger';

export class APIDocsGenerator {
  private static instance: APIDocsGenerator;
  private spec: OpenAPIV3.Document;

  private constructor() {
    this.spec = {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'Complete API documentation with examples',
      },
      servers: [
        {
          url: '/api',
          description: 'API endpoint',
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

  public static getInstance(): APIDocsGenerator {
    if (!APIDocsGenerator.instance) {
      APIDocsGenerator.instance = new APIDocsGenerator();
    }
    return APIDocsGenerator.instance;
  }

  public async generateDocs(router: Router): Promise<OpenAPIV3.Document> {
    try {
      const routesDir = join(__dirname, '../routes');
      const routeFiles = readdirSync(routesDir);

      for (const file of routeFiles) {
        if (file.endsWith('.routes.ts')) {
          const route = require(join(routesDir, file));
          await this.processRoute(route);
        }
      }

      return this.spec;
    } catch (error) {
      logger.error('Failed to generate API docs:', error);
      throw error;
    }
  }

  private async processRoute(route: any) {
    const stack = route.stack || [];
    
    for (const layer of stack) {
      if (layer.route) {
        const path = layer.route.path;
        const method = layer.route.stack[0].method;

        this.spec.paths[path] = {
          ...this.spec.paths[path],
          [method]: await this.generatePathSpec(layer),
        };
      }
    }
  }

  private async generatePathSpec(layer: any): Promise<OpenAPIV3.OperationObject> {
    const route = layer.route;
    const handler = route.stack[route.stack.length - 1].handle;
    
    // Extract JSDoc comments for documentation
    const docs = handler.toString().match(/\/\*\*([\s\S]*?)\*\//);
    
    return {
      summary: docs ? this.extractSummary(docs[1]) : '',
      description: docs ? this.extractDescription(docs[1]) : '',
      tags: [this.extractTag(route.path)],
      parameters: this.generateParameters(route),
      requestBody: this.generateRequestBody(route),
      responses: this.generateResponses(route),
      security: this.generateSecurity(route),
    };
  }

  // Helper methods for parsing JSDoc comments and generating OpenAPI specs
  private extractSummary(docs: string): string {
    const match = docs.match(/@summary\s+(.+)/);
    return match ? match[1].trim() : '';
  }

  private extractDescription(docs: string): string {
    const match = docs.match(/@description\s+(.+)/);
    return match ? match[1].trim() : '';
  }

  private extractTag(path: string): string {
    return path.split('/')[1];
  }

  // ... additional helper methods for generating OpenAPI specs
}

export const apiDocsGenerator = APIDocsGenerator.getInstance(); 