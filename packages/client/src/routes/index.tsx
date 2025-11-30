import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { fetchDbTest, fetchTest } from "@/utils/fetchFunctions";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["test"],
    queryFn: () => fetchTest(),
  });

  const {
    isPending: dbPending, error: dbError, data: dbData,
  } = useQuery({
    queryKey: ["dbtest"],
    queryFn: () => fetchDbTest(),
  });
  return (
    <div
      className={`
        bg-white p-2 text-black
        dark:bg-gray-800 dark:text-white
      `}
    >
      <h3 className="text-3xl font-bold">Welcome Home!</h3>

      <p data-testid="status-message">
        Test data is{" "}
        {isPending && "Pending"}
        {error && "Erroring"}
        {data && "loaded!"}
      </p>
      {data && data.item}
      <p data-testid="status-message-db">
        Test DB data is{" "}
        {dbPending && "Pending"}
        {dbError && "Erroring"}
        {dbData && "loaded!"}
      </p>
      {dbData && <span>Sample name (should be &#34;John&#34;): {dbData[0].name}</span>}
    </div>
  );
}
