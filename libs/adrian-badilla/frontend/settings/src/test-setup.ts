import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

// Mock Firebase modules to prevent Jest from parsing ESM code in node_modules
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
}));

jest.mock('@angular/fire/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  Auth: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
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
}));

jest.mock('@firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('rxfire/auth', () => ({
  authState: jest.fn(),
}));

// Mock the settings store to prevent circular dependencies
jest.mock('./lib/store/settings.store', () => ({
  settingsStoreDev: {
    routes: () => [],
    selectedRoute: () => null,
    routeSearchQuery: () => '',
    filteredRoutes: () => [],
    selectedRouteSupercenters: () => [],
    createRouteisLoading: () => false,
    saveRouteisLoading: () => false,
    isSavingRoute: () => false,
    foodDescriptionVm: () => null,
    chatMessages: () => [],
    chatIsLoading: () => false,
    isChatOpen: () => false,
    hasPendingAISuggestion: () => false,
  },
}));

// Mock window.matchMedia for jsdom environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
