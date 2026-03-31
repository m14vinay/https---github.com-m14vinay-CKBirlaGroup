import * as React from 'react';
import styles from './VendorRegistrationSearch.module.scss';
import type { IVendorRegistrationSearchProps } from './IVendorRegistrationSearchProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class VendorRegistrationSearch extends React.Component<IVendorRegistrationSearchProps> {
  public render(): React.ReactElement<IVendorRegistrationSearchProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <section>
      </section>
    );
  }
}
