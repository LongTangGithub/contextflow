export interface PDFExtractionResult {
    text: string;
    pageCount: number;
    metadata: PDFMetadata;
}

export interface PDFMetadata {
    title?: string;
    author?: string;
    creationDate?: Date;
    fileSize: number;
}

  // pdfjs-dist metadata structure
  export interface PDFJSMetadata {
    info?: {
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      Creator?: string;
      Producer?: string;
      CreationDate?: string; // pdfjs returns string, not Date
      ModDate?: string;
      Trapped?: string;
    };
    metadata?: any;
    contentDispositionFilename?: string;
  }

export class PDFExtractionError extends Error {
    constructor(
        message: string,
        public code: 'INVALID_FILE' | 'CORRUPTED' | 'PASSWORD_PROTECTED' | 'PARSE_ERROR' 
    ) {
        super(message);
        this.name = 'PDFExtractionError';
    }
}