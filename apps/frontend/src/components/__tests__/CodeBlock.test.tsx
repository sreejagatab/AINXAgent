import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeBlock } from '../CodeBlock';
import { toast } from '../../utils/toast';

jest.mock('../../utils/toast');

describe('CodeBlock', () => {
  const mockCode = 'const x = 1;';
  const mockLanguage = 'typescript';

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
  });

  it('should render code with syntax highlighting', () => {
    render(
      <CodeBlock
        code={mockCode}
        language={mockLanguage}
      />
    );

    expect(screen.getByText(mockCode)).toBeInTheDocument();
    expect(screen.getByText(mockLanguage)).toBeInTheDocument();
  });

  it('should copy code to clipboard when clicking copy button', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator.clipboard, { writeText });

    render(
      <CodeBlock
        code={mockCode}
        language={mockLanguage}
      />
    );

    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    expect(writeText).toHaveBeenCalledWith(mockCode);
    expect(toast.success).toHaveBeenCalledWith('Code copied to clipboard');
  });

  it('should show error toast when copy fails', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('Copy failed'));
    Object.assign(navigator.clipboard, { writeText });

    render(
      <CodeBlock
        code={mockCode}
        language={mockLanguage}
      />
    );

    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    expect(toast.error).toHaveBeenCalledWith('Failed to copy code');
  });

  it('should respect maxHeight prop', () => {
    render(
      <CodeBlock
        code={mockCode}
        language={mockLanguage}
        maxHeight="200px"
      />
    );

    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toHaveStyle({ maxHeight: '200px' });
  });

  it('should toggle line numbers based on prop', () => {
    const { rerender } = render(
      <CodeBlock
        code={mockCode}
        language={mockLanguage}
        showLineNumbers={true}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(
      <CodeBlock
        code={mockCode}
        language={mockLanguage}
        showLineNumbers={false}
      />
    );

    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
}); 