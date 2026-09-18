import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const port = 4174;
const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)], {
    stdio: 'ignore',
    shell: true,
});

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

try {
    await wait(1500);
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.getByRole('button', { name: 'Play' }).click();
    await page.waitForSelector('canvas');

    const frameSamples = await page.evaluate(async () => {
        const samples = [];
        let previous = performance.now();
        await new Promise((resolve) => {
            const collect = (now) => {
                samples.push(now - previous);
                previous = now;
                if (samples.length >= 300) resolve();
                else requestAnimationFrame(collect);
            };
            requestAnimationFrame(collect);
        });
        return {
            samples,
            memory: performance.memory
                ? { usedJSHeapSize: performance.memory.usedJSHeapSize, jsHeapSizeLimit: performance.memory.jsHeapSizeLimit }
                : null,
        };
    });

    const sorted = frameSamples.samples.slice().sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const averageFps = 1000 / (frameSamples.samples.reduce((sum, value) => sum + value, 0) / sorted.length);
    console.log(JSON.stringify({ averageFps, frameP95Ms: p95, samples: sorted.length, memory: frameSamples.memory }, null, 2));
    await browser.close();
} finally {
    server.kill();
}
