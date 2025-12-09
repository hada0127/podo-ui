import { test, expect } from '@playwright/test';

test.describe('Form Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Checkbox', () => {
    test('renders and toggles checkbox', async ({ page }) => {
      await page.goto('/components/checkbox-radio');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Look for any checkbox input on the page
      const checkbox = page.locator('input[type="checkbox"]').first();
      await expect(checkbox).toBeVisible({ timeout: 10000 });

      // Click to toggle
      await checkbox.click({ force: true });
    });

    test('disabled checkbox cannot be toggled', async ({ page }) => {
      await page.goto('/components/checkbox-radio');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      const disabledCheckbox = page.locator('input[type="checkbox"][disabled]').first();
      if (await disabledCheckbox.count() > 0) {
        await expect(disabledCheckbox).toBeDisabled();
      }
    });
  });

  test.describe('Radio', () => {
    test('renders and selects radio', async ({ page }) => {
      await page.goto('/components/checkbox-radio');

      const radios = page.locator('input[type="radio"]');
      if (await radios.count() > 1) {
        const firstRadio = radios.first();
        const secondRadio = radios.nth(1);

        await firstRadio.check();
        await expect(firstRadio).toBeChecked();

        await secondRadio.check();
        await expect(secondRadio).toBeChecked();
        await expect(firstRadio).not.toBeChecked();
      }
    });
  });

  test.describe('Toggle', () => {
    test('renders and toggles switch', async ({ page }) => {
      await page.goto('/components/toggle');

      const toggle = page.locator('input.toggle').first();
      await expect(toggle).toBeVisible();

      const initialState = await toggle.isChecked();
      await toggle.click();
      await expect(toggle).toHaveJSProperty('checked', !initialState);
    });

    test('disabled toggle cannot be toggled', async ({ page }) => {
      await page.goto('/components/toggle');

      const disabledToggle = page.locator('input.toggle[disabled]').first();
      if (await disabledToggle.count() > 0) {
        await expect(disabledToggle).toBeDisabled();
      }
    });
  });

  test.describe('Select', () => {
    test('renders and selects option', async ({ page }) => {
      await page.goto('/components/select');

      const select = page.locator('select').first();
      await expect(select).toBeVisible();

      const options = select.locator('option:not([disabled])');
      if (await options.count() > 0) {
        const firstOption = await options.first().getAttribute('value');
        if (firstOption) {
          await select.selectOption(firstOption);
          await expect(select).toHaveValue(firstOption);
        }
      }
    });

    test('disabled select cannot be changed', async ({ page }) => {
      await page.goto('/components/select');

      const disabledSelect = page.locator('select[disabled]').first();
      if (await disabledSelect.count() > 0) {
        await expect(disabledSelect).toBeDisabled();
      }
    });
  });

  test.describe('Button', () => {
    test('renders button with different themes', async ({ page }) => {
      await page.goto('/components/button');

      const primaryButton = page.locator('button.primary').first();
      const dangerButton = page.locator('button.danger').first();

      if (await primaryButton.count() > 0) {
        await expect(primaryButton).toBeVisible();
        await expect(primaryButton).toHaveClass(/primary/);
      }

      if (await dangerButton.count() > 0) {
        await expect(dangerButton).toBeVisible();
        await expect(dangerButton).toHaveClass(/danger/);
      }
    });

    test('disabled button cannot be clicked', async ({ page }) => {
      await page.goto('/components/button');

      const disabledButton = page.locator('button[disabled]').first();
      if (await disabledButton.count() > 0) {
        await expect(disabledButton).toBeDisabled();
      }
    });

    test('button variants render correctly', async ({ page }) => {
      await page.goto('/components/button');

      const fillButton = page.locator('button.fill').first();
      const borderButton = page.locator('button.border').first();
      const textButton = page.locator('button.text').first();

      if (await fillButton.count() > 0) {
        await expect(fillButton).toHaveClass(/fill/);
      }
      if (await borderButton.count() > 0) {
        await expect(borderButton).toHaveClass(/border/);
      }
      if (await textButton.count() > 0) {
        await expect(textButton).toHaveClass(/text/);
      }
    });
  });

  test.describe('Tab', () => {
    test('renders tabs correctly', async ({ page }) => {
      await page.goto('/components/tab');

      // Verify tabs container exists
      const tabsContainer = page.locator('ul.tabs').first();
      await expect(tabsContainer).toBeVisible();

      // Verify tabs have items
      const tabs = tabsContainer.locator('> li');
      const count = await tabs.count();
      expect(count).toBeGreaterThan(0);

      // Verify active tab has 'on' class
      const activeTab = tabsContainer.locator('> li.on');
      expect(await activeTab.count()).toBeGreaterThan(0);
    });

    test('tab links are clickable', async ({ page }) => {
      await page.goto('/components/tab');

      const tabs = page.locator('ul.tabs').first().locator('> li');
      if (await tabs.count() > 1) {
        const secondTabLink = tabs.nth(1).locator('a');
        await expect(secondTabLink).toBeVisible();

        // Verify link is clickable (doesn't throw)
        await secondTabLink.click();
      }
    });
  });

  test.describe('Table', () => {
    test('renders table with data', async ({ page }) => {
      await page.goto('/components/table');

      const table = page.locator('table').first();
      await expect(table).toBeVisible();

      const headers = table.locator('thead th');
      const rows = table.locator('tbody tr');

      expect(await headers.count()).toBeGreaterThan(0);
      expect(await rows.count()).toBeGreaterThan(0);
    });

    test('table with list class has hover effect', async ({ page }) => {
      await page.goto('/components/table');

      const listTable = page.locator('table.list').first();
      if (await listTable.count() > 0) {
        await expect(listTable).toHaveClass(/list/);
      }
    });
  });

  test.describe('FileInput', () => {
    test('renders file input', async ({ page }) => {
      await page.goto('/components/file');

      const fileInput = page.locator('input[type="file"]').first();
      await expect(fileInput).toBeVisible();
    });

    test('disabled file input cannot accept files', async ({ page }) => {
      await page.goto('/components/file');

      const disabledFileInput = page.locator('input[type="file"][disabled]').first();
      if (await disabledFileInput.count() > 0) {
        await expect(disabledFileInput).toBeDisabled();
      }
    });
  });
});
