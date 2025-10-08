import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { NotesListComponent } from '../../components/notes-list/notes-list.component';
import { NoteEditorComponent } from '../../components/note-editor/note-editor.component';
import { NotesService } from '../../services/notes.service';
import { Observable } from 'rxjs';
import { Note } from '../../models/note.model';

/**
 * PUBLIC_INTERFACE
 * NotesLayoutComponent renders the main app shell with header, sidebar, and main editor outlet.
 * Integrates with NotesService for state and interactions.
 */
@Component({
  selector: 'app-notes-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, HeaderComponent, NotesListComponent, NoteEditorComponent],
  templateUrl: './notes-layout.component.html',
  styleUrls: ['./notes-layout.component.scss'],
})
export class NotesLayoutComponent {
  private svc = inject(NotesService);
  private router = inject(Router);

  notes$: Observable<Note[]> = this.svc.notes$;
  selectedNote$ = this.svc.selectedNote$;

  onSearch(term: string) {
    this.svc.setSearchTerm(term);
  }

  onSelect(id: string) {
    this.svc.selectNote(id);
    this.router.navigate(['/notes', id]);
  }

  onTogglePin(id: string) {
    const n = this.svc.getNoteSnapshot(id);
    this.svc.updateNote(id, { pinned: !n?.pinned });
  }

  private safeConfirm(message: string): boolean {
    try {
      const g: any = globalThis as any;
      if (g && typeof g.confirm === 'function') {
        return g.confirm(message);
      }
    } catch {
      // ignore
    }
    // Default to true in non-interactive environments (like SSR/prerender) to avoid blocking
    return true;
  }

  onDelete(id: string) {
    const n = this.svc.getNoteSnapshot(id);
    const title = n?.title ? `"${n.title}"` : 'this note';
    const ok = this.safeConfirm(`Delete ${title}? This action cannot be undone.`);
    if (ok) {
      this.svc.deleteNote(id);
      this.router.navigate(['/notes']);
    }
  }

  addNote() {
    this.router.navigate(['/notes', 'new']);
  }

  onEditorChange(patch: Partial<Note>) {
    const current = this.svc.getNoteSnapshot(this.svc['selectedIdSubject'].value as string);
    if (current) {
      this.svc.updateNote(current.id, patch);
    }
  }
}
