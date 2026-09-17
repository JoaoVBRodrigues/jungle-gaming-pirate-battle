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

test('persists options and exposes touch controls on mobile', async ({
    page,
}, testInfo) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Options' }).click();

    await page
        .getByLabel('Game session time (60-180 seconds)')
        .fill('90');
    await page
        .getByLabel('Enemy spawn time (1-30 seconds)')
        .fill('3');
    await page.getByRole('button', { name: 'Save Options' }).click();
    await page.reload();
    await page.getByRole('button', { name: 'Options' }).click();

    await expect(
        page.getByLabel('Game session time (60-180 seconds)'),
    ).toHaveValue('90');
    await expect(
        page.getByLabel('Enemy spawn time (1-30 seconds)'),
    ).toHaveValue('3');

    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('button', { name: 'Play' }).click();
    if (testInfo.project.name !== 'mobile') {
        return;
    }

    await expect(
        page.getByRole('group', { name: 'Touch controls' }),
    ).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(1);
});
