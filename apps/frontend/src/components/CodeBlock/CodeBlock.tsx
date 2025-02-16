import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../hooks/useTheme';
import { CopyIcon, CheckIcon } from '../Icons';
import styles from './CodeBlock.module.css';

interface CodeBlockProps {
  content: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  content,
  language = 'typescript' 
}) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const extractLanguage = (content: string): string => {
    const match = content.match(/```(\w+)/);
    return match ? match[1] : language;
  };

  const cleanContent = (content: string): string => {
    return content.replace(/```\w+\n|```/g, '').trim();
  };

  const codeLanguage = extractLanguage(content);
  const cleanedContent = cleanContent(content);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.language}>{codeLanguage}</span>
        <button 
          className={styles.copyButton}
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      
      <SyntaxHighlighter
        language={codeLanguage}
        style={theme === 'dark' ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0 0 6px 6px',
        }}
      >
        {cleanedContent}
      </SyntaxHighlighter>
    </div>
  );
}; 