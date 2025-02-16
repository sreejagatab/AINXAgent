import { test, expect, waitForLoading, fillPromptForm } from './utils/test-utils';

test.describe('Prompt Engineering Flow', () => {
  test('should create and test a new prompt', async ({ authenticatedPage: page }) => {
    // Navigate to prompt creation
    await page.goto('/prompts/new');
    await waitForLoading(page);

    // Fill prompt details
    await fillPromptForm(page, {
      name: 'Code Review Assistant',
      description: 'AI-powered code review helper',
      template: 'Please review this code:\n\n{{code}}',
      variables: [
        { name: 'code', type: 'string', required: true },
      ],
    });

    // Save prompt
    await page.click('[data-testid="save-prompt-button"]');
    await expect(page).toHaveURL(/\/prompts\/[\w-]+$/);

    // Test the prompt
    await page.click('[data-testid="test-prompt-button"]');
    await page.fill('[data-testid="variable-code-input"]', 'console.log("test");');
    await page.click('[data-testid="generate-button"]');

    // Verify response
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
    await expect(page.locator('[data-testid="response-quality-score"]')).toHaveText(/[4-5]\/5/);
  });

  test('should edit and version a prompt', async ({ authenticatedPage: page }) => {
    // Navigate to existing prompt
    await page.goto('/prompts');
    await waitForLoading(page);
    await page.click('text=Code Review Assistant');

    // Edit prompt
    await page.click('[data-testid="edit-prompt-button"]');
    await page.fill('[data-testid="prompt-template-input"]', 
      'Please review this code and suggest improvements:\n\n{{code}}'
    );

    // Save as new version
    await page.click('[data-testid="save-version-button"]');
    await expect(page.locator('[data-testid="version-number"]')).toContainText('v2');

    // Compare versions
    await page.click('[data-testid="compare-versions-button"]');
    await expect(page.locator('[data-testid="version-diff"]')).toBeVisible();
    await expect(page.locator('[data-testid="version-diff"]')).toContainText('suggest improvements');
  });

  test('should evaluate prompt performance', async ({ authenticatedPage: page }) => {
    // Navigate to prompt analytics
    await page.goto('/prompts');
    await waitForLoading(page);
    await page.click('text=Code Review Assistant');
    await page.click('[data-testid="view-analytics-button"]');

    // Check analytics data
    await expect(page.locator('[data-testid="usage-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();
    await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();

    // Generate evaluation report
    await page.click('[data-testid="generate-report-button"]');
    await waitForLoading(page);
    
    // Verify report contents
    await expect(page.locator('[data-testid="evaluation-report"]')).toContainText('Performance Analysis');
    await expect(page.locator('[data-testid="improvement-suggestions"]')).toBeVisible();
  });
}); 