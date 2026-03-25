import * as React from 'react';
import styles from './BillProcessingDetailView.module.scss';
import type { IBillProcessingDetailViewProps } from './IBillProcessingDetailViewProps';
import { SPHttpClient } from '@microsoft/sp-http';

interface IState {
  BPRequestNo:string;
  POsigned:boolean
  ProjcetCode:string
  vendorCode: string;
  vendorName: string;
  projectTitle: string;
  Comments: string;
  PORequestNo:string;
  BillNo:string;
  BillDate:Date;
  BillAmount: number;  
  CalculatedTaxes:number;
  TotalAmount: number;  
  UploadDocument:string;
  ApproverComment:string;
  files: FileList | null;
}
export default class BillProcessingDetailView extends React.Component<IBillProcessingDetailViewProps, IState> {

  constructor(props: IBillProcessingDetailViewProps) {
    super(props);

    this.state = {
      BPRequestNo:'',
      POsigned: true,
      ProjcetCode:'',
      vendorCode: '',
      vendorName: '',
      projectTitle: '',
      Comments: '',
      PORequestNo:'',
      BillNo:'',
      BillDate: new Date(),
      BillAmount: 0,
      CalculatedTaxes: 0,
      TotalAmount: 0,
      UploadDocument: '',
      ApproverComment:'',
     files:  null
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
      BPRequestNo: data.value[0].BPRequestNo,
      POsigned: data.value[0].POsigned,
      ProjcetCode: data.value[0].ProjcetCode,
      vendorCode: data.value[0].vendorCode,
      vendorName: data.value[0].vendorName,
      projectTitle: data.value[0].projectTitle,
      Comments: data.value[0].Comments,
      PORequestNo: data.value[0].PORequestNo,
      BillNo: data.value[0].BillNo,
      BillDate: new Date(data.value[0].BillDate),
      BillAmount: data.value[0].BillAmount,
      CalculatedTaxes: data.value[0].CalculatedTaxes,
      TotalAmount: data.value[0].TotalAmount,
      ApproverComment: data.value[0].ApproverComment,
      UploadDocument: data.value[0].UploadDocument      
    });
  } else {
   
    this.setState({
       BPRequestNo:'',
      POsigned: true,
      ProjcetCode:'',
      vendorCode: '',
      vendorName: '',
      projectTitle: '',
      Comments: '', 
      PORequestNo:'',
      BillNo:'',
      BillDate: new Date(),
      BillAmount: 0,
      CalculatedTaxes: 0,
      TotalAmount: 0,
      UploadDocument: '',
      ApproverComment:'',
     files:  null
    });
  }
};
 
private handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  this.setState({ BPRequestNo: value });

 // optional
    this.getRequestDetails(value);
  
};

  private handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ files: e.target.files });
  };
  private saveData = async () => {

  const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VendorMapping')/items?$format=json`;

  const body = {
  BPRequestNo: this.state.  BPRequestNo,      
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
  
  
  private handlemail = () => {
    console.log("Form Data:", this.state);
    alert("Form Submitted");
  };
  public render(): React.ReactElement<IBillProcessingDetailViewProps> {

    return (
      <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h2>Bill Processing Details</h2>
          <h4>Bill Processing / Request Details</h4>

          <label>PO Signed</label>
          <input type="checkbox" checked={this.state.POsigned}  onChange={this.handleRequestNoChange}  />

          <label>Project Code</label>
          <input value={this.state.ProjcetCode}  onChange={this.handleRequestNoChange}  />

          <label>Select Vendor Code</label>
          <input name="vendorCode" value={this.state.vendorCode}   >
          </input>

          <label>Select Vendor Name</label>
          <input name="vendorName" value={this.state.vendorName}   >
          </input>

          <label>Project Title</label>
          <input name="projectTitle" value={this.state.projectTitle}  />

          <label>Additional Information & Remarks</label>
          <input name="comments" value={this.state.Comments}   >
          </input>

          <label>PO Request No</label>
          <input name="PORequestNo" value={this.state.PORequestNo}  />

          <label>Bill No</label>
          <input name="BillNo" value={this.state.BillNo}   >
          </input>

          <label>Bill Date</label>
          <input name="BillDate" type="date" value={this.state.BillDate.toISOString().split('T')[0]}   >
          </input>

          <label>Bill Amount</label>
          <input name="BillAmount" value={this.state.BillAmount}   >
          </input>

          <label>Calculated Taxes</label>
          <input name="CalculatedTaxes" value={this.state.CalculatedTaxes}   >
          </input>

          <label>Total Amount</label>
          <input name="TotalAmount" value={this.state.TotalAmount}   >
          </input>          

          <label>Select Uploaded Documents</label>
          <input type="file" multiple onChange={this.handleFileChange} /> 
          {/* Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.submitBtn} onClick={this.handlemail}>Send Mail to Vendor</button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          {/* Templates */}
          <div className={styles.card}>
            <h4>Templates</h4>
            <ul>
              <li>Cheque_Payment_Form_v1.0.xlsx</li>
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

