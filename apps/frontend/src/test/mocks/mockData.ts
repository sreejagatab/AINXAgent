export const mockPrompts = [
  {
    id: '1',
    name: 'Code Review',
    description: 'AI-powered code review assistant',
    category: 'development',
    template: 'Please review the following code:\n\n{{code}}',
    variables: [
      {
        name: 'code',
        type: 'string',
        required: true,
        description: 'Code to review',
      },
    ],
    version: '1.0.0',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Bug Analysis',
    description: 'Analyze and debug code issues',
    category: 'development',
    template: 'Debug the following error:\n\n{{error}}\n\nContext:\n{{context}}',
    variables: [
      {
        name: 'error',
        type: 'string',
        required: true,
        description: 'Error message',
      },
      {
        name: 'context',
        type: 'string',
        required: false,
        description: 'Additional context',
      },
    ],
    version: '1.0.0',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockTools = [
  {
    id: '1',
    name: 'Code Analyzer',
    description: 'Static code analysis tool',
    type: 'development',
    parameters: [
      {
        name: 'code',
        type: 'string',
        required: true,
        description: 'Code to analyze',
      },
      {
        name: 'language',
        type: 'string',
        required: true,
        description: 'Programming language',
      },
    ],
  },
  {
    id: '2',
    name: 'Documentation Generator',
    description: 'Generate documentation from code',
    type: 'development',
    parameters: [
      {
        name: 'code',
        type: 'string',
        required: true,
        description: 'Code to document',
      },
      {
        name: 'format',
        type: 'string',
        required: false,
        description: 'Documentation format',
        default: 'markdown',
      },
    ],
  },
];

export const mockEvaluations = [
  {
    id: '1',
    scores: {
      accuracy: { score: 4.5, feedback: 'Good accuracy' },
      clarity: { score: 4.0, feedback: 'Clear explanation' },
      completeness: { score: 3.8, feedback: 'Some details missing' },
    },
    suggestions: [
      'Add more examples',
      'Include error handling cases',
    ],
    metadata: {
      modelUsed: 'gpt-4',
      confidence: 0.85,
      evaluationTime: 1200,
    },
  },
]; 