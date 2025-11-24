import { useState } from "react";
import { CustomHighlightLayer, HighlightArea } from "./CustomHighlightLayer";
import { findTextItemRanges } from "./HighlightUtil";
import { Document, Page } from "react-pdf";

function PDFViewer({ searchText }: { searchText?: string }) {
  const [highlightAreas, setHighlightAreas] = useState<HighlightArea[]>([]);
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState(0);

  return (
    <div style={{ position: "relative" }}>
      <Document
        file="sample.pdf"
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            scale={scale}
            onLoadSuccess={async (page) => {
              if (searchText) {
                const textContent = await page.getTextContent();
                const textItems = textContent.items.filter(
                  (item) => "str" in item
                );

                const matches = findTextItemRanges(textItems, searchText);

                if (matches.length > 0) {
                  setHighlightAreas((prev) => [
                    ...prev,
                    {
                      pageIndex: i,
                      pageHeight: page.height,
                      textItems: matches,
                    },
                  ]);
                }
              }
            }}
          />
        ))}
      </Document>

      <CustomHighlightLayer
        highlightAreas={highlightAreas}
        totalPages={numPages}
        scale={scale}
      />
    </div>
  );
}
