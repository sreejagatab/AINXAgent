export type EvaluationCriteria = {
  relevance?: boolean;
  coherence?: boolean;
  accuracy?: boolean;
  creativity?: boolean;
  helpfulness?: boolean;
  safety?: boolean;
  bias?: boolean;
  toxicity?: boolean;
  [key: string]: boolean | undefined;
};

export type EvaluationScore = {
  score: number;
  feedback: string;
  confidence: number;
};

export type EvaluationResult = {
  scores: Record<string, EvaluationScore>;
  feedback: string;
  suggestions: string[];
  metadata?: {
    evaluationTime: number;
    modelUsed: string;
    [key: string]: any;
  };
};

export type ModelResponse = {
  model: string;
  response: string;
  evaluation: EvaluationResult;
  metrics?: {
    latency: number;
    tokenCount: number;
    [key: string]: any;
  };
};

export type ModelComparison = {
  results: Array<{
    prompt: string;
    responses: ModelResponse[];
  }>;
  summary: string;
  metadata?: {
    totalTime: number;
    totalTokens: number;
    [key: string]: any;
  };
};

export type EvaluationMetrics = {
  totalEvaluations: number;
  averageScores: Record<string, number>;
  timeRange: {
    start: Date;
    end: Date;
  };
  breakdown?: {
    byModel: Record<string, number>;
    byCriteria: Record<string, number>;
    byScore: Record<number, number>;
  };
};

export interface Evaluator {
  evaluate(
    prompt: string,
    response: string,
    criteria: EvaluationCriteria
  ): Promise<EvaluationResult>;
  compareModels(
    prompts: string[],
    models: string[]
  ): Promise<ModelComparison>;
  getMetrics(timeRange: {
    start: Date;
    end: Date;
  }): Promise<EvaluationMetrics>;
} 