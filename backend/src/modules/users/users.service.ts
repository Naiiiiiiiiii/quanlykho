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
   * Khởi tạo dữ liệu mẫu cho hệ thống (Roles & Users thử nghiệm các kịch bản Sequence Diagram)
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

      // 2. Seed tài khoản Quản trị viên (ADMIN) - kịch bản Đăng nhập thành công
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

        const hash = await bcrypt.hash('Admin@123', 10);
        await this.userAccountRepository.save({
          username: 'admin',
          passwordHash: hash,
          employeeId: empAdmin.employeeId,
          roleId: adminRole.roleId,
          status: 'ACTIVE',
        });
        this.logger.log('Đã tạo tài khoản mẫu ADMIN: admin / Admin@123');
      }

      // 3. Seed tài khoản Thủ kho (USER) - kịch bản Đăng nhập thành công
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

        const hash = await bcrypt.hash('Staff@123', 10);
        await this.userAccountRepository.save({
          username: 'thukho',
          passwordHash: hash,
          employeeId: empStaff.employeeId,
          roleId: userRole.roleId,
          status: 'ACTIVE',
        });
        this.logger.log('Đã tạo tài khoản mẫu USER: thukho / Staff@123');
      }

      // 4. Seed tài khoản bị Khóa (LOCKED) - thử kịch bản "Từ chối đăng nhập"
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

        const hash = await bcrypt.hash('123456', 10);
        await this.userAccountRepository.save({
          username: 'khoa_taikhoan',
          passwordHash: hash,
          employeeId: empLocked.employeeId,
          roleId: userRole.roleId,
          status: 'LOCKED',
        });
        this.logger.log('Đã tạo tài khoản mẫu BỊ KHÓA: khoa_taikhoan / 123456');
      }

      // 5. Seed tài khoản chưa có vai trò (Role null) - thử kịch bản "Từ chối đăng nhập"
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

        const hash = await bcrypt.hash('123456', 10);
        await this.userAccountRepository.save({
          username: 'chua_phan_quyen',
          passwordHash: hash,
          employeeId: empNoRole.employeeId,
          roleId: undefined,
          status: 'ACTIVE',
        });
        this.logger.log(
          'Đã tạo tài khoản mẫu CHƯA PHÂN QUYỀN: chua_phan_quyen / 123456',
        );
      }
    } catch (err) {
      this.logger.warn('Seed data initial check: ' + (err as Error).message);
    }
  }
}
