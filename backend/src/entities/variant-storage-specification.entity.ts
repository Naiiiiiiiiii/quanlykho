import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { StorageSpecification } from './storage-specification.entity';

@Entity('variant_storage_specifications')
export class VariantStorageSpecification {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'variant_id', type: 'int' })
  variantId: number;

  @Column({ name: 'specification_id', type: 'int' })
  specificationId: number;

  // Quan hệ N-1 với ProductVariant
  @ManyToOne(
    () => ProductVariant,
    (variant) => variant.variantStorageSpecifications,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  // Quan hệ N-1 với StorageSpecification
  @ManyToOne(
    () => StorageSpecification,
    (spec) => spec.variantStorageSpecifications,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'specification_id' })
  specification: StorageSpecification;
}
