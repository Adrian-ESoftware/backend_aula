import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCategory } from './ProductCategory';
import { ProductSituation } from './ProductSituation';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'productSituationId', type: 'int', nullable: true })
  productSituationId!: number | null;

  @ManyToOne(() => ProductSituation, (situation) => situation.products, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productSituationId' })
  productSituation!: ProductSituation | null;

  @Column({ name: 'productCategoryId', type: 'int', nullable: true })
  productCategoryId!: number | null;

  @ManyToOne(() => ProductCategory, (category) => category.products, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productCategoryId' })
  productCategory!: ProductCategory | null;

  @Column({ type: 'varchar', length: 180, unique: true, nullable: true })
  slug?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}

export { Product as Products };
export default Product;
