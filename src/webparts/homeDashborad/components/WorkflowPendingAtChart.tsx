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

export default function WorkflowPendingAtChart() {

    const context = React.useContext(SharePointContext) as WebPartContext;
    const [items, setItems] = useState<any[]>([]);
    const [dataset, setDataset] = useState<number[]>([]);

    const chartLabels = {
        "QuotationApproval":["Department Head", "Management 1", "Management 2"],
        "PoApproval":["Finance Controller", "Management 1", "Management 2"],
        "ITApproval":[],
        "ReimburseExpenseMaster":[],
        "BillProcessing":[],
        "VendorMapping":[]
    };

    const [labels, setLabels] = useState<string[]>(chartLabels.QuotationApproval);
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

    const [selectedList, setSelectedList] = useState(listOptions[0].key);

    const getChartDataSet = () => {
        switch (selectedList) {
            case "QuotationApproval":
                setLabels(chartLabels.QuotationApproval);
                getChartDataSetQuotation();
                break;
            case "PoApproval":
                setLabels(chartLabels.PoApproval);
                getChartDataSetPo();
                break;
            default:
                break;
        }
    }

    const getChartDataSetQuotation = () => {
        let departmentHead = 0, management1 = 0, management2 = 0;
        items.forEach(item => {
            if(item.ApprovalPath){
                const pathLength = item.ApprovalPath.split(">");
                switch(pathLength.length){
                    case 1:
                        departmentHead++;
                        break;
                    case 2:
                        management1++;
                        break;
                    case 3:
                        management2++;
                        break;
                    default:
                        break;
                }
            }
        });
        setDataset([departmentHead, management1, management2]);
    }
    
    const getChartDataSetPo = () => {
        let financeController = 0, management1 = 0, management2 = 0;
        items.forEach(item => {
            if(item.ApprovalPath){
                const pathLength = item.ApprovalPath.split(">");
                switch(pathLength.length){
                    case 1:
                        financeController++;
                        break;
                    case 2:
                        management1++;
                        break;
                    case 3:
                        management2++;
                        break;
                    default:
                        break;
                }
            }
        });
        setDataset([financeController, management1, management2]);
    }

    useEffect(() => {
        getChartDataSet()
    },[items]);

    const getQuotationData = () => {
        let resturl = webUrl + "/_api/web/lists/getbytitle('" + selectedList + "')/items?$top=5000&$select=Department,Id,ApprovalPath";
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
        getQuotationData();
    },[selectedList]);

    const data = {
        labels: labels,
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