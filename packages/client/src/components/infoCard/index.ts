// Single import surface for the read-only info sections shared by entity view
// (`$id.index`) pages — labelled info areas/rows, the resource-links list, and
// the yes/no display. Aggregates components that live elsewhere; this only
// re-exports them so a view page pulls its info sections from one module.
export { YesNoDisplay } from "@/components/boxElements/YesNoDisplay";
export { InfoArea } from "@/components/layout/InfoArea";
export { InfoRow } from "@/components/layout/InfoRow";
export { ResourceLinksSection } from "@/components/layout/ResourceLinksSection";
