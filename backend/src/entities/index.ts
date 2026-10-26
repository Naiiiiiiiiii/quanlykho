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
import { UserSession } from './user-session.entity';
import { FacilityIncident } from './facility-incident.entity';
import { RentalContract } from './rental-contract.entity';
import { Conversation } from './conversation.entity';
import { ConversationParticipant } from './conversation-participant.entity';
import { Message } from './message.entity';
import { BackupLog } from './backup-log.entity';
import { SalaryRecord } from './salary-record.entity';
import { WorkTask } from './work-task.entity';
import { SystemErrorLog } from './system-error-log.entity';

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
export * from './user-session.entity';
export * from './facility-incident.entity';
export * from './rental-contract.entity';
export * from './conversation.entity';
export * from './conversation-participant.entity';
export * from './message.entity';
export * from './backup-log.entity';
export * from './salary-record.entity';
export * from './work-task.entity';
export * from './system-error-log.entity';

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
  UserSession,
  FacilityIncident,
  RentalContract,
  Conversation,
  ConversationParticipant,
  Message,
  BackupLog,
  SalaryRecord,
  WorkTask,
  SystemErrorLog,
];
