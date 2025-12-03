import React from "react";
import { ArrowUpDown } from "lucide-react";
import Spinner from "./Spinner";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyText?: string;
  loading?: boolean;
  toolbar?: React.ReactNode;
  dense?: boolean;
  getRowIcon?: (row: T) => React.ReactNode;
  getRowActions?: (row: T) => React.ReactNode;
}

export default function DataTable<T extends { id: number }>(
  { data, columns, emptyText = 'Sin registros', loading = false, toolbar, dense = false, getRowIcon, getRowActions }: DataTableProps<T>
) {
  const cellPadding = dense ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className="w-full">
      {toolbar && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {toolbar}
        </div>
      )}

      <div className="overflow-hidden rounded-xl ring-1 ring-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-gray-600">
              <tr className="bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                {getRowIcon && (
                  <th className={`${cellPadding} w-10`}></th>
                )}
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`${cellPadding} font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    style={{ width: col.width }}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>{col.header}</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  </th>
                ))}
                {getRowActions && (
                  <th className={`${cellPadding} text-center w-32`}>Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (getRowIcon ? 1 : 0) +
                      (getRowActions ? 1 : 0)
                    }
                    className="py-10 text-center"
                  >
                    <div className="flex justify-center items-center gap-3 text-gray-500">
                      <Spinner size="sm" black />
                    </div>
                  </td>
                </tr>
              )}


              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 text-gray-300">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                      </svg>
                      <div className="text-sm">{emptyText}</div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && data.map((row, rIdx) => (
                <tr
                  key={row.id}
                  className={`transition-colors ${rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-blue-50/40`}
                >
                  {getRowIcon && (
                    <td className={`${cellPadding} text-center`}>{getRowIcon(row)}</td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`${cellPadding} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} whitespace-nowrap`}
                    >
                      {col.render
                        ? col.render(row)
                        : (() => {
                          const value = (row as any)[col.key];
                          if (value === null || value === undefined) return "—";
                          if (typeof value === "object") {
                            return value.nombre ?? JSON.stringify(value);
                          }
                          return String(value);
                        })()
                      }
                    </td>
                  ))}
                  {getRowActions && (
                    <td className={`${cellPadding} text-right`}>{getRowActions(row)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

