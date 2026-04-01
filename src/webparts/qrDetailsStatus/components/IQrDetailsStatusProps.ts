import { SPHttpClient } from '@microsoft/sp-http';

export interface IQrDetailsStatusProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  siteUrl: string;
  spHttpClient: SPHttpClient;
  listName: string;
}
