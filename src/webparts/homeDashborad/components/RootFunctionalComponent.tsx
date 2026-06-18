import * as React from 'react';
import { useState, useEffect, useContext } from "react";
import { SPHttpClient } from '@microsoft/sp-http';
import { IHomeDashboradProps } from './IHomeDashboradProps';
import WorkflowStatusChart from './WorkflowStatusChart';
import MyRequests from './MyRequests';
import { SharePointContext } from './SharePointContext';
import DepartmentWiseChart from './DepartmentWiseChart';
import MyWorkflowStatusChart from './MyWorkflowStatusChart';
import MyDepartmentWiseChart from './MyDepartmentWiseChart';
import MyPendingRequests from './MyPendingRequests';
import WorkflowPendingAtChart from './WorkflowPendingAtChart';
import CarousalMenu from './CarousalMenu';

export default function RootFunctionalComponent(props: IHomeDashboradProps) {

    return(<div>
        <SharePointContext.Provider value={props.context}>
            <div><label style={{fontSize:"20px"}}>Digiflow Overview Status</label></div>   
            <div>
              {sessionStorage.getItem("DId") === "2" && <MyPendingRequests/>}
            </div>
            <div>
                {sessionStorage.getItem("DId") === "1" && <MyRequests/>}
            </div>
        </SharePointContext.Provider>
    </div>)
}