# 09 — Hướng dẫn Phát triển (Development Guide)

## 9.1 Scripts

```bash
# Development
yarn start:dev        # Hot reload, watch mode
yarn start:debug      # Debug mode với inspect port

# Build
yarn build            # Compile TypeScript → dist/
yarn start:prod       # Chạy production build

# Linting & Format
yarn lint             # ESLint auto-fix
yarn format           # Prettier format

# Testing
yarn test             # Unit tests
yarn test:watch       # Watch mode
yarn test:cov         # Code coverage
yarn test:e2e         # End-to-end tests

# Database
yarn migration:run          # Chạy pending migrations
yarn migration:revert       # Rollback migration cuối cùng
yarn migration:generate src/database/migrations/ten-migration
                            # Tự động sinh migration từ entity changes
yarn migration:create src/database/migrations/ten-migration
                            # Tạo migration rỗng
```

---

## 9.2 Tạo Module Mới

Dùng NestJS CLI:
```bash
# Tạo module, controller, service cùng lúc
npx nest g module modules/ten-module
npx nest g controller modules/ten-module
npx nest g service modules/ten-module
```

**Cấu trúc module chuẩn:**
```
src/modules/ten-module/
├── ten-module.module.ts       # @Module decorator
├── ten-module.controller.ts   # Routes
├── ten-module.service.ts      # Business logic
├── entities/
│   └── ten-module.entity.ts   # TypeORM entity
└── dto/
    ├── create-ten-module.dto.ts
    ├── update-ten-module.dto.ts
    └── get-ten-module.dto.ts
```

**Checklist tạo module:**
- [ ] Khai báo entity kế thừa `BaseEntity`
- [ ] Đăng ký entity vào `TypeOrmModule.forFeature([...])`
- [ ] Import module vào `AppModule`
- [ ] Tạo migration sau khi thêm entity: `yarn migration:generate`
- [ ] Chạy migration: `yarn migration:run`
- [ ] Thêm Swagger decorators (`@ApiProperty`, `@ApiResponse`)

---

## 9.3 Tạo Migration

### Auto-generate từ entity changes
```bash
yarn migration:generate src/database/migrations/mo-ta-thay-doi
```
> ⚠️ Đảm bảo `data-source.ts` có đúng entities trước khi generate.

### Tạo migration thủ công
```bash
yarn migration:create src/database/migrations/custom-migration
```
Sau đó điền SQL vào `up()` và `down()`:
```typescript
export class CustomMigration1748000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" ADD COLUMN "new_col" varchar`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "new_col"`);
  }
}
```

---

## 9.4 Conventions & Best Practices

### Path Alias
Dùng `src/` thay vì relative imports:
```typescript
// ✅ Đúng
import { BaseEntity } from 'src/database/base.entity';

// ❌ Tránh
import { BaseEntity } from '../../../database/base.entity';
```

### Response Format
Luôn dùng `formatApiResponse()`:
```typescript
import { formatApiResponse } from 'src/common/utils/format';

return formatApiResponse(data, HttpStatus.OK, 'success message');
```

### DTO Validation
```typescript
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Tour Hạ Long' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  destinationId?: string;
}
```

### Pagination Query DTO
```typescript
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}
```

### Entity Foreign Key Naming
```typescript
@JoinColumn({
  name: 'product_id',
  foreignKeyConstraintName: 'FK_{Entity}_{Relation}',
})
```

---

## 9.5 Testing

### Unit Test (Jest)
```typescript
// ten-module.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

---

## 9.6 Debugging

### Debug với VS Code
Cấu hình `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register", "-r", "tsconfig-paths/register"],
      "args": ["src/main.ts"],
      "cwd": "${workspaceFolder}",
      "env": { "NODE_ENV": "development" },
      "sourceMaps": true,
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

### TypeORM Query Logging
Bật trong `database.module.ts`:
```typescript
logging: process.env.NODE_ENV === 'development',
```

---

## 9.7 Cấu trúc Database Module

```typescript
// src/database/database.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? {
    rejectUnauthorized: true,
    ca: fs.readFileSync('certs/ca-certificate.crt').toString(),
  } : false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,  // KHÔNG bật synchronize — dùng migration
  logging: false,
})
```

> ⚠️ **QUAN TRỌNG**: `synchronize: false` — không bao giờ bật `synchronize: true` trên production vì sẽ tự động alter schema và có thể mất dữ liệu.

---

## 9.8 Thêm Scheduled Task (Cron Job)

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async resetMonthlySearchStats() {
    this.logger.log('Running monthly search stat reset...');
    // logic here
  }
}
```

**Import TaskModule vào AppModule** và đảm bảo `ScheduleModule.forRoot()` đã được import.

---

## 9.9 Known Issues & TODO

| Issue | Mức độ | Mô tả |
|-------|--------|-------|
| Không có Auth | 🔴 Critical | Chưa có JWT/OAuth — mọi endpoint đều public |
| review_point không tự động | 🟡 Medium | Phải update thủ công sau khi tạo/xoá review |
| Supplier stats không tự sync | 🟡 Medium | rating_count, tour_offered cần update tay |
| Không có rate limiting | 🟡 Medium | Dễ bị spam /video/:id/like |
| Thiếu input sanitization | 🟡 Medium | JSONB fields (banner, readBefore) không validate sâu |
| Không có E2E tests | 🟠 Low | Cần thiết lập test database |
| FFmpeg dependency | 🟠 Low | Cần cài local nếu dùng video preview feature |
