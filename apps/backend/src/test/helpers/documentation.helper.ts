import { prisma } from '../../lib/prisma';
import type { DocPage, DocSection } from '../../types/documentation.types';

export const createTestDocPage = async (overrides: Partial<DocPage> = {}): Promise<DocPage> => {
  return await prisma.documentationPage.create({
    data: {
      title: 'Test Page',
      description: 'Test Description',
      category: 'test',
      order: 0,
      lastUpdated: new Date(),
      ...overrides,
    },
    include: {
      sections: true,
    },
  });
};

export const createTestDocSection = async (
  pageId: string,
  overrides: Partial<DocSection> = {}
): Promise<DocSection> => {
  return await prisma.documentationSection.create({
    data: {
      title: 'Test Section',
      content: 'Test Content',
      pageId,
      order: 0,
      ...overrides,
    },
  });
};

export const cleanupTestDocs = async (): Promise<void> => {
  await prisma.documentationSection.deleteMany({
    where: {
      title: { startsWith: 'Test' },
    },
  });
  await prisma.documentationPage.deleteMany({
    where: {
      title: { startsWith: 'Test' },
    },
  });
}; 