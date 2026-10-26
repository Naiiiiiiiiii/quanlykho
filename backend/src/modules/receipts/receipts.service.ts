import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ImportReceipt } from '../../entities/import-receipt.entity';
import { ImportDetail } from '../../entities/import-detail.entity';
import { ExportReceipt } from '../../entities/export-receipt.entity';
import { ExportDetail } from '../../entities/export-detail.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { ProductVariant } from '../../entities/product-variant.entity';
import { Lot } from '../../entities/lot.entity';
import { StorageLocation } from '../../entities/storage-location.entity';
import { InventoryLocation } from '../../entities/inventory-location.entity';
import { QualityCheck } from '../../entities/quality-check.entity';
import { CreateReceiptDto, ReceiptItemDto } from './dto/create-receipt.dto';
import { FilterReceiptDto } from './dto/filter-receipt.dto';

@Injectable()
export class ReceiptsService implements OnModuleInit {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    @InjectRepository(ImportReceipt)
    private readonly importReceiptRepo: Repository<ImportReceipt>,
    @InjectRepository(ImportDetail)
    private readonly importDetailRepo: Repository<ImportDetail>,
    @InjectRepository(ExportReceipt)
    private readonly exportReceiptRepo: Repository<ExportReceipt>,
    @InjectRepository(ExportDetail)
    private readonly exportDetailRepo: Repository<ExportDetail>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Lot)
    private readonly lotRepo: Repository<Lot>,
    @InjectRepository(StorageLocation)
    private readonly locationRepo: Repository<StorageLocation>,
    @InjectRepository(InventoryLocation)
    private readonly inventoryLocationRepo: Repository<InventoryLocation>,
    @InjectRepository(QualityCheck)
    private readonly qualityCheckRepo: Repository<QualityCheck>,
    @Optional()
    private readonly dataSource?: DataSource,
  ) {}

  async onModuleInit() {
    await this.seedReceiptData();
  }

  /**
   * Chuẩn hóa loại phiếu và chế độ lưu
   */
  private normalizeType(type: string): 'IMPORT' | 'EXPORT' {
    const upper = type.trim().toUpperCase();
    if (upper === 'IMPORT' || upper === 'NHẬP' || upper === 'NHAP') {
      return 'IMPORT';
    }
    return 'EXPORT';
  }

  private normalizeSaveMode(mode: string): 'DRAFT' | 'COMPLETED' {
    const upper = mode.trim().toUpperCase();
    if (upper === 'DRAFT' || upper === 'NHÁP' || upper === 'NHAP') {
      return 'DRAFT';
    }
    return 'COMPLETED';
  }

  /**
   * UC01 - Bước: kiemTraKhoBienTheLoViTri(dsChiTiet)
   * Kiểm tra kho, biến thể, lô và vị trí có tồn tại và khả dụng không
   */
  private async validateCatalogAvailability(
    warehouseId: number,
    type: 'IMPORT' | 'EXPORT',
    items: ReceiptItemDto[],
  ): Promise<void> {
    const warehouse = await this.warehouseRepo.findOne({
      where: { warehouseId },
    });
    if (!warehouse || warehouse.status !== 'ACTIVE') {
      throw new BadRequestException('Vui lòng chọn lại kho/biến thể/lô/vị trí');
    }

    for (const item of items) {
      const variant = await this.variantRepo.findOne({
        where: { variantId: item.variantId },
      });
      if (!variant || variant.status !== 'ACTIVE') {
        throw new BadRequestException(
          'Vui lòng chọn lại kho/biến thể/lô/vị trí',
        );
      }

      if (item.lotId !== undefined && item.lotId !== null) {
        const lot = await this.lotRepo.findOne({
          where: { lotId: item.lotId },
        });
        if (
          !lot ||
          lot.variantId !== item.variantId ||
          lot.status === 'INACTIVE' ||
          lot.status === 'BLOCKED'
        ) {
          throw new BadRequestException(
            'Vui lòng chọn lại kho/biến thể/lô/vị trí',
          );
        }
      } else if (type === 'EXPORT') {
        // Phiếu xuất bắt buộc phải chọn lô hoặc vị trí hợp lệ
        throw new BadRequestException(
          'Vui lòng chọn lại kho/biến thể/lô/vị trí',
        );
      }

      if (item.locationId !== undefined && item.locationId !== null) {
        const loc = await this.locationRepo.findOne({
          where: { locationId: item.locationId },
          relations: { rack: { zone: true } },
        });
        if (
          !loc ||
          loc.status === 'INACTIVE' ||
          loc.rack?.zone?.warehouseId !== warehouseId
        ) {
          throw new BadRequestException(
            'Vui lòng chọn lại kho/biến thể/lô/vị trí',
          );
        }
      }
    }
  }

  /**
   * UC01 - Bước: kiemTraTonKhaDung(dsChiTiet)
   * Tồn khả dụng theo lô/vị trí và trạng thái chất lượng cho phép xuất
   */
  private async validateAvailableStockForExport(
    items: ReceiptItemDto[],
  ): Promise<void> {
    for (const item of items) {
      if (!item.lotId) {
        throw new BadRequestException(
          'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
        );
      }

      const lot = await this.lotRepo.findOne({
        where: { lotId: item.lotId },
        relations: {
          qualityChecks: {
            status: true,
          },
        },
      });

      if (!lot || lot.status !== 'AVAILABLE') {
        throw new BadRequestException(
          'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
        );
      }

      // Kiểm tra trạng thái chất lượng: Nếu lô có bản ghi kiểm định DAMAGED/BLOCKED toàn bộ hoặc trạng thái không cho phép xuất
      const latestCheck = (lot.qualityChecks || []).sort(
        (a, b) =>
          new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime(),
      )[0];

      if (
        latestCheck?.status &&
        ['BLOCKED', 'REJECTED'].includes(latestCheck.status.name.toUpperCase())
      ) {
        throw new BadRequestException(
          'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
        );
      }

      if (Number(lot.remainingQuantity) < Number(item.quantity)) {
        throw new BadRequestException(
          'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
        );
      }

      if (item.locationId) {
        const invLoc = await this.inventoryLocationRepo.findOne({
          where: {
            variantId: item.variantId,
            lotId: item.lotId,
            locationId: item.locationId,
          },
        });
        if (!invLoc || Number(invLoc.quantity) < Number(item.quantity)) {
          throw new BadRequestException(
            'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
          );
        }
      }
    }
  }

  /**
   * UC01 - Tạo và xử lý phiếu nhập/xuất
   */
  async createAndProcessReceipt(
    dto: CreateReceiptDto,
    employeeId?: number,
  ): Promise<{ message: string; data: unknown }> {
    // 1. kiemTraDuLieuPhieu() - Trường bắt buộc, số lượng > 0
    if (
      !dto ||
      !dto.warehouseId ||
      !Array.isArray(dto.items) ||
      dto.items.length === 0 ||
      dto.items.some((i) => !i.variantId || !i.quantity || i.quantity <= 0)
    ) {
      throw new BadRequestException('Dữ liệu không hợp lệ, vui lòng chỉnh sửa');
    }

    const type = this.normalizeType(dto.receiptType);
    const saveMode = this.normalizeSaveMode(dto.saveMode);

    // 2. kiemTraKhoBienTheLoViTri(dsChiTiet)
    await this.validateCatalogAvailability(dto.warehouseId, type, dto.items);

    // 3. opt [loaiPhieu = "Xuất"] -> kiemTraTonKhaDung(dsChiTiet)
    if (type === 'EXPORT') {
      await this.validateAvailableStockForExport(dto.items);
    }

    // 4. Nhánh 1: Lưu phiếu ở trạng thái Nháp (KHÔNG tác động tồn kho)
    if (saveMode === 'DRAFT') {
      try {
        if (type === 'IMPORT') {
          const totalQuantity = dto.items.reduce(
            (sum, i) => sum + Number(i.quantity),
            0,
          );
          const receipt = await this.importReceiptRepo.save({
            warehouseId: dto.warehouseId,
            employeeId,
            supplierName: dto.supplierName,
            totalQuantity,
            status: 'DRAFT',
            note: dto.note,
          });

          const details = dto.items.map((item) =>
            this.importDetailRepo.create({
              importId: receipt.importId,
              variantId: item.variantId,
              lotId: item.lotId,
              locationId: item.locationId,
              quantity: item.quantity,
              unit: item.unit || 'Chiếc',
            }),
          );
          await this.importDetailRepo.save(details);

          return {
            message: 'Đã lưu nháp phiếu',
            data: {
              receiptId: receipt.importId,
              receiptType: 'IMPORT',
              status: 'DRAFT',
              totalQuantity,
            },
          };
        } else {
          const receipt = await this.exportReceiptRepo.save({
            warehouseId: dto.warehouseId,
            employeeId,
            reason: dto.reason || 'Xuất bán',
            receiver: dto.receiver,
            status: 'DRAFT',
            note: dto.note,
          });

          const details = dto.items.map((item) =>
            this.exportDetailRepo.create({
              exportId: receipt.exportId,
              variantId: item.variantId,
              lotId: item.lotId,
              locationId: item.locationId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
            }),
          );
          await this.exportDetailRepo.save(details);

          return {
            message: 'Đã lưu nháp phiếu',
            data: {
              receiptId: receipt.exportId,
              receiptType: 'EXPORT',
              status: 'DRAFT',
            },
          };
        }
      } catch (error) {
        this.logger.error('Lỗi khi lưu nháp phiếu: ', error);
        throw new InternalServerErrorException('Lưu phiếu thất bại');
      }
    }

    // 5. Nhánh 2: Xác nhận hoàn tất phiếu (Mở Transaction, khóa bản ghi, cập nhật tồn kho, commit)
    try {
      if (!this.dataSource) {
        throw new Error('DataSource is not initialized');
      }

      const result = await this.dataSource.transaction(async (manager) => {
        const impRepo = manager.getRepository(ImportReceipt);
        const impDetailRepo = manager.getRepository(ImportDetail);
        const expRepo = manager.getRepository(ExportReceipt);
        const expDetailRepo = manager.getRepository(ExportDetail);
        const lotRepo = manager.getRepository(Lot);
        const invLocRepo = manager.getRepository(InventoryLocation);
        const locRepo = manager.getRepository(StorageLocation);

        if (type === 'IMPORT') {
          const totalQuantity = dto.items.reduce(
            (sum, i) => sum + Number(i.quantity),
            0,
          );
          // Bước 41: luuPhieuVaChiTiet(thongTinChung, dsChiTiet, trangThai = "Nháp")
          const draftReceipt = await impRepo.save({
            warehouseId: dto.warehouseId,
            employeeId,
            supplierName: dto.supplierName,
            totalQuantity,
            status: 'DRAFT',
            note: dto.note,
          });

          // Bước 43: khoaPhieuVaKiemTraTrangThai(maPhieu)
          const lockedReceipt = await impRepo.findOne({
            where: { importId: draftReceipt.importId },
            lock: { mode: 'pessimistic_write' },
          });

          if (!lockedReceipt || lockedReceipt.status !== 'DRAFT') {
            throw new ConflictException(
              'Phiếu đã được xử lý, không thể hoàn tất lại',
            );
          }

          // Bước 45: capNhatTonKho(loaiPhieu = Nhập, dsChiTiet)
          for (const item of dto.items) {
            let targetLotId = item.lotId;
            if (targetLotId) {
              const lot = await lotRepo.findOne({
                where: { lotId: targetLotId },
                lock: { mode: 'pessimistic_write' },
              });
              if (!lot) {
                throw new BadRequestException('Lô hàng không tồn tại');
              }
              lot.remainingQuantity =
                Number(lot.remainingQuantity) + Number(item.quantity);
              await lotRepo.save(lot);
            } else {
              // Tạo lô mới nếu phiếu nhập chưa có lotId
              const newLot = await lotRepo.save({
                variantId: item.variantId,
                lotCode:
                  item.lotCode ||
                  `LOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                receivedDate: new Date(),
                initialQuantity: item.quantity,
                remainingQuantity: item.quantity,
                status: 'AVAILABLE',
              });
              targetLotId = newLot.lotId;
            }

            await impDetailRepo.save({
              importId: lockedReceipt.importId,
              variantId: item.variantId,
              lotId: targetLotId,
              locationId: item.locationId,
              quantity: item.quantity,
              unit: item.unit || 'Chiếc',
            });

            if (item.locationId) {
              const loc = await locRepo.findOne({
                where: { locationId: item.locationId },
                lock: { mode: 'pessimistic_write' },
              });
              if (loc) {
                loc.currentQuantity =
                  Number(loc.currentQuantity) + Number(item.quantity);
                await locRepo.save(loc);
              }

              let invLoc = await invLocRepo.findOne({
                where: {
                  variantId: item.variantId,
                  lotId: targetLotId,
                  locationId: item.locationId,
                },
                lock: { mode: 'pessimistic_write' },
              });
              if (invLoc) {
                invLoc.quantity =
                  Number(invLoc.quantity) + Number(item.quantity);
                await invLocRepo.save(invLoc);
              } else {
                invLoc = invLocRepo.create({
                  variantId: item.variantId,
                  lotId: targetLotId,
                  locationId: item.locationId,
                  quantity: item.quantity,
                });
                await invLocRepo.save(invLoc);
              }
            }
          }

          // Bước 55: capNhatTrangThai(maPhieu, "Hoàn tất", thoiDiemHoanTat)
          lockedReceipt.status = 'COMPLETED';
          lockedReceipt.importDate = new Date();
          await impRepo.save(lockedReceipt);

          return {
            receiptId: lockedReceipt.importId,
            receiptType: 'IMPORT',
            status: 'COMPLETED',
            completedAt: lockedReceipt.importDate,
          };
        } else {
          // LoaiPhieu = EXPORT
          // Bước 41: luuPhieuVaChiTiet(thongTinChung, dsChiTiet, trangThai = "Nháp")
          const draftReceipt = await expRepo.save({
            warehouseId: dto.warehouseId,
            employeeId,
            reason: dto.reason || 'Xuất bán',
            receiver: dto.receiver,
            status: 'DRAFT',
            note: dto.note,
          });

          // Bước 43: khoaPhieuVaKiemTraTrangThai(maPhieu)
          const lockedReceipt = await expRepo.findOne({
            where: { exportId: draftReceipt.exportId },
            lock: { mode: 'pessimistic_write' },
          });

          if (!lockedReceipt || lockedReceipt.status !== 'DRAFT') {
            throw new ConflictException(
              'Phiếu đã được xử lý, không thể hoàn tất lại',
            );
          }

          // Bước 45: capNhatTonKho(loaiPhieu = Xuất, dsChiTiet) - Kiểm tra lại tồn khi đã khóa bản ghi
          for (const item of dto.items) {
            if (!item.lotId) {
              throw new BadRequestException(
                'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
              );
            }

            const lot = await lotRepo.findOne({
              where: { lotId: item.lotId },
              lock: { mode: 'pessimistic_write' },
            });

            if (!lot || Number(lot.remainingQuantity) < Number(item.quantity)) {
              throw new BadRequestException(
                'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
              );
            }

            lot.remainingQuantity =
              Number(lot.remainingQuantity) - Number(item.quantity);
            await lotRepo.save(lot);

            if (item.locationId) {
              const invLoc = await invLocRepo.findOne({
                where: {
                  variantId: item.variantId,
                  lotId: item.lotId,
                  locationId: item.locationId,
                },
                lock: { mode: 'pessimistic_write' },
              });

              if (!invLoc || Number(invLoc.quantity) < Number(item.quantity)) {
                throw new BadRequestException(
                  'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
                );
              }

              invLoc.quantity = Number(invLoc.quantity) - Number(item.quantity);
              await invLocRepo.save(invLoc);

              const loc = await locRepo.findOne({
                where: { locationId: item.locationId },
                lock: { mode: 'pessimistic_write' },
              });
              if (loc) {
                loc.currentQuantity = Math.max(
                  0,
                  Number(loc.currentQuantity) - Number(item.quantity),
                );
                await locRepo.save(loc);
              }
            }

            await expDetailRepo.save({
              exportId: lockedReceipt.exportId,
              variantId: item.variantId,
              lotId: item.lotId,
              locationId: item.locationId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
            });
          }

          // Bước 55: capNhatTrangThai(maPhieu, "Hoàn tất", thoiDiemHoanTat)
          lockedReceipt.status = 'COMPLETED';
          lockedReceipt.exportDate = new Date();
          await expRepo.save(lockedReceipt);

          return {
            receiptId: lockedReceipt.exportId,
            receiptType: 'EXPORT',
            status: 'COMPLETED',
            completedAt: lockedReceipt.exportDate,
          };
        }
      });

      return {
        message: 'Hoàn tất phiếu',
        data: result,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        'Lỗi ghi phiếu hoặc cập nhật tồn kho (đã rollback toàn bộ): ',
        error,
      );
      throw new InternalServerErrorException(
        'Không thể hoàn tất phiếu, dữ liệu chưa bị thay đổi',
      );
    }
  }

  /**
   * UC02 - Theo dõi phiếu nhập/xuất (Xem danh sách mặc định & Lọc danh sách phiếu)
   */
  async findAll(filter: FilterReceiptDto) {
    // Bước 16: kiemTraBoLoc() - Kiểm tra tuNgay > denNgay
    let fromDateObj: Date | undefined;
    let toDateObj: Date | undefined;

    if (filter.fromDate) {
      fromDateObj = new Date(filter.fromDate);
      if (isNaN(fromDateObj.getTime())) {
        throw new BadRequestException('Bộ lọc không hợp lệ, vui lòng nhập lại');
      }
    }
    if (filter.toDate) {
      toDateObj = new Date(filter.toDate);
      if (isNaN(toDateObj.getTime())) {
        throw new BadRequestException('Bộ lọc không hợp lệ, vui lòng nhập lại');
      }
      // Đặt cuối ngày nếu chỉ truyền YYYY-MM-DD
      if (filter.toDate.length <= 10) {
        toDateObj.setHours(23, 59, 59, 999);
      }
    }

    if (
      fromDateObj &&
      toDateObj &&
      fromDateObj.getTime() > toDateObj.getTime()
    ) {
      throw new BadRequestException('Bộ lọc không hợp lệ, vui lòng nhập lại');
    }

    try {
      const normalizedStatus = filter.status
        ? filter.status.toUpperCase() === 'NHÁP' ||
          filter.status.toUpperCase() === 'NHAP'
          ? 'DRAFT'
          : filter.status.toUpperCase() === 'HOÀN TẤT' ||
              filter.status.toUpperCase() === 'HOAN TAT'
            ? 'COMPLETED'
            : filter.status.toUpperCase()
        : undefined;

      const wantImport =
        !filter.type ||
        ['IMPORT', 'NHẬP', 'NHAP'].includes(filter.type.toUpperCase());
      const wantExport =
        !filter.type ||
        ['EXPORT', 'XUẤT', 'XUAT'].includes(filter.type.toUpperCase());

      const results: Array<Record<string, unknown>> = [];

      if (wantImport) {
        const imports = await this.importReceiptRepo.find({
          relations: {
            warehouse: true,
            employee: true,
            importDetails: {
              variant: { product: true, size: true, color: true },
              lot: true,
            },
          },
          order: { importDate: 'DESC' },
        });

        for (const imp of imports) {
          const code = `PN-${String(imp.importId).padStart(4, '0')}`;
          if (filter.warehouseId && imp.warehouseId !== filter.warehouseId)
            continue;
          if (normalizedStatus && imp.status !== normalizedStatus) continue;
          if (
            filter.receiptCode &&
            !code.toLowerCase().includes(filter.receiptCode.toLowerCase()) &&
            String(imp.importId) !== filter.receiptCode
          )
            continue;
          if (fromDateObj && new Date(imp.importDate) < fromDateObj) continue;
          if (toDateObj && new Date(imp.importDate) > toDateObj) continue;

          results.push({
            receiptId: imp.importId,
            receiptCode: code,
            receiptType: 'IMPORT',
            warehouseId: imp.warehouseId,
            warehouseName: imp.warehouse?.name,
            employeeName: imp.employee?.fullName,
            date: imp.importDate,
            status: imp.status,
            supplierOrReceiver: imp.supplierName,
            totalQuantity: imp.totalQuantity,
            note: imp.note,
            itemCount: imp.importDetails?.length || 0,
          });
        }
      }

      if (wantExport) {
        const exports = await this.exportReceiptRepo.find({
          relations: {
            warehouse: true,
            employee: true,
            exportDetails: {
              variant: { product: true, size: true, color: true },
              lot: true,
            },
          },
          order: { exportDate: 'DESC' },
        });

        for (const exp of exports) {
          const code = `PX-${String(exp.exportId).padStart(4, '0')}`;
          if (filter.warehouseId && exp.warehouseId !== filter.warehouseId)
            continue;
          if (normalizedStatus && exp.status !== normalizedStatus) continue;
          if (
            filter.receiptCode &&
            !code.toLowerCase().includes(filter.receiptCode.toLowerCase()) &&
            String(exp.exportId) !== filter.receiptCode
          )
            continue;
          if (fromDateObj && new Date(exp.exportDate) < fromDateObj) continue;
          if (toDateObj && new Date(exp.exportDate) > toDateObj) continue;

          const totalQty = (exp.exportDetails || []).reduce(
            (s, d) => s + Number(d.quantity || 0),
            0,
          );

          results.push({
            receiptId: exp.exportId,
            receiptCode: code,
            receiptType: 'EXPORT',
            warehouseId: exp.warehouseId,
            warehouseName: exp.warehouse?.name,
            employeeName: exp.employee?.fullName,
            date: exp.exportDate,
            status: exp.status,
            reason: exp.reason,
            supplierOrReceiver: exp.receiver,
            totalQuantity: totalQty,
            note: exp.note,
            itemCount: exp.exportDetails?.length || 0,
          });
        }
      }

      if (results.length === 0) {
        return {
          message: 'Không có phiếu phù hợp',
          data: [],
        };
      }

      return {
        message: 'Lấy danh sách phiếu nhập/xuất thành công',
        data: results,
      };
    } catch (error) {
      this.logger.error('Lỗi truy vấn danh sách phiếu: ', error);
      throw new InternalServerErrorException('Không thể tải dữ liệu');
    }
  }

  /**
   * UC02 - Xem chi tiết phiếu
   * Sequence diagram:
   * - HT -> PNX : layThongTinChung(maPhieu, phamViQuyen)
   * - HT -> CT : layChiTietHangVaLo(maPhieu)
   * - Không tìm thấy -> "Không tìm thấy phiếu"
   * - Lỗi truy vấn -> "Không thể tải dữ liệu"
   */
  async findOne(type: string, id: number) {
    const normalizedType = this.normalizeType(type);

    try {
      if (normalizedType === 'IMPORT') {
        const receipt = await this.importReceiptRepo.findOne({
          where: { importId: id },
          relations: {
            warehouse: true,
            employee: true,
            importDetails: {
              variant: {
                product: true,
                size: true,
                color: true,
              },
              lot: true,
            },
          },
        });

        if (!receipt) {
          throw new NotFoundException('Không tìm thấy phiếu');
        }

        return {
          message: 'Lấy chi tiết phiếu thành công',
          data: {
            receiptId: receipt.importId,
            receiptCode: `PN-${String(receipt.importId).padStart(4, '0')}`,
            receiptType: 'IMPORT',
            status: receipt.status,
            date: receipt.importDate,
            warehouse: receipt.warehouse,
            employee: receipt.employee,
            supplierName: receipt.supplierName,
            totalQuantity: receipt.totalQuantity,
            note: receipt.note,
            items: receipt.importDetails || [],
            lots: (receipt.importDetails || [])
              .map((d) => d.lot)
              .filter(Boolean),
          },
        };
      } else {
        const receipt = await this.exportReceiptRepo.findOne({
          where: { exportId: id },
          relations: {
            warehouse: true,
            employee: true,
            exportDetails: {
              variant: {
                product: true,
                size: true,
                color: true,
              },
              lot: true,
            },
          },
        });

        if (!receipt) {
          throw new NotFoundException('Không tìm thấy phiếu');
        }

        return {
          message: 'Lấy chi tiết phiếu thành công',
          data: {
            receiptId: receipt.exportId,
            receiptCode: `PX-${String(receipt.exportId).padStart(4, '0')}`,
            receiptType: 'EXPORT',
            status: receipt.status,
            date: receipt.exportDate,
            warehouse: receipt.warehouse,
            employee: receipt.employee,
            reason: receipt.reason,
            receiver: receipt.receiver,
            note: receipt.note,
            items: receipt.exportDetails || [],
            lots: (receipt.exportDetails || [])
              .map((d) => d.lot)
              .filter(Boolean),
          },
        };
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Lỗi truy vấn chi tiết phiếu: ', error);
      throw new InternalServerErrorException('Không thể tải dữ liệu');
    }
  }

  /**
   * UC01 - Xác nhận hoàn tất một phiếu đang ở trạng thái Nháp (DRAFT -> COMPLETED)
   * Sequence diagram:
   * - moGiaoDich()
   * - khoaPhieuVaKiemTraTrangThai(maPhieu)
   * - [TrangThai == COMPLETED] -> ConflictException('Phiếu đã được xử lý, không thể hoàn tất lại')
   * - capNhatTonKho(loaiPhieu, dsChiTiet)
   * - capNhatTrangThai(maPhieu, "Hoàn tất", thoiDiemHoanTat)
   * - commitGiaoDich()
   */
  async completeDraftReceipt(
    type: string,
    id: number,
  ): Promise<{ message: string; data: unknown }> {
    const normalizedType = this.normalizeType(type);

    try {
      if (!this.dataSource) {
        throw new Error('DataSource is not initialized');
      }

      const result = await this.dataSource.transaction(async (manager) => {
        const impRepo = manager.getRepository(ImportReceipt);
        const impDetailRepo = manager.getRepository(ImportDetail);
        const expRepo = manager.getRepository(ExportReceipt);
        const expDetailRepo = manager.getRepository(ExportDetail);
        const lotRepo = manager.getRepository(Lot);
        const invLocRepo = manager.getRepository(InventoryLocation);
        const locRepo = manager.getRepository(StorageLocation);

        if (normalizedType === 'IMPORT') {
          const lockedReceipt = await impRepo.findOne({
            where: { importId: id },
            lock: { mode: 'pessimistic_write' },
          });

          if (!lockedReceipt) {
            throw new NotFoundException('Không tìm thấy phiếu');
          }

          if (lockedReceipt.status !== 'DRAFT') {
            throw new ConflictException(
              'Phiếu đã được xử lý, không thể hoàn tất lại',
            );
          }

          const details = await impDetailRepo.find({
            where: { importId: id },
          });

          for (const item of details) {
            let targetLotId = item.lotId;
            if (targetLotId) {
              const lot = await lotRepo.findOne({
                where: { lotId: targetLotId },
                lock: { mode: 'pessimistic_write' },
              });
              if (!lot) {
                throw new BadRequestException('Lô hàng không tồn tại');
              }
              lot.remainingQuantity =
                Number(lot.remainingQuantity) + Number(item.quantity);
              await lotRepo.save(lot);
            } else {
              const newLot = await lotRepo.save({
                variantId: item.variantId,
                lotCode: `LOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                receivedDate: new Date(),
                initialQuantity: item.quantity,
                remainingQuantity: item.quantity,
                status: 'AVAILABLE',
              });
              targetLotId = newLot.lotId;
              item.lotId = targetLotId;
              await impDetailRepo.save(item);
            }

            if (item.locationId) {
              const loc = await locRepo.findOne({
                where: { locationId: item.locationId },
                lock: { mode: 'pessimistic_write' },
              });
              if (loc) {
                loc.currentQuantity =
                  Number(loc.currentQuantity) + Number(item.quantity);
                await locRepo.save(loc);
              }

              let invLoc = await invLocRepo.findOne({
                where: {
                  variantId: item.variantId,
                  lotId: targetLotId,
                  locationId: item.locationId,
                },
                lock: { mode: 'pessimistic_write' },
              });
              if (invLoc) {
                invLoc.quantity =
                  Number(invLoc.quantity) + Number(item.quantity);
                await invLocRepo.save(invLoc);
              } else {
                invLoc = invLocRepo.create({
                  variantId: item.variantId,
                  lotId: targetLotId,
                  locationId: item.locationId,
                  quantity: item.quantity,
                });
                await invLocRepo.save(invLoc);
              }
            }
          }

          lockedReceipt.status = 'COMPLETED';
          lockedReceipt.importDate = new Date();
          await impRepo.save(lockedReceipt);

          return {
            receiptId: lockedReceipt.importId,
            receiptType: 'IMPORT',
            status: 'COMPLETED',
            completedAt: lockedReceipt.importDate,
          };
        } else {
          const lockedReceipt = await expRepo.findOne({
            where: { exportId: id },
            lock: { mode: 'pessimistic_write' },
          });

          if (!lockedReceipt) {
            throw new NotFoundException('Không tìm thấy phiếu');
          }

          if (lockedReceipt.status !== 'DRAFT') {
            throw new ConflictException(
              'Phiếu đã được xử lý, không thể hoàn tất lại',
            );
          }

          const details = await expDetailRepo.find({
            where: { exportId: id },
          });

          for (const item of details) {
            if (!item.lotId) {
              throw new BadRequestException(
                'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
              );
            }

            const lot = await lotRepo.findOne({
              where: { lotId: item.lotId },
              lock: { mode: 'pessimistic_write' },
            });

            if (!lot || Number(lot.remainingQuantity) < Number(item.quantity)) {
              throw new BadRequestException(
                'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
              );
            }

            lot.remainingQuantity =
              Number(lot.remainingQuantity) - Number(item.quantity);
            await lotRepo.save(lot);

            if (item.locationId) {
              const invLoc = await invLocRepo.findOne({
                where: {
                  variantId: item.variantId,
                  lotId: item.lotId,
                  locationId: item.locationId,
                },
                lock: { mode: 'pessimistic_write' },
              });

              if (!invLoc || Number(invLoc.quantity) < Number(item.quantity)) {
                throw new BadRequestException(
                  'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
                );
              }

              invLoc.quantity = Number(invLoc.quantity) - Number(item.quantity);
              await invLocRepo.save(invLoc);

              const loc = await locRepo.findOne({
                where: { locationId: item.locationId },
                lock: { mode: 'pessimistic_write' },
              });
              if (loc) {
                loc.currentQuantity = Math.max(
                  0,
                  Number(loc.currentQuantity) - Number(item.quantity),
                );
                await locRepo.save(loc);
              }
            }
          }

          lockedReceipt.status = 'COMPLETED';
          lockedReceipt.exportDate = new Date();
          await expRepo.save(lockedReceipt);

          return {
            receiptId: lockedReceipt.exportId,
            receiptType: 'EXPORT',
            status: 'COMPLETED',
            completedAt: lockedReceipt.exportDate,
          };
        }
      });

      return {
        message: 'Hoàn tất phiếu',
        data: result,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Lỗi khi hoàn tất phiếu nháp: ', error);
      throw new InternalServerErrorException(
        'Không thể hoàn tất phiếu, dữ liệu chưa bị thay đổi',
      );
    }
  }

  /**
   * Khởi tạo dữ liệu mẫu Phiếu Nhập & Phiếu Xuất bán (phục vụ UC02, UC15, UC16, UC20)
   */
  async seedReceiptData(): Promise<void> {
    try {
      const impCount = await this.importReceiptRepo.count();
      if (impCount > 0) return;

      const warehouse = await this.warehouseRepo.findOne({
        where: {},
        order: { warehouseId: 'ASC' },
      });
      const variants = await this.variantRepo.find({
        order: { variantId: 'ASC' },
      });
      const lots = await this.lotRepo.find({ order: { lotId: 'ASC' } });
      const locations = await this.locationRepo.find({
        order: { locationId: 'ASC' },
      });

      if (!warehouse || variants.length === 0 || lots.length === 0) return;

      // 1. Tạo Phiếu Nhập hoàn tất mẫu
      const imp = await this.importReceiptRepo.save({
        warehouseId: warehouse.warehouseId,
        importDate: new Date('2026-07-10T09:00:00Z'),
        supplierName: 'Công ty May Mặc Việt Tiến',
        totalQuantity: 200,
        status: 'COMPLETED',
        note: 'Nhập lô hàng Áo Polo đợt 1',
      });

      await this.importDetailRepo.save({
        importId: imp.importId,
        variantId: variants[0].variantId,
        lotId: lots[0].lotId,
        locationId: locations[0]?.locationId,
        quantity: 200,
        unit: 'Chiếc',
      });

      // 2. Tạo 3 Phiếu Xuất bán hoàn tất ở 3 tháng gần nhất (Tháng 7, 8, 9/2026) để phục vụ UC15 & UC16 (Dự báo doanh thu 3 tháng)
      const months = [
        {
          date: new Date('2026-07-20T14:00:00Z'),
          qty: 30,
          price: 250000,
          discount: 500000,
        },
        {
          date: new Date('2026-08-18T10:30:00Z'),
          qty: 40,
          price: 250000,
          discount: 0,
        },
        {
          date: new Date('2026-09-22T16:15:00Z'),
          qty: 50,
          price: 250000,
          discount: 500000,
        },
      ];

      for (const m of months) {
        const exp = await this.exportReceiptRepo.save({
          warehouseId: warehouse.warehouseId,
          exportDate: m.date,
          reason: 'Xuất bán',
          receiver: 'Hệ thống Cửa hàng Thời trang TP.HCM',
          status: 'COMPLETED',
          note: 'Phiếu xuất bán sỉ định kỳ',
        });

        await this.exportDetailRepo.save({
          exportId: exp.exportId,
          variantId: variants[0].variantId,
          lotId: lots[0].lotId,
          locationId: locations[0]?.locationId,
          quantity: m.qty,
          unitPrice: m.price,
          discount: m.discount,
        });
      }

      this.logger.log(
        'Đã khởi tạo dữ liệu mẫu Phiếu Nhập và Phiếu Xuất bán 3 tháng gần nhất',
      );
    } catch (err) {
      this.logger.warn('Seed receipt data check: ' + (err as Error).message);
    }
  }
}
