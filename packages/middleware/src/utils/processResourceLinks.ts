import { TopicsToResources } from "@emstack/types";

interface NamedRef {
  id: string;
  name: string;
}

/**
 * Project a topics<->resources junction array into a flat list of `{id, name}`
 * pairs from one side of the relation. Rows whose chosen side is null are
 * dropped.
 */
export function processResourceLinks(
  ttc: TopicsToResources[] | null | undefined,
  side: "resource" | "topic",
): NamedRef[] {
  if (!ttc || ttc.length === 0) return [];
  const out: NamedRef[] = [];
  for (const link of ttc) {
    const ref = link[side];
    if (ref?.id && ref.name) {
      out.push({
        id: ref.id,
        name: ref.name,
      });
    }
  }
  return out;
}
