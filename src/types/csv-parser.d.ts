declare module 'csv-parser' {
  import { Transform } from 'stream';

  interface CsvParserOptions {
    headers?: string[] | boolean;
    separator?: string;
    newline?: string;
    skipLines?: number;
    strict?: boolean;
    maxRows?: number;
    escape?: string;
    quote?: string | null;
  }

  function csvParser(options?: CsvParserOptions): Transform;

  export = csvParser;
}
