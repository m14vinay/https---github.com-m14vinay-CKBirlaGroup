import * as React from 'react';
import styles from './ManageApprovers.module.scss';
import { IManageApproversProps } from './IManageApproversProps';
import { Dropdown, Icon, IDropdownOption, Label } from '@fluentui/react';
import SharePointService from '../service/service';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { useEffect, useState } from 'react';
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import 'bootstrap/dist/css/bootstrap.min.css';
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
const ManageApprovers: React.FC<IManageApproversProps> = (props) => {
  const [loading, setLoading] = React.useState(false);
  const service = new SharePointService(props.context);
  const [data, _setData] = useState<any[]>(() => []);
  const [user, setUser] = useState<any>(null);
  const [isActiveQA, setIsActiveQA] = React.useState(false);
  const [isActivePO, setIsActivePO] = React.useState(false);
  const [isActiveVM, setIsActiveVM] = React.useState(false);
  const [isActiveBP, setIsActiveBP] = React.useState(false);
  const [isActiveREIMD, setIsActiveREIMD] = React.useState(false);
  const [isActiveREIMF, setIsActiveREIMF] = React.useState(false);
  const [isActiveNEI, setIsActiveBPNEI] = React.useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<any>([]);
  const [Label, setLabel] = useState("");
  const columnHelper = createColumnHelper<any>();
  const [columns, setColumns] = React.useState<any[]>([]);
  const peoplePickerContext: IPeoplePickerContext = {
    absoluteUrl: props.context.pageContext.web.absoluteUrl,
    msGraphClientFactory: props.context.msGraphClientFactory as any,
    spHttpClient: props.context.spHttpClient as any
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
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState({
    ApproverId: 0,
    ApproverName: '',
    ID: 0,
    ApproverEMail: ''
  });
  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
    window.location.assign(url);
  };
  const handleVendorSubmit = async () => {
    if (form.ID <= 0) {
      alert("Please select a Approver");
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        ApproverId: selectedUserId,
        ID: form.ID
      };
      await service.updateItem(form.ID, payload, 'VendorMappingApproval');
      alert("Updated Successfully.");
      handleVendor();
    }
    catch (error) {
      console.error(error);
      alert("Error occurred ❌");
    }
    finally {
      setLoading(false);
    }
  };
  const handlePOSubmit = async () => {
    if (form.ID <= 0) {
      alert("Please select a Approver");
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        ApproverId: selectedUserId,
        ID: form.ID
      };
      await service.updateItem(form.ID, payload, 'VendorMappingApproval');
      alert("Updated Successfully.");
      handleVendor();
    }
    catch (error) {
      console.error(error);
      alert("Error occurred ❌");
    }
    finally {
      setLoading(false);
    }
  };
  const handleBPSubmit = async () => {
    if (form.ID <= 0) {
      alert("Please select a Approver");
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        ApproverId: selectedUserId,
        ID: form.ID
      };
      await service.updateItem(form.ID, payload, 'VendorMappingApproval');
      alert("Updated Successfully.");
      handleVendor();
    }
    catch (error) {
      console.error(error);
      alert("Error occurred ❌");
    }
    finally {
      setLoading(false);
    }
  };
  const handleQASubmit = async () => {
    if (form.ID <= 0) {
      alert("Please select a Approver");
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        ApproverId: selectedUserId,
        ID: form.ID
      };
      await service.updateItem(form.ID, payload, 'VendorMappingApproval');
      alert("Updated Successfully.");
      handleVendor();
    }
    catch (error) {
      console.error(error);
      alert("Error occurred ❌");
    }
    finally {
      setLoading(false);
    }
  };
  const handleQANEISubmit = async () => {
    if (form.ID <= 0) {
      alert("Please select a Approver");
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        ApproverId: selectedUserId,
        ID: form.ID
      };
      await service.updateItem(form.ID, payload, 'VendorMappingApproval');
      alert("Updated Successfully.");
      handleVendor();
    }
    catch (error) {
      console.error(error);
      alert("Error occurred ❌");
    }
    finally {
      setLoading(false);
    }
  };
  const handleREIMDSubmit = async () => {
    if (form.ID <= 0) {
      alert("Please select a Approver");
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        ApproverId: selectedUserId,
        ID: form.ID
      };
      await service.updateItem(form.ID, payload, 'VendorMappingApproval');
      alert("Updated Successfully.");
      handleVendor();
    }
    catch (error) {
      console.error(error);
      alert("Error occurred ❌");
    }
    finally {
      setLoading(false);
    }
  };
  const handleREIMFSubmit = async () => {
    if (form.ID <= 0) {
      alert("Please select a Approver");
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        ApproverId: selectedUserId,
        ID: form.ID
      };
      await service.updateItem(form.ID, payload, 'VendorMappingApproval');
      alert("Updated Successfully.");
      handleVendor();
    }
    catch (error) {
      console.error(error);
      alert("Error occurred ❌");
    }
    finally {
      setLoading(false);
    }
  };
  const onUserChange = async (items: any[]) => {
    if (items.length > 0) {
      const UserID = await service.getUserByLogOnName(items[0].id);
      if (UserID != null) {
        setSelectedUserId(Number(UserID));
      }
    } else {
      setSelectedUserId(null);
    }
    console.log(items);
  };
  // Load data
  React.useEffect(() => {
    getUser();
    _setData(data);
    setColumns(columns);
    handleQuotation();
    console.log("Web URL:", props.context?.pageContext?.web?.absoluteUrl);
  }, []);
  // Load the User Details
  const getUser = async () => {
    const data = await service.getUser();
    if (data.Id > 0) {
      setUser(data);
    }
  };
  const handleEdit = (rowData: any) => {
    console.log("Edit clicked:", rowData);
    setForm(prev => ({
      ...prev,
      ApproverId: rowData.Approver?.Id,
      ApproverName: rowData.Approver?.Title,
      ID: rowData.Id,
      ApproverEMail: rowData.Approver?.EMail
    }));
  };
  const handleQuotation = async () => {
    _setData([]);
    setLabel('Quotation Approval');
    setIsActiveQA(true);
    setIsActiveBP(false);
    setIsActivePO(false);
    setIsActiveVM(false);
    setIsActiveREIMD(false);
    setIsActiveREIMF(false);
    setIsActiveBPNEI(false);
    const setDynamicColumns = [
      columnHelper.accessor('DepartmentName', {
        header: "Department Name"
      }),
      columnHelper.accessor('Departmenthead.Title', {
        header: "Department Head"
      }),
      columnHelper.accessor('Approval1.Title', {
        header: "Approval 1"
      }),
      columnHelper.accessor('Approval2.Title', {
        header: "Approval 2"
      }),
      columnHelper.accessor('Approval3.Title', {
        header: "Approval 3"
      }),
      columnHelper.display({
        id: 'edit',
        header: 'Action',
        cell: (info) => (
          <button
            onClick={() => handleEdit(info.row.original)}
            style={{
              padding: '5px 10px',
              backgroundColor: 'green',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '10px'
            }}
          >
            View
          </button>
        )
      })
    ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('DepartmentMaster', 'Quotation Approval');
  };
  const handleVendor = async () => {
    _setData([]);
    setLabel('Vendor Mapping');
    setIsActiveQA(false);
    setIsActiveBP(false);
    setIsActivePO(false);
    setIsActiveVM(true);
    setIsActiveREIMD(false);
    setIsActiveREIMF(false);
    setIsActiveBPNEI(false);
    const setDynamicColumns = [
      columnHelper.accessor('Approver.Id', {
        header: "Approver ID"
      }),
      columnHelper.accessor('Approver.Title', {
        header: "Approver Name"
      }),
      columnHelper.accessor('Approver.EMail', {
        header: "Approver Email"
      }),
      columnHelper.display({
        id: 'edit',
        header: 'Action',
        cell: (info) => (
          <button
            onClick={() => handleEdit(info.row.original)}
            style={{
              padding: '5px 10px',
              backgroundColor: 'green',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '10px'
            }}
          >
            View
          </button>
        )
      })
    ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('VendorMappingApproval', 'Vendor Mapping');
  };
  const handlePO = async () => {
    _setData([]);
    setLabel('PO Approval');
    setIsActiveQA(false);
    setIsActiveBP(false);
    setIsActivePO(true);
    setIsActiveVM(false);
    setIsActiveREIMD(false);
    setIsActiveREIMF(false);
    setIsActiveBPNEI(false);
    const setDynamicColumns = [
      columnHelper.accessor('DepartmentName', {
        header: "Department Name"
      }),
      columnHelper.accessor('FinanceController.Id', {
        header: "Finance Controller ID"
      }),
      columnHelper.accessor('FinanceController.Title', {
        header: "Finance Controller Name"
      }),
      columnHelper.accessor('FinanceController.EMail', {
        header: "Finance Controller Email"
      }),
      columnHelper.display({
        id: 'edit',
        header: 'Action',
        cell: (info) => (
          <button
            onClick={() => handleEdit(info.row.original)}
            style={{
              padding: '5px 10px',
              backgroundColor: 'green',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '10px'
            }}
          >
            View
          </button>
        )
      })
    ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('FinanceController', 'PO Approval');
  };
  const handleBill = async () => {
    _setData([]);
    setLabel('Bill Processing');
    setIsActiveQA(false);
    setIsActiveBP(true);
    setIsActivePO(false);
    setIsActiveVM(false);
    setIsActiveREIMD(false);
    setIsActiveREIMF(false);
    setIsActiveBPNEI(false);
    const setDynamicColumns = [
      columnHelper.accessor((row) => row.DepartmentName ?? "N/A",
        {
          id: "DepartmentName",
          header: "Department Name"
        }),
      columnHelper.accessor('FinanceController.Title', {
        header: "Finance Controller Name"
      }),
      columnHelper.accessor(
        (row) => row.Billing2ndApprover?.Title ?? "N/A",
        {
          id: "Billing2ndApprover",
          header: "Billing2 and Approver"
        }
      ),
      columnHelper.display({
        id: 'edit',
        header: 'Action',
        cell: (info) => (
          <button
            onClick={() => handleEdit(info.row.original)}
            style={{
              padding: '5px 10px',
              backgroundColor: 'green',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '10px'
            }}
          >
            View
          </button>
        )
      })
    ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('FinanceController', 'Bill Processing');
  };
  const handleREIMF = async () => {
    _setData([]);
    setLabel('Reimbursement Finance Master');
    setIsActiveQA(false);
    setIsActiveBP(false);
    setIsActivePO(false);
    setIsActiveVM(false);
    setIsActiveREIMF(true);
    setIsActiveREIMD(false);
    setIsActiveBPNEI(false);
    const setDynamicColumns = [
      columnHelper.accessor('ApproverType', {
        header: "Approver Type"
      }),
      columnHelper.accessor('ApproverName.Id', {
        header: "Approver ID"
      }),
      columnHelper.accessor('ApproverName.Title', {
        header: "ApproverName Name"
      }),
      columnHelper.accessor('ApproverName.EMail', {
        header: "ApproverName Email"
      }),
      columnHelper.display({
        id: 'edit',
        header: 'Action',
        cell: (info) => (
          <button
            onClick={() => handleEdit(info.row.original)}
            style={{
              padding: '5px 10px',
              backgroundColor: 'green',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '10px'
            }}
          >
            View
          </button>
        )
      })
    ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('ReimbursementApproverMaster', 'Reimbursement Finance Master');
  };
  const handleREIMD = async () => {
    _setData([]);
    setLabel('Reimbursement Department Master');
    setIsActiveQA(false);
    setIsActiveBP(false);
    setIsActivePO(false);
    setIsActiveVM(false);
    setIsActiveREIMF(false);
    setIsActiveREIMD(true);
    setIsActiveBPNEI(false);
    const setDynamicColumns = [
      columnHelper.accessor('DepartmentName', {
        header: "Department Name"
      }),
      columnHelper.accessor('DepartmentHead.Id', {
        header: "Department Head Id"
      }),
      columnHelper.accessor('DepartmentHead.Title', {
        header: "Department Head Name"
      }),
      columnHelper.accessor('DepartmentHead.EMail', {
        header: "Department Head Email"
      }),
      columnHelper.display({
        id: 'edit',
        header: 'Action',
        cell: (info) => (
          <button
            onClick={() => handleEdit(info.row.original)}
            style={{
              padding: '5px 10px',
              backgroundColor: 'green',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '10px'
            }}
          >
            View
          </button>
        )
      })
    ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('ReimburseDepartmentMaster', 'Reimbursement Department Master');
  };
  const handleNEIBT = async () => {
    _setData([]);
    setLabel('Quotation Approval NEI BT');
    setIsActiveQA(false);
    setIsActiveBP(false);
    setIsActivePO(false);
    setIsActiveVM(false);
    setIsActiveREIMD(false);
    setIsActiveREIMF(false);
    setIsActiveBPNEI(true);
    const setDynamicColumns = [
      columnHelper.accessor('DepartmentName', {
        header: "DepartmentName"
      }),
      columnHelper.accessor('Departmenthead.Title', {
        header: "Department Head"
      }),
      columnHelper.accessor('Approval1.Title', {
        header: "Approval 1"
      }),
      columnHelper.accessor('Approval2.Title', {
        header: "Approval 2"
      }),
      columnHelper.accessor('Approval3.Title', {
        header: "Approval 3"
      }),
      columnHelper.display({
        id: 'edit',
        header: 'Action',
        cell: (info) => (
          <button
            onClick={() => handleEdit(info.row.original)}
            style={{
              padding: '5px 10px',
              backgroundColor: 'green',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '10px'
            }}
          >
            View
          </button>
        )
      })
    ]
    setColumns(setDynamicColumns);
    await getDatafromListByTitle('DepartmentMasterNEI', 'Quotation Approval NEI BT');
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
  const getDatafromListByTitle = async (listname: string, FormType: string) => {
    try {
      setLoading(true);
      const data = await service.getItemByTitle(listname, FormType);
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
          <h2>Manage Approver
            <span>Digiflow / Manage Approver</span>
          </h2>
        </div>
        <div className={styles.searchBox}>
          <div className={styles.container}>
            <div className={styles.row}>
              <div className={styles['col-md-3']}>
                <button className={styles.btnSearch} style={{ width: "100%", backgroundColor: isActiveQA ? "red" : "grey" }} onClick={handleQuotation}>Quotation</button>
              </div>
              <div className={styles['col-md-3']}>
                <button className={styles.btnSearch} style={{ width: "100%", backgroundColor: isActiveNEI ? "red" : "grey" }} onClick={handleNEIBT}>Quotation NEIBT</button>
              </div>
              <div className={styles['col-md-3']}>
                <button className={styles.btnSearch} style={{ width: "100%", backgroundColor: isActiveREIMD ? "red" : "grey" }} onClick={handleREIMD}>REIM Dept. Master</button>
              </div>
              <div className={styles['col-md-3']}>
                <button className={styles.btnSearch} style={{ width: "100%", backgroundColor: isActiveREIMF ? "red" : "grey" }} onClick={handleREIMF}>REIM Fin. Master</button>
              </div>
              <div className={styles['col-md-3']}>
                <button className={styles.btnSearch} style={{ width: "100%", backgroundColor: isActiveVM ? "red" : "grey" }} onClick={handleVendor}>Vendor</button>
              </div>
              <div className={styles['col-md-3']} >
                <button className={styles.btnSearch} style={{ width: "100%", backgroundColor: isActivePO ? "red" : "grey" }} onClick={handlePO}>Purchase Order</button>
              </div>
              <div className={styles['col-md-3']}>
                <button className={styles.btnSearch} style={{ width: "100%", backgroundColor: isActiveBP ? "red" : "grey" }} onClick={handleBill}>Bill Processing</button>
              </div>
              <div style={{ paddingBottom: "5%" }}></div>
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
          <div className='row' id='vendor' style={{ paddingTop: "2%", display: isActiveVM ? "block" : "none", alignSelf: "center" }}>
            <div className={styles['form-control']}>
              <label>Approver</label>
              <PeoplePicker
                context={peoplePickerContext}
                titleText="People Picker"
                personSelectionLimit={1}
                showtooltip={true}
                required={true}
                disabled={false}
                searchTextLimit={2}
                principalTypes={[PrincipalType.User]}
                resolveDelay={1000}
                defaultSelectedUsers={[form.ApproverEMail]}
                onChange={onUserChange}
              />
            </div>
            {/* Buttons */}
            <div className={styles['btn-group']}>
              <button name='vendorbtnsubmit' className={styles.btnSubmit} onClick={handleVendorSubmit}>Update</button>&nbsp;
              <button name='vendorbtnCancel' className={styles.btnCancel} onClick={handleCancel}>Cancel</button>
            </div>
          </div>
          <div className='row' id='Quotation' style={{ paddingTop: "2%", display: isActiveQA ? "block" : "none", alignSelf: "center" }}>
            <div className={styles['form-control']}>
              <label>Approver</label>
              <PeoplePicker
                key={[form.ApproverEMail].join(",")}
                context={props.context.pageContext.web.absoluteUrl as any}
                titleText="Select Approver"
                personSelectionLimit={1}
                showtooltip={true}
                required={true}
                disabled={false}
                ensureUser={true}
                principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
                defaultSelectedUsers={[form.ApproverEMail]}
                onChange={onUserChange}
              />
            </div>
            {/* Buttons */}
            <div className={styles['btn-group']}>
              <button name='QAbtnsubmit' className={styles.btnSubmit} onClick={handleQASubmit}>Update</button>&nbsp;
              <button name='QAbtnCancel' className={styles.btnCancel} onClick={handleCancel}>Cancel</button>
            </div>
          </div>
          <div className='row' id='QuotationNEI' style={{ paddingTop: "2%", display: isActiveNEI ? "block" : "none", alignSelf: "center" }}>
            <div className={styles['form-control']}>
              <label>Approver</label>
              <PeoplePicker
                key={[form.ApproverEMail].join(",")}
                context={props.context.pageContext.web.absoluteUrl as any}
                titleText="Select Approver"
                personSelectionLimit={1}
                showtooltip={true}
                required={true}
                disabled={false}
                ensureUser={true}
                principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
                defaultSelectedUsers={[form.ApproverEMail]}
                onChange={onUserChange}
              />
            </div>
            {/* Buttons */}
            <div className={styles['btn-group']}>
              <button name='NEIbtnsubmit' className={styles.btnSubmit} onClick={handleNEIBT}>Update</button>&nbsp;
              <button name='NEIbtnCancel' className={styles.btnCancel} onClick={handleCancel}>Cancel</button>
            </div>
          </div>
          <div className='row' id='ReimbursementD' style={{ paddingTop: "2%", display: isActiveREIMD ? "block" : "none", alignSelf: "center" }}>
            <div className={styles['form-control']}>
              <label>Approver</label>
              <PeoplePicker
                key={[form.ApproverEMail].join(",")}
                context={props.context.pageContext.web.absoluteUrl as any}
                titleText="Select Approver"
                personSelectionLimit={1}
                showtooltip={true}
                required={true}
                disabled={false}
                ensureUser={true}
                principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
                defaultSelectedUsers={[form.ApproverEMail]}
                onChange={onUserChange}
              />
            </div>
            {/* Buttons */}
            <div className={styles['btn-group']}>
              <button name='Reimbtnsubmit' className={styles.btnSubmit} onClick={handleREIMD}>Update</button>&nbsp;
              <button name='ReimbtnCancel' className={styles.btnCancel} onClick={handleCancel}>Cancel</button>
            </div>
          </div>
          <div className='row' id='ReimbursementF' style={{ paddingTop: "2%", display: isActiveREIMF ? "block" : "none", alignSelf: "center" }}>
            <div className={styles['form-control']}>
              <label>Approver</label>
              <PeoplePicker
                key={[form.ApproverEMail].join(",")}
                context={props.context.pageContext.web.absoluteUrl as any}
                titleText="Select Approver"
                personSelectionLimit={1}
                showtooltip={true}
                required={true}
                disabled={false}
                ensureUser={true}
                principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
                defaultSelectedUsers={[form.ApproverEMail]}
                onChange={onUserChange}
              />
            </div>
            {/* Buttons */}
            <div className={styles['btn-group']}>
              <button name='Reimbtnsubmit' className={styles.btnSubmit} onClick={handleREIMF}>Update</button>&nbsp;
              <button name='ReimbtnCancel' className={styles.btnCancel} onClick={handleCancel}>Cancel</button>
            </div>
          </div>
          <div className='row' id='BillProcessing' style={{ paddingTop: "2%", display: isActiveBP ? "block" : "none", alignSelf: "center" }}>
            <div className={styles['form-control']}>
              <label>Approver</label>
              <PeoplePicker
                key={[form.ApproverEMail].join(",")}
                context={props.context.pageContext.web.absoluteUrl as any}
                titleText="Select Approver"
                personSelectionLimit={1}
                showtooltip={true}
                required={true}
                disabled={false}
                ensureUser={true}
                principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
                defaultSelectedUsers={[form.ApproverEMail]}
                onChange={onUserChange}
              />
            </div>
            {/* Buttons */}
            <div className={styles['btn-group']}>
              <button name='BPbtnsubmit' className={styles.btnSubmit} onClick={handleBPSubmit}>Update</button>&nbsp;
              <button name='BPbtnCancel' className={styles.btnCancel} onClick={handleCancel}>Cancel</button>
            </div>
          </div>
          <div className='row' id='PurchaseOrder' style={{ paddingTop: "2%", display: isActivePO ? "block" : "none", alignSelf: "center" }}>
            <div className={styles['form-control']}>
              <label>Approver</label>
              <PeoplePicker
                key={[form.ApproverEMail].join(",")}
                context={props.context.pageContext.web.absoluteUrl as any}
                titleText="Select Approver"
                personSelectionLimit={1}
                showtooltip={true}
                required={true}
                disabled={false}
                ensureUser={true}
                principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
                defaultSelectedUsers={[form.ApproverEMail]}
                onChange={onUserChange}
              />
            </div>
            {/* Buttons */}
            <div className={styles['btn-group']}>
              <button name='PObtnsubmit' className={styles.btnSubmit} onClick={handlePO}>Update</button>&nbsp;
              <button name='PObtnCancel' className={styles.btnCancel} onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ManageApprovers;