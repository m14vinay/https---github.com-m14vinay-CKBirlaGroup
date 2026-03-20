import * as React from 'react';
import { useState, useEffect } from "react";
import { SPHttpClient } from '@microsoft/sp-http';
import { IDashboardFunctionalProps } from './IDashboardFunctionalProps';
import { Dropdown } from '@fluentui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardFunctional(props: IDashboardFunctionalProps) {

    const [quotations, setQuotations] = useState<any[]>([]);
    const webUrl = props.context.pageContext.web.absoluteUrl;
    const data = {
        labels: [
            'Red',
            'Blue',
            'Yellow'
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [300, 50, 100],
            backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
        }]
    };

    const getQuotationData = () => {
        var resturl = webUrl + "/_api/web/lists/getbytitle('Quotations')/items";
        props.context.spHttpClient.get(
            `${resturl}`,
            SPHttpClient.configurations.v1
        ).then(res => res.json()).then(data => {
            if (data.value.length > 0) {
                setQuotations(data.value);
            }
        })
    }

    return (<div>
    <label>Workflow Status</label>
    <div>
        <span style={{padding:"4px 10px"}}>Flow</span>
        <Dropdown
            label=""
            options={[]}
        ></Dropdown>
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
    </div>)
}