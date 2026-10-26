import {
  Injectable,
  OnModuleInit,
  Logger,
  ConflictException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserAccount } from '../../entities/user-account.entity';
import { Employee } from '../../entities/employee.entity';
import { Role } from '../../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: Repository<UserAccount>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Optional()
    private readonly dataSource?: DataSource,
  ) {}

  async onModuleInit() {
    await this.seedInitialData();
  }

  /**
   * Bước: xacDinhTaiKhoan()
   * Tra cứu tài khoản theo username kèm theo thông tin vai trò (Role) và nhân viên (Employee)
   */
  async findByUsername(username: string): Promise<UserAccount | null> {
    return this.userAccountRepository.findOne({
      where: { username },
      relations: {
        role: true,
        employee: true,
      },
    });
  }

  /**
   * Tra cứu tài khoản theo userId
   */
  async findById(userId: number): Promise<UserAccount | null> {
    return this.userAccountRepository.findOne({
      where: { userId },
      relations: {
        role: true,
        employee: true,
      },
    });
  }

  /**
   * Cập nhật thời gian đăng nhập gần nhất
   */
  async updateLastLogin(userId: number): Promise<void> {
    await this.userAccountRepository.update(userId, {
      lastLogin: new Date(),
    });
  }

  /**
   * UC18 - Xem danh sách tài khoản
   * HT -> DB : truyVanDanhSachEmployeeVaUser()
   */
  async findAll(): Promise<UserAccount[]> {
    return this.userAccountRepository.find({
      relations: {
        role: true,
        employee: true,
      },
      select: {
        userId: true,
        username: true,
        employeeId: true,
        roleId: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        role: {
          roleId: true,
          name: true,
          description: true,
        },
        employee: {
          employeeId: true,
          fullName: true,
          email: true,
          phone: true,
          address: true,
          position: true,
          status: true,
        },
      },
      order: {
        userId: 'ASC',
      },
    });
  }

  /**
   * UC18 - Bước: kiemTraRangBuoc(username, role, employeeId)
   * Kiểm tra:
   * - Username trùng (TrungUser)
   * - Role không tồn tại (SaiRole)
   * - Nhân viên đã có tài khoản (DaCoTK)
   */
  async validateAccountConstraints(params: {
    username?: string;
    roleId?: number;
    roleName?: string;
    employeeId?: number;
    excludeUserId?: number;
  }): Promise<{ resolvedRoleId?: number; existingEmployee?: Employee }> {
    const { username, roleId, roleName, employeeId, excludeUserId } = params;

    // 1. Kiểm tra trùng username
    if (username) {
      const existingUsername = await this.userAccountRepository.findOne({
        where: excludeUserId
          ? { username, userId: Not(excludeUserId) }
          : { username },
      });
      if (existingUsername) {
        throw new ConflictException(
          'Username trùng, Role không tồn tại hoặc Nhân viên đã có tài khoản',
        );
      }
    }

    // 2. Kiểm tra Role hợp lệ
    let resolvedRoleId = roleId;
    if (roleId !== undefined && roleId !== null) {
      const role = await this.roleRepository.findOne({ where: { roleId } });
      if (!role) {
        throw new BadRequestException(
          'Username trùng, Role không tồn tại hoặc Nhân viên đã có tài khoản',
        );
      }
      resolvedRoleId = role.roleId;
    } else if (roleName) {
      const role = await this.roleRepository.findOne({
        where: { name: roleName },
      });
      if (!role) {
        throw new BadRequestException(
          'Username trùng, Role không tồn tại hoặc Nhân viên đã có tài khoản',
        );
      }
      resolvedRoleId = role.roleId;
    }

    // 3. Kiểm tra Nhân viên đã có tài khoản chưa (nếu liên kết employeeId có sẵn)
    let existingEmployee: Employee | undefined;
    if (employeeId !== undefined && employeeId !== null) {
      const emp = await this.employeeRepository.findOne({
        where: { employeeId },
      });
      if (!emp) {
        throw new BadRequestException(
          'Username trùng, Role không tồn tại hoặc Nhân viên đã có tài khoản',
        );
      }
      existingEmployee = emp;

      const accWithEmp = await this.userAccountRepository.findOne({
        where: excludeUserId
          ? { employeeId, userId: Not(excludeUserId) }
          : { employeeId },
      });
      if (accWithEmp) {
        throw new ConflictException(
          'Username trùng, Role không tồn tại hoặc Nhân viên đã có tài khoản',
        );
      }
    }

    return { resolvedRoleId, existingEmployee };
  }

  /**
   * UC18 - Tạo mới tài khoản và hồ sơ nhân viên đồng bộ 1-1
   * Sequence diagram:
   * - kiemTraRangBuoc(username, role, employeeId)
   * - batDauTransaction()
   * - bamMatKhauVaLuu(thongTinTaiKhoan) -> luuEmployeeVaUserAccount()
   * - Nếu lỗi ghi CSDL -> hoanTacTransaction() -> "Lưu tài khoản thất bại, đã hoàn tác dữ liệu"
   * - Nếu thành công -> xacNhanTransaction() -> "Lưu tài khoản thành công"
   */
  async create(createUserDto: CreateUserDto): Promise<UserAccount> {
    if (
      !createUserDto.username?.trim() ||
      !createUserDto.password?.trim() ||
      !createUserDto.fullName?.trim()
    ) {
      throw new BadRequestException('Vui lòng nhập đầy đủ thông tin bắt buộc');
    }

    const { resolvedRoleId, existingEmployee } =
      await this.validateAccountConstraints({
        username: createUserDto.username.trim(),
        roleId: createUserDto.roleId,
        roleName: createUserDto.roleName,
        employeeId: createUserDto.employeeId,
      });

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    try {
      if (this.dataSource) {
        return await this.dataSource.transaction(async (manager) => {
          const empRepo = manager.getRepository(Employee);
          const accRepo = manager.getRepository(UserAccount);

          let savedEmployee: Employee;
          if (existingEmployee) {
            existingEmployee.fullName = createUserDto.fullName;
            if (createUserDto.email !== undefined)
              existingEmployee.email = createUserDto.email;
            if (createUserDto.phone !== undefined)
              existingEmployee.phone = createUserDto.phone;
            if (createUserDto.address !== undefined)
              existingEmployee.address = createUserDto.address;
            if (createUserDto.position !== undefined)
              existingEmployee.position = createUserDto.position;
            savedEmployee = await empRepo.save(existingEmployee);
          } else {
            const employee = empRepo.create({
              fullName: createUserDto.fullName,
              email: createUserDto.email,
              phone: createUserDto.phone,
              address: createUserDto.address,
              position: createUserDto.position || 'Nhân viên kho',
              status: 'ACTIVE',
            });
            savedEmployee = await empRepo.save(employee);
          }

          const account = accRepo.create({
            username: createUserDto.username.trim(),
            passwordHash,
            employeeId: savedEmployee.employeeId,
            roleId: resolvedRoleId,
            status: createUserDto.status || 'ACTIVE',
          });

          const savedAccount = await accRepo.save(account);
          return (await accRepo.findOne({
            where: { userId: savedAccount.userId },
            relations: { role: true, employee: true },
          })) as UserAccount;
        });
      }

      // Fallback khi chạy unit test không truyền DataSource
      const employee =
        existingEmployee ||
        this.employeeRepository.create({
          fullName: createUserDto.fullName,
          email: createUserDto.email,
          phone: createUserDto.phone,
          address: createUserDto.address,
          position: createUserDto.position || 'Nhân viên kho',
          status: 'ACTIVE',
        });
      const savedEmployee = await this.employeeRepository.save(employee);

      const account = this.userAccountRepository.create({
        username: createUserDto.username.trim(),
        passwordHash,
        employeeId: savedEmployee.employeeId,
        roleId: resolvedRoleId,
        status: createUserDto.status || 'ACTIVE',
      });
      return await this.userAccountRepository.save(account);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        'Lỗi ghi CSDL khi tạo tài khoản (đã rollback): ',
        error,
      );
      throw new InternalServerErrorException(
        'Lưu tài khoản thất bại, đã hoàn tác dữ liệu',
      );
    }
  }

  /**
   * UC18 - Cập nhật tài khoản và thông tin nhân viên đồng bộ trong Transaction
   */
  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserAccount> {
    const existingAccount = await this.userAccountRepository.findOne({
      where: { userId },
      relations: { employee: true, role: true },
    });

    if (!existingAccount) {
      throw new NotFoundException('Không tìm thấy tài khoản cần cập nhật');
    }

    const { resolvedRoleId } = await this.validateAccountConstraints({
      username: updateUserDto.username?.trim(),
      roleId: updateUserDto.roleId,
      roleName: updateUserDto.roleName,
      employeeId: updateUserDto.employeeId,
      excludeUserId: userId,
    });

    let newPasswordHash: string | undefined;
    if (updateUserDto.password) {
      newPasswordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    try {
      if (this.dataSource) {
        return await this.dataSource.transaction(async (manager) => {
          const empRepo = manager.getRepository(Employee);
          const accRepo = manager.getRepository(UserAccount);

          if (existingAccount.employee) {
            if (updateUserDto.fullName !== undefined)
              existingAccount.employee.fullName = updateUserDto.fullName;
            if (updateUserDto.email !== undefined)
              existingAccount.employee.email = updateUserDto.email;
            if (updateUserDto.phone !== undefined)
              existingAccount.employee.phone = updateUserDto.phone;
            if (updateUserDto.address !== undefined)
              existingAccount.employee.address = updateUserDto.address;
            if (updateUserDto.position !== undefined)
              existingAccount.employee.position = updateUserDto.position;
            await empRepo.save(existingAccount.employee);
          }

          if (updateUserDto.username !== undefined) {
            existingAccount.username = updateUserDto.username.trim();
          }
          if (newPasswordHash) {
            existingAccount.passwordHash = newPasswordHash;
          }
          if (resolvedRoleId !== undefined) {
            existingAccount.roleId = resolvedRoleId;
          }
          if (updateUserDto.employeeId !== undefined) {
            existingAccount.employeeId = updateUserDto.employeeId;
          }
          if (updateUserDto.status !== undefined) {
            existingAccount.status = updateUserDto.status;
          }

          await accRepo.save(existingAccount);
          return (await accRepo.findOne({
            where: { userId },
            relations: { role: true, employee: true },
          })) as UserAccount;
        });
      }

      if (existingAccount.employee && updateUserDto.fullName) {
        existingAccount.employee.fullName = updateUserDto.fullName;
        await this.employeeRepository.save(existingAccount.employee);
      }
      if (updateUserDto.username) {
        existingAccount.username = updateUserDto.username.trim();
      }
      if (newPasswordHash) {
        existingAccount.passwordHash = newPasswordHash;
      }
      if (resolvedRoleId !== undefined) {
        existingAccount.roleId = resolvedRoleId;
      }
      if (updateUserDto.status !== undefined) {
        existingAccount.status = updateUserDto.status;
      }
      return await this.userAccountRepository.save(existingAccount);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(
        'Lỗi ghi CSDL khi cập nhật tài khoản (đã rollback): ',
        error,
      );
      throw new InternalServerErrorException(
        'Lưu tài khoản thất bại, đã hoàn tác dữ liệu',
      );
    }
  }

  /**
   * Khởi tạo dữ liệu mẫu cho hệ thống (mật khẩu tạm thời đổi thành 123456 cho tất cả tài khoản)
   */
  async seedInitialData(): Promise<void> {
    try {
      // 1. Seed Roles nếu chưa có
      let adminRole = await this.roleRepository.findOne({
        where: { name: 'ADMIN' },
      });
      if (!adminRole) {
        adminRole = await this.roleRepository.save({
          name: 'ADMIN',
          description: 'Quản trị viên toàn quyền hệ thống',
        });
      }

      let userRole = await this.roleRepository.findOne({
        where: { name: 'USER' },
      });
      if (!userRole) {
        userRole = await this.roleRepository.save({
          name: 'USER',
          description: 'Nhân viên thủ kho / vận hành',
        });
      }

      const defaultHash = await bcrypt.hash('123456', 10);

      // 2. Seed tài khoản Quản trị viên (ADMIN) - mật khẩu: 123456
      const adminAcc = await this.userAccountRepository.findOne({
        where: { username: 'admin' },
      });
      if (!adminAcc) {
        const empAdmin = await this.employeeRepository.save({
          fullName: 'Nguyễn Quản Trị',
          email: 'admin@quanlykho.vn',
          position: 'Quản trị hệ thống',
          status: 'ACTIVE',
        });

        await this.userAccountRepository.save({
          username: 'admin',
          passwordHash: defaultHash,
          employeeId: empAdmin.employeeId,
          roleId: adminRole.roleId,
          status: 'ACTIVE',
        });
        this.logger.log('Đã tạo tài khoản mẫu ADMIN: admin / 123456');
      } else {
        adminAcc.passwordHash = defaultHash;
        await this.userAccountRepository.save(adminAcc);
      }

      // 3. Seed tài khoản Thủ kho (USER) - mật khẩu: 123456
      const staffAcc = await this.userAccountRepository.findOne({
        where: { username: 'thukho' },
      });
      if (!staffAcc) {
        const empStaff = await this.employeeRepository.save({
          fullName: 'Trần Thủ Kho',
          email: 'thukho@quanlykho.vn',
          position: 'Thủ kho chính',
          status: 'ACTIVE',
        });

        await this.userAccountRepository.save({
          username: 'thukho',
          passwordHash: defaultHash,
          employeeId: empStaff.employeeId,
          roleId: userRole.roleId,
          status: 'ACTIVE',
        });
        this.logger.log('Đã tạo tài khoản mẫu USER: thukho / 123456');
      } else {
        staffAcc.passwordHash = defaultHash;
        await this.userAccountRepository.save(staffAcc);
      }

      // 4. Seed tài khoản bị Khóa (LOCKED) - mật khẩu: 123456 (Thử kịch bản "Từ chối đăng nhập")
      const lockedAcc = await this.userAccountRepository.findOne({
        where: { username: 'khoa_taikhoan' },
      });
      if (!lockedAcc) {
        const empLocked = await this.employeeRepository.save({
          fullName: 'Lê Tài Khoản Khóa',
          email: 'khoa@quanlykho.vn',
          position: 'Nhân viên tạm ngưng',
          status: 'INACTIVE',
        });

        await this.userAccountRepository.save({
          username: 'khoa_taikhoan',
          passwordHash: defaultHash,
          employeeId: empLocked.employeeId,
          roleId: userRole.roleId,
          status: 'LOCKED',
        });
        this.logger.log('Đã tạo tài khoản mẫu BỊ KHÓA: khoa_taikhoan / 123456');
      } else {
        lockedAcc.passwordHash = defaultHash;
        await this.userAccountRepository.save(lockedAcc);
      }

      // 5. Seed tài khoản chưa có vai trò (Role null) - mật khẩu: 123456 (Thử kịch bản "Từ chối đăng nhập")
      const noRoleAcc = await this.userAccountRepository.findOne({
        where: { username: 'chua_phan_quyen' },
      });
      if (!noRoleAcc) {
        const empNoRole = await this.employeeRepository.save({
          fullName: 'Vũ Chưa Phân Quyền',
          email: 'chuaphanquyen@quanlykho.vn',
          position: 'Nhân viên mới',
          status: 'ACTIVE',
        });

        await this.userAccountRepository.save({
          username: 'chua_phan_quyen',
          passwordHash: defaultHash,
          employeeId: empNoRole.employeeId,
          roleId: undefined,
          status: 'ACTIVE',
        });
        this.logger.log(
          'Đã tạo tài khoản mẫu CHƯA PHÂN QUYỀN: chua_phan_quyen / 123456',
        );
      } else {
        noRoleAcc.passwordHash = defaultHash;
        await this.userAccountRepository.save(noRoleAcc);
      }
    } catch (err) {
      this.logger.warn('Seed data initial check: ' + (err as Error).message);
    }
  }
}
