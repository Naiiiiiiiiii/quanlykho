import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';
import { ProductVariant } from '../../entities/product-variant.entity';
import { Size } from '../../entities/size.entity';
import { Color } from '../../entities/color.entity';
import { Lot } from '../../entities/lot.entity';
import { InventoryLocation } from '../../entities/inventory-location.entity';
import { StorageLocation } from '../../entities/storage-location.entity';
import { QualityStatus } from '../../entities/quality-status.entity';
import { QualityCheck } from '../../entities/quality-check.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      ProductVariant,
      Size,
      Color,
      Lot,
      InventoryLocation,
      StorageLocation,
      QualityStatus,
      QualityCheck,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
