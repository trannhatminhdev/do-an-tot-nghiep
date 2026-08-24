import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    CoreModule,
    // Shared Module chứa các utility, decorator xài chung
    SharedModule,

    // 1. Phục vụ uploads từ thư mục static (không bao giờ bị Nuxt build làm sạch)
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'static', 'uploads'),
        serveRoot: '/uploads',
        serveStaticOptions: {
          index: false,
        },
      },
      // 2. Phục vụ giao diện tĩnh FE từ thư mục public (loại trừ api, swagger và uploads)
      {
        rootPath: join(__dirname, '..', 'public'),
        exclude: ['/api/*path', '/swagger', '/swagger/*path', '/uploads/*path'],
      },
    ),

    // Cấu hình Event Emitter cho giao tiếp bất đồng bộ (giúp tách microservices sau này)
    EventEmitterModule.forRoot(),

    // Feature Modules
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    VouchersModule,
    OrdersModule,
    ReviewsModule,
  ],
})
export class AppModule {}
