import * as React from 'react';
import styles from './FinanceReport.module.scss';
import { IFinanceReportProps } from './IFinanceReportProps';
import { Dropdown, Icon, IDropdownOption, Label } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
import DataTable, { TableColumn } from "react-data-table-component";
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
import { Table } from 'react-bootstrap';
const FinanceReport: React.FC<IFinanceReportProps> = (props) => {
const [form, setForm] = React.useState({
      VendorName: '',
      VendorID: ''
  });
  

  const [loading, setLoading] = React.useState(false);
  const [vendorOptions, setVendorOptions] = React.useState<IDropdownOption[]>([]);
  const params = new URLSearchParams(window.location.search);
  const service = new SharePointService(props.context);
  const [search, setSearch] = useState("");
    const [data, _setData] = useState<any[]>(() => []);
    const [user, setUser] = useState<any>(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<any>([]);
    
const filteredData = data.filter(item =>
  item.DocumentName?.toLowerCase().includes(search.toLowerCase()) ||
  item.VendorName?.toLowerCase().includes(search.toLowerCase())
);

const columnHelper = createColumnHelper<any>()
    const columns = [
        columnHelper.accessor('ID', {
            header: () => <span>Document ID</span>
        }),
        columnHelper.accessor('Title', {
            header: () => 'Document Name'
        }),
        columnHelper.accessor('VendorName', {
            header: () => <span>Vendor Name</span>
        }),
        columnHelper.accessor('BillNumber', {
            header: 'Bill Number'
        }),
        columnHelper.accessor('BillDate', {
  header: 'Bill Date',
  cell: info =>
    info.getValue()
      ? new Date(info.getValue()).toLocaleDateString()
      : ""
}),
        columnHelper.accessor('BillAmount', {
            header: 'Bill Amount'            
        }),
        columnHelper.accessor('Created', {
  header: 'Uploaded Date',
  cell: info => new Date(info.getValue()).toLocaleDateString()
}),
        columnHelper.accessor(row => row.Author?.Title, {
  id: 'Author',
  header: 'Uploader'
}),
        columnHelper.display({
  id: 'view',
  header: 'View',
  cell: info => (
    <button onClick={() => handleView(info.row.original)}>
      View
    </button>
  )
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
  // 🔹 Load data
    React.useEffect(() => {
      loadMaster();
      getUser();
    }, []);
  // Load the User Details
  const getUser = async () => {
      const data = await service.getUser();
      if(data && Array.isArray(data))
      {
      setUser(data);
    }
    };
    //Load the Master Data for Dropdown
    const loadMaster = async () => {
      const data = await service.getMasterDocument();
      if(data && Array.isArray(data))
      {
      const options = data.map((item: any) => ({
        key: item.Id,
        text: item.VendorName
      }));
      setVendorOptions(options);
    }
    };
  const handleAddNewDocument = () => {
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
  window.location.assign(url);
};
 const handleView = (documentId: string) => {
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx?documentId=${documentId}`;
  window.location.assign(url);
};
const handlesearch = async () => {
  _setData([]);
  if (!form.VendorName) {
    alert("Please select a Vendor Name");
    return;
  }
  await getDatafromListByTitle(form.VendorName);
};    
const getDatafromListByTitle = async (parm_vendorname:string) => {
  try
  {
    setLoading(true);
  const data = await service.getItemByTitle(parm_vendorname);
    if(data.Id>0)
    {
      _setData((d) => [...d.concat(data)]);
    }
  }catch (error) {
    console.error(error);
    alert("Error occurred");
  }
  finally
  {
    setLoading(false);
  }
};
  return (
<div className={styles.pagecontainer}>
  <div className={styles.headerbar}>
      <h2 className={styles.leftPanel}>My Documents List</h2>      
    <div className={styles.rightPanel}> 
      <span className={styles.rightPanel}>Digiflow / My Documents List</span>
      <br></br>      
    </div>
  </div>
  <div className={styles.searchbox}>
    <span><h3>Search My Document</h3>    
      <button className={styles.btnadd} onClick={handleAddNewDocument}>Add New Document</button></span>    
    <div className={styles.searchrow}>
      <div className={styles.field}>
        <label className={styles.field}>Vendor Name</label>
        <Dropdown
                  options={vendorOptions}
                  selectedKey={form.VendorID}
                  onChange={(e, option) =>
                    setForm({ ...form, VendorName: option?.text as string,VendorID: option?.key as string, })
                  }
                />
      </div>
      <div className={styles.btnarea}>
        <button className={styles.btnsearch} onClick={handlesearch}>Search</button>
      </div>
    </div>
  </div>
      <div className={styles.pagecontainer}>
        <Label style={{display:"inline-block"}}>My Documents List</Label>
         <input
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search..."
                    style={{ marginBottom: "10px", padding: "5px", float:"right" }}
                />
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
                                asc: <Icon iconName='ChevronUpMed' style={{verticalAlign:"middle", marginLeft:"5px"}}/>,
                                desc: <Icon iconName='ChevronDownMed' style={{verticalAlign:"middle", marginLeft:"5px"}}/>,
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
                
                 <div className="pagination" style={{padding:"10px",textAlign:"right"}}>
                <span>
                    Showing {table.getRowModel().rows.length.toLocaleString()} of{' '}
                    {table.getRowCount().toLocaleString()} Rows
                </span>
                <div style={{float:"right", textAlign:"right"}}>
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
                
            </Table>
      </div>
  </div>
  );
};
export default FinanceReport;