declare module 'csv-writer' {
  interface Field {
    id: string;
    title: string;
  }

  interface CsvWriterOptions {
    path: string;
    header: Field[];
    append?: boolean;
    fieldDelimiter?: string;
    recordDelimiter?: string;
    alwaysQuote?: boolean;
    encoding?: string;
  }

  interface CsvWriter {
    writeRecords(records: any[]): Promise<void>;
  }

  export function createObjectCsvWriter(options: CsvWriterOptions): CsvWriter;
  export function createArrayCsvWriter(
    options: Omit<CsvWriterOptions, 'header'> & { header: string[] },
  ): CsvWriter;
}
