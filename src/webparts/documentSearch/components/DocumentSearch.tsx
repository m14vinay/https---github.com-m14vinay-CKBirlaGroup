import * as React from 'react';
import styles from './DocumentSearch.module.scss';
import { IDocumentSearchProps } from './IDocumentSearchProps';
import { Dropdown, Icon, IDropdownOption, Label } from '@fluentui/react';
import SharePointService from '../service/service';
import { Spinner, SpinnerSize } from '@fluentui/react';
//import DataTable, { TableColumn } from "react-data-table-component";
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
const DocumentSearch: React.FC<IDocumentSearchProps> = (props) => {
const [form, setForm] = React.useState({
      VendorName: '',
      ID: '',
      BillNumber: '',
      BillDate: '',
      BillAmount: '',
      Title: ''
  });
  

  const [loading, setLoading] = React.useState(false);
  const [vendorOptions, setVendorOptions] = React.useState<IDropdownOption[]>([]);
  const [BillNumberOptions, setBillNumberOptions] = React.useState<IDropdownOption[]>([]);
  const [BillDateOptions, setBillDateOptions] = React.useState<IDropdownOption[]>([]);
  const [BillAmountOptions, setBillAmountOptions] = React.useState<IDropdownOption[]>([]);
  const [TitleOptions, setTitleOptions] = React.useState<IDropdownOption[]>([]);
  const service = new SharePointService(props.context);
  const [search, setSearch] = useState("");
    const [data, _setData] = useState<any[]>(() => []);
    const [user, setUser] = useState<any>(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<any>([]);

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
        columnHelper.accessor(row => user?.Title, {
  id: 'Author',
  header: 'Uploader'
}),
        columnHelper.display({
  id: 'view',
  header: 'View',
  cell: info => (
    <button onClick={() => handleView(info.row.original.ID)}>
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
  // Load data
    React.useEffect(() => {
      getUser();          
    }, []);
  // Load the User Details
  const getUser = async () => {
      const data = await service.getUser();
      if(data.Id>0)
      {
      setUser(data);
      loadMaster(data.Id); // Load the Master Data for Dropdown based on User ID  
    }
    };
    //Load the Master Data for Dropdown
    const loadMaster = async (userId: number) => {
      const data = await service.getMasterDocument(userId);
      if(data && Array.isArray(data))
      {
      const BillNumberOption = data.map((item: any) => ({
        key: item.BillNumber,
        text: item.BillNumber
      }));
      const BillDateOption = data.map((item: any) => ({
        key: item.BillDate ? new Date(item.BillDate).toLocaleDateString() : "",
        text: item.BillDate ? new Date(item.BillDate).toLocaleDateString() : ""
      }));
      const BillAmountOption = data.map((item: any) => ({
        key: item.BillAmount,
        text: item.BillAmount
      }));
      const VendorOption = data.map((item: any) => ({
        key: item.VendorName,
        text: item.VendorName
      }));
      const TitleOption = data.map((item: any) => ({
        key: item.Title,
        text: item.Title
      }));
      setVendorOptions(VendorOption);
      setBillNumberOptions(BillNumberOption);
      setBillDateOptions(BillDateOption);
      setBillAmountOptions(BillAmountOption);
      setTitleOptions(TitleOption);
    }
    };
  const handleAddNewDocument = () => {
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/DocumentUpload.aspx`;
  window.location.assign(url);
};
 const handleView = (documentId: string) => {
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/DocumentView.aspx?ID=${documentId}`;
  window.location.assign(url);
};
const handlesearch = async () => {
  _setData([]);
  if (!form.VendorName && !form.BillAmount && !form.Title&& !form.BillDate&& !form.BillNumber) {
    alert("Please select any one  fields to search");
    return;
  }
  await getDatafromListByTitle(form.VendorName,form.BillAmount,form.Title,form.BillDate,form.BillNumber);
};    
const getDatafromListByTitle = async (parm_vendorname:string, parm_billamount:string, parm_title:string, parm_billdate:string, parm_billnumber:string) => {
  try
  {
    setLoading(true);
  const data = await service.getItemByTitle(parm_vendorname,parm_billamount, parm_title, parm_billdate, parm_billnumber);
   if (data)
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
<div className={styles.container}>
  <div className={styles.header}>
        <h2>My Document List</h2>          
  </div>
  <div className={styles.row}>    
    <div className={styles.rightPanel}> 
      <span className={styles.rightPanel}>Digiflow / My Documents List</span>
      <br></br>      
    </div>
    <span><h3>Search My Document</h3>    
      <button className={styles.RejectBtn} onClick={handleAddNewDocument}>Add New Document</button></span>    
      <div className={styles["col-md-12"]}>
      <span className={styles['col-4']}>
        <label>Vendor Name</label>
        <Dropdown
                  options={vendorOptions}
                  selectedKey={form.VendorName}
                  onChange={(e, option) =>
                    setForm({ ...form, VendorName: option?.text as string,ID: option?.key as string, })
                  }
                />
                
      </span>
      <span className={styles['col-4']}>
        <label>Bill Number</label>
        <Dropdown
                  options={BillNumberOptions}
                  selectedKey={form.BillNumber}
                  onChange={(e, option) =>
                    setForm({ ...form, BillNumber: option?.text as string,ID: option?.key as string, })
                  }
                />
                
      </span>
      <span className={styles['col-4']}>
        <label>Bill Amount</label>
        <Dropdown
                  options={BillAmountOptions}
                  selectedKey={form.BillAmount}
                  onChange={(e, option) =>
                    setForm({ ...form, BillAmount: option?.text as string,ID: option?.key as string, })
                  }
                />
                
      </span> 
      <span className={styles['col-4']}>
        <label>Bill Date</label>
        <Dropdown
                  options={BillDateOptions}
                  selectedKey={form.BillDate}
                  onChange={(e, option) =>
                    setForm({ ...form, BillDate: option?.text as string,ID: option?.key as string, })
                  }
                />
                
      </span>
      <span className={styles['col-4']}>
        <label>Document Name</label>
        <Dropdown
                  options={TitleOptions}
                  selectedKey={form.Title}
                  onChange={(e, option) =>
                    setForm({ ...form, Title: option?.text as string,ID: option?.key as string, })
                  }
                />                
      </span>       
      <span className={styles['col-4']} style={{display:"flex", alignItems:"flex-end"}}>
        <button className={styles.ApproveBtn} onClick={handlesearch}>Search</button>
      </span>
    </div>
  </div>
      <div className={styles.table}>
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
export default DocumentSearch;