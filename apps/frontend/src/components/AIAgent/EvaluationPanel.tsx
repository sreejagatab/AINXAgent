import React from 'react';
import type { EvaluationResult } from '../../types/ai-evaluation.types';
import styles from './EvaluationPanel.module.css';

interface EvaluationPanelProps {
  evaluation: EvaluationResult;
}

export const EvaluationPanel: React.FC<EvaluationPanelProps> = ({
  evaluation
}) => {
  const averageScore = Object.values(evaluation.scores)
    .reduce((acc, curr) => acc + curr.score, 0) / 
    Object.keys(evaluation.scores).length;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Response Evaluation</h3>
      
      <div className={styles.overview}>
        <div className={styles.averageScore}>
          <span className={styles.scoreLabel}>Average Score</span>
          <span className={styles.scoreValue}>
            {averageScore.toFixed(1)}
          </span>
        </div>
        
        <div className={styles.confidence}>
          <span className={styles.confidenceLabel}>
            Evaluation Confidence
          </span>
          <div className={styles.confidenceMeter}>
            <div 
              className={styles.confidenceValue}
              style={{ 
                width: `${evaluation.metadata?.confidence || 0}%` 
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.scores}>
        {Object.entries(evaluation.scores).map(([criterion, score]) => (
          <div key={criterion} className={styles.scoreItem}>
            <div className={styles.scoreHeader}>
              <span className={styles.criterion}>{criterion}</span>
              <span className={styles.score}>{score.score.toFixed(1)}</span>
            </div>
            <div className={styles.scoreBar}>
              <div 
                className={styles.scoreProgress}
                style={{ width: `${score.score * 10}%` }}
              />
            </div>
            <p className={styles.feedback}>{score.feedback}</p>
          </div>
        ))}
      </div>

      {evaluation.suggestions.length > 0 && (
        <div className={styles.suggestions}>
          <h4 className={styles.suggestionsTitle}>
            Improvement Suggestions
          </h4>
          <ul className={styles.suggestionsList}>
            {evaluation.suggestions.map((suggestion, index) => (
              <li key={index} className={styles.suggestion}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.metadata && (
        <div className={styles.metadata}>
          <span>Model: {evaluation.metadata.modelUsed}</span>
          <span>
            Time: {evaluation.metadata.evaluationTime}ms
          </span>
        </div>
      )}
    </div>
  );
}; 