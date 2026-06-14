// Both the Daily and Resource public shapes expose the same optional
// `provider?: { name; id }` block. The source Drizzle row's `courseProvider`
// carries a nullable name (and, on resources, extra columns we ignore), so
// collapse it to the public shape only when both id and name are present —
// otherwise the provider is omitted. Shared so dailyProjection and
// resourceProjection stay in lockstep and each keeps one fewer inline branch.
export interface ProviderBlock {
  name: string;
  id: string;
}

export function toProviderBlock(
  courseProvider: { id: string;
    name: string | null; } | null | undefined,
): ProviderBlock | undefined {
  return courseProvider?.id && courseProvider?.name
    ? {
      name: courseProvider.name,
      id: courseProvider.id,
    }
    : undefined;
}
