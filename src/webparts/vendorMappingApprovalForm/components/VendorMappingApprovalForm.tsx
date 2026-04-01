import * as React from 'react';
import styles from './VendorMappingApprovalForm.module.scss';
import { IVendorMappingApprovalFormProps } from './IVendorMappingApprovalFormProps';
import { SPHttpClient } from '@microsoft/sp-http';

interface IState {
   requestNo:string;
   requestNoError: string;
  projectCode: string;
  projectTitle: string;
  projectDescription: string;
  vendorName: string;
  vendorDescription: string;
  files: FileList | null;
  filesError: string;
  approverComments:string;
  approverCommentsError:string;
}

export default class VendorMappingForm extends React.Component<IVendorMappingApprovalFormProps, IState> {

  constructor(props: IVendorMappingApprovalFormProps) {
    super(props);

    this.state = {
      requestNo:'',
       requestNoError: '',
      projectCode: '',
      projectTitle: '',
      projectDescription: '',
      vendorName: '',
      vendorDescription: '',
      files: null,
      filesError: '',
      approverComments:'',
      approverCommentsError:''


    };
  }

   // --- VALIDATIONS ---
  validateProjectCode = (value: string): string => {
    if (!value) return 'Project Code is required';
    if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Project Code must be alphanumeric';
    if (value.length > 10) return 'Project Code must be at most 10 characters';
    return '';
  }

  validateVendorName = (value: string): string => {
    if (!value) return 'Vendor selection is required';
    return '';
  }

  validateFiles = (files: FileList | null): string => {
    if (!files || files.length === 0) return 'At least one file is required';
    return '';
  }
  
  validateApproverComments = (value: string): string => {
    if (!value) return 'Vendor approver is required';
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
      projectTitle: data.value[0].ProjectTitle,
      projectDescription: data.value[0].ProjectDescription
    });
  } else {
   
    this.setState({
      projectTitle: '',
      projectDescription: ''
    });
  }
};
 
private handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const errorMsg = this.validateProjectCode(value);

    this.setState({ requestNo: value, requestNoError: errorMsg });

    if (!errorMsg) {
      this.getRequestDetails(value);
    } else {
      this.setState({ projectTitle: '', projectDescription: '' });
    }
  };
   private handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      const errorMsg = this.validateFiles(files);
      this.setState({ files: files, filesError: errorMsg });
    };

   private handleApproverCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;                    // get text input value
  const errorMsg = this.validateApproverComments(value);  // validate required field
  this.setState({ approverComments: value, approverCommentsError: errorMsg });
};
  private saveData = async () => {

  const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VendorMapping')/items?$format=json`;

  const body = {
  
    ProjectCode: this.state.requestNo,
    ProjectTitle: this.state.projectTitle,
    ProjectDescription: this.state.projectDescription,
    VendorName : this.state.vendorName,
    VendorDescription: this.state.vendorDescription,
    Attachments: this.state.files
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

  public render(): React.ReactElement<IVendorMappingApprovalFormProps> {
    const { requestNo, requestNoError, projectTitle, projectDescription, vendorName, filesError } = this.state;

    // Form is invalid if any required field has an error
    const isFormInvalid = !!requestNoError  || !!filesError || !requestNo || !vendorName || !this.state.files;

    return (
      <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h2>Vendor Mapping Approval Form</h2>
       
           <label>Project Code </label>
    <input name="requestNo" value={this.state.requestNo} readOnly/>

    {/* Project Title (Read Only) */}
    <label>Project Title</label>
    <input name="projectTitle" value={this.state.projectTitle} readOnly/>

    {/* Project Description (Read Only) */}
    <label>Project Description</label>
    <input name="projectDescription" value={this.state.projectDescription} readOnly/>

    {/* Vendor Name (Read Only) */}
    <label>Select Vendor </label>
    <input name="vendorName" value={this.state.vendorName}readOnly/>

    {/* Additional Information / Remarks (Read Only) */}
    <label>Additional Information & Remarks</label>
    <input  name="VendorDescription"  value={this.state.vendorDescription} readOnly />

    <label>Attach Documents</label>
           
          
  <label>Approver Comments <span className={styles.required}>*</span></label>
<input name="ApproverComments" value={this.state.approverComments} onChange={this.handleApproverCommentsChange}
  className={this.state.approverCommentsError ? styles.inputError : ''}
/>
{this.state.approverCommentsError && (
  <span className={styles.error}>{this.state.approverCommentsError}</span>
)}

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
            <h4>Templates</h4>
            <ul>
              <li>Vendor_Registration_Form_v1.0.xlsx</li>
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