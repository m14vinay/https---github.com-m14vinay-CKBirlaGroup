import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'PurchaseOrderRequestWebPartStrings';
import PurchaseOrderRequest from './components/PurchaseOrderRequest';
import { IPurchaseOrderRequestProps } from './components/IPurchaseOrderRequestProps';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import * as microsoftTeams from "@microsoft/teams-js";
export interface IPurchaseOrderRequestWebPartProps {
  description: string;
}

export default class PurchaseOrderRequestWebPart extends BaseClientSideWebPart<IPurchaseOrderRequestWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IPurchaseOrderRequestProps> = React.createElement(
      PurchaseOrderRequest,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
         context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }



 private _getEnvironmentMessage(): Promise<string> {

  const isLocal: boolean = Environment.type === EnvironmentType.Local;

  if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
    return microsoftTeams.app.getContext()
      .then((context: any) => {
        let environmentMessage: string = '';

        switch (context.app.host.name) {
          case 'Office': // running in Office
            environmentMessage = isLocal
              ? strings.AppLocalEnvironmentOffice
              : strings.AppOfficeEnvironment;
            break;

          case 'Outlook': // running in Outlook
            environmentMessage = isLocal
              ? strings.AppLocalEnvironmentOutlook
              : strings.AppOutlookEnvironment;
            break;

          case 'Teams': // running in Teams
          case 'TeamsModern':
            environmentMessage = isLocal
              ? strings.AppLocalEnvironmentTeams
              : strings.AppTeamsTabEnvironment;
            break;

          default:
            environmentMessage = strings.UnknownEnvironment;
        }

        return environmentMessage;
      });
  }

  return Promise.resolve(
    isLocal
      ? strings.AppLocalEnvironmentSharePoint
      : strings.AppSharePointEnvironment
  );
}

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  //protected dataVersion: Version = Version.parse('1.0');
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
