import { useState } from 'react';
import React from 'react';

type tProps = {
  textContent: string;
  language: string;
  darkMode?: boolean;
}

const OmsSyntaxHighlight = (props: tProps) => {
  const { textContent, darkMode, language = 'txt' } = props;

  const [SyntaxHighlighter, setSyntaxHighlighter] = useState<any>();
  const [ThemeDark, setThemeDark] = useState<any>();
  const [ThemeLight, setThemeLight] = useState<any>();

  React.useEffect(() => {
    import('react-syntax-highlighter').then((module) => {
      const { PrismAsyncLight: SyntaxHighlighter } = module;
      setSyntaxHighlighter(() => SyntaxHighlighter);
    });
    import('react-syntax-highlighter/dist/esm/styles/prism').then((module) => {
      const { vscDarkPlus, darcula } = module;
      setThemeDark(vscDarkPlus);
      setThemeLight(darcula);
    });
  }, []);

  if (!SyntaxHighlighter || !ThemeDark || !ThemeLight) {
    return <div>Loading...</div>;
  }

  return (
    <SyntaxHighlighter
      showLineNumbers={true}
      lineNumberStyle={{ color: '#ddd', fontSize: 10 }}
      style={darkMode ? ThemeDark : ThemeLight}
      language={language}
      PreTag='div'
      codeTagProps={{
        style: {
          fontSize: "inherit",
          borderRadius: "inherit",
        }
      }}
      customStyle={{ fontSize: '17px', borderRadius: "6px" }}
    >
      {String(textContent).replace(/\n$/, '')}
    </SyntaxHighlighter>
  );
};

export default OmsSyntaxHighlight;