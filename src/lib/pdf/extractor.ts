import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFExtractionResult, PDFExtractionError, PDFJSMetadata } from "./types";

/**
 * Extract text from a PDF File
 * @param file - The PDF file to extract text from
 * @returns Extracted text and metadata
 */
export async function extractTextFromPDF(
  file: File
): Promise<PDFExtractionResult> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Load PDF Document
    const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
    })

    const pdfDocument = await loadingTask.promise;

    // Extract text from all pages
    const textPromises = [];
    for ( let i = 1; i <= pdfDocument.numPages; i++ ) {
        textPromises.push(
            pdfDocument.getPage(i).then(async (page) => {
                const textContent = await page.getTextContent();
                return textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
            })
        );
    } 

    const pageTexts = await Promise.all(textPromises);
    const fullText = pageTexts.join('\n\n');

    // Validate we got text
    if (!fullText || fullText.trim().length === 0) {
        throw new PDFExtractionError(
            "PDF contains no extractable text (might be scanned images)",
            "PARSE_ERROR"
        );
    }

    // Get metadata
    const metadata = await pdfDocument.getMetadata() as PDFJSMetadata;
    
    return {
      text: fullText,
      pageCount: pdfDocument.numPages,
      metadata: {
        title: metadata.info?.Title,
        author: metadata.info?.Author,
        creationDate: metadata.info?.CreationDate
          ? new Date(metadata.info.CreationDate)
          : undefined,
        fileSize: file.size,
      },
    };
  } catch (error) {
    // Handle pdfjs specific errors
    if (error instanceof Error) {
      if (error.message.includes("Invalid PDF") || error.message.includes("invalid")) {
        throw new PDFExtractionError(
          "Invalid or corrupted PDF file",
          "CORRUPTED"
        );
      }
      if (error.message.includes("password") || error.message.includes("encrypted")) {
        throw new PDFExtractionError(
          "PDF is password protected",
          "PASSWORD_PROTECTED"
        );
      }
    }

    //Re-throw PDFExtractionError as-is
    if (error instanceof PDFExtractionError) {
      throw error;
    }

    // Generic error
    throw new PDFExtractionError(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      "PARSE_ERROR"
    );
  }
}
