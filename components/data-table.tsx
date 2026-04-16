import { ReactNode, useState } from "react";
import { Button } from "./ui/button";

export interface Column<T> {
  label: string;
  accessor: (row: T) => any;
  render?: (value: any, row: T) => ReactNode;
}

interface props<T> {
  data: T[];
  columns: Column<T>[];
}

export function Table<T>({ data, columns }: props<T>) {
  const [sortBy, setSortBy] = useState<number | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const pageSize = 5;

  // SORT
  const sortedData = [...data].sort((a, b) => {
    if (sortBy === null) return 0;

    const aVal = columns[sortBy].accessor(a);
    const bVal = columns[sortBy].accessor(b);

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });

  // PAGINATION
  const paginatedData = sortedData.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="w-full bg-[#F2F3FF] rounded-2xl">
      <div className="flex justify-between items-center md:px-[28px] md:py-[20px] px-[24px] py-[16px] shadow-2xl">
        <h2 className="font-heading text-[#131B2E] font-medium">
          Recent Attempts
        </h2>
        <Button variant={"outline"} className="font-body text-[#3525CD]">
          VIEW ALL
        </Button>
      </div>
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full overflow-hidden">
          <thead className="bg-[#DAE2FD]">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  // onClick={() => {
                  //   if (sortBy === i) {
                  //     setOrder(order === "asc" ? "desc" : "asc");
                  //   } else {
                  //     setSortBy(i);
                  //     setOrder("asc");
                  //   }
                  //   setPage(1);
                  // }}
                  className="p-3 text-sm font-medium text-[#464555] font-heading text-center"
                >
                  {col.label}
                  {/* {sortBy === i ? (order === "asc" ? " 🔼" : " 🔽") : ""} */}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                {columns.map((col, i) => (
                  <td key={i} className="p-3 text-sm font-body text-center">
                    {col.render
                      ? col.render(col.accessor(row), row)
                      : col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden divide-y bg-white rounded-xl overflow-hidden">
        {paginatedData.map((row, idx) => (
          <div key={idx} className="p-3">
            {columns.map((col, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                {/* LABEL */}
                <span className="text-xs text-gray-400">{col.label}</span>

                {/* VALUE */}
                <span className="text-sm font-medium text-gray-800 text-right truncate max-w-[55%]">
                  {col.render
                    ? col.render(col.accessor(row), row)
                    : col.accessor(row)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex items-center justify-end gap-4 py-4 mx-4">
        <Button
          variant={"outline"}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
        >
          Prev
        </Button>

        <span className="text-xs font-body">Page {page}</span>

        <Button
          variant={"outline"}
          onClick={() =>
            setPage((p) => (p * pageSize < data.length ? p + 1 : p))
          }
          className="px-3 py-1 border rounded-md"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
