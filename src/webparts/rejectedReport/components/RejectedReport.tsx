import * as React from 'react';
import styles from './RejectedReport.module.scss';
import { IRejectedReportProps } from './IRejectedReportProps';
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
const RejectedReport: React.FC<IRejectedReportProps> = (props) => {
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
  const stripHtml = (html: string) => {
           const temp = document.createElement("div");
           temp.innerHTML = html;
           return temp.textContent || temp.innerText || "";
       };
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
    setLoading(true);
    _setData([]);
    setLabel('Quotation Approval');
    setIsActiveQA(true);
    setIsActiveBP(false);
    setIsActivePO(false);
    setIsActiveVM(false);
    const setDynamicColumns = [
      columnHelper.accessor('RequestNo', {
        header: "Request No"
      }),
      columnHelper.accessor('ProjectTitle', {
        header: "Project Title"
      }),
      columnHelper.accessor('ProjectDescription', {
         header: 'Project Description',
         cell: info => (
                   <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                       {stripHtml(info.getValue())}
                   </div>
               )
       }),
      columnHelper.accessor('Department', {
        header: "Department"
      }),
      columnHelper.accessor('CurrentStatus', {
        header: "Current Status"
      }),
      columnHelper.accessor('ApprovalPath', {
        header: "Approval Path"
      }),
       columnHelper.accessor('ApproverComment1', {
        header: "Approver Comment 1"
      }),
       columnHelper.accessor('ApproverComment2', {
        header: "Approver Comment 2"
      }),
       columnHelper.accessor('ApproverComment3', {
        header: "Approver Comment 3"
      }),
      columnHelper.accessor(row => row.Approval1?.Title,
     {
       id: 'Approval1',
       header: 'Approver 1'
     }),
     columnHelper.accessor(row => row.Approval2?.Title,
     {
       id: 'Approval2',
       header: 'Approver 2'
     }),
     columnHelper.accessor(row => row.Approval3?.Title,
     {
       id: 'Approval3',
       header: 'Approver 3'
     }),
     columnHelper.accessor('Modified', {
         header: 'Modified Date',
         cell: (info) => <span>{new Date(info.row.original.Modified).toLocaleDateString()}</span>
       }),
       columnHelper.accessor('Advancepayment', {
        header: "Advance Payment"
      }),
       columnHelper.accessor('ActionDate1', {
        header: "Action Date 1"
      }),
      columnHelper.accessor('ActionDate2', {
        header: "Action Date 2"
      }),
      columnHelper.accessor('ActionDate3', {
        header: "Action Date 3"
      }),
      columnHelper.accessor('ApprovalPath', {
        header: "Approval Path"
      }),
      columnHelper.accessor('Vendor1', {
        header: "Vendor 1"
      }),
      columnHelper.accessor('Vendor2', {
        header: "Vendor 2"
      }),
      columnHelper.accessor('Vendor3', {
        header: "Vendor 3"
      }),
      columnHelper.accessor('Quote1', {
        header: "Quote 1"
      }),
      columnHelper.accessor('Quote2', {
        header: "Quote 2"
      }),
      columnHelper.accessor('Quote3', {
        header: "Quote 3"
      }),
      columnHelper.accessor('Selectedvendor', {
        header: "Selected Vendor"
      }),
      columnHelper.accessor('Created', {
         header: 'Created Date',
         cell: (info) => <span>{new Date(info.row.original.Created).toLocaleDateString()}</span>
       }),
       columnHelper.accessor('SelectedQuote', {
        header: "Selected Quote"
      }),
      columnHelper.accessor(row => row.Author?.Title,
     {
       id: 'Author',
       header: 'Created By'
     }),
     columnHelper.accessor(row => row.Editor?.Title,
     {
       id: 'Editor',
       header: 'Modified By'
     }),
     columnHelper.accessor('TotalProjectAmount', {
        header: "Total Project Amount"
      }),
      columnHelper.accessor('ApplicableTaxes', {
        header: "Applicable Taxes"
      }),
      columnHelper.accessor('AssignedTo', {
        header: "Assigned To"
      }),
    ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('QuotationApproval');
    setLoading(false);
  };
  const handleVendor = async () => {
    setLoading(true);
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
      columnHelper.accessor('RequestNo', {
        header: "Request No"
      }),
      columnHelper.accessor('ProjectTitle', {
        header: "Project Title"
      }),
      columnHelper.accessor('Created', {
         header: 'Created Date',
         cell: (info) => <span>{new Date(info.row.original.Created).toLocaleDateString()}</span>
       }),
      columnHelper.accessor('ProjectDescription', {
         header: 'Project Description',
         cell: info => (
                   <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                       {stripHtml(info.getValue())}
                   </div>
               )
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
      columnHelper.accessor('VendorDescription', {
        header: "Vendor Description",
        cell: info => (
                   <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                       {stripHtml(info.getValue())}
                   </div>
               )
      }),
      columnHelper.accessor('AssignedTo', {
        header: "Assigned To"
      }),
      columnHelper.accessor('ApproverComment', {
        header: "Approver Comment"
      }),
      columnHelper.accessor('ApproverComment1', {
        header: "Approver Comment 1"
      }),
      columnHelper.accessor('ApproverComment2', {
        header: "Approver Comment 2"
      }),
      columnHelper.accessor('Actiondate1', {
        header: "Action Date 1"
      }),
      columnHelper.accessor('Modified', {
         header: 'Modified Date',
         cell: (info) => <span>{new Date(info.row.original.Modified).toLocaleDateString()}</span>
       }),
       columnHelper.accessor(row => row.Author?.Title,
     {
       id: 'Author',
       header: 'Created By'
     }),
     columnHelper.accessor(row => row.Editor?.Title,
     {
       id: 'Editor',
       header: 'Modified By'
     })
    ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('VendorMapping');
    setLoading(false);
  };
  const handlePO = async () => {
    setLoading(true);
    _setData([]);
    setLabel('PO Approval');
    setIsActiveQA(false);
    setIsActiveBP(false);
    setIsActivePO(true);
    setIsActiveVM(false);
    const setDynamicColumns = [
      columnHelper.accessor('RequestNo', {
        header: "Request No"
      }),
      columnHelper.accessor('ProjectCode', {
        header: "Project Code"
      }),
      columnHelper.accessor('Department', {
        header: "Department"
      }),
      columnHelper.accessor('ProjectTitle', {
        header: "Project Title"
      }),
      columnHelper.accessor('Created', {
         header: 'Created Date',
         cell: (info) => <span>{new Date(info.row.original.Created).toLocaleDateString()}</span>
       }),
      columnHelper.accessor('VendorName', {
        header: "Vendor Name"
      }),
      columnHelper.accessor('CurrentStatus', {
        header: "Status"
      }),
      columnHelper.accessor('PODescription', {
         header: 'PO Description',
         cell: info => (
                   <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                       {stripHtml(info.getValue())}
                   </div>
               )
       }),
       columnHelper.accessor('ProjectDescription', {
         header: 'Project Description',
         cell: info => (
                   <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                       {stripHtml(info.getValue())}
                   </div>
               )
       }),
      columnHelper.accessor('AssignedTo', {
         header: 'Assigned To'
       }),    
       columnHelper.accessor('ApproverComment1', {
        header: "Approver Comment 1"
      }),
      columnHelper.accessor('ApproverComment2', {
        header: "Approver Comment 2"
      }),
      columnHelper.accessor('ActionDate1', {
        header: "Action Date 1"
      }),
      columnHelper.accessor('ActionDate2', {
        header: "Action Date 2"
      }),
      columnHelper.accessor(row => row.DepartmentHead?.Title,
     {
       id: 'DepartmentHead',
       header: 'Department Head'
     }), 
     columnHelper.accessor(row => row.Approver2?.Title,
     {
       id: 'Approver2',
       header: 'Approver 2'
     }), 
     columnHelper.accessor('POCategory', {
        header: "PO Category"
      }),
      columnHelper.accessor('Modified', {
         header: 'Modified Date',
         cell: (info) => <span>{new Date(info.row.original.Modified).toLocaleDateString()}</span>
       }),
      columnHelper.accessor(row => row.Author?.Title,
     {
       id: 'Author',
       header: 'Created By'
     }),
      columnHelper.accessor('PoMaster', {
        header: "PO Master"
      }),
      columnHelper.accessor('ApprovalPath', {
        header: "Approval Path"
      }),
      columnHelper.accessor('POAmount', {
        header: "PO Issued Amount"
      }),
      columnHelper.accessor('ApplicableTaxes', {
        header: "Applicable Taxes"
      }),
      columnHelper.accessor('TotalPRJAmount', {
        header: "Total Project Amount"
      }),
    ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('PoApproval');
    setLoading(false);
  };
  const handleBill = async () => {
    setLoading(true);
    _setData([]);
    setLabel('Bill Processing');
    setIsActiveQA(false);
    setIsActiveBP(true);
    setIsActivePO(false);
    setIsActiveVM(false);
    const setDynamicColumns = [
       columnHelper.accessor('ID', {
         header: () => 'Request No.'
       }),
       columnHelper.accessor('ProjectCode', {
         header: 'Project Code'
       }),
       columnHelper.accessor('PORequestNo', {
         header: 'PO Request No.'
       }),
       columnHelper.accessor('Department', {
         header: 'Department'
       }),
       columnHelper.accessor('Vendorcode', {
         header: 'Vendor Code'
       }),
       columnHelper.accessor('Modified', {
         header: 'Modified Date',
         cell: (info) => <span>{new Date(info.row.original.Modified).toLocaleDateString()}</span>
       }),
       columnHelper.accessor('ProjectTitle', {
         header: () => 'Project Title'
       }),
       columnHelper.accessor(row => row.Author?.Title,
     {
       id: 'Author',
       header: 'Created By'
     }), 
       columnHelper.accessor('Created', {
         header: 'Submitted Date',
          cell: (info) => <span>{new Date(info.row.original.Created).toLocaleDateString()}</span>
       }),
       columnHelper.accessor('VendorName', {
         header: 'Vendor Name'
       }),
       columnHelper.accessor('CurrentStatus', {
         header: 'Status'
       }), 
       columnHelper.accessor('BillDescription', {
         header: 'Bill Description',
         cell: info => (
                   <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                       {stripHtml(info.getValue())}
                   </div>
               )
       }),
       columnHelper.accessor('PODescription', {
         header: 'PO Description',
         cell: info => (
                   <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                       {stripHtml(info.getValue())}
                   </div>
               )
       }),
       columnHelper.accessor('AssignedTo', {
         header: 'Assigned To'
       }),    
       columnHelper.accessor('ApproverComment1', {
         header: 'Approver Comment 1'
       }),  
       columnHelper.accessor('ApproverComment2', {
         header: 'Approver Comment 2'
       }),  
       columnHelper.accessor('ApproverComment3', {
         header: 'Approver Comment 3'
       }),  
       columnHelper.accessor('ApproverComment4', {
         header: 'Approver Comment 4'
       }),  
       columnHelper.accessor('ActionDate1', {
         header: 'Action Date 1'
       }),  
       columnHelper.accessor('ActionDate2', {
         header: 'Action Date 2'
       }),  
       columnHelper.accessor('ActionDate3', {
         header: 'Action Date 3'
       }),  
       columnHelper.accessor('ActionDate4', {
         header: 'Action Date 4'
       }),  
       columnHelper.accessor(row => row.DepartmentHead?.Title,
     {
       id: 'DepartmentHead',
       header: 'Department Head'
     }), 
       columnHelper.accessor(row => row.Approver2?.Title,
     {
       id: 'Approver2',
       header: 'Approver 2'
     }),
       columnHelper.accessor(row => row.Approver3?.Title,
     {
       id: 'Approver3',
       header: 'Approver 3'
     }), 
       columnHelper.accessor(row => row.Approver5?.Title,
     {
       id: 'Approver5',
       header: 'Approver 5'
     }), 
       columnHelper.accessor('BillNo', {
         header: 'Bill No'
       }),
       columnHelper.accessor('BillDate', {
         header: 'Bill Date'
       }),
       columnHelper.accessor('BillAmount', {
         header: 'Bill Amount'
       }),
     columnHelper.accessor(row => row.Editor?.Title,
     {
       id: 'ModifiedBy',
       header: 'Modified By'
     }),
       columnHelper.accessor('CalculatedTaxes', {
         header: 'Calculated Taxes'
       }),
       columnHelper.accessor('TotalAmount', {
         header: 'Total Amount'
       }), 
       columnHelper.accessor('ApprovalPath', {
         header: 'Approval Path'
       }), 
       columnHelper.accessor('RemainingAmount', {
         header: 'Remaining Amount'
       }), 
       columnHelper.accessor('OccupiedAmount', {
         header: 'Occupied Amount'
       })  
     ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('BillProcessing');
    setLoading(false);
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
    setLoading(true);
    try {
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
    catch {

    }
    finally {
      setLoading(false);
    }
  };
  const handleCSV = async () => {
    setLoading(true);
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
  const getDatafromListByTitle = async (listname: string) => {
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
          <h2>Rejected Report
            <span>Digiflow / AP Report / Rejected Report</span>
          </h2>
        </div>
        <div className={styles.searchBox}>
          <div className={styles.container}>
            <div className={styles.row}>
              <div className={styles['col-md-3']}>
                <button className={styles.btnSearch} style={{ width: "100%", backgroundColor: isActiveQA ? "red" : "grey" }} onClick={handleQuotation}>Quotation Approval</button>
              </div>
              <div className={styles['col-md-3']}>
                <button className={styles.btnSearch} style={{ width: "100%", backgroundColor: isActiveVM ? "red" : "grey" }} onClick={handleVendor}>Vendor Mapping</button>
              </div>
              <div className={styles['col-md-3']} >
                <button className={styles.btnSearch} style={{ width: "100%", backgroundColor: isActivePO ? "red" : "grey" }} onClick={handlePO}>PO Approval</button>
              </div>
              <div className={styles['col-md-3']}>
                <button className={styles.btnSearch} style={{ width: "100%", backgroundColor: isActiveBP ? "red" : "grey" }} onClick={handleBill}>Bill Processing</button>
              </div>
              <div style={{ paddingBottom: "5%" }}></div>
              <div className={styles['col-md-6']} style={{ width: "15%", paddingTop: "10px", alignItems: "flex-end", justifyContent: "flex-end" }}>
                <button className={styles.btnSearch} onClick={handleExcel}>Export to Excel</button>
              </div>
              <div className={styles['col-md-6']} style={{ paddingTop: "10px", alignItems: "flex-end", justifyContent: "flex-end" }}>
                <button className={styles.btnSearch} onClick={handleCSV}>Export to CSV</button>
              </div>
            </div>
          </div>
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
export default RejectedReport;