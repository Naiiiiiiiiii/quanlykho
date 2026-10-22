import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VariantStorageSpecification } from './variant-storage-specification.entity';

@Entity('storage_specifications')
export class StorageSpecification {
  @PrimaryGeneratedColumn({ name: 'specification_id' })
  specificationId: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'max_quantity', type: 'int', nullable: true })
  maxQuantity?: number;

  @Column({ name: 'unit', type: 'varchar', length: 50, nullable: true })
  unit?: string;

  @Column({ name: 'storage_condition', type: 'text', nullable: true })
  storageCondition?: string;

  // Quan hệ 1-N với VariantStorageSpecification
  @OneToMany(() => VariantStorageSpecification, (vss) => vss.specification)
  variantStorageSpecifications: VariantStorageSpecification[];
}
