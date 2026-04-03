import * as React from 'react';
import { useState, useEffect } from "react";
import { SPHttpClient } from '@microsoft/sp-http';
import styles from './HomeDashborad.module.scss'
import { WebPartContext } from '@microsoft/sp-webpart-base';
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
import { Icon, Label } from '@fluentui/react';
import { SharePointContext } from './SharePointContext';

export default function MyRequests() {

    const context = React.useContext(SharePointContext) as WebPartContext;

    const columnHelper = createColumnHelper<any>()

    const columns = [
        columnHelper.accessor('RequestNo', {
            header: () => <span>Request No</span>
        }),
        columnHelper.accessor((row) => row.lastName, {
            id: 'ProjectTitle',
            header: () => <span>Project Title</span>
        }),
        columnHelper.accessor('ProjectDescription', {
            header: () => 'Description'
        }),
        columnHelper.accessor('Department', {
            header: () => <span>Department</span>
        }),
        columnHelper.accessor('CurrentStatus', {
            header: 'Status'
        }),
        columnHelper.accessor('Created', {
            header: 'Submitted Date'
        }),
        columnHelper.accessor('Created', {
            header: 'Approved Date',
            cell: (info) => <span>TBD</span>
        }),
        columnHelper.accessor('Created', {
            header: 'Approval History',
            cell: (info) => <span>TBD</span>
        }),
        columnHelper.accessor('Created', {
            header: 'View',
            cell: (info) => <span>TBD</span>
        })
    ]
    const [data, _setData] = useState<any[]>(() => []);
    const [user, setUser] = useState<any>(null);

    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<any>([]);
    const webUrl = context.pageContext.web.absoluteUrl;
    const lists = ["QuotationApproval", "PoApproval", "ITApproval", "ReimburseExpenseMaster", "BillProcessing", "VendorMapping"];

    const getUser = () => {
        console.log("context user : ", context);
        let resturl = webUrl + "/_api/web/currentuser";
        context.spHttpClient.get(
            `${resturl}`,
            SPHttpClient.configurations.v1
        ).then(res => res.json()).then(data => {
            console.log(data);
            setUser(data);
        }).catch(e => {
            console.log(e);
        })
    }

    useEffect(() => {
        getUser();
    }, []);

    const getData = (listName: string) => {
        console.log("context user : ", context);
        let resturl = webUrl + "/_api/web/lists/getbytitle('" + listName + "')/items?$top=5000&$select=*&$filter=AuthorId eq " + user.Id;
        context.spHttpClient.get(
            `${resturl}`,
            SPHttpClient.configurations.v1
        ).then(res => res.json()).then(data => {
            console.log(listName, data);
            if (data.value.length > 0) {
                _setData((d) => [...d.concat(data.value)]);
            }
        }).catch(e => {
            console.log(e);
        })
    }

    useEffect(() => {
        if (user) {
            lists.forEach(l => {
                getData(l);
            })
        }
    }, [user]);

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

    return (
        <div className="p-2">
            <div>
                <Label style={{ display: "inline-block" }}>My Requests</Label>
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
    )
}