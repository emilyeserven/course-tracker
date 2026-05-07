interface DescriptionProps {
  description?: string | null;
  emptyText?: string;
}

export function Description({
  description,
  emptyText = "No description provided.",
}: DescriptionProps) {
  return <p>{description ? description : <i>{emptyText}</i>}</p>;
}
