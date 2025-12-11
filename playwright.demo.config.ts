import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Demo Configuration
 * Extends the main config but optimized for visual presentation:
 * - Runs in HEADED mode (visible browser)
 * - Adds SLOWMO delay (1000ms) so viewers can follow actions
 * - Records VIDEO for backup
 * - Only runs on Chromium for clean demo
 */
export default defineConfig({
    ...baseConfig,
    retries: 0, // No retries for demo (we want a clean run)
    workers: 1, // Serial execution to follow strictly one by one
    reporter: 'list', // Clean terminal output
    use: {
        ...baseConfig.use,
        headless: false,
        video: 'on',
        launchOptions: {
            slowMo: 1000, // 1 second delay per action
        },
    },
    projects: [
        {
            name: 'Demo (Chromium)',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
