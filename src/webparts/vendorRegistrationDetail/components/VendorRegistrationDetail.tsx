import * as React from 'react';
import styles from './VendorRegistrationDetail.module.scss';
import type { IVendorRegistrationDetailProps } from './IVendorRegistrationDetailProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class VendorRegistrationDetail extends React.Component<IVendorRegistrationDetailProps> {
  public render(): React.ReactElement<IVendorRegistrationDetailProps> {
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
