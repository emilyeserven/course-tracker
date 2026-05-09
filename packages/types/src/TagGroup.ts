import type { Tag } from "./Tag";

export interface TagGroup {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  position?: number | null;
  tags?: Tag[];
}
