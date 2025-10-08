import { Routes } from '@angular/router';
import { NotesLayoutComponent } from './pages/notes-layout/notes-layout.component';
import { NotesListRouteComponent } from './pages/notes-layout/notes-list-route.component';
import { NoteEditorRouteComponent } from './pages/notes-layout/note-editor-route.component';
import { noteResolver } from './resolvers/note.resolver';

export const routes: Routes = [
  {
    path: '',
    component: NotesLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'notes' },
      { path: 'notes', component: NotesListRouteComponent },
      {
        path: 'notes/:id',
        component: NoteEditorRouteComponent,
        resolve: { note: noteResolver }
      },
    ],
  },
  { path: '**', redirectTo: '' }
];
