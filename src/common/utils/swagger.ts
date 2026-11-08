import type {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Schema chuẩn cho response bọc bởi formatApiResponse():
 * { data, code: 200, error: null, message }
 * chỉ cần truyền schema của phần `data`.
 */
export const standardResponseSchema = (
  data: SchemaObject | ReferenceObject,
): SchemaObject => ({
  properties: {
    data,
    code: { type: 'number', example: 200 },
    error: { type: 'null', example: null },
    message: { type: 'string' },
  },
});
