import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,
    @InjectRepository(InventoryLocation)
    private readonly inventoryLocationRepository: Repository<InventoryLocation>,
    @InjectRepository(StorageLocation)
    private readonly storageLocationRepository: Repository<StorageLocation>,
    @InjectRepository(QualityStatus)
    private readonly qualityStatusRepository: Repository<QualityStatus>,
    @InjectRepository(QualityCheck)
    private readonly qualityCheckRepository: Repository<QualityCheck>,
  ) {}

  async onModuleInit() {
    await this.seedProductData();
  }

  /**
   * UC05 - Tìm kiếm hoặc chọn hàng hóa (Danh sách hàng hóa)
   */
  async findAll(keyword?: string) {
    try {
      const whereCondition = keyword
        ? { name: Like(`%${keyword.trim()}%`) }
        : {};

      const products = await this.productRepository.find({
        where: whereCondition,
        relations: {
          category: true,
          variants: {
            size: true,
            color: true,
            lots: true,
            inventoryLocations: {
              location: true,
            },
          },
        },
        order: {
          productId: 'ASC',
        },
      });

      if (!products || products.length === 0) {
        return {
          message: 'Hiển thị kết quả rỗng',
          data: [],
        };
      }

      return {
        message: 'Lấy danh sách hàng hóa thành công',
        data: products,
      };
    } catch (error) {
      this.logger.error('Lỗi truy vấn danh sách hàng hóa: ', error);
      throw new InternalServerErrorException('Thông báo lỗi hệ thống');
    }
  }

  /**
   * UC05 - Xem chi tiết hàng hóa
   * Sequence diagram:
   * - System -> DB : truyVanChiTiet(idHangHoa)
   * - Nhánh 1: Lỗi truy vấn -> "Thông báo lỗi hệ thống"
   * - Nhánh 2: Không tìm thấy hàng hóa -> ketQuaRong -> "Hiển thị kết quả rỗng"
   * - Nhánh 3: Một phần dữ liệu chưa có (duLieuThieuPhanGhiChu) -> "Hiển thị các trường hiện có"
   * - Nhánh 4: Truy vấn thành công -> duLieuHangHoa(bienThe, size, mau, lo, tonKho, trangThai)
   */
  async findOne(productId: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { productId },
        relations: {
          category: true,
          variants: {
            size: true,
            color: true,
            lots: {
              qualityChecks: {
                status: true,
              },
            },
            inventoryLocations: {
              location: {
                rack: {
                  zone: {
                    warehouse: true,
                  },
                },
              },
            },
          },
        },
      });

      if (!product) {
        return {
          message: 'Hiển thị kết quả rỗng',
          data: null,
        };
      }

      // Tổng hợp tồn kho và danh sách lô từ các biến thể
      let totalStock = 0;
      const variantsDetail = (product.variants || []).map((v) => {
        const variantStock = (v.inventoryLocations || []).reduce(
          (sum, inv) => sum + Number(inv.quantity || 0),
          0,
        );
        totalStock += variantStock;
        return {
          variantId: v.variantId,
          sku: v.sku,
          barcode: v.barcode,
          status: v.status,
          size: v.size?.name ?? null,
          color: v.color?.name ?? null,
          hexCode: v.color?.hexCode ?? null,
          lots: v.lots || [],
          inventoryLocations: v.inventoryLocations || [],
          totalVariantStock: variantStock,
        };
      });

      const isMissingNoteOrPartial =
        !product.description || product.description.trim() === '';

      const payload = {
        productId: product.productId,
        name: product.name,
        brand: product.brand ?? null,
        unit: product.unit,
        status: product.status,
        description: product.description ?? null,
        category: product.category ?? null,
        totalStock,
        variants: variantsDetail,
        isPartialData: isMissingNoteOrPartial,
      };

      return {
        message: isMissingNoteOrPartial
          ? 'Hiển thị các trường hiện có'
          : 'Lấy chi tiết hàng hóa thành công',
        data: payload,
      };
    } catch (error) {
      this.logger.error('Lỗi truy vấn chi tiết hàng hóa: ', error);
      throw new InternalServerErrorException('Thông báo lỗi hệ thống');
    }
  }

  /**
   * Khởi tạo dữ liệu mẫu cho Hàng hóa, Biến thể, Size, Màu, Lô, Tồn kho vị trí và Kiểm định chất lượng
   */
  async seedProductData(): Promise<void> {
    try {
      const count = await this.productRepository.count();
      if (count > 0) return;

      const catShirt = await this.categoryRepository.save({
        name: 'Áo thời trang',
        description: 'Áo thun Polo, T-Shirt, Áo sơ mi công sở',
      });
      const catPants = await this.categoryRepository.save({
        name: 'Quần thời trang',
        description: 'Quần Jeans, Kaki, Quần Tây',
      });

      const sizeM = await this.sizeRepository.save({
        name: 'M',
        description: 'Size M (55-65kg)',
      });
      const sizeL = await this.sizeRepository.save({
        name: 'L',
        description: 'Size L (65-75kg)',
      });

      const colorNavy = await this.colorRepository.save({
        name: 'Xanh Navy',
        hexCode: '#1E3A8A',
      });
      const colorWhite = await this.colorRepository.save({
        name: 'Trắng',
        hexCode: '#FFFFFF',
      });

      const prod1 = await this.productRepository.save({
        categoryId: catShirt.categoryId,
        name: 'Áo Polo Nam Coolmax Cao Cấp',
        brand: 'CoolMate',
        unit: 'Chiếc',
        status: 'ACTIVE',
        description: 'Áo Polo chất liệu thoáng khí, co giãn 4 chiều',
      });

      const prod2 = await this.productRepository.save({
        categoryId: catPants.categoryId,
        name: 'Quần Jeans Slimfit Co Giãn',
        brand: 'Routine',
        unit: 'Chiếc',
        status: 'ACTIVE',
        description: undefined, // Để kiểm thử nhánh "Một phần dữ liệu chưa có (duLieuThieuPhanGhiChu)"
      });

      const var1 = await this.variantRepository.save({
        productId: prod1.productId,
        sizeId: sizeM.sizeId,
        colorId: colorNavy.colorId,
        sku: 'POLO-CM-NAVY-M',
        barcode: '8930001112223',
        weight: 0.25,
        status: 'ACTIVE',
      });

      const var2 = await this.variantRepository.save({
        productId: prod1.productId,
        sizeId: sizeL.sizeId,
        colorId: colorWhite.colorId,
        sku: 'POLO-CM-WHT-L',
        barcode: '8930001112224',
        weight: 0.27,
        status: 'ACTIVE',
      });

      const var3 = await this.variantRepository.save({
        productId: prod2.productId,
        sizeId: sizeL.sizeId,
        colorId: colorNavy.colorId,
        sku: 'JEAN-RT-NAVY-L',
        barcode: '8930001112225',
        weight: 0.55,
        status: 'ACTIVE',
      });

      const lot1 = await this.lotRepository.save({
        variantId: var1.variantId,
        lotCode: 'LOT-2026-001',
        manufactureDate: new Date('2026-01-15'),
        receivedDate: new Date('2026-02-01'),
        expiryDate: new Date('2029-01-15'),
        initialQuantity: 200,
        remainingQuantity: 120,
        status: 'AVAILABLE',
      });

      const lot2 = await this.lotRepository.save({
        variantId: var2.variantId,
        lotCode: 'LOT-2026-002',
        manufactureDate: new Date('2026-02-10'),
        receivedDate: new Date('2026-02-20'),
        expiryDate: new Date('2029-02-10'),
        initialQuantity: 150,
        remainingQuantity: 80,
        status: 'AVAILABLE',
      });

      const lot3 = await this.lotRepository.save({
        variantId: var3.variantId,
        lotCode: 'LOT-2026-003',
        manufactureDate: new Date('2026-03-01'),
        receivedDate: new Date('2026-03-10'),
        expiryDate: new Date('2029-03-01'),
        initialQuantity: 100,
        remainingQuantity: 50,
        status: 'AVAILABLE',
      });

      // Seed trạng thái chất lượng
      const qsGood = await this.qualityStatusRepository.save({
        name: 'GOOD',
        description: 'Đạt chuẩn chất lượng - Cho phép xuất kho',
      });
      const qsDamaged = await this.qualityStatusRepository.save({
        name: 'DAMAGED',
        description: 'Hàng lỗi/hỏng - Không được phép xuất bán',
      });

      await this.qualityCheckRepository.save([
        {
          lotId: lot1.lotId,
          statusId: qsGood.qualityStatusId,
          quantity: 120,
          description: 'Lô hàng đạt tiêu chuẩn xuất kho',
        },
        {
          lotId: lot2.lotId,
          statusId: qsGood.qualityStatusId,
          quantity: 80,
          description: 'Lô hàng đạt tiêu chuẩn xuất kho',
        },
        {
          lotId: lot3.lotId,
          statusId: qsDamaged.qualityStatusId,
          quantity: 10,
          description: 'Phát hiện 10 sản phẩm lỗi đường may',
        },
      ]);

      // Gắn tồn kho vào các StorageLocation nếu đã được seed
      const locations = await this.storageLocationRepository.find({
        order: { locationId: 'ASC' },
      });
      if (locations.length >= 2) {
        await this.inventoryLocationRepository.save([
          {
            variantId: var1.variantId,
            lotId: lot1.lotId,
            locationId: locations[0].locationId,
            quantity: 120,
          },
          {
            variantId: var2.variantId,
            lotId: lot2.lotId,
            locationId: locations[1].locationId,
            quantity: 80,
          },
        ]);
        if (locations[2]) {
          await this.inventoryLocationRepository.save({
            variantId: var3.variantId,
            lotId: lot3.lotId,
            locationId: locations[2].locationId,
            quantity: 50,
          });
        }
      }

      this.logger.log(
        'Đã khởi tạo dữ liệu mẫu Hàng hóa, Biến thể, Lô và Tồn kho vị trí',
      );
    } catch (err) {
      this.logger.warn('Seed product data check: ' + (err as Error).message);
    }
  }
}
