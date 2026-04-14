import * as React from 'react';
import styles from './BillPaymentRepository.module.scss';
import { IBillPaymentRepositoryProps } from './IBillPaymentRepositoryProps';
import { Dropdown, Icon, IDropdownOption, Label } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { useEffect, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  useReactTable,
} from '@tanstack/react-table';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
const BillPaymentRepository: React.FC<IBillPaymentRepositoryProps> = (props) => {
  const [loading, setLoading] = React.useState(false);
  const service = new SharePointService(props.context);
  const [data, _setData] = useState<any[]>(() => []);
  const [user, setUser] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<any>([]);

  const columnHelper = createColumnHelper<any>()
  const columns = [
    columnHelper.accessor('LinkFilename', {
      header: () => 'File Name',
      cell: (info) => {
    const fileName = info.getValue();
    const fileUrl = info.row.original.FileRef;
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
        {fileName}
      </a>
    );
  }
    }),
    columnHelper.accessor('BillProcessingNumber', {
      header: 'Bill Processing Number'
    }),
  columnHelper.accessor('ProjectCode', {
      header: 'Project Code'
    })
  ]
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  const [form, setForm] = React.useState({
    FromDate: new Date(),
    ToDate: new Date()
  });
  // Load data
  React.useEffect(() => {
    getUser();
    getDatafromListByTitle();
  }, []);
  // Load the User Details
  const getUser = async () => {
    const data = await service.getUser();
    if (data.Id > 0) {
      setUser(data);
    }
  };
  const getVisibleColumns = () => {
    return table
      .getVisibleLeafColumns()
      .map(col => ({
        id: col.id,
        header:
          typeof col.columnDef.header === "function"
            ? col.columnDef.header // if JSX/function
            : col.columnDef.header
      }));
  };
  const getVisibleRows = () => {
    return table.getFilteredRowModel().rows;
  };
  const getExportData = () => {
    const columns = getVisibleColumns();
    const rows = getVisibleRows();

    return rows.map(row => {
      const obj: any = {};

      columns.forEach(col => {
        obj[col.id] = row.getValue(col.id);
      });

      return obj;
    });
  };
  const getDatafromListByTitle = async () => {
    try {
      setLoading(true);
      const data = await service.getItemByTitle();
      if (data) {
        _setData((d) => [...d.concat(data)]);
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred");
    }
    finally {
      setLoading(false);
    }
  };
  return (
    <section>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(255,255,255,0.6)',
          zIndex: 9999
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
            <Spinner label="Processing..." size={SpinnerSize.large} />
          </div>
        </div>
      )}
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Bill Payment Repository
            <span>Digiflow / Repository / Bill Payment Repository</span>
          </h2>
        </div>
        <div className="p-2">
          <div style={{ marginBottom: "10px", padding: "5px", textAlign: 'right' }}>
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
            />
          </div>
          <div className={styles['table-responsive']}>
            <Table striped bordered hover>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        {{
                          asc: <Icon iconName='ChevronUpMed' style={{ verticalAlign: "middle", marginLeft: "5px" }} />,
                          desc: <Icon iconName='ChevronDownMed' style={{ verticalAlign: "middle", marginLeft: "5px" }} />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* 📄 Pagination */}
          <div className="flex items-center gap-2">
            <span>
              Showing {table.getRowModel().rows.length.toLocaleString()} of{' '}
              {table.getRowCount().toLocaleString()} Rows
            </span>
            <div style={{ float: "right" }} className="flex items-center gap-2">
              <label>
                Go to page:
              </label>
              <label>
                <input
                  type="number"
                  min="1"
                  max={table.getPageCount()}
                  defaultValue={table.getState().pagination.pageIndex + 1}
                  onChange={(e) => {
                    const page = e.target.value ? Number(e.target.value) - 1 : 0
                    table.setPageIndex(page)
                  }}
                  className="border p-1 rounded w-16"
                />
              </label>
              <button
                className="border rounded p-1"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<<'}
              </button>
              <button
                className="border rounded p-1"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<'}
              </button>
              <button
                className="border rounded p-1"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>'}
              </button>
              <button
                className="border rounded p-1"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>>'}
              </button>
              <span>Page size</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
};
export default BillPaymentRepository;