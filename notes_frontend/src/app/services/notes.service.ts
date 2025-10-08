import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { Note } from '../models/note.model';

/**
 * PUBLIC_INTERFACE
 * NotesService manages CRUD operations for notes using localStorage for persistence.
 * - Exposes observables for the notes list and the currently selected note.
 * - Maintains a search term for filtering.
 * - Seeds initial sample notes on first load if storage is empty.
 */
@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly STORAGE_KEY = 'notes.v1';

  // Internal state
  private notesSubject = new BehaviorSubject<Note[]>([]);
  private selectedIdSubject = new BehaviorSubject<string | null>(null);
  private searchTermSubject = new BehaviorSubject<string>('');

  // Public streams
  notes$: Observable<Note[]> = combineLatest([
    this.notesSubject.asObservable(),
    this.searchTermSubject.asObservable().pipe(debounceTime(150), distinctUntilChanged())
  ]).pipe(
    map(([notes, term]) => {
      const t = term.trim().toLowerCase();
      let filtered = notes;
      if (t) {
        filtered = notes.filter(n =>
          n.title.toLowerCase().includes(t) ||
          n.content.toLowerCase().includes(t)
        );
      }
      // Sort by pinned first, then updatedAt desc
      return filtered.slice().sort((a, b) => {
        if ((b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) !== 0) {
          return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    })
  );

  selectedNote$: Observable<Note | null> = combineLatest([
    this.notesSubject.asObservable(),
    this.selectedIdSubject.asObservable()
  ]).pipe(
    map(([notes, id]) => {
      if (!id) return null;
      return notes.find(n => n.id === id) ?? null;
    })
  );

  constructor() {
    this.loadFromStorage();
  }

  /** Generate UUID leveraging crypto.randomUUID if available, fallback simple generator. */
  private uuid(): string {
    const cryptoAny = globalThis.crypto as any;
    if (cryptoAny && typeof cryptoAny.randomUUID === 'function') {
      return cryptoAny.randomUUID();
    }
    // Fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Safely access localStorage only when running in a browser.
   */
  private get safeLocalStorage(): any | null {
    try {
      const g: any = globalThis as any;
      if (g && g.localStorage) {
        return g.localStorage as any;
      }
    } catch {
      // ignore
    }
    return null;
  }

  private persist(): void {
    try {
      const ls = this.safeLocalStorage;
      if (!ls) return;
      ls.setItem(this.STORAGE_KEY, JSON.stringify(this.notesSubject.value));
    } catch (e) {
      console.error('Failed to persist notes', e);
    }
  }

  private loadFromStorage(): void {
    try {
      const ls = this.safeLocalStorage;
      if (ls) {
        const raw = ls.getItem(this.STORAGE_KEY);
        if (raw) {
          this.notesSubject.next(JSON.parse(raw));
          return;
        }
      }
      // Fallback to seeding if storage unavailable or empty
      this.seedSample();
    } catch {
      this.seedSample();
    }
  }

  private seedSample(): void {
    const now = new Date().toISOString();
    const samples: Note[] = [
      {
        id: this.uuid(),
        title: 'Welcome to Ocean Notes',
        content:
          'This is your personal notes manager. Use the search above to filter notes, and click the + button to add a new note.',
        pinned: true,
        favorite: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: this.uuid(),
        title: 'Getting Started',
        content:
          '- Click a note to edit it in the main panel.\n- Your changes are autosaved.\n- Use the pin icon to keep important notes on top.',
        pinned: false,
        favorite: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: this.uuid(),
        title: 'Shortcuts & Tips',
        content:
          'Use the browser search or the header search. Keep titles concise and use content for details.',
        pinned: false,
        favorite: false,
        createdAt: now,
        updatedAt: now
      }
    ];
    this.notesSubject.next(samples);
    this.persist();
  }

  // PUBLIC_INTERFACE
  /** Set the current search term used to filter notes list. */
  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  // PUBLIC_INTERFACE
  /** Set the currently selected note ID. */
  selectNote(id: string | null): void {
    this.selectedIdSubject.next(id);
  }

  // PUBLIC_INTERFACE
  /** Create a new note with provided initial values. Returns the created note. */
  createNote(initial?: Partial<Note>): Note {
    const now = new Date().toISOString();
    const note: Note = {
      id: this.uuid(),
      title: initial?.title ?? 'Untitled note',
      content: initial?.content ?? '',
      pinned: initial?.pinned ?? false,
      favorite: initial?.favorite ?? false,
      createdAt: now,
      updatedAt: now
    };
    const notes = [note, ...this.notesSubject.value];
    this.notesSubject.next(notes);
    this.persist();
    return note;
  }

  // PUBLIC_INTERFACE
  /** Update an existing note by ID with provided fields. */
  updateNote(id: string, patch: Partial<Note>): void {
    const notes = this.notesSubject.value.slice();
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return;
    const updated: Note = {
      ...notes[idx],
      ...patch,
      updatedAt: new Date().toISOString()
    };
    notes[idx] = updated;
    this.notesSubject.next(notes);
    this.persist();
  }

  // PUBLIC_INTERFACE
  /** Delete a note by ID. */
  deleteNote(id: string): void {
    const filtered = this.notesSubject.value.filter(n => n.id !== id);
    this.notesSubject.next(filtered);
    this.persist();
    // if currently selected, clear
    if (this.selectedIdSubject.value === id) {
      this.selectedIdSubject.next(null);
    }
  }

  // PUBLIC_INTERFACE
  /** Get a snapshot by ID. */
  getNoteSnapshot(id: string): Note | undefined {
    return this.notesSubject.value.find(n => n.id === id);
  }
}
