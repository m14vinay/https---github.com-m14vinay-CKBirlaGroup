import * as React from 'react';
import styles from './HomeDashborad.module.scss';
import type { IHomeDashboradProps } from './IHomeDashboradProps';
import { escape } from '@microsoft/sp-lodash-subset';
import WorkflowStatusChart from './WorkflowStatusChart';
import MyRequests from './MyRequests';

export default class HomeDashborad extends React.Component<IHomeDashboradProps> {
  public render(): React.ReactElement<IHomeDashboradProps> {

    return (
      <section className={`${styles.homeDashborad}`}>
        <div style={{width:"400px"}}>
          <WorkflowStatusChart context={this.props.context}/>
        </div>
        <div>
          <MyRequests context={this.props.context}/>
        </div>
      </section>
    );
  }
}
