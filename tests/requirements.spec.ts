import { expect, test } from '@playwright/test';

test.describe('delivery requirements', () => {
    test('supports paginated ranking and network scenario selection', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('pirate-battle.network-scenario', 'paginated');
        });
        await page.goto('/');
        await page.getByRole('button', { name: 'Ranking', exact: true }).click();

        await expect(page.getByRole('heading', { name: 'Ranking' })).toBeVisible();
        await expect(page.getByText('Page 1 of 2')).toBeVisible();
        await page.getByRole('button', { name: 'Next' }).click();
        await expect(page.getByText('Page 2 of 2')).toBeVisible();
        await expect(page.locator('select')).toHaveValue('paginated');
    });

    test('exposes accessible game canvas and health semantics', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Play' }).click();

        await expect(page.getByRole('img', { name: 'Pirate Battle arena' })).toBeVisible();
        await expect(page.getByRole('progressbar', { name: 'Player health' })).toHaveAttribute('aria-valuenow', '100');
    });

    test('separates left and right fire controls on mobile', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'mobile', 'Touch controls are enabled in the mobile project.');
        await page.goto('/');
        await page.getByRole('button', { name: 'Play' }).click();

        await expect(page.getByRole('button', { name: 'Left Fire' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Right Fire' })).toBeVisible();
    });

    test('shows network errors without blocking navigation', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('pirate-battle.network-scenario', 'server-error');
        });
        await page.goto('/');
        await page.getByRole('button', { name: 'Ranking', exact: true }).click();
        await expect(page.getByRole('alert')).toContainText('Unable to load ranking');
        await page.getByRole('button', { name: 'Back' }).click();
        await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
    });
});
