export type SpatialSection = 'overview' | 'work' | 'philosophy' | 'archive' | 'contact';

export type SculptureForm = 'metaball' | 'wireframe' | 'constellation';

export interface SpatialWorkItem {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  discipline: string;
  year: string;
  client: string;
  description: string;
  conceptNotes: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  position3D: [number, number, number];
  rotation3D: [number, number, number];
}

export interface PhilosophyPillar {
  index: string;
  title: string;
  italicLead: string;
  body: string;
}

export interface ArchiveEntry {
  index: string;
  title: string;
  medium: string;
  year: string;
  note: string;
}
