import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import './common/types/mongoose.types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('FreshShop API')
    .setDescription('Hệ thống quản lý cửa hàng rau củ - API Documentation')
    .setVersion('1.0')
    .addTag('Authentication', 'Xác thực và đăng nhập')
    .addTag('Admin Management', 'Quản lý tài khoản admin')
    .addTag('Customer Management', 'Quản lý khách hàng')
    .addTag('Product Management', 'Quản lý sản phẩm')
    .addTag('Supplier Management', 'Quản lý nhà cung cấp')
    .addTag('Inventory Management', 'Quản lý tồn kho')
    .addTag('Point of Sale (POS)', 'Bán hàng POS')
    .addTag('Reports & Analytics', 'Báo cáo và phân tích')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'Enter API Key',
      },
      'api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 5000);
  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 5000}`,
  );
  console.log(
    `📚 API Documentation: http://localhost:${process.env.PORT ?? 5000}/api`,
  );
}
void bootstrap();
