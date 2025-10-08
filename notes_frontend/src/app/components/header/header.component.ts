import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * PUBLIC_INTERFACE
 * HeaderComponent renders the app title and a search input.
 * Emits search term changes to parent or can be bound to NotesService externally.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() title = 'Ocean Notes';
  @Input() placeholder = 'Search notes...';
  @Input() initialTerm = '';
  @Output() search = new EventEmitter<string>();

  term = '';

  ngOnInit() {
    this.term = this.initialTerm;
  }

  onInput() {
    this.search.emit(this.term);
  }
}
