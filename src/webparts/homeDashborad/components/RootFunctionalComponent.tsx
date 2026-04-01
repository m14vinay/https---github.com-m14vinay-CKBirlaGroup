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
            <div><label style={{fontSize:"20px"}}>Digital Overview Status</label></div>
            <div style={{width:"33%", minWidth:"350px", display:"inline-block"}}>
                <WorkflowStatusChart context={props.context}/>
            </div>
            <div style={{width:"33%", minWidth:"350px", display:"inline-block"}}>
                <DepartmentWiseChart/>
            </div>
            <div style={{width:"33%", minWidth:"350px", display:"inline-block"}}>
                <WorkflowPendingAtChart/>
            </div>
            <div><label style={{fontSize:"20px"}}>My Workflow Status</label></div>
            <div style={{width:"33%", minWidth:"350px", display:"inline-block"}}>
                <MyWorkflowStatusChart context={props.context}/>
            </div>
            <div style={{width:"33%", minWidth:"350px", display:"inline-block"}}>
                <MyDepartmentWiseChart/>
            </div>
            {/* <CarousalMenu/> */}
            <div>
                <MyPendingRequests/>
            </div>
            <div>
                <MyRequests/>
            </div>
        </SharePointContext.Provider>
    </div>)
}