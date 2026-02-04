import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

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
      env: {
      E2E_VERIFIED_EMAIL: ' gafretriffaru-5726@yopmail.com',
      E2E_VERIFIED_PASSWORD: '123456789',
      E2E_UNVERIFIED_EMAIL: 'email-no-verificado@yopmail.com',
      E2E_UNVERIFIED_PASSWORD: '123456789',
    },
});
