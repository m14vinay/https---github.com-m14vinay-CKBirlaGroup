import * as React from 'react';
import styles from './VendorRegistrationSearch.module.scss';
import { IVendorRegistrationSearchProps } from './IVendorRegistrationSearchProps';
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
import { Title } from 'chart.js';
const VendorRegistrationSearch: React.FC<IVendorRegistrationSearchProps> = (props) => {
  const [form, setForm] = React.useState({
    Title: '',
    MSMERegistrationNo: '',
    Created: '',
    Pan: '',
    GST: '',
    YearofEstablishment: '',
    Tin: '',
    VendorCode: ''
  });
  const [loading, setLoading] = React.useState(false);
  const service = new SharePointService(props.context);
  const [data, _setData] = useState<any[]>(() => []);
  const [user, setUser] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<any>([]);

  const columnHelper = createColumnHelper<any>()
  const columns = [
    columnHelper.accessor('VendorCode', {
      header: () => <span>Vendor Code</span>
    }),
    columnHelper.accessor('Title', {
      header: () => <span>Vendor Name</span>
    }),
    columnHelper.accessor('MSMERegistrationNo', {
      header: () => 'MSME Registration Number'
    }),
    columnHelper.accessor('Pan', {
      header: 'PAN'
    }),
    columnHelper.accessor('GST', {
      header: 'GST'
    }),
    columnHelper.accessor('Pan', {
      header: 'PAN'
    }),
    columnHelper.accessor('Created', {
      header: 'Submitted Date',
      cell: info =>
        info.getValue()
          ? new Date(info.getValue()).toLocaleDateString()
          : ""
    }),
    columnHelper.accessor('YearofEstablishment', {
      header: 'Establishment Year'
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
    handlesearch();
  }, []);
  // Load the User Details
  const getUser = async () => {
    const data = await service.getUser();
    if (data.Id > 0) {
      setUser(data);
    }
  };

  const handleAddNewDocument = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/VendorRegistration.aspx`;
    window.location.assign(url);
  };
  const handleView = (documentId: string) => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/VendorRegistrationDetails.aspx?RequestId=${documentId}`;
    window.location.assign(url);
  };
  const handlesearch = async () => {
    _setData([]);
    await getDatafromListByTitle(form.Title, form.GST, form.Pan, form.VendorCode, form.Tin);
  };
  const getDatafromListByTitle = async (parm_Title: string, parm_GST: string, parm_Pan: string, parm_VendorCode: string, parm_Tin: string) => {
    try {
      setLoading(true);
      const data = await service.getItemByTitle(parm_Title, parm_GST, parm_Pan, parm_VendorCode, parm_Tin);
      if (data) {
        _setData((d) => [...d.concat(data)]);
      }
    } catch (error) {
      console.error(error);
      alert("Error Occurred,Please Contact To System Administrator.");
    }
    finally {
      setLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
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
          <h2>All Vendors
            <span>Digiflow / All Vendor List</span>
          </h2>
        </div>
        <div className={styles.searchBox}>
          <h3>Search Vendor
            <button className={styles.btnAdd} onClick={handleAddNewDocument}>Add New Document</button>
          </h3>
          <div className={styles.container}>
            <div className={styles.row}>
              <div className={styles['col-md-4']}>
                <label>Vendor Name</label>
                <input style={{ width: '100%' }} name='Title' value={form.Title} onChange={handleChange} className='form-control' type='text' />
              </div>
              <div className={styles['col-md-4']}>
                <label>GST</label>
                <input style={{ width: '100%' }} name='GST' value={form.GST} onChange={handleChange} className='form-control' type='text' />
              </div>
              <div className={styles['col-md-4']}>
                <label>PAN</label>
                <input style={{ width: '100%' }} name='Pan' value={form.Pan} onChange={handleChange} className='form-control' type='text' />
              </div>
              <div className={styles['col-md-4']}>
                <label>Vendor Code</label>
                <input style={{ width: '100%' }} name='VendorCode' value={form.VendorCode} onChange={handleChange} className='form-control' type='text' />
              </div>
              <div className={styles['col-md-4']}>
                <label>TIN Number</label>
                <input style={{ width: '100%' }} name='Tin' value={form.Tin} onChange={handleChange} className='form-control' type='text' />
              </div>
              <div className={styles['col-md-4']} style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                <button className={styles.btnSearch} onClick={handlesearch}>Search</button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-2">
          <div>
            <Label style={{ display: "inline-block" }}>All Vendor List</Label>
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
    </section>
  );
};
export default VendorRegistrationSearch;