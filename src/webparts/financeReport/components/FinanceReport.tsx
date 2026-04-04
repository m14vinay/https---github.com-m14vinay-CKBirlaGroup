import * as React from 'react';
import styles from './FinanceReport.module.scss';
import { IFinanceReportProps } from './IFinanceReportProps';
import { Dropdown, Icon, IDropdownOption, Label } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { useEffect, useState } from 'react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
const FinanceReport: React.FC<IFinanceReportProps> = (props) => {
  const [loading, setLoading] = React.useState(false);
  const service = new SharePointService(props.context);
  const [data, _setData] = useState<any[]>(() => []);
  const [user, setUser] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<any>([]);

  const columnHelper = createColumnHelper<any>()
  const columns = [
    columnHelper.accessor('ID', {
      header: () => 'Req No.'
    }),    
    columnHelper.accessor('ProjectTitle', {
      header: () => 'Project Title'
    }),
    columnHelper.accessor('Title', {
      header: () => 'Project Ref No.'
    }),
    columnHelper.accessor('Department', {
      header: 'Department'
    }),
    columnHelper.accessor('Description', {
      header: 'Description'
    }),
    columnHelper.accessor('Status', {
      header: 'Status'
    }),
    columnHelper.accessor(row => user?.Title, {
      header: 'Submitted Date'
    }),
    columnHelper.accessor(row => user?.Title, {
      header: 'Approved Date'
    }),
    columnHelper.accessor(row => user?.Title, {
      header: 'Project Code'
    }),
    columnHelper.accessor(row => user?.Title, {
      header: 'Approval Path'
    }),
    columnHelper.accessor(row => user?.Title, {
      header: 'Approved Pending On'
    }),
    columnHelper.accessor('BillAmount', {
      header: 'Approval Pending Date'
    }),
    columnHelper.accessor(row => user?.Title, {
      header: 'Vendor Req No.'
    }),
    columnHelper.accessor(row => user?.Title, {
      header: 'Vendor Code'
    }),
    columnHelper.accessor(row => user?.Title, {
      header: 'Vendor Name'
    }),
    columnHelper.accessor(row => user?.Title, {
      header: 'PO Request No.'
    }),
    columnHelper.accessor(row => user?.Title, {
      header: 'Requestor Name'
    }),
    columnHelper.accessor(row => user?.Title, {
      header: 'Bill Amount'
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
        ToDate:new Date()
    });
  // Load data
  React.useEffect(() => {
    getUser();
  }, []);
  // Load the User Details
  const getUser = async () => {
    const data = await service.getUser();
    if (data.Id > 0) {
      setUser(data);
    }
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "BillDate" ? new Date(value) : value
    });
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
    const handleExcel = async () => {
      try{
    setLoading(true);
    const data = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });
    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
    });
    saveAs(blob, "Data.xlsx");
  }
  catch
  {
  
  }
  finally
  {
    setLoading(false);
  }
    };
    const handleCSV = async () => {
      const data = getExportData();
      const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers
        .map(field => {
          let value = row[field] ?? "";
          value = String(value).replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    };
  const handlesearch = async () => {
    _setData([]);
    await getDatafromListByTitle();
  };
  const getDatafromListByTitle = async () => {
    try {
      setLoading(true);
      const data = await service.getItemByTitle(form.FromDate.toString(),form.ToDate.toString());
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Finance Report
          <span>Digiflow / AP Report / Finance Report</span>
        </h2>
      </div>
       <div className={styles.searchBox}>        
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles['col-md-4']}>
              <label>From Date</label>
            </div>
            <div className={styles['col-md-8']}>
              <input
            name="FromDate"
            type="date"
            value={
              form.FromDate
                ? new Date(form.FromDate).toISOString().split('T')[0]
                : ''
            }
            style={{width:"100%"}}
            onChange={handleDateChange}
          />
            </div>
            <div className={styles['col-md-4']} style={{paddingTop:"10px"}}>
              <label>To Date</label>
            </div>
            <div className={styles['col-md-8']} style={{paddingTop:"10px"}}>              
               <input
            name="ToDate"
            type="date" 
            value={
              form.ToDate
                ? new Date(form.ToDate).toISOString().split('T')[0]
                : '' 
            }
            onChange={handleDateChange}
            style={{width:"100%"}}
          />
            </div>        
            <div className={styles['col-md-12']} style={{ paddingTop:"10px",textAlign:"right",alignItems: "flex-end", justifyContent: "flex-end" }}>
              <button className={styles.btnSearch} onClick={handlesearch}>Search</button>
            </div>
            <div className={styles['col-md-6']} style={{ width:"22%",paddingTop:"10px", alignItems: "flex-end", justifyContent: "flex-end" }}>
              <button className={styles.btnSearch} onClick={handleExcel}>Export to Excel</button>
            </div>
            <div className={styles['col-md-6']} style={{paddingTop:"10px", alignItems: "flex-end", justifyContent: "flex-end" }}>
              <button className={styles.btnSearch} onClick={handleCSV}>Export to CSV</button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-2">
        <div>         
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            style={{ marginBottom: "10px", padding: "5px", float: "right" }}
          />
        </div>
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
  );
};
export default FinanceReport;