declare module "papaparse" {
  export interface ParseResult<T> {
    data: T[];
    errors: Array<{ type: string; code: string; message: string; row: number }>;
    meta: { delimiter: string; linebreak: string; aborted: boolean; fields?: string[] };
  }
  export function parse<T = Record<string, string>>(
    input: string,
    config?: { header?: boolean; skipEmptyLines?: boolean }
  ): ParseResult<T>;
}
