import { WebPartContext } from '@microsoft/sp-webpart-base';
export interface IVendorRegistrationProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
}
