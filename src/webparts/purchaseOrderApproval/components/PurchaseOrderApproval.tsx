import * as React from 'react';
import styles from './PurchaseOrderApproval.module.scss';
import { IPurchaseOrderApprovalProps } from './IPurchaseOrderApprovalProps';
import { SPHttpClient } from '@microsoft/sp-http';
import SharePointService from '../service/Service';

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
  attachments: any [];
  approver1: string;
  approver2: string;
  approver3: string;
  approver4: string;
  approver5: string;
  DepartmentHead: string;
};
export default class PurchaseOrderRequest extends React.Component<IPurchaseOrderApprovalProps, IState> {
  private service: SharePointService;
  constructor(props: IPurchaseOrderApprovalProps) {
    super(props);
  this.service = new SharePointService(props.context);
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
     ApproverComments: '',
     attachments: [],
    approver1: '',
   approver2: '',
   approver3: '',
   approver4: '',
   approver5: '',
   DepartmentHead: ''
    };
  }
private loadAttachments = async () => {
  const files = await this.service.getAttachments(10);
  console.log("Attachments:", files);
  this.setState({
    attachments: files
  });
};

private GetApprover = async () => {
  const data = await this.service.getApprover('');
  if(data.ok)
  {
    this.setState({approver1:data[0].approver1});
    this.setState({approver2:data[0].approver2});
    this.setState({approver3:data[0].approver3});
    this.setState({approver4:data[0].approver4});
    this.setState({approver5:data[0].approver5});
    this.setState({DepartmentHead:data[0].DepartmentHead});
  }
};

componentDidMount(): void {
  this.loadAttachments();
  this.GetApprover();
}
 
private handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  this.setState({ POrequestNo: value });  
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
          <input value={this.state.POrequestNo}  onChange={this.handleRequestNoChange}  />

          <label>Department</label>
          <input name="Department" value={this.state.Department}  />

          <label>Project Title</label>
          <input name="projectTitle" value={this.state.projectTitle}  />

          <label>Select Vendor Name</label>
          <input name="vendorName" value={this.state.vendorName}   >
          </input>

          <label>Remaining Amount</label>
          <input name="RemainingAmount" value={this.state.RemainingAmount}  />

          <label>PO Amount</label>
          <input name="POAmount" value={this.state.POAmount}  />

          <label>Apllicable Taxes</label>
          <input name="ApplicableTaxes" value={this.state.ApplicableTaxes}   >
          </input>

          <label>Additional Information & Remarks</label>
          <input name="comments" value={this.state.Comments}   >
          </input>

          <label>Approver Comments</label>
          <input name="ApproverComments" value={this.state.ApproverComments}   >
          </input>

          <label>Attach Documents</label>
          <ul>
  {this.state.attachments.map((file, index) => (
    <li key={index}>
      <a href={file.ServerRelativeUrl} target="_blank">
        {file.FileName}
      </a>
    </li>
  ))}
</ul>

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
