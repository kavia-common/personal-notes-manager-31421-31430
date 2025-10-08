import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NoteEditorComponent } from '../../components/note-editor/note-editor.component';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';

/**
 * PUBLIC_INTERFACE
 * NoteEditorRouteComponent renders NoteEditorComponent for the resolved note id.
 */
@Component({
  standalone: true,
  selector: 'app-note-editor-route',
  imports: [CommonModule, NoteEditorComponent],
  template: `
    <app-note-editor
      [note]="note"
      (change)="onChange($event)">
    </app-note-editor>
  `
})
export class NoteEditorRouteComponent {
  private route = inject(ActivatedRoute);
  private svc = inject(NotesService);
  note: Note | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.svc.selectNote(id);
      this.note = this.svc.getNoteSnapshot(id) ?? null;
    }
  }

  onChange(patch: Partial<Note>) {
    if (!this.note) return;
    this.svc.updateNote(this.note.id, patch);
    this.note = this.svc.getNoteSnapshot(this.note.id) ?? this.note;
  }
}
