const { test, expect } = require('@playwright/test');

test.describe('Project Dashboard - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for the dashboard to initialize
    await page.waitForFunction(() => window.dashboard !== undefined);
    
    // Clear any existing projects
    await page.evaluate(() => {
      localStorage.clear();
      window.dashboard.projects = [];
      window.dashboard.renderProjects();
    });
  });

  test('should display main dashboard elements', async ({ page }) => {
    // Check header
    await expect(page.locator('h1')).toContainText('Project Dashboard');
    
    // Check Add Project button is visible and clickable
    const addBtn = page.locator('#addProjectBtn');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('Add Project');
  });

  test('should open Add Project modal', async ({ page }) => {
    // Click Add Project button
    await page.click('#addProjectBtn');
    
    // Check modal opens
    await expect(page.locator('#addProjectModal')).toHaveClass(/active/);
    
    // Check form fields exist
    await expect(page.locator('#projectName')).toBeVisible();
    await expect(page.locator('#projectDescription')).toBeVisible();
    await expect(page.locator('#projectUrl')).toBeVisible();
    await expect(page.locator('#projectTools')).toBeVisible();
    
    // Check submit button exists
    await expect(page.locator('#submitAddProject')).toBeVisible();
  });

  test('should close modal with close button', async ({ page }) => {
    await page.click('#addProjectBtn');
    await expect(page.locator('#addProjectModal')).toHaveClass(/active/);
    
    await page.click('#closeAddModal');
    await expect(page.locator('#addProjectModal')).not.toHaveClass(/active/);
  });

  test('should close modal with cancel button', async ({ page }) => {
    await page.click('#addProjectBtn');
    await expect(page.locator('#addProjectModal')).toHaveClass(/active/);
    
    await page.click('#cancelAdd');
    await expect(page.locator('#addProjectModal')).not.toHaveClass(/active/);
  });

  test('should successfully add a project', async ({ page }) => {
    // Open modal
    await page.click('#addProjectBtn');
    
    // Fill form
    await page.fill('#projectName', 'Test Project');
    await page.fill('#projectDescription', 'This is a test project');
    await page.fill('#projectUrl', 'https://example.com');
    await page.fill('#projectTools', 'JavaScript, CSS');
    
    // Submit
    await page.click('#submitAddProject');
    
    // Wait for modal to close
    await page.waitForFunction(() => 
      !document.getElementById('addProjectModal').classList.contains('active')
    );
    
    // Check project appears
    await expect(page.locator('.project-card')).toBeVisible();
    await expect(page.locator('.project-card-title')).toContainText('Test Project');
  });

  test('should show empty state when no projects', async ({ page }) => {
    // Wait for dashboard to render
    await page.waitForFunction(() => window.dashboard !== undefined);
    
    // Check empty state
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state h3')).toContainText('No projects yet');
  });

  test('should open project detail modal when clicking card', async ({ page }) => {
    // Add a project first
    await page.evaluate(() => {
      const project = {
        id: 'test-1',
        name: 'Test Project',
        description: 'Test description',
        url: 'https://example.com',
        tools: ['JavaScript'],
        screenshot: 'https://via.placeholder.com/400x200'
      };
      window.dashboard.projects = [project];
      window.dashboard.renderProjects();
    });
    
    // Wait for project card to be visible
    await expect(page.locator('.project-card')).toBeVisible();
    
    // Click on project card
    await page.click('.project-card');
    
    // Check detail modal opens
    await expect(page.locator('#projectDetailModal')).toHaveClass(/active/);
    await expect(page.locator('#detailProjectName')).toContainText('Test Project');
  });

  test('should show edit modal when clicking edit button', async ({ page }) => {
    // Add a project and open detail modal
    await page.evaluate(() => {
      const project = {
        id: 'test-1',
        name: 'Test Project',
        description: 'Test description',
        url: 'https://example.com',
        tools: ['JavaScript'],
        screenshot: 'https://via.placeholder.com/400x200'
      };
      window.dashboard.projects = [project];
      window.dashboard.renderProjects();
    });
    
    await page.click('.project-card');
    await expect(page.locator('#projectDetailModal')).toHaveClass(/active/);
    
    // Click edit button
    await page.click('#editProjectBtn');
    
    // Check edit modal opens
    await expect(page.locator('#editProjectModal')).toHaveClass(/active/);
    await expect(page.locator('#editProjectName')).toHaveValue('Test Project');
  });

  test('should save project edits', async ({ page }) => {
    // Add a project
    await page.evaluate(() => {
      const project = {
        id: 'test-1',
        name: 'Original Name',
        description: 'Original description',
        url: 'https://example.com',
        tools: ['JavaScript'],
        screenshot: 'https://via.placeholder.com/400x200'
      };
      window.dashboard.projects = [project];
      window.dashboard.renderProjects();
    });
    
    // Open edit modal
    await page.click('.project-card');
    await page.click('#editProjectBtn');
    
    // Edit project
    await page.fill('#editProjectName', 'Updated Name');
    await page.fill('#editProjectDescription', 'Updated description');
    
    // Save changes
    await page.click('#submitEditProject');
    
    // Wait for modal to close
    await page.waitForFunction(() => 
      !document.getElementById('editProjectModal').classList.contains('active')
    );
    
    // Check changes are reflected
    await expect(page.locator('.project-card-title')).toContainText('Updated Name');
  });

  test('should launch project in new tab', async ({ page, context }) => {
    // Add a project and open detail modal
    await page.evaluate(() => {
      const project = {
        id: 'test-1',
        name: 'Test Project',
        description: 'Test description',
        url: 'https://example.com',
        tools: ['JavaScript'],
        screenshot: 'https://via.placeholder.com/400x200'
      };
      window.dashboard.projects = [project];
      window.dashboard.renderProjects();
    });
    
    await page.click('.project-card');
    
    // Set up new page promise
    const pagePromise = context.waitForEvent('page');
    
    // Click launch button
    await page.click('#launchProjectBtn');
    
    // Verify new tab opens
    const newPage = await pagePromise;
    expect(newPage.url()).toContain('example.com');
    await newPage.close();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check elements are visible on mobile
    await expect(page.locator('.dashboard')).toBeVisible();
    await expect(page.locator('#addProjectBtn')).toBeVisible();
    
    // Test modal on mobile
    await page.click('#addProjectBtn');
    await expect(page.locator('#addProjectModal')).toHaveClass(/active/);
    
    // Close modal
    await page.click('#closeAddModal');
    await expect(page.locator('#addProjectModal')).not.toHaveClass(/active/);
  });
});
