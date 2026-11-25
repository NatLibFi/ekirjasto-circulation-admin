import * as React from "react";
import { isSortableKey, SortDirection, SortKey } from "../../utils/allWorks";
import AllWorksColumnFilter, {
  ColumnFilterProps,
} from "./AllWorksColumnFilter";

export interface ColumnHeaderProps extends ColumnFilterProps {
  sort: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}

export default function AllWorksColumnHeader(props: ColumnHeaderProps) {
  const { column, sort, direction, onSort } = props;
  const sortKey = isSortableKey(column.key) ? column.key : null;
  const active = sort === column.key;
  return (
    <th
      aria-sort={
        active ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <div className="all-works-column-heading">
        <div className="all-works-column-title-row">
          <span className="all-works-column-title">{column.label}</span>
          {sortKey !== null && (
            <button
              type="button"
              aria-label={`Lajittele: ${column.label}`}
              aria-pressed={active}
              className={`all-works-sort-button${active ? " active" : ""}`}
              onClick={() => onSort(sortKey)}
            >
              ⇅
            </button>
          )}
        </div>
        <div className="all-works-column-filter">
          <AllWorksColumnFilter {...props} />
        </div>
      </div>
    </th>
  );
}
