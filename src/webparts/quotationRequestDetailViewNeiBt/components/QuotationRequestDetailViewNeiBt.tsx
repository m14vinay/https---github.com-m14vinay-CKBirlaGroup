import * as React from 'react';
import styles from './QuotationRequestDetailViewNeiBt.module.scss';
import type { IQuotationRequestDetailViewNeiBtProps } from './IQuotationRequestDetailViewNeiBtProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
interface IState {
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
export default class QuotationRequestDetailViewNeiBt extends React.Component<IQuotationRequestDetailViewNeiBtProps, IState> {

  constructor(props: IQuotationRequestDetailViewNeiBtProps) {
    super(props);

    this.state = {
      QARequestNo:'',
      ProjectTitle:'',
      ProjectReferenceNo:'',
      projectDescription: '',
      TotalProjectAmount:0,
      ApplicableTaxes:0,
      Vendor1: '',
      Vendor2: '',
      Vendor3: '',
      Quote1:'',
      Quote2:'',
      Quote3:'',
      Vendor:'',
      Quote:'',
      Department:'',
      AdvancePayment:0,
      ApprovalPath: '',
      files: null
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
      QARequestNo: data.value[0].QARequestNo,
      ProjectTitle: data.value[0].ProjectTitle,
      ProjectReferenceNo: data.value[0].ProjectReferenceNo,
      projectDescription: data.value[0].projectDescription,
      TotalProjectAmount: data.value[0].TotalProjectAmount,
      ApplicableTaxes: data.value[0].ApplicableTaxes,
      Vendor1: data.value[0].Vendor1,
      Vendor2: data.value[0].Vendor2,
      Vendor3: data.value[0].Vendor3,
      Quote1: data.value[0].Quote1,
      Quote2: data.value[0].Quote2,
      Quote3: data.value[0].Quote3,
      Vendor: data.value[0].Vendor,
      Quote: data.value[0].Quote,
      Department: data.value[0].Department,
      AdvancePayment: data.value[0].AdvancePayment,
      ApprovalPath: data.value[0].ApprovalPath
    });
  } else {
   
    this.setState({
       QARequestNo:'',
      ProjectTitle:'',
      ProjectReferenceNo:'',
      projectDescription: '',
      TotalProjectAmount:0,
      ApplicableTaxes:0,
      Vendor1: '',
      Vendor2: '',
      Vendor3: '',
      Quote1:'',
      Quote2:'',
      Quote3:'',
      Vendor:'',
      Quote:'',
      Department:'',
      AdvancePayment:0,
      ApprovalPath: ''
    });
  }
};
 
private handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  this.setState({ QARequestNo: value });

 // optional
    this.getRequestDetails(value);
  
};

  private handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ files: e.target.files });
  };
  private saveData = async () => {

  const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VendorMapping')/items?$format=json`;

  const body = {
  QARequestNo: this.state.  QARequestNo,      
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
    console.log("Form Data:", this.state);
    alert("Form Rejected");
  };

  public render(): React.ReactElement<IQuotationRequestDetailViewNeiBtProps> {

    return (
      <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h2>Quotation Approval Form-NEI BT Admin</h2>
          <h4>Quotation Approval Form-NEI BT Admin/Request Details</h4>

          <label>Project Title</label>
          <input value={this.state.ProjectTitle}  onChange={this.handleRequestNoChange}  />

          <label>Project Reference No</label>
          <input name="projectReferenceNo" value={this.state.ProjectReferenceNo}   >
          </input>

          <label>Project Description & Advance Payment Details</label>
          <input name="projectDescription" value={this.state.projectDescription}   >
          </input>

          <label>Total Project Amount</label>
          <input name="totalProjectAmount" value={this.state.TotalProjectAmount }  />

          <label>Applicable Taxes</label>
          <input name="applicableTaxes" value={this.state.ApplicableTaxes}   >
          </input>

          <label>Vendor 1</label>
          <input name="vendor1" value={this.state.Vendor1}  />

          <label>Vendor 2</label>
          <input name="vendor2" value={this.state.Vendor2}  />

          <label>Vendor 3</label>
          <input name="vendor3" value={this.state.Vendor3}  />

          <label>Quote 1</label>
          <input name="quote1" value={this.state.Quote1}  />

          <label>Quote 2</label>
          <input name="quote2" value={this.state.Quote2}  />

          <label>Quote 3</label>
          <input name="quote3" value={this.state.Quote3}  />

          <label>Select Vendor</label>
          <input name="vendor" value={this.state.Vendor}  />

          <label>Select Quote</label>
          <input name="quote" value={this.state.Quote}   >
          </input>

          <label>Department</label>
          <input name="Department" value={this.state.Department}   >
          </input>

          <label>Advance Amount</label>
          <input name="AdvanceAmount" value={this.state.AdvancePayment}   >
          </input>

          <label>Approval Path</label>
          <input name="ApprovalPath" value={this.state.ApprovalPath}   >
          </input>          

          <label>Attach Documents</label>
          <input type="file" multiple onChange={this.handleFileChange} /> 
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

