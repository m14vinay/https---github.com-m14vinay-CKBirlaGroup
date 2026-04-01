import { WebPartContext } from '@microsoft/sp-webpart-base';
export interface IDocumentSearchProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
}
export interface IState {
  vendorName: string;
  GST: string;
  PAN: string;
  vendorCode: string;
  TANNo:string;
}
 export interface IData {
  id: number;
  name: string;
  amount: number;
}
export interface IColumn {
  key: string;
  name: string;
  fieldName: string;
  minWidth: number;
}

