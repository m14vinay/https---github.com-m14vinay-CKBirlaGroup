import { SPHttpClient } from '@microsoft/sp-http';

export interface IOuotationApprovalFormProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;

  // 🔥 ADD THESE (Important)
  siteUrl: string;
  spHttpClient: SPHttpClient;
  listName: string;
}