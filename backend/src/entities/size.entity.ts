import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('sizes')
export class Size {
  @PrimaryGeneratedColumn({ name: 'size_id' })
  sizeId: number;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description?: string;

  // Quan hệ 1-N với ProductVariant
  @OneToMany(() => ProductVariant, (variant) => variant.size)
  variants: ProductVariant[];
}
