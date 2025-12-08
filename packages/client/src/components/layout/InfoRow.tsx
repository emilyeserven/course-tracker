interface InfoRowProps {
  header?: string;
  condition?: boolean;
  children?: React.ReactNode;
}

export function InfoRow({
  header, condition = true, children,
}: InfoRowProps) {
  if (!condition) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {header && (<h6 className="mb-2 text-lg font-bold text-black/90 uppercase">{header}</h6>)}
      <div className="flex flex-row gap-8">
        {children}
      </div>
    </div>
  );
}
