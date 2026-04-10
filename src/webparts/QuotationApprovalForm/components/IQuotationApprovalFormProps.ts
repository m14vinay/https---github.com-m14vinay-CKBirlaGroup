import { SPHttpClient } from '@microsoft/sp-http';

export interface IQuotationApprovalFormProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;

  // 🔥 ADD THESE (Important)
  siteUrl: string;
  spHttpClient: SPHttpClient;
  listName: string;
  context: any; // You can replace 'any' with the specific type if you have it
}
