import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Web travel API')
  .setDescription('API Documents ')
  .setVersion('1.0')
  .build();

const options: SwaggerDocumentOptions = {
  include: [],
  extraModels: [],
  ignoreGlobalPrefix: false,
  deepScanRoutes: true,
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
};

export const setupSwagger = (app: INestApplication<any>) => {
  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Web Travel API documents',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      // Disable cache
      responseInterceptor: (res) => {
        // Browser cache control
        res.headers['Cache-Control'] =
          'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        res.headers['Pragma'] = 'no-cache';
        res.headers['Expires'] = '0';
        // CDN/Proxy cache control
        res.headers['Surrogate-Control'] = 'no-store';
        res.headers['Vary'] = '*';
        res.headers['X-Cache-Control'] = 'no-cache';
        return res;
      },
    },
  });
};
