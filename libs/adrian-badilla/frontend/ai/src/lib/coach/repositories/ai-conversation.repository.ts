import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from '@angular/fire/firestore';
import { aiFirestorePaths } from '../constants/ai-firestore-paths';
import type {
  AiConversation,
  AiConversationMessage,
  FirestoreAiConversation,
  FirestoreAiMessage,
} from '../models/ai-conversation.model';

// ─── Path helpers ─────────────────────────────────────────────────────────────

function toPathArgs(path: string): [string, ...string[]] {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) throw new Error(`Invalid Firestore path: "${path}"`);
  return parts as [string, ...string[]];
}

// ─── Repository ───────────────────────────────────────────────────────────────

/**
 * AiConversationRepository
 *
 * Pure Firestore infrastructure for AI conversation history.
 * No state, no business logic. Reads and writes Firestore only.
 *
 * Architecture note:
 *  - Prepared for the future conversational memory feature.
 *  - The current migration does NOT persist messages to Firestore.
 *  - This repository will be wired into withMemoryFeature() in a future sprint.
 *
 * Security: All paths are user-scoped. The repository never writes
 * to other users' documents.
 */
@Injectable({ providedIn: 'root' })
export class AiConversationRepository {
  readonly #db = inject(Firestore);

  /**
   * Lists the most recent conversations for a user.
   */
  async listConversations(uid: string, maxCount = 20): Promise<AiConversation[]> {
    const ref = collection(this.#db, ...toPathArgs(aiFirestorePaths.conversations(uid)));
    const q = query(ref, orderBy('updatedAt', 'desc'), limit(maxCount));
    const snap = await getDocs(q);

    return snap.docs.map((doc) => {
      const data = doc.data() as FirestoreAiConversation;
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        messageCount: data.messageCount,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        archivedAt: data.archivedAt?.toDate(),
      } satisfies AiConversation;
    });
  }

  /**
   * Persists a new conversation record and returns its Firestore ID.
   */
  async createConversation(
    uid: string,
    type: AiConversation['type'],
    title: string
  ): Promise<string> {
    const ref = collection(this.#db, ...toPathArgs(aiFirestorePaths.conversations(uid)));
    const now = Timestamp.now();
    const data: FirestoreAiConversation = {
      userId: uid,
      type,
      title,
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(ref, data);
    return docRef.id;
  }

  /**
   * Persists a message in a conversation.
   */
  async addMessage(
    uid: string,
    conversationId: string,
    message: Omit<AiConversationMessage, 'id' | 'conversationId'>
  ): Promise<string> {
    const ref = collection(
      this.#db,
      ...toPathArgs(aiFirestorePaths.messages(uid, conversationId))
    );
    const data: FirestoreAiMessage = {
      conversationId,
      role: message.role,
      content: message.content,
      timestamp: Timestamp.fromDate(message.timestamp),
    };
    const docRef = await addDoc(ref, data);
    return docRef.id;
  }
}
