import { Request, Response } from 'express';
import { documentationController } from '../documentation.controller';
import { documentationService } from '../../services/documentation.service';
import { createTestDocPage, cleanupTestDocs } from '../../test/helpers/documentation.helper';
import { ApiError } from '../../utils/errors';

jest.mock('../../services/documentation.service');

describe('DocumentationController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockSend = jest.fn();
    mockRes = {
      json: mockJson,
      status: mockStatus,
      send: mockSend,
    };
    mockReq = {};
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await cleanupTestDocs();
  });

  describe('getPage', () => {
    it('should return a page when it exists', async () => {
      const testPage = await createTestDocPage();
      mockReq.params = { id: testPage.id };
      jest.spyOn(documentationService, 'getPage').mockResolvedValue(testPage);

      await documentationController.getPage(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(testPage);
    });

    it('should throw 404 when page does not exist', async () => {
      mockReq.params = { id: 'non-existent' };
      jest.spyOn(documentationService, 'getPage').mockResolvedValue(null);

      await expect(
        documentationController.getPage(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(ApiError);
    });
  });

  // Add more test cases for other controller methods...
}); 