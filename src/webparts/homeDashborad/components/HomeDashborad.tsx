import * as React from 'react';
import styles from './HomeDashborad.module.scss';
import type { IHomeDashboradProps } from './IHomeDashboradProps';
import { escape } from '@microsoft/sp-lodash-subset';
import RootFunctionalComponent from './RootFunctionalComponent';

export default class HomeDashborad extends React.Component<IHomeDashboradProps> {

  public render(): React.ReactElement<IHomeDashboradProps> {
    return (
      <section className={`${styles.homeDashborad}`}>
        <RootFunctionalComponent context={this.props.context}/>
      </section>
    );
  }
}
