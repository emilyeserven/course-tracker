interface InfoAreaProps {
  header?: string;
  condition?: boolean;
  children?: React.ReactNode;
}

export function InfoArea({
  header, condition, children,
}: InfoAreaProps) {
  if (!condition) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {header && (
        <h6
          className="text-xs font-bold text-black/70 uppercase"
        >{header}
        </h6>
      )}
      {children}
    </div>
  );
}
