import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  /**
   * Extra per-column metadata.
   *
   * label is what the column-visibility menu shows: the column id is a data key, which reads
   * badly in a menu, and the header can be a React node rather than text.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string
  }
}
