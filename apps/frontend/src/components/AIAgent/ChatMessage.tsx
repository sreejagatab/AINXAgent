import React from 'react';
import { formatDistance } from 'date-fns';
import { Message } from '../../types/ai.types';
import { EvaluationResult } from '../../types/ai-evaluation.types';
import { CodeBlock } from '../CodeBlock';
import { Markdown } from '../Markdown';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: Message;
  evaluation?: EvaluationResult;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message,
  evaluation 
}) => {
  const isAI = message.role === 'assistant';
  const hasCode = message.content.includes('```');

  return (
    <div className={`${styles.message} ${isAI ? styles.ai : styles.user}`}>
      <div className={styles.header}>
        <span className={styles.role}>
          {isAI ? 'AI Assistant' : 'You'}
        </span>
        <span className={styles.time}>
          {formatDistance(new Date(message.timestamp), new Date(), { 
            addSuffix: true 
          })}
        </span>
      </div>

      <div className={styles.content}>
        {hasCode ? (
          <CodeBlock content={message.content} />
        ) : (
          <Markdown content={message.content} />
        )}
      </div>

      {message.metadata && (
        <div className={styles.metadata}>
          <span className={styles.model}>
            Model: {message.metadata.model}
          </span>
          <span className={styles.tokens}>
            Tokens: {message.metadata.tokens}
          </span>
          {message.metadata.tool && (
            <span className={styles.tool}>
              Tool: {message.metadata.tool}
            </span>
          )}
        </div>
      )}

      {evaluation && isAI && (
        <div className={styles.evaluation}>
          <div className={styles.scores}>
            {Object.entries(evaluation.scores).map(([criterion, score]) => (
              <div key={criterion} className={styles.score}>
                <span className={styles.criterion}>{criterion}</span>
                <div className={styles.scoreBar}>
                  <div 
                    className={styles.scoreValue}
                    style={{ width: `${score.score * 10}%` }}
                  />
                </div>
                <span className={styles.scoreNumber}>
                  {score.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
          {evaluation.suggestions.length > 0 && (
            <div className={styles.suggestions}>
              <h4>Suggestions for Improvement</h4>
              <ul>
                {evaluation.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 