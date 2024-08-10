export type TeXCommand = {
  caption: string;
  snippet: string;
  meta: string;
  score: number;
};

export type DocumentMetadata = {
  labels: string[];
  packages: Record<string, TeXCommand[]>;
  packageNames: string[];
};

type DocumentsMetadata = Record<string, DocumentMetadata>

type DocMetadataResponse = { docId: string; meta: DocumentMetadata }