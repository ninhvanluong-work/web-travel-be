import { escapeLike } from 'src/common/utils/sql';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EntityManager, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

import { TourGuideService } from 'src/modules/tour-guide/tour-guide.service';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';

import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UserDto } from './dto/user-response.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';

export interface Actor {
  userId: string;
  role: UserRole;
}

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly tourGuideService: TourGuideService,
  ) {}

  async isExisted(userId: string) {
    return await this.userRepository.existsBy({ id: userId });
  }

  // manager: truyền vào khi được gọi bên trong transaction của service khác
  async createAnonymousUser(manager?: EntityManager): Promise<User> {
    const userRepository = manager?.getRepository(User) ?? this.userRepository;
    const user = userRepository.create({
      name: 'Anonymous',
      role: UserRole.NORMAL,
    });

    return userRepository.save(user);
  }

  private async hashPassword(plainText: string) {
    const saltRounds = parseInt(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'),
      10,
    );
    return bcrypt.hash(plainText, saltRounds);
  }

  private toDto(user: User): UserDto {
    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }

  /**
   * - super_admin cannot be created / assigned via API
   * - only super_admin can assign the admin role
   */
  private assertCanAssignRole(actor: Actor, role: UserRole) {
    if (role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot assign super_admin role');
    }
    if (role === UserRole.ADMIN && actor.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super_admin can assign admin role');
    }
  }

  /**
   * - anyone may manage their own account (except delete / role change, checked by callers)
   * - admin accounts can only be managed by super_admin
   * - super_admin accounts can only be managed by themselves
   */
  private assertCanManage(actor: Actor, target: User) {
    if (actor.userId === target.id) return;

    if (target.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot manage another super_admin account');
    }
    if (
      ADMIN_ROLES.includes(target.role) &&
      actor.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only super_admin can manage admin accounts',
      );
    }
  }

  private async assertEmailAvailable(email: string, excludeUserId?: string) {
    // withDeleted: email column is unique even for soft-deleted rows
    const existed = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
    if (existed && existed.id !== excludeUserId) {
      throw new ConflictException('Email already in use');
    }
  }

  private async findEntityOrFail(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(payload: CreateUserDto, actor: Actor) {
    const { email, password, name, role = UserRole.NORMAL } = payload;

    this.assertCanAssignRole(actor, role);
    await this.assertEmailAvailable(email);

    const newUser: Partial<User> = {
      email,
      name,
      role,
      password: await this.hashPassword(password),
    };

    if (role === UserRole.TOUR_GUIDE) {
      const tourGuide = await this.tourGuideService.create(
        { name: name || 'tour-guide' },
        actor.userId,
      );
      newUser.tourGuideId = tourGuide.id;
    }

    const user = await this.userRepository.save(
      this.userRepository.create(newUser),
    );
    return this.toDto(user);
  }

  async findAll(query: GetUserDto): Promise<ListItemsResponse<UserDto>> {
    const { keyword = '', role, page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    const baseCondition: FindOptionsWhere<User> = role ? { role } : {};
    const where: FindOptionsWhere<User>[] | FindOptionsWhere<User> = keyword
      ? [
          { ...baseCondition, name: ILike(`%${escapeLike(keyword)}%`) },
          { ...baseCondition, email: ILike(`%${escapeLike(keyword)}%`) },
        ]
      : baseCondition;

    const [users, total] = await this.userRepository.findAndCount({
      where,
      take: pageSize,
      skip,
      order: { createdAt: 'DESC' },
    });

    const pagination: PaginationResponse = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
    return {
      items: users.map((user) => this.toDto(user)),
      pagination,
    };
  }

  async findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async findOneDto(id: string) {
    const user = await this.findEntityOrFail(id);
    return this.toDto(user);
  }

  async update(id: string, payload: UpdateUserDto, actor: Actor) {
    const user = await this.findEntityOrFail(id);
    this.assertCanManage(actor, user);

    const { email, name, role } = payload;
    let isRoleChanged = false;

    if (role && role !== user.role) {
      if (actor.userId === user.id) {
        throw new ForbiddenException('Cannot change your own role');
      }
      this.assertCanAssignRole(actor, role);
      isRoleChanged = true;

      if (role === UserRole.TOUR_GUIDE && !user.tourGuideId) {
        const tourGuide = await this.tourGuideService.create(
          { name: name || user.name || 'tour-guide' },
          actor.userId,
        );
        user.tourGuideId = tourGuide.id;
      }
      user.role = role;
    }

    if (email && email !== user.email) {
      await this.assertEmailAvailable(email, user.id);
      user.email = email;
    }

    if (name !== undefined) user.name = name;

    // role is embedded in tokens -> force re-login to pick up the new role
    if (isRoleChanged) {
      user.refreshTokenVersion = (user.refreshTokenVersion ?? 1) + 1;
    }

    const saved = await this.userRepository.save(user);
    return this.toDto(saved);
  }

  async resetPassword(id: string, payload: ResetUserPasswordDto, actor: Actor) {
    const user = await this.findEntityOrFail(id);
    this.assertCanManage(actor, user);

    await this.userRepository.update(
      { id },
      {
        password: await this.hashPassword(payload.newPassword),
        resetPasswordToken: null,
        resetPasswordTokenExp: null,
        // invalidate all existing refresh tokens
        refreshTokenVersion: (user.refreshTokenVersion ?? 1) + 1,
      },
    );
    return {};
  }

  async remove(id: string, actor: Actor) {
    const user = await this.findEntityOrFail(id);

    if (actor.userId === user.id) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    this.assertCanManage(actor, user);

    await this.userRepository.update(
      { id },
      { refreshTokenVersion: (user.refreshTokenVersion ?? 1) + 1 },
    );
    await this.userRepository.softDelete(id);
    return {};
  }
}
