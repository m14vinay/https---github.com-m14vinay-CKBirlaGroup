import * as React from 'react';
import styles from './PurchaseOrderApproval.module.scss';
import { IPurchaseOrderApprovalProps } from './IPurchaseOrderApprovalProps';
import { SPHttpClient } from '@microsoft/sp-http';

interface IState {
  POrequestNo:string;
  projectCode: string;
  projectTitle: string;
  RemainingAmount: number;
  vendorName: string;
  Department:string;
  POAmount: number;
  ApplicableTaxes:number;
  POCategory:string;
  Comments: string;
  ApproverComments:string;
   ApproverCommentsError:string;
  files: FileList | null;
}
export default class PurchaseOrderRequest extends React.Component<IPurchaseOrderApprovalProps, IState> {

  constructor(props: IPurchaseOrderApprovalProps) {
    super(props);

    this.state = {
      POrequestNo:'',
      projectCode: '',
      projectTitle: '',
      vendorName: '',
      RemainingAmount: 0,
      Department:'',
      POAmount: 0,
     ApplicableTaxes:0,
     POCategory:'',
     Comments: '',
     ApproverComments:'',
     ApproverCommentsError:'',
     files:  null
    };
  }

  validateApproverComments = (value: string): string => {
    if (!value) return 'Approver Comments is required';
    return '';
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
      POrequestNo: data.value[0].projectCode,
      projectCode: data.value[0].ProjectDescription,
      projectTitle: data.value[0].ProjectTitle,
      vendorName: data.value[0].VendorName,
      RemainingAmount: data.value[0].RemainingAmount,
      Department:data.value[0].Department,
      POAmount: data.value[0].POAmount,
     ApplicableTaxes:data.value[0].ApplicableTaxes,
     POCategory:data.value[0].POCategory,
     Comments: data.value[0].Comments
      
    });
  } else {
   
    this.setState({
      projectCode: '',
      projectTitle: '',
      vendorName: '',
      RemainingAmount: 0,
      Department:'',
      POAmount: 0,
  ApplicableTaxes:0,
  POCategory:'',
  Comments: '',
    });
  }
};
 
private handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  this.setState({ POrequestNo: value });

 // optional
    this.getRequestDetails(value);
  
};


private handleApproverCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;                    // get text input value
  const errorMsg = this.validateApproverComments(value);  // validate required field
  this.setState({ ApproverComments: value, ApproverCommentsError: errorMsg });
};

  private handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ files: e.target.files });
  };
  private saveData = async () => {

  const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VendorMapping')/items?$format=json`;

  const body = {
  POrequestNo: this.state.POrequestNo,
      projectCode: this.state.projectCode,
      projectTitle: this.state.projectTitle,
      vendorName: this.state.vendorName,
      RemainingAmount: this.state.RemainingAmount,
      Department:this.state.Department,
      POAmount: this.state.POAmount,
     ApplicableTaxes:this.state.ApplicableTaxes,
     POCategory:this.state.POCategory,
     Comments: this.state.Comments
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
  
  
  private handleApprove = () => {
    console.log("Form Data:", this.state);
    alert("Form Submitted");
  };

  private handleReject = () => {
    console.log("Saved Data:", this.state);
    alert("Saved");
  };

  public render(): React.ReactElement<IPurchaseOrderApprovalProps> {

    return (
      <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h2>PO Approval Form</h2>
          <h4>PO Approval / Request Approval</h4>

          <label>Project Code</label>
          <input value={this.state.POrequestNo}  onChange={this.handleRequestNoChange} readOnly />

          <label>Department</label>
          <input name="Department" value={this.state.Department} readOnly />

          <label>Project Title</label>
          <input name="projectTitle" value={this.state.projectTitle} readOnly />

          <label>Select Vendor Name</label>
          <input name="vendorName" value={this.state.vendorName} readOnly   >
          </input>

          <label>Remaining Amount</label>
          <input name="RemainingAmount" value={this.state.RemainingAmount} readOnly  />

          <label>PO Amount</label>
          <input name="POAmount" value={this.state.POAmount} readOnly  />

          <label>Applicable Taxes</label>
          <input name="ApplicableTaxes" value={this.state.ApplicableTaxes} readOnly   >
          </input>

           <label>PO Category</label>
          <input name="POCategory" value={this.state.POCategory} readOnly   >
          </input>

          <label>Additional Information & Remarks</label>
          <input name="comments" value={this.state.Comments}  readOnly >
          </input>

        <label>Approver Comments <span className={styles.required}>*</span></label>
<input name="ApproverComments" value={this.state.ApproverComments} onChange={this.handleApproverCommentsChange}
  className={this.state.ApproverCommentsError ? styles.inputError : ''}/>
{this.state.ApproverCommentsError && (
  <span className={styles.error}>{this.state.ApproverCommentsError}</span>
)}

          <label>Attach Documents</label>
          {/* <input type="file" multiple onChange={this.handleFileChange} /> */}

          {/* Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.ApproveBtn} onClick={this.handleApprove}>Approve</button>
            <button className={styles.RejectBtn} onClick={this.handleReject}>Reject</button>
            <button className={styles.cancelBtn}>Cancel</button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          {/* Templates */}
          <div className={styles.card}>
            <h4>Timeline of the Request - </h4>
            <ul>
              <li>PO_v1.0.xlsx</li>
              <li>SOP_Procurement_of_Goods_Services.pdf</li>
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
