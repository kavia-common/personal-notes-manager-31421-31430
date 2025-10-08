export interface Note {
  id: string;
  title: string;
  content: string;
  pinned?: boolean;
  favorite?: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
