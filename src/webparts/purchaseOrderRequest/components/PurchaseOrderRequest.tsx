import * as React from 'react';
import styles from './PurchaseOrderRequest.module.scss';
import { IPurchaseOrderRequestProps } from './IPurchaseOrderRequestProps';
import { SPHttpClient } from '@microsoft/sp-http';

interface IState {
  POrequestNo:string;
  POrequestNoError: string;
  projectCode: string;
  projectTitle: string;
  RemainingAmount: number;
  vendorName: string;
  Department:string;
  POAmount: number;
  //POAmountError:string,
  ApplicableTaxes:number;
  POCategory:string;
  Comments: string;
  files: FileList | null;
  filesError: string;
}
export default class PurchaseOrderRequest extends React.Component<IPurchaseOrderRequestProps, IState> {

  constructor(props: IPurchaseOrderRequestProps) {
    super(props);

    this.state = {
      POrequestNo:'',
      POrequestNoError:'',
      projectCode: '',
      projectTitle: '',
      vendorName: '',
      RemainingAmount: 0,
      Department:'',
      POAmount: 0,
     ApplicableTaxes:0,
     POCategory:'',
     Comments: '',
     files:  null,
     filesError: ''
    };
  }

  // --- VALIDATIONS ---
  validateProjectCode = (value: string): string => {
    if (!value) return 'Project Code is required';
    if (!/^[a-zA-Z0-9-]+$/.test(value)) return 'Project Code must be alphanumeric';
    if (value.length > 10) return 'Project Code must be at most 10 characters';
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
      
      projectTitle: '',
      vendorName: '',
      RemainingAmount: 0,
      Department:'',
      POAmount: 0 ,
  ApplicableTaxes:0,
  POCategory:'',
  Comments: '',
    });
  }
};
 
 validateFiles = (files: FileList | null): string => {
    if (!files || files.length === 0) return 'At least one file is required';
    return '';
 }

// private handlePOAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const value = e.target.value;
//   const error = this.validateNumber(value, 'PO Amount');

//   this.setState({
//     POAmount: Number(value),
//     POAmountError: error
//   });
// };

private handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const errorMsg = this.validateProjectCode(value);

    this.setState({ POrequestNo: value, POrequestNoError: errorMsg });

    if (!errorMsg) {
      this.getRequestDetails(value);
    } else {
      this.setState({ projectTitle: '', Department: '' });
    }
  };;

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
  
  
  private handleSubmit = () => {
    console.log("Form Data:", this.state);
    alert("Form Submitted");
  };

  private handleSave = () => {
    console.log("Saved Data:", this.state);
    alert("Saved");
  };

public render(): React.ReactElement<IPurchaseOrderRequestProps> {
    const { POrequestNo, POrequestNoError, projectTitle,  vendorName,filesError } = this.state;

    // Form is invalid if any required field has an error
    const isFormInvalid = !!POrequestNoError || !!filesError   || !POrequestNo || !vendorName || !this.state.files;

    return (
      <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h2>PO Approval Mapping Form</h2>
         
          <label>Project Code <span className={styles.required}>*</span></label>
          <input
            name="PorequestNo"
            value={POrequestNo}
            onChange={this.handleRequestNoChange}
            className={POrequestNoError ? styles.buttonGroup : ''}
          />
          {POrequestNoError && <span className={styles.error}>{POrequestNoError}</span>}
         
        
          <label>Department</label>
          <input name="Department" value={this.state.Department} readOnly  />

          <label>Project Title</label>
          <input name="projectTitle" value={this.state.projectTitle} readOnly />

          <label>Select Vendor Name</label>
          <input name="vendorName" value={this.state.vendorName} readOnly  >
          </input>

          <label>Remaining Amount</label>
          <input name="RemainingAmount" value={this.state.RemainingAmount} readOnly  />

          <label>PO Amount <span className={styles.required}>*</span></label>
          <input name="POAmount" value={this.state.POAmount} type="number" />

          <label>Applicable Taxes <span className={styles.required}>*</span></label>
          <input name="ApplicableTaxes" value={this.state.ApplicableTaxes} type="number"  >
          </input>


          <label>Additional Information & Remarks</label>
          <input name="comments" value={this.state.Comments}   >
          </input>

         <label>Attach Documents <span className={styles.required}>*</span></label>
                    <input type="file" multiple onChange={this.handleFileChange} />
                   {filesError && <span className={styles.required}>{filesError}</span>}
         

          {/* Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.submitBtn} onClick={this.handleSubmit}>Submit</button>
            <button className={styles.saveBtn} onClick={this.saveData}>Save</button>
            <button className={styles.cancelBtn}>Cancel</button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          {/* Templates */}
          <div className={styles.card}>
            <h4>Templates</h4>
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
