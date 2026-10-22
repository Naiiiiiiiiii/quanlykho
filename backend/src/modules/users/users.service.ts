import {
  Injectable,
  OnModuleInit,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserAccount } from '../../entities/user-account.entity';
import { Employee } from '../../entities/employee.entity';
import { Role } from '../../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';

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
   * Lấy danh sách tài khoản
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
          position: true,
        },
      },
    });
  }

  /**
   * Tạo tài khoản nhân viên mới
   */
  async create(createUserDto: CreateUserDto): Promise<UserAccount> {
    const existing = await this.userAccountRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existing) {
      throw new ConflictException('Tên đăng nhập đã tồn tại trong hệ thống');
    }

    // 1. Tạo nhân viên
    const employee = this.employeeRepository.create({
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      phone: createUserDto.phone,
      position: 'Nhân viên kho',
      status: 'ACTIVE',
    });
    const savedEmployee = await this.employeeRepository.save(employee);

    // 2. Mã hóa mật khẩu với bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    // 3. Tạo tài khoản
    const account = this.userAccountRepository.create({
      username: createUserDto.username,
      passwordHash,
      employeeId: savedEmployee.employeeId,
      roleId: createUserDto.roleId,
      status: 'ACTIVE',
    });

    return this.userAccountRepository.save(account);
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
