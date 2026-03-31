import * as React from 'react';
import styles from './VendorRegistrationManually.module.scss';
import type { IVendorRegistrationManuallyProps } from './IVendorRegistrationManuallyProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class VendorRegistrationManually extends React.Component<IVendorRegistrationManuallyProps> {
  public render(): React.ReactElement<IVendorRegistrationManuallyProps> {
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