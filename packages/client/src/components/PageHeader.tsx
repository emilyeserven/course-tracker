import { Link } from "@tanstack/react-router";

interface PageHeaderProps {
  pageTitle?: string;
  pageSection?: "" | "courses" | "topics";
  children?: React.ReactNode;
}

export function PageHeader({
  pageTitle = "",
  pageSection = "",
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-8 bg-gray-200 py-4">
      <div className="container">
        <div className="flex w-full flex-col items-start gap-1">
          {pageSection && (
            <div className="flex flex-row gap-3">
              {pageSection === "courses" && (
                <Link
                  to="/courses"
                  className="text-sm uppercase"
                >
                  Courses
                </Link>
              )}
              {pageSection === "topics" && (
                <Link
                  to="/topics"
                  className="text-sm uppercase"
                >
                  Topics
                </Link>
              )}
            </div>
          )}
          <div
            className="m-auto flex w-full flex-row items-start justify-between"
          >
            <div>
              <h1 className="text-3xl">{pageTitle}</h1>
            </div>
            {children && (
              <div>
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
