import { expect, test } from '@playwright/test';

test('navigates through the main menu and starts a game', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Main Menu' })).toBeVisible();
    await page.getByRole('button', { name: 'Options' }).click();
    await expect(page.getByRole('heading', { name: 'Options' })).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();

    await page.getByRole('button', { name: 'Ranking', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Ranking' })).toBeVisible();
    await expect(page.getByText('Captain Nova')).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();

    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByRole('region', { name: 'Game status' })).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(1);
});
