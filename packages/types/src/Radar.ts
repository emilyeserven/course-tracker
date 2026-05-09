export interface RadarConfigEntry {
  id: string;
  name: string;
  position: number;
  isAdopted?: boolean;
}

export type RadarQuadrant = RadarConfigEntry;
export type RadarRing = RadarConfigEntry;

export interface RadarBlip {
  id: string;
  domainId: string;
  quadrantId: string | null;
  ringId: string | null;
  topicId: string;
  topicName: string;
  description?: string | null;
}

export interface Radar {
  domainId: string;
  domainTitle: string;
  hasAdoptedSection?: boolean;
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  blips: RadarBlip[];
}
