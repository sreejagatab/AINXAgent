import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Icon } from './Icon';
import { toast } from '../utils/toast';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  showLineNumbers = true,
  maxHeight = '400px',
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="code-block" style={{ maxHeight }}>
      <div className="code-header">
        <span className="language">{language}</span>
        <button
          onClick={handleCopy}
          className={`copy-button ${isCopied ? 'copied' : ''}`}
          title="Copy code"
        >
          <Icon name={isCopied ? 'check' : 'copy'} />
        </button>
      </div>
      <div className="code-content">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          wrapLines
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}; 