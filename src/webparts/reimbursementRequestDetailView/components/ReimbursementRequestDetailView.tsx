import * as React from 'react';
import styles from './ReimbursementRequestDetailView.module.scss';
import type { IReimbursementRequestDetailViewProps } from './IReimbursementRequestDetailViewProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import { Checkbox, Modal, PrimaryButton } from '@fluentui/react'
interface IState {
  RRequestNo:string;  
  ProjectTitle:string;
  Department:string;
  Remarks: string;
  TotalAmount:number;
  ExpenseType:string;
  SelectedDocument:string;
  BillNo:string
  BillAmount:number;
  BillDate:string;
  ClaimAmount:number;
  Description:string;
  SupportingAvailable:boolean;
}
export default class ReimbursementRequestDetailView extends React.Component<IReimbursementRequestDetailViewProps, IState> {

  constructor(props: IReimbursementRequestDetailViewProps) {
    super(props);

    this.state = {
      RRequestNo:'',
      ProjectTitle:'',
      Department:'',
      Remarks: '',
      TotalAmount:0,
      ExpenseType:'',
      SelectedDocument:'',
      BillNo:'',
      BillAmount:0,
      BillDate:'',
      ClaimAmount:0,
      Description:'',
      SupportingAvailable:false
    };
  }

  private handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    this.setState({ ...this.state, [name]: value });
  };

 private getRequestDetails = async (requestNo: string) => {
 
  const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items?$filter=RequestNo eq '${requestNo}'`;

    console.log("URL:",url)  
  const response = await this.props.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );

 const data = await response.json();

  if (data.value.length > 0) {
    this.setState({
      RRequestNo: data.value[0].RRequestNo,
      ProjectTitle: data.value[0].ProjectTitle,
      Department: data.value[0].Department,
      Remarks: data.value[0].Remarks,
      TotalAmount: data.value[0].TotalAmount,
      ExpenseType: data.value[0].ExpenseType,
      SelectedDocument: data.value[0].SelectedDocument,
      BillNo: data.value[0].BillNo,
      BillAmount: data.value[0].BillAmount,
      BillDate: data.value[0].BillDate,
      ClaimAmount: data.value[0].ClaimAmount,
      Description: data.value[0].Description,
      SupportingAvailable: data.value[0].SupportingAvailable          
    });
  } else {
   
    this.setState({
       RRequestNo:'',
      ProjectTitle:'',
      Department:'',
      Remarks: '',
      TotalAmount:0,
      ExpenseType:'',
      SelectedDocument:'',
      BillNo:'',
      BillAmount:0,
      BillDate:'',
      ClaimAmount:0,
      Description:'',
      SupportingAvailable:false
    });
  }
};
 
private handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  this.setState({ RRequestNo: value });

 // optional
    this.getRequestDetails(value);
  
};

  private saveData = async () => {

  const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VendorMapping')/items?$format=json`;

  const body = {
    RRequestNo: this.state.  RRequestNo,      
     };
  
  const response = await this.props.context.spHttpClient.post(
    url,SPHttpClient.configurations.v1,
   {
      headers: {
        "Accept": "application/json;odata=nometadata",
        "Content-Type": "application/json;odata=nometadata"
      },
      body: JSON.stringify(body)
    }
  );
   const result = await response.json();
  console.log("Response:", result);

   if (response.ok) {
    alert("Data Saved Successfully ✅");
  } else {
    alert("Error saving data ❌");
  }
};
  
  public render(): React.ReactElement<IReimbursementRequestDetailViewProps> {
    

    return (
      <div className={styles.container}>

        {/* LEFT FORM */}
        
        <div className={styles.leftPanel}>
          <h2>Reimbursement Request Approval</h2>
          <h4>Reimbursement Request Approval</h4>

          <label>Select Department</label>
          <input value={this.state.Department}  onChange={this.handleRequestNoChange}  />

          <div className={styles.gridContainer}>

          </div>

          <label>Total Amount</label>
          <input name="totalAmount" value={this.state.TotalAmount}   >
          </input>         

          <label>Remarks</label>
          <input name="remarks" value={this.state.Remarks}   >
          </input>          
        </div>
        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          {/* Templates */}
          <div className={styles.card}>
            <h4>Templates</h4>
            <ul>
              <li>Quotation_Approval_Form_v1.0.xlsx</li>
              <li>SOP_Procurement_of_Goods_Services-CKBCS.pdf</li>
              <li>DigiFlow_Training_Manual.pdf</li>
            </ul>
          </div>

          {/* Guidelines */}
          <div className={styles.card}>
            <h4>Important Guidelines</h4>
            <ol>
              <li>Select approval path carefully.</li>
              <li>Use project reference if needed.</li>
              <li>Attach all documents (Max 25 MB).</li>
              <li>Avoid special characters in file names.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

