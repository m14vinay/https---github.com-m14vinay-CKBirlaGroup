import * as React from 'react';
import styles from './SummaryReport.module.scss';
import { ISummaryReportProps } from './ISummaryReportProps';
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
const SummaryReport: React.FC<ISummaryReportProps> = (props) => {
  const [loading, setLoading] = React.useState(false);
  const service = new SharePointService(props.context);
  const [data, _setData] = useState<any[]>(() => []);
  const [user, setUser] = useState<any>(null);
  const [isActiveQA, setIsActiveQA] = React.useState(false);
  const [isActivePO, setIsActivePO] = React.useState(false);
  const [isActiveVM, setIsActiveVM] = React.useState(false);
  const [isActiveBP, setIsActiveBP] = React.useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<any>([]);
  const [Label, setLabel] = useState("");
  const columnHelper = createColumnHelper<any>();
  const [columns, setColumns] = React.useState<any[]>([]);
  
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
  // Load data
  React.useEffect(() => {
    getUser();
    _setData(data);
    setColumns(columns); 
    handleQuotation();
  }, []);
  // Load the User Details
  const getUser = async () => {
    const data = await service.getUser();
    if (data.Id > 0) {
      setUser(data);
    }
  };
  const handleQuotation = async () => {
    _setData([]);
    setLabel('Quotation Approval');
    setIsActiveQA(true);
    setIsActiveBP(false);
    setIsActivePO(false);
    setIsActiveVM(false);
    const setDynamicColumns =[
    columnHelper.accessor('RequestNo', {
      header: "Request No"
    }),
    columnHelper.accessor('ProjectReffNo', {
      header: "Description"
    }),
    columnHelper.accessor('ProjectTitle', {
      header: "Project Title"
    }),
    columnHelper.accessor('ProjectDescription', {
      header: "Project Description"
    }),
    columnHelper.accessor('Department', {
      header: "Department"
    }),
    columnHelper.accessor('Status', {
      header: "Status"
    }),
    columnHelper.accessor('ApprovalPath', {
      header: "Approval Path"
    })
  ]
   setColumns(setDynamicColumns);
    await getDatafromListByTitle('QuotationApproval');
  };
  const handleVendor = async () => {
    _setData([]);
    setLabel('Vendor Mapping');
    setIsActiveQA(false);
    setIsActiveBP(false);
    setIsActivePO(false);
    setIsActiveVM(true);
    const setDynamicColumns = [
    columnHelper.accessor('ProjectCode', {
      header: "Project Code"
    }),
    columnHelper.accessor('ProjectReffNo', {
      header: "Description"
    }),
    columnHelper.accessor('ProjectTitle', {
      header: "Project Title"
    }),
    columnHelper.accessor('ProjectDescription', {
      header: "Project Description"
    }),
    columnHelper.accessor('Department', {
      header: "Department"
    }),
    columnHelper.accessor('Vendorcode', {
      header: "Vendor Code"
    }),
    columnHelper.accessor('VendorName', {
      header: "Vendor Name"
    }),
    columnHelper.accessor('CurrentStatus', {
      header: "Status"
    }),
    columnHelper.accessor('RequestNo', {
      header: "Request No"
    })
  ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('VendorMapping');
  };
  const handlePO = async () => {
    _setData([]);
    setLabel('PO Approval');
    setIsActiveQA(false);
    setIsActiveBP(false);
    setIsActivePO(true);
    setIsActiveVM(false);
    const setDynamicColumns = [
    columnHelper.accessor('ProjectCode', {
      header: "Project Code"
    }),
    columnHelper.accessor('ProjectDescription', {
      header: "Description"
    }),
    columnHelper.accessor('Department', {
      header: "Department"
    }),
    columnHelper.accessor('VendorName', {
      header: "Vendor Name"
    }),
    columnHelper.accessor('CurrentStatus', {
      header: "Status"
    }),
    columnHelper.accessor('RequestNo', {
      header: "Request No"
    })
  ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('PoApproval');
  };
  const handleBill = async () => {
    _setData([]);
     setLabel('Bill Processing');
    setIsActiveQA(false);
    setIsActiveBP(true);
    setIsActivePO(false);
    setIsActiveVM(false);
const setDynamicColumns = [
    columnHelper.accessor('ProjectCode', {
      header: "Project Code"
    }),
    columnHelper.accessor('ProjectDescription', {
  header: "Description",
  cell: info => (
    <div
      dangerouslySetInnerHTML={{
        __html: info.getValue()
      }}
    />
  )
}),
    columnHelper.accessor('ProjectTitle', {
      header: "Project Title"
    }),
    columnHelper.accessor('Vendorcode', {
      header: "Vendor Code"
    }),
    columnHelper.accessor('VendorName', {
      header: "Vendor Name"
    }),
    columnHelper.accessor('CurrentStatus', {
      header: "Status"
    }),
    columnHelper.accessor('RequestNo', {
      header: "Request No"
    })
  ]
   setColumns(setDynamicColumns);
    await getDatafromListByTitle('BillProcessing');
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
  const getDatafromListByTitle = async (listname:string) => {
    try {
      setLoading(true);
      const data = await service.getItemByTitle(listname);
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
        <h2>Summary Report
          <span>Digiflow / AP Report / Summary Report</span>
        </h2>
      </div>
      <div className={styles.searchBox}>        
        <div className={styles.container}>
          <div className={styles.row}>            
            <div className={styles['col-md-3']}>
             <button className={styles.btnSearch} style={{width:"100%",backgroundColor:isActiveQA?"red":"grey"}} onClick={handleQuotation}>Quotation Approval</button>
            </div>  
            <div className={styles['col-md-3']}>
             <button className={styles.btnSearch} style={{width:"100%",backgroundColor:isActiveVM?"red":"grey"}} onClick={handleVendor}>Vendor Mapping</button>
            </div>  
            <div className={styles['col-md-3']} >
             <button className={styles.btnSearch} style={{width:"100%",backgroundColor:isActivePO?"red":"grey"}} onClick={handlePO}>PO Approval</button>
            </div>  
            <div className={styles['col-md-3']}>
             <button className={styles.btnSearch} style={{width:"100%",backgroundColor:isActiveBP?"red":"grey"}} onClick={handleBill}>Bill Processing</button>
            </div>                
            <div style={{paddingBottom:"5%"}}></div>
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
          <span style={{ display: "inline-block" }}>{Label}</span>
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
export default SummaryReport;