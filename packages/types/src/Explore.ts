// Data for the "Explore Something" dashboard card. An "item" is a topic placed
// on some domain's radar (a non-ignored radar blip). Because rings are defined
// per-domain in each domain's radarConfig, a blip's ring is resolved to its
// human-readable name so the card can match a ring (e.g. "Trial") across
// domains by name.
export interface ExploreItem {
  topicId: string;
  topicName: string;
  domainId: string;
  domainTitle: string;
  // Resolved ring name (null when the blip has no ring assigned, or its ringId
  // no longer matches a ring in the domain's config).
  ringName: string | null;
  // Blip reasoning if present, else the topic's own description; null when
  // neither is set.
  description: string | null;
}

// Response shape for GET /api/domains/explore.
export interface ExploreData {
  // Distinct ring names across all domains, used to populate the card's ring
  // selector.
  rings: string[];
  items: ExploreItem[];
}
