import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { NotesService } from '../services/notes.service';
import { Note } from '../models/note.model';

/**
 * PUBLIC_INTERFACE
 * Resolves a Note for routes with param id.
 * - If id === 'new', creates a new note and redirects to its id.
 * - If not found, redirects to /notes.
 * - Returns the found note when available.
 */
export const noteResolver: ResolveFn<Note | null> = (route, state) => {
  const svc = inject(NotesService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    router.navigate(['/notes']);
    return null;
  }

  if (id === 'new') {
    const created = svc.createNote();
    router.navigate(['/notes', created.id], { replaceUrl: true });
    return created;
  }

  const snap = svc.getNoteSnapshot(id);
  if (!snap) {
    router.navigate(['/notes']);
    return null;
  }
  return snap;
};
