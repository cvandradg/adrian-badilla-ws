import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
import * as fs from 'node:fs';
import * as path from 'node:path';

function loadLocalEnv() {
  const p = path.join(__dirname, 'cypress.env.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'npx nx run adrian-badilla:serve',
        production: 'npx nx run adrian-badilla:serve-static',
      },
      ciWebServerCommand: 'npx nx run adrian-badilla:serve-static',
      ciBaseUrl: 'http://localhost:4200',
    }),
    baseUrl: 'http://localhost:4200',
  },

  env: loadLocalEnv(),
});
