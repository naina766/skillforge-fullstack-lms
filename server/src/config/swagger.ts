import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SkillForge REST API Documentation',
    version: '1.0.0',
    description: 'Production API specification for SkillForge EdTech Learning Platform.',
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health Check',
        responses: {
          200: { description: 'Service and Database Operational' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login User',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'student@skillforge.dev' },
                  password: { type: 'string', example: 'Student@123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
        },
      },
    },
    '/courses': {
      get: {
        summary: 'Discover Courses with Filters, Search and Pagination',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'level', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
        ],
        responses: {
          200: { description: 'Paginated list of courses' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Application) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
