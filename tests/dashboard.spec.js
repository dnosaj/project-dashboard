const { test, expect } = require('@playwright/test');

test.describe('Project Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      localStorage.clear();
      if (window.dashboard) {
        window.dashboard.clearAllProjects();
      }
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should display the main dashboard with header', async ({ page }) => {
    await page.goto('/');
    
    // Check header elements
    await expect(page.locator('h1')).toContainText('Project Dashboard');
    await expect(page.locator('.dashboard-header p')).toContainText('Manage and showcase your vibe coded projects');
    
    // Check Add Project button is visible
    await expect(page.locator('#addProjectBtn')).toBeVisible();
    await expect(page.locator('#addProjectBtn')).toContainText('Add Project');
  });

  test('should show empty state when no projects exist', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the dashboard to load and clear sample projects
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      window.dashboard.clearAllProjects();
    });
    
    // Check empty state
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state h3')).toContainText('No projects yet');
    await expect(page.locator('.empty-state p')).toContainText('Click "Add Project" to get started');
  });

  test('should open and close Add Project modal', async ({ page }) => {
    await page.goto('/');
    
    // Open modal
    await page.click('#addProjectBtn');
    await expect(page.locator('#addProjectModal')).toHaveClass(/active/);
    await expect(page.locator('.add-project-modal h2')).toContainText('Add New Project');
    
    // Check form fields are present
    await expect(page.locator('#projectName')).toBeVisible();
    await expect(page.locator('#projectDescription')).toBeVisible();
    await expect(page.locator('#projectUrl')).toBeVisible();
    await expect(page.locator('#projectTools')).toBeVisible();
    
    // Close modal with close button
    await page.click('#closeAddModal');
    await expect(page.locator('#addProjectModal')).not.toHaveClass(/active/);
  });

  test('should close modal with Cancel button', async ({ page }) => {
    await page.goto('/');
    
    await page.click('#addProjectBtn');
    await expect(page.locator('#addProjectModal')).toHaveClass(/active/);
    
    await page.click('#cancelAdd');
    await expect(page.locator('#addProjectModal')).not.toHaveClass(/active/);
  });

  test('should close modal with Escape key', async ({ page }) => {
    await page.goto('/');
    
    await page.click('#addProjectBtn');
    await expect(page.locator('#addProjectModal')).toHaveClass(/active/);
    
    await page.keyboard.press('Escape');
    await expect(page.locator('#addProjectModal')).not.toHaveClass(/active/);
  });

  test('should close modal when clicking overlay', async ({ page }) => {
    await page.goto('/');
    
    await page.click('#addProjectBtn');
    await expect(page.locator('#addProjectModal')).toHaveClass(/active/);
    
    // Click on the overlay (not the modal content)
    await page.click('#addProjectModal', { position: { x: 10, y: 10 } });
    await expect(page.locator('#addProjectModal')).not.toHaveClass(/active/);
  });

  test('should add a new project successfully', async ({ page }) => {
    await page.goto('/');
    
    // Clear any existing projects
    await page.evaluate(() => {
      window.dashboard.clearAllProjects();
    });
    
    // Open modal and fill form
    await page.click('#addProjectBtn');
    await page.fill('#projectName', 'Test Project');
    await page.fill('#projectDescription', 'This is a test project description');
    await page.fill('#projectUrl', 'https://example.com');
    await page.fill('#projectTools', 'JavaScript, HTML, CSS');
    
    // Submit form
    await page.click('#submitAddProject');
    
    // Wait for form submission to complete
    await page.waitForFunction(() => !document.getElementById('submitAddProject').disabled);
    
    // Check modal is closed
    await expect(page.locator('#addProjectModal')).not.toHaveClass(/active/);
    
    // Check project card appears
    await expect(page.locator('.project-card')).toBeVisible();
    await expect(page.locator('.project-card-title')).toContainText('Test Project');
    await expect(page.locator('.project-card-description')).toContainText('This is a test project description');
  });

  test('should validate required fields in add project form', async ({ page }) => {
    await page.goto('/');
    
    await page.click('#addProjectBtn');
    
    // Try to submit empty form
    await page.click('#submitAddProject');
    
    // Modal should still be open
    await expect(page.locator('#addProjectModal')).toHaveClass(/active/);
    
    // Check that required fields prevent submission
    const nameField = page.locator('#projectName');
    await expect(nameField).toHaveAttribute('required');
    
    const descriptionField = page.locator('#projectDescription');
    await expect(descriptionField).toHaveAttribute('required');
    
    const urlField = page.locator('#projectUrl');
    await expect(urlField).toHaveAttribute('required');
  });

  test('should open project detail modal when clicking on project card', async ({ page }) => {
    await page.goto('/');
    
    // Wait for sample projects to load
    await page.waitForSelector('.project-card', { timeout: 5000 });
    
    // Click on first project card
    await page.click('.project-card:first-child');
    
    // Check detail modal opens
    await expect(page.locator('#projectDetailModal')).toHaveClass(/active/);
    await expect(page.locator('#detailProjectName')).toBeVisible();
    await expect(page.locator('#detailProjectImage')).toBeVisible();
    await expect(page.locator('#detailProjectDescription')).toBeVisible();
    await expect(page.locator('#detailProjectTools')).toBeVisible();
  });

  test('should show launch button on screenshot hover in detail modal', async ({ page }) => {
    await page.goto('/');
    
    // Wait for sample projects and click first one
    await page.waitForSelector('.project-card', { timeout: 5000 });
    await page.click('.project-card:first-child');
    
    // Check launch overlay is initially hidden
    await expect(page.locator('.launch-overlay')).toHaveCSS('opacity', '0');
    
    // Hover over screenshot
    await page.hover('.project-screenshot-container');
    
    // Check launch overlay becomes visible
    await expect(page.locator('.launch-overlay')).toHaveCSS('opacity', '1');
    await expect(page.locator('#launchProjectBtn')).toBeVisible();
  });

  test('should open edit modal when clicking edit button', async ({ page }) => {
    await page.goto('/');
    
    // Wait for sample projects and open detail modal
    await page.waitForSelector('.project-card', { timeout: 5000 });
    await page.click('.project-card:first-child');
    
    // Click edit button
    await page.click('#editProjectBtn');
    
    // Check edit modal opens and detail modal closes
    await expect(page.locator('#editProjectModal')).toHaveClass(/active/);
    await expect(page.locator('#projectDetailModal')).not.toHaveClass(/active/);
    
    // Check form fields are populated
    await expect(page.locator('#editProjectName')).toHaveValue(/\w+/);
    await expect(page.locator('#editProjectDescription')).toHaveValue(/\w+/);
    await expect(page.locator('#editProjectUrl')).toHaveValue(/https?:\/\/.+/);
  });

  test('should save changes when editing a project', async ({ page }) => {
    await page.goto('/');
    
    // Wait for sample projects and open edit modal
    await page.waitForSelector('.project-card', { timeout: 5000 });
    await page.click('.project-card:first-child');
    await page.click('#editProjectBtn');
    
    // Edit project details
    await page.fill('#editProjectName', 'Updated Project Name');
    await page.fill('#editProjectDescription', 'Updated project description');
    
    // Submit changes
    await page.click('#submitEditProject');
    
    // Check modal is closed
    await expect(page.locator('#editProjectModal')).not.toHaveClass(/active/);
    
    // Check project card is updated
    await expect(page.locator('.project-card:first-child .project-card-title')).toContainText('Updated Project Name');
    await expect(page.locator('.project-card:first-child .project-card-description')).toContainText('Updated project description');
  });

  test('should launch project in new tab when clicking launch button', async ({ page, context }) => {
    await page.goto('/');
    
    // Wait for sample projects and open detail modal
    await page.waitForSelector('.project-card', { timeout: 5000 });
    await page.click('.project-card:first-child');
    
    // Set up new page promise before clicking launch
    const pagePromise = context.waitForEvent('page');
    
    // Hover and click launch button
    await page.hover('.project-screenshot-container');
    await page.click('#launchProjectBtn');
    
    // Check new tab opens
    const newPage = await pagePromise;
    await expect(newPage).toBeTruthy();
    
    // Close the new tab
    await newPage.close();
  });

  test('should display project tools as tags in detail modal', async ({ page }) => {
    await page.goto('/');
    
    // Wait for sample projects and open detail modal
    await page.waitForSelector('.project-card', { timeout: 5000 });
    await page.click('.project-card:first-child');
    
    // Check tools section
    await expect(page.locator('#detailProjectTools')).toBeVisible();
    await expect(page.locator('.tool-tag')).toHaveCount.toBeGreaterThan(0);
  });

  test('should handle form validation in edit modal', async ({ page }) => {
    await page.goto('/');
    
    // Wait for sample projects and open edit modal
    await page.waitForSelector('.project-card', { timeout: 5000 });
    await page.click('.project-card:first-child');
    await page.click('#editProjectBtn');
    
    // Clear required fields
    await page.fill('#editProjectName', '');
    await page.fill('#editProjectDescription', '');
    
    // Try to submit
    await page.click('#submitEditProject');
    
    // Modal should still be open due to validation
    await expect(page.locator('#editProjectModal')).toHaveClass(/active/);
  });

  test('should show success toast after adding project', async ({ page }) => {
    await page.goto('/');
    
    // Clear existing projects
    await page.evaluate(() => {
      window.dashboard.clearAllProjects();
    });
    
    // Add new project
    await page.click('#addProjectBtn');
    await page.fill('#projectName', 'Toast Test Project');
    await page.fill('#projectDescription', 'Testing toast notification');
    await page.fill('#projectUrl', 'https://example.com');
    await page.click('#submitAddProject');
    
    // Check for success toast
    await expect(page.locator('.toast')).toBeVisible();
    await expect(page.locator('.toast')).toContainText('Project added successfully!');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check responsive layout
    await expect(page.locator('.dashboard')).toBeVisible();
    await expect(page.locator('#addProjectBtn')).toBeVisible();
    
    // Check grid adapts to single column
    const gridColumns = await page.locator('.projects-grid').evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // On mobile, should be single column (1fr)
    expect(gridColumns).toBe('1fr');
  });

  test('should persist projects in localStorage', async ({ page }) => {
    await page.goto('/');
    
    // Clear and add a project
    await page.evaluate(() => {
      window.dashboard.clearAllProjects();
    });
    
    await page.click('#addProjectBtn');
    await page.fill('#projectName', 'Persistence Test');
    await page.fill('#projectDescription', 'Testing localStorage persistence');
    await page.fill('#projectUrl', 'https://example.com');
    await page.click('#submitAddProject');
    
    // Reload page
    await page.reload();
    
    // Check project is still there
    await expect(page.locator('.project-card')).toBeVisible();
    await expect(page.locator('.project-card-title')).toContainText('Persistence Test');
  });
});
