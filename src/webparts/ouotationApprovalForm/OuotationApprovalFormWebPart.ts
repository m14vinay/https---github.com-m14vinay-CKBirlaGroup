import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'OuotationApprovalFormWebPartStrings';
import { OuotationApprovalForm } from './components/OuotationApprovalForm';
import { IOuotationApprovalFormProps } from './components/IOuotationApprovalFormProps';

export interface IOuotationApprovalFormWebPartProps {
  description: string;
}

export default class OuotationApprovalFormWebPart extends BaseClientSideWebPart<IOuotationApprovalFormWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {

    const element: React.ReactElement<IOuotationApprovalFormProps> = React.createElement(
      OuotationApprovalForm,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,

        // 🔥 IMPORTANT (Added)
        siteUrl: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient,
        listName: 'Quotation Approval'
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
    if (!!this.context.sdks.microsoftTeams) {
      return new Promise((resolve) => {
        const teamsJs = this.context.sdks.microsoftTeams?.teamsJs;
        if (teamsJs?.getContext) {
          teamsJs.getContext((context: any) => {
            let environmentMessage: string = '';
            const isLocalhost = this.context.pageContext.web.absoluteUrl.includes('localhost');

            switch (context.host.name) {
              case 'Office':
                environmentMessage = isLocalhost
                  ? strings.AppLocalEnvironmentOffice
                  : strings.AppOfficeEnvironment;
                break;

              case 'Outlook':
                environmentMessage = isLocalhost
                  ? strings.AppLocalEnvironmentOutlook
                  : strings.AppOutlookEnvironment;
                break;

              case 'Teams':
              case 'TeamsModern':
                environmentMessage = isLocalhost
                  ? strings.AppLocalEnvironmentTeams
                  : strings.AppTeamsTabEnvironment;
                break;

              default:
                environmentMessage = strings.UnknownEnvironment;
            }

            resolve(environmentMessage);
          });
        } else {
          resolve(strings.UnknownEnvironment);
        }
      });
    }

    const isLocalhost = this.context.pageContext.web.absoluteUrl.includes('localhost');
    return Promise.resolve(
      isLocalhost
        ? strings.AppLocalEnvironmentSharePoint
        : strings.AppSharePointEnvironment
    );
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;

    this._isDarkTheme = !!currentTheme.isInverted;

    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected  getdataVersion: Version = Version.parse('1.0');

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