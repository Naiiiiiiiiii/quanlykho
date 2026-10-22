import { Warehouse } from './warehouse.entity';
import { WarehouseZone } from './warehouse-zone.entity';
import { Rack } from './rack.entity';
import { StorageLocation } from './storage-location.entity';
import { Category } from './category.entity';
import { Product } from './product.entity';
import { Size } from './size.entity';
import { Color } from './color.entity';
import { ProductVariant } from './product-variant.entity';
import { StorageSpecification } from './storage-specification.entity';
import { VariantStorageSpecification } from './variant-storage-specification.entity';
import { Role } from './role.entity';
import { Employee } from './employee.entity';
import { UserAccount } from './user-account.entity';
import { Lot } from './lot.entity';
import { ImportReceipt } from './import-receipt.entity';
import { ImportDetail } from './import-detail.entity';
import { ExportReceipt } from './export-receipt.entity';
import { ExportDetail } from './export-detail.entity';
import { InventoryLocation } from './inventory-location.entity';
import { QualityStatus } from './quality-status.entity';
import { QualityCheck } from './quality-check.entity';
import { Delivery } from './delivery.entity';
import { DeliveryDetail } from './delivery-detail.entity';

export * from './warehouse.entity';
export * from './warehouse-zone.entity';
export * from './rack.entity';
export * from './storage-location.entity';
export * from './category.entity';
export * from './product.entity';
export * from './size.entity';
export * from './color.entity';
export * from './product-variant.entity';
export * from './storage-specification.entity';
export * from './variant-storage-specification.entity';
export * from './role.entity';
export * from './employee.entity';
export * from './user-account.entity';
export * from './lot.entity';
export * from './import-receipt.entity';
export * from './import-detail.entity';
export * from './export-receipt.entity';
export * from './export-detail.entity';
export * from './inventory-location.entity';
export * from './quality-status.entity';
export * from './quality-check.entity';
export * from './delivery.entity';
export * from './delivery-detail.entity';

export const ENTITIES = [
  Warehouse,
  WarehouseZone,
  Rack,
  StorageLocation,
  Category,
  Product,
  Size,
  Color,
  ProductVariant,
  StorageSpecification,
  VariantStorageSpecification,
  Role,
  Employee,
  UserAccount,
  Lot,
  ImportReceipt,
  ImportDetail,
  ExportReceipt,
  ExportDetail,
  InventoryLocation,
  QualityStatus,
  QualityCheck,
  Delivery,
  DeliveryDetail,
];
