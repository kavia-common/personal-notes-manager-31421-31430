import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * PUBLIC_INTERFACE
 * NotesListRouteComponent renders an empty editor message when /notes route is active.
 */
@Component({
  standalone: true,
  selector: 'app-notes-list-route',
  imports: [CommonModule],
  template: `
    <div class="placeholder">
      <p>Select a note from the left, or create a new note.</p>
    </div>
  `,
  styles: [`
    .placeholder { 
      color: var(--muted); 
      padding: 2rem; 
      text-align: center; 
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: .75rem;
      min-height: calc(100vh - 170px);
      display: grid;
      place-items: center;
    }
  `]
})
export class NotesListRouteComponent {}
