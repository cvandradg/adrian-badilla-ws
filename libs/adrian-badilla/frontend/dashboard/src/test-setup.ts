import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

// Mock Firebase modules to prevent "fetch is not defined" errors in Node/Jest
jest.mock('@angular/fire/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  Auth: jest.fn(),
  authState: jest.fn(() => ({ subscribe: jest.fn() })),
  user: jest.fn(() => ({ subscribe: jest.fn() })),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  confirmPasswordReset: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock('@firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('rxfire/auth', () => ({
  authState: jest.fn(),
  user: jest.fn(),
}));

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
