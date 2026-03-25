import { WebPartContext } from '@microsoft/sp-webpart-base';
export interface IQuotationRequestApprovalNeiBtProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
}
export interface IState {
  QARequestNo:string;  
  ProjectTitle:string;
  ProjectReferenceNo:string;
  projectDescription: string;
  TotalProjectAmount:number;
  ApplicableTaxes:number;
  Vendor1: string;
  Vendor2: string;
  Vendor3: string;
  Quote1:string;
  Quote2:string;
  Quote3:string;
  Vendor:string;
  Quote:string;
  Department:string;
  AdvancePayment:number;
  ApprovalPath: string;
  files: FileList | null;
}
export interface IForm {
  projectTitle: string;
  projectDescription: string;
  department: string;
  approvalPath: string;
  vendor1: string;
  vendor2: string;
  vendor3: string;
  selectedVendor: string;
  quote1: number;
  quote2: number;
  quote3: number;
  selectedQuote: number;
  projectRef: string;
  files: File[];
}