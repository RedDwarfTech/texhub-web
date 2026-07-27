export interface PdfOutlineNavRequest {
  dest: unknown;
  id: number;
}

export interface PdfActiveOutline {
  key?: string;
  ancestorKeys: string[];
}
