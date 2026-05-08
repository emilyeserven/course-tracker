export interface RadarQuadrant {
  id: string;
  domainId: string;
  name: string;
  position: number;
}

export interface RadarRing {
  id: string;
  domainId: string;
  name: string;
  position: number;
}

export interface RadarBlip {
  id: string;
  domainId: string;
  quadrantId: string;
  ringId: string;
  name: string;
  description?: string | null;
}

export interface Radar {
  domainId: string;
  domainTitle: string;
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  blips: RadarBlip[];
}
