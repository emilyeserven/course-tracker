interface EntityStateProps {
  /** Plural noun for the entity, e.g. "tasks", "routines". */
  entity: string;
}

export function EntityPending({
  entity,
}: EntityStateProps) {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">
        Hold on, loading your {entity}
        ...
      </h1>
    </div>
  );
}

export function EntityError({
  entity,
}: EntityStateProps) {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">
        There was an error loading your {entity}.
      </h1>
      <p>
        Try reloading the page, or check that your {entity} data loaded
        properly.
      </p>
    </div>
  );
}
