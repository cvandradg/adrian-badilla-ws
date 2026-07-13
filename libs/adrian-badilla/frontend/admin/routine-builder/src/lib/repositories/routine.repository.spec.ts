import { TestBed } from '@angular/core/testing';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { RoutineRepository } from './routine.repository';
import type {
  RoutineCreatePayload,
  RoutineUpdatePayload,
} from '../models/routine.model';

jest.mock('@angular/fire/firestore', () => ({
  Firestore: class Firestore {},
  collection: jest.fn(() => ({ path: 'routine-library' })),
  collectionData: jest.fn(),
  doc: jest.fn((...segments: unknown[]) => ({ path: segments.slice(1).join('/') })),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}));

describe('RoutineRepository', () => {
  let repository: RoutineRepository;
  const mockedAddDoc = jest.mocked(addDoc);
  const mockedUpdateDoc = jest.mocked(updateDoc);
  const mockedDeleteDoc = jest.mocked(deleteDoc);
  const mockedDoc = jest.mocked(doc);
  const mockedCollection = jest.mocked(collection);
  const mockedServerTimestamp = jest.mocked(serverTimestamp);

  const createPayload: RoutineCreatePayload = {
    name: 'Hipertrofia Superior',
    description: '',
    difficulty: 'intermediate',
    daysPerWeek: 3,
    goals: ['muscle_gain'],
    tags: [],
    trainingLocations: ['gym'],
    days: [],
    isActive: true,
    isTemplate: true,
  };

  const updatePayload: RoutineUpdatePayload = {
    days: [],
  };

  beforeEach(() => {
    mockedAddDoc.mockReset();
    mockedUpdateDoc.mockReset();
    mockedDeleteDoc.mockReset();
    mockedDoc.mockClear();
    mockedCollection.mockClear();
    mockedServerTimestamp.mockClear();
    mockedServerTimestamp.mockReturnValue('SERVER_TIMESTAMP' as never);

    mockedAddDoc.mockResolvedValue({ id: 'routine-123' } as never);
    mockedUpdateDoc.mockResolvedValue(undefined as never);
    mockedDeleteDoc.mockResolvedValue(undefined as never);

    TestBed.configureTestingModule({
      providers: [RoutineRepository, { provide: Firestore, useValue: {} }],
    });

    repository = TestBed.inject(RoutineRepository);
  });

  it('creates a new routine with addDoc when no id exists', async () => {
    const id = await firstValueFrom(repository.create(createPayload));

    expect(id).toBe('routine-123');
    expect(mockedCollection).toHaveBeenCalled();
    expect(mockedAddDoc).toHaveBeenCalledWith(
      { path: 'routine-library' },
      expect.objectContaining({
        ...createPayload,
        createdAt: 'SERVER_TIMESTAMP',
        updatedAt: 'SERVER_TIMESTAMP',
      })
    );
  });

  it('updates an existing routine with its real document id', async () => {
    await firstValueFrom(repository.update('routine-123', updatePayload));

    expect(mockedDoc).toHaveBeenCalledWith({}, 'routine-library', 'routine-123');
    expect(mockedUpdateDoc).toHaveBeenCalledWith(
      { path: 'routine-library/routine-123' },
      expect.objectContaining({
        ...updatePayload,
        updatedAt: 'SERVER_TIMESTAMP',
      })
    );
  });

  it('rejects invalid ids before attempting updateDoc', () => {
    expect(() =>
      repository.update('true' as never, updatePayload)
    ).toThrow('Invalid routine document id "true"');

    expect(mockedUpdateDoc).not.toHaveBeenCalled();
  });

  it('rejects invalid ids before attempting deleteDoc', () => {
    expect(() => repository.delete('false' as never)).toThrow(
      'Invalid routine document id "false"'
    );

    expect(mockedDeleteDoc).not.toHaveBeenCalled();
  });
});
