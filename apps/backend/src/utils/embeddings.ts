import { encode, decode } from 'gpt-3-encoder';
import { config } from '../config';
import { logger } from './logger';

export class EmbeddingsUtil {
  private static readonly MAX_TOKENS = 8192;
  private static readonly CHUNK_OVERLAP = 200;

  public static countTokens(text: string): number {
    return encode(text).length;
  }

  public static splitTextIntoChunks(
    text: string,
    maxTokens = this.MAX_TOKENS,
    overlap = this.CHUNK_OVERLAP
  ): string[] {
    const tokens = encode(text);
    const chunks: string[] = [];
    let currentChunk: number[] = [];

    for (let i = 0; i < tokens.length; i++) {
      currentChunk.push(tokens[i]);

      if (currentChunk.length >= maxTokens) {
        chunks.push(decode(currentChunk));
        currentChunk = tokens.slice(i - overlap + 1, i + 1);
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(decode(currentChunk));
    }

    return chunks;
  }

  public static async validateAndOptimizeText(text: string): Promise<string> {
    // Remove excessive whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // Remove non-printable characters
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

    // Ensure text is within token limits
    const tokenCount = this.countTokens(text);
    if (tokenCount > this.MAX_TOKENS) {
      logger.warn(`Text exceeds token limit (${tokenCount} tokens)`);
      text = decode(encode(text).slice(0, this.MAX_TOKENS));
    }

    return text;
  }

  public static estimateCost(tokens: number, model: string): number {
    const costs: Record<string, number> = {
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002,
      'text-davinci-003': 0.02,
    };

    const costPerToken = costs[model] || 0.002;
    return (tokens / 1000) * costPerToken;
  }
} 