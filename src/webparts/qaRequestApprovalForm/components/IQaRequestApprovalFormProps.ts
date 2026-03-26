import { SPHttpClient } from '@microsoft/sp-http';

export interface IQaRequestApprovalFormProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;

  // 🔥 Add these
  siteUrl: string;
  spHttpClient: SPHttpClient;
  listName: string;
}