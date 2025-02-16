import React, { useState, useEffect, useCallback } from 'react';
import { useAIContext } from '../../contexts/AIContext';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage } from './ChatMessage';
import { ToolPanel } from './ToolPanel';
import { EvaluationPanel } from './EvaluationPanel';
import { PromptTemplates } from './PromptTemplates';
import type { 
  Message, 
  Tool, 
  EvaluationResult 
} from '../../types/ai.types';
import styles from './AIAgent.module.css';

export const AIAgent: React.FC = () => {
  const { user } = useAuth();
  const { 
    sendMessage,
    getCompletion,
    evaluateResponse,
    availableTools,
    promptTemplates,
  } = useAIContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: input,
        role: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      setInput('');

      const response = await sendMessage(input, {
        tool: selectedTool?.name,
        userId: user?.id,
      });

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: response.text,
        role: 'assistant',
        timestamp: new Date(),
        metadata: response.metadata,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Auto-evaluate AI responses
      if (user?.settings?.autoEvaluate) {
        const evaluation = await evaluateResponse(input, response.text);
        setEvaluation(evaluation);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error notification
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, selectedTool, user, sendMessage, evaluateResponse]);

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const handleTemplateSelect = async (templateId: string) => {
    try {
      const template = promptTemplates.find(t => t.id === templateId);
      if (template) {
        setInput(template.content);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  useEffect(() => {
    // Load chat history
    const loadHistory = async () => {
      // Implement chat history loading
    };

    loadHistory();
  }, [user?.id]);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <ToolPanel
          tools={availableTools}
          selectedTool={selectedTool}
          onSelect={handleToolSelect}
        />
        <PromptTemplates
          templates={promptTemplates}
          onSelect={handleTemplateSelect}
        />
      </div>

      <div className={styles.main}>
        <div className={styles.messages}>
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              evaluation={
                message.role === 'assistant' ? evaluation : undefined
              }
            />
          ))}
        </div>

        <div className={styles.inputArea}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      {evaluation && (
        <div className={styles.sidebar}>
          <EvaluationPanel evaluation={evaluation} />
        </div>
      )}
    </div>
  );
}; 