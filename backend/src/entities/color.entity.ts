import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('colors')
export class Color {
  @PrimaryGeneratedColumn({ name: 'color_id' })
  colorId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'hex_code', type: 'varchar', length: 20, nullable: true })
  hexCode?: string;

  // Quan hệ 1-N với ProductVariant
  @OneToMany(() => ProductVariant, (variant) => variant.color)
  variants: ProductVariant[];
}
