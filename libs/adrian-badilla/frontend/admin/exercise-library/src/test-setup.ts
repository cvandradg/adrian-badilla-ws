import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

jest.mock('@angular/fire/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  addDoc: jest.fn(),
  collection: jest.fn(),
  collectionData: jest.fn(),
  Firestore: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(),
}));

setupZoneTestEnv();
