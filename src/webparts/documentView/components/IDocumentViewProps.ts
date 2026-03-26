import { WebPartContext } from '@microsoft/sp-webpart-base';
export interface IDocumentViewProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
}
