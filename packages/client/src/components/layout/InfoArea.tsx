interface InfoAreaProps {
  header?: string;
  condition?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function InfoArea({
  header, condition = true, children,
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
