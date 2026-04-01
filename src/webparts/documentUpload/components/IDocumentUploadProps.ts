import { WebPartContext } from '@microsoft/sp-webpart-base';
export interface IDocumentUploadProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
}
export interface IState {
  TypeofDocument:any;
  TypeofDocumentID:any;
  NameofDocument: any;
  BillNumber: any;
  BillDate: Date;
  vendorName: any;
  BillAmount: number;
  Remarks: any;
  files: FileList | null;
}
