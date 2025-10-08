import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../../models/note.model';

/**
 * PUBLIC_INTERFACE
 * NotesListComponent renders a list of notes with pin and delete actions.
 * Emits select, pinToggle, delete events.
 */
@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
})
export class NotesListComponent {
  @Input() notes: Note[] = [];
  @Input() selectedId: string | null = null;
  @Output() select = new EventEmitter<string>();
  @Output() togglePin = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  trackById = (_: number, n: Note) => n.id;
}
