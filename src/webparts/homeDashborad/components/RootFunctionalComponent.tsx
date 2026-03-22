import * as React from 'react';
import { useState, useEffect, useContext } from "react";
import { SPHttpClient } from '@microsoft/sp-http';
import { IHomeDashboradProps } from './IHomeDashboradProps';
import WorkflowStatusChart from './WorkflowStatusChart';
import MyRequests from './MyRequests';
import { SharePointContext } from './SharePointContext';
import DepartmentWiseChart from './DepartmentWiseChart';

export default function RootFunctionalComponent(props: IHomeDashboradProps) {

    return(<div>
        <SharePointContext.Provider value={props.context}> 
            <div style={{width:"400px"}}>
            <WorkflowStatusChart context={props.context}/>
            </div>
            <div style={{width:"400px"}}>
            <DepartmentWiseChart/>
            </div>
            <div>
            <MyRequests/>
            </div>
        </SharePointContext.Provider>
    </div>)
}