export interface PdfOutlineNavRequest {
  dest: unknown;
  id: number;
  key?: string;
  ancestorKeys?: string[];
}

export interface PdfActiveOutline {
  key?: string;
  ancestorKeys: string[];
}
