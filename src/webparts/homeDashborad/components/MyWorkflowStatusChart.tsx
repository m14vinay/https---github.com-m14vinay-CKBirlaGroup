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

export default function MyWorkflowStatusChart(props: IChartProps) {

    const [quotations, setQuotations] = useState<any[]>([]);
    const [dataset, setDataset] = useState<number[]>([]);
    const webUrl = props.context.pageContext.web.absoluteUrl;

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

    const context = React.useContext(SharePointContext) as WebPartContext;
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
        const approved = quotations.filter(q => q.CurrentStatus === "Approved");
        const rejected = quotations.filter(q => q.CurrentStatus === "Rejected");
        const pending = quotations.filter(q => q.CurrentStatus === "Pending");
        const sendBack = quotations.filter(q => q.CurrentStatus === "SendBack");
        const drafted = quotations.filter(q => q.CurrentStatus === "Drafted");

        setDataset([approved.length, rejected.length, pending.length, sendBack.length, drafted.length]);
    }

    useEffect(() => {
        getChartDataSet()
    },[quotations]);

    const getQuotationData = () => {
        let resturl = webUrl + "/_api/web/lists/getbytitle('" + selectedList + "')/items?$top=5000&$select=CurrentStatus,Id,AuthorId&$filter=AuthorId eq " + user.Id;
        props.context.spHttpClient.get(
            `${resturl}`,
            SPHttpClient.configurations.v1
        ).then(res => res.json()).then(data => {
            console.log("quotations: ",data);
            if (data && data.value) {
                setQuotations(data.value);
            }
            else{
                setQuotations([]);
            }
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
            'Approved',
            'Rejected',
            'Pending',
            'SendBack',
            'Drafted'
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
    <Label>Workflow Status</Label>
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
        <Pie 
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
        }}/>
    </div>
    </div>)
}