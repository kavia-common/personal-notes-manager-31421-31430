import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { Note } from '../../models/note.model';

/**
 * PUBLIC_INTERFACE
 * NoteEditorComponent shows inputs for title and content, and emits debounced updates.
 */
@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss'],
})
export class NoteEditorComponent implements OnChanges, OnDestroy {
  @Input() note: Note | null = null;
  @Output() change = new EventEmitter<Partial<Note>>();

  localTitle = '';
  localContent = '';

  private title$ = new Subject<string>();
  private content$ = new Subject<string>();
  private sub = new Subscription();

  constructor() {
    this.sub.add(
      this.title$.pipe(debounceTime(500)).subscribe(v => this.change.emit({ title: v }))
    );
    this.sub.add(
      this.content$.pipe(debounceTime(500)).subscribe(v => this.change.emit({ content: v }))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['note']) {
      this.localTitle = this.note?.title ?? '';
      this.localContent = this.note?.content ?? '';
    }
  }

  onTitleInput() {
    this.title$.next(this.localTitle);
  }

  onContentInput() {
    this.content$.next(this.localContent);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
