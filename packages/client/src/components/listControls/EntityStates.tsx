import { Link } from "@tanstack/react-router";

interface EntityStateProps {
  /** Plural noun for the entity, e.g. "courses", "topics", "domains". */
  entity: string;
}

export function EntityPending({
  entity,
}: EntityStateProps) {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">
        Hold on, loading your
        {" "}
        {entity}
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
        There was an error loading your
        {" "}
        {entity}
        .
      </h1>
      <p>
        Try to use the
        {" "}
        <Link to="/onboard">Onboarding Wizard</Link>
        {" "}
        again, or load in properly formed
        {" "}
        {entity}
        {" "}
        data.
      </p>
    </div>
  );
}
