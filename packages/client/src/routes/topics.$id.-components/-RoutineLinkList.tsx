import type { Routine } from "@emstack/types";

import { Link } from "@tanstack/react-router";

/** Bulleted list of links to the routines connected to a topic. */
export function RoutineLinkList({
  routines,
}: { routines: Routine[] }) {
  return (
    <ul className="ml-5 list-disc">
      {routines.map(r => (
        <li key={r.id}>
          <Link
            to="/routines/$id"
            params={{
              id: r.id,
            }}
            className={`
              font-bold text-blue-800
              hover:text-blue-600
            `}
          >
            {r.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
