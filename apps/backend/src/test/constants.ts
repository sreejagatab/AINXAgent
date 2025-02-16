export const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
};

export const TEST_ADMIN = {
  email: 'admin@example.com',
  password: 'admin123',
  name: 'Admin User',
  role: 'ADMIN',
};

export const TEST_PROMPT = {
  name: 'Test Prompt',
  description: 'A test prompt template',
  template: 'Hello {{name}}, this is a {{type}} message.',
  variables: [
    {
      name: 'name',
      type: 'string',
      required: true,
      description: 'The name of the recipient',
    },
    {
      name: 'type',
      type: 'string',
      required: true,
      description: 'The type of message',
      validation: {
        enum: ['test', 'demo', 'example'],
      },
    },
  ],
  category: 'test',
  isPublic: true,
};

export const TEST_TOOL = {
  name: 'Test HTTP Tool',
  description: 'A test HTTP tool',
  type: 'http',
  parameters: {
    url: 'https://api.example.com/test',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  isPublic: true,
};

export const TEST_EVALUATION = {
  response: 'This is a test response',
  scores: {
    accuracy: 85,
    relevance: 90,
    coherence: 88,
    creativity: 75,
  },
  suggestions: [
    'Improve clarity',
    'Add more examples',
  ],
  metadata: {
    strengths: ['Well structured', 'Clear explanation'],
    weaknesses: ['Could be more detailed'],
  },
};

export const MOCK_AI_RESPONSE = {
  content: 'This is a mock AI response',
  usage: {
    prompt_tokens: 50,
    completion_tokens: 100,
    total_tokens: 150,
  },
  model: 'gpt-4',
}; 