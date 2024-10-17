// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  
  use: {
    localURL: 'http://localhost:4200',
    testURL: 'https://fk-feedback-test.mni.thm.de/login',
  },
  
  reporter: [
  //['html'],
  ['allure-playwright'], 
  ],

});