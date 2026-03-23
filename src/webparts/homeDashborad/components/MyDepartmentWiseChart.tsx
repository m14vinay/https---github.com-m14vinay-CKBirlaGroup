import * as React from 'react';
import { useState, useEffect } from "react";
import { SPHttpClient } from '@microsoft/sp-http';
import { IChartProps } from './IChartProps';
import { Dropdown, IDropdownOption, Label } from '@fluentui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import styles from './HomeDashborad.module.scss'
import { SharePointContext } from './SharePointContext';
import { WebPartContext } from '@microsoft/sp-webpart-base';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MyDepartmentWiseChart() {

    const context = React.useContext(SharePointContext) as WebPartContext;
    const [items, setItems] = useState<any[]>([]);
    const [dataset, setDataset] = useState<number[]>([]);
    const webUrl = context.pageContext.web.absoluteUrl;

    const listOptions:IDropdownOption[] = [
        {
            "key":"QuotationApproval",
            "text":"Quotation Approval"
        },
        {
            "key":"PoApproval",
            "text":"PO Approval"
        },
        {
            "key":"ITApproval",
            "text":"IT Approval"
        },
        {
            "key":"ReimburseExpenseMaster",
            "text":"Reimbursement"
        },
        {
            "key":"BillProcessing",
            "text":"Bill Processing"
        },
        {
            "key":"VendorMapping",
            "text":"Vendor Mapping / New Vendor Registration"
        }
    ]
        
    const [user, setUser] = useState<any>(null);
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
    },[]);

    const [selectedList, setSelectedList] = useState(listOptions[0].key);

    const getChartDataSet = () => {
        const Admin = items.filter(q => q.Department === "Admin");
        const Finance = items.filter(q => q.Department === "Finance");
        const IT = items.filter(q => q.Department === "IT");
        const Branding = items.filter(q => q.Department === "Branding");
        const Legal = items.filter(q => q.Department === "Legal");

        setDataset([Admin.length, Finance.length, IT.length, Branding.length, Legal.length]);
    }

    useEffect(() => {
        getChartDataSet()
    },[items]);

    const getQuotationData = () => {
        let resturl = webUrl + "/_api/web/lists/getbytitle('" + selectedList + "')/items?$top=5000&$select=Department,Id,AuthorId&$filter=AuthorId eq " + user.Id;
        context.spHttpClient.get(
            `${resturl}`,
            SPHttpClient.configurations.v1
        ).then(res => res.json()).then(data => {
            console.log("quotations: ",data);
                if(data && data.value)
                    setItems(data.value);
                else
                    setItems([]);
        }).catch(e => {
            console.log(e);
        })
    }
    
    useEffect(() => {
        if(user)
            getQuotationData();
    },[selectedList, user]);

    const data = {
        labels: [
            'Admin',
            'Finance',
            'IT',
            'Branding',
            'Legal'
        ],
        datasets: [{
            data: dataset,
            backgroundColor: [
            '#4EC348',
            '#EF2020',
            '#E4DE24',
            '#2C38B8',
            '#D52B9D'
            ],
            hoverOffset: 4
        }]
    };

    return (<div>
    <Label>Department Wise</Label>
    <div className={styles.chartDiv}>
        <div style={{display:"flex"}}>
            <div style={{display:"inline-block", width:"100px"}}><span>Flow</span></div>
            <div style={{display:"inline-block"}}><Dropdown
                label=""
                style={{width:"200px"}}
                options={listOptions}
                selectedKey={selectedList}
                onChange={(e, option) => setSelectedList(option?option.key:"")}
            ></Dropdown>
            </div>
        </div>
        {items.length > 0 &&<Pie 
        data={data}
        options={{
            plugins: {
                legend:{
                    position:"right",
                    labels:{
                        usePointStyle:true,
                        pointStyle:"circle"
                    }
                }
            }
        }}/>}
    </div>
    </div>)
}