import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

jest.mock('@angular/fire/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  addDoc: jest.fn(),
  collection: jest.fn(),
  Firestore: jest.fn(),
  collectionGroup: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

jest.mock('@angular/fire/auth', () => ({
  getAuth: jest.fn(),
  Auth: jest.fn(),
  authState: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  Timestamp: { now: jest.fn(), fromDate: jest.fn() },
}));

jest.mock('@firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  addDoc: jest.fn(),
  collection: jest.fn(),
  Firestore: jest.fn(),
  collectionGroup: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

jest.mock('@firebase/auth', () => ({
  getAuth: jest.fn(),
  Auth: jest.fn(),
}));

jest.mock('rxfire/auth', () => ({
  authState: jest.fn(),
}));

setupZoneTestEnv();
