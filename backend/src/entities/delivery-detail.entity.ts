import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Delivery } from './delivery.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('delivery_details')
export class DeliveryDetail {
  @PrimaryGeneratedColumn({ name: 'delivery_detail_id' })
  deliveryDetailId: number;

  @Column({ name: 'delivery_id', type: 'int' })
  deliveryId: number;

  @Column({ name: 'variant_id', type: 'int' })
  variantId: number;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  // Quan hệ N-1 với Delivery
  @ManyToOne(() => Delivery, (delivery) => delivery.deliveryDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery;

  // Quan hệ N-1 với ProductVariant
  @ManyToOne(() => ProductVariant, (variant) => variant.deliveryDetails, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}
