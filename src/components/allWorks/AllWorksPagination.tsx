import * as React from "react";
import { AllWorksData } from "../../reducers/allWorks";

interface PaginationProps {
  data: AllWorksData;
  isFetching: boolean;
  position: "top" | "bottom";
  onPage: (offset: number) => void;
}

export default function AllWorksPagination({
  data,
  isFetching,
  position,
  onPage,
}: PaginationProps) {
  if (!data || data.limit <= 0) return null;
  const page = Math.floor(data.offset / data.limit) + 1;
  const pageCount = Math.max(1, Math.ceil(data.total / data.limit));
  if (pageCount <= 1) return null;
  return (
    <nav
      className={`all-works-pagination all-works-pagination-${position}`}
      aria-label="Pagination"
    >
      <button
        type="button"
        className="btn btn-default"
        disabled={page <= 1 || isFetching}
        onClick={() => onPage(data.offset - data.limit)}
      >
        Edellinen
      </button>
      <span aria-live="polite">
        Sivu {page} / {pageCount}
      </span>
      <button
        type="button"
        className="btn btn-default"
        disabled={!data.has_more || isFetching}
        onClick={() => onPage(data.offset + data.limit)}
      >
        Seuraava
      </button>
    </nav>
  );
}
