import React from 'react';

interface PDFPreviewProps {
  curPdfUrl: string;
}

const App: React.FC<PDFPreviewProps> = (props: PDFPreviewProps) => {

  React.useEffect(() => {
      resizeLeft(props.curPdfUrl);
  }, []);

  const resizeLeft = (curPdfUrl: string)=>{

  };
  
  return (
    <div>
      
    </div>
  );
}

export default App;