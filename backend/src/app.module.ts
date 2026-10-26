import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ENTITIES } from './entities';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { ProductsModule } from './modules/products/products.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { ChatModule } from './modules/chat/chat.module';
import { HrModule } from './modules/hr/hr.module';
import { SystemModule } from './modules/system/system.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TransformLoggingInterceptor } from './common/interceptors/transform-logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'quanlykho'),
        entities: ENTITIES,
        synchronize: true,
        logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
      }),
    }),
    UsersModule,
    AuthModule,
    WarehousesModule,
    ProductsModule,
    ReceiptsModule,
    ReportsModule,
    IncidentsModule,
    ContractsModule,
    ChatModule,
    HrModule,
    SystemModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 1. Guard (JWT) - Áp dụng toàn cục, route có @Public() sẽ bỏ qua kiểm tra token
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 1b. Guard (RBAC) - Kiểm tra vai trò theo metadata @Roles() và @ForbiddenMessage()
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // 2. Interceptor (Tiền xử lý đo thời gian bắt đầu -> Hậu xử lý tính duration và chuẩn hóa format)
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformLoggingInterceptor,
    },
    // 3. Exception Filter (Bắt mọi ngoại lệ và định dạng thông báo lỗi theo sequence)
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  // Middleware - Cấp phát requestId duy nhất cho từng request
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
