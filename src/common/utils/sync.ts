import { NotFoundException } from '@nestjs/common';

export interface SyncChildrenByIdOptions<
  TItem extends { id?: string },
  TEntity extends { id: string },
> {
  // danh sách gửi lên từ client
  items: TItem[];
  // danh sách hiện có trong DB (đã lọc theo cha)
  existing: TEntity[];
  // message khi item có id nhưng không thuộc danh sách hiện có
  notFoundMessage: (id: string) => string;
  // item có id -> cập nhật bản ghi đã tồn tại
  update: (entity: TEntity, fields: Omit<TItem, 'id'>) => Promise<unknown>;
  // item không có id -> tạo mới (tự validate field bắt buộc bên trong)
  create: (fields: Omit<TItem, 'id'>) => Promise<unknown>;
  // bản ghi hiện có không còn trong danh sách gửi lên -> xoá
  removeMissing: (entities: TEntity[]) => Promise<unknown>;
}

/**
 * Đồng bộ danh sách con theo id:
 * - có id -> update (id phải thuộc danh sách hiện có, nếu không -> 404)
 * - không có id -> tạo mới
 * - bản ghi hiện có mà không được nhắc tới -> xoá
 *
 * Chạy tuần tự theo đúng thứ tự items (transaction chỉ có 1 connection).
 */
export async function syncChildrenById<
  TItem extends { id?: string },
  TEntity extends { id: string },
>(options: SyncChildrenByIdOptions<TItem, TEntity>): Promise<void> {
  const { items, existing, notFoundMessage, update, create, removeMissing } =
    options;
  const keepIds = new Set<string>();

  for (const item of items) {
    const { id, ...fields } = item;
    if (id) {
      const entity = existing.find((e) => e.id === id);
      if (!entity) {
        throw new NotFoundException(notFoundMessage(id));
      }
      keepIds.add(id);
      await update(entity, fields);
    } else {
      await create(fields);
    }
  }

  await removeMissing(existing.filter((e) => !keepIds.has(e.id)));
}
