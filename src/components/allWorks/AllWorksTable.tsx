import * as React from "react";
import { AllWork } from "../../reducers/allWorks";
import { bookDetailsHref, WorkColumn } from "../../utils/allWorks";
import AllWorksColumnHeader, {
  ColumnHeaderProps,
} from "./AllWorksColumnHeader";

interface TableProps extends Omit<ColumnHeaderProps, "column"> {
  library: string;
  columns: WorkColumn[];
  renderListAction: (work: AllWork) => React.ReactNode;
}

export default function AllWorksTable({
  library,
  columns,
  renderListAction,
  ...props
}: TableProps) {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          {columns.map((column) => (
            <AllWorksColumnHeader key={column.key} {...props} column={column} />
          ))}
          <th>Listat</th>
        </tr>
      </thead>
      <tbody>
        {props.rows.map((work) => {
          const detailsHref = bookDetailsHref(library, work.admin_url);
          return (
            <tr key={work.id}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={
                    column.key === "author"
                      ? "all-works-author-cell"
                      : undefined
                  }
                >
                  {column.key === "title" && detailsHref ? (
                    <a href={detailsHref}>{work.title}</a>
                  ) : (
                    column.formatValue(work)
                  )}
                </td>
              ))}
              <td>{renderListAction(work)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
