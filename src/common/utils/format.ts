import { HttpResult } from 'src/types/http.dto';

export const formatApiResponse = <T>(
  data: T,
  code: number,
  message: string = '',
  error: string | null = null,
): HttpResult<T> => {
  return {
    data,
    code,
    message,
    error,
  };
};

export const getSchemaRefPath = (schema: string) => {
  return `#/components/schemas/${schema}`;
};
