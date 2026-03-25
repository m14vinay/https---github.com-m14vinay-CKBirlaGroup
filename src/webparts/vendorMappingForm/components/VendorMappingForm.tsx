import * as React from 'react';
import styles from './VendorMappingForm.module.scss';
import { IVendorMappingFormProps } from './IVendorMappingFormProps';
import { SPHttpClient } from '@microsoft/sp-http';

interface IState {
  requestNo:string;
  projectCode: string;
  projectTitle: string;
  projectDescription: string;
  vendorName: string;
  vendorDescription: string;
  files: FileList | null;
}

export default class VendorMappingForm extends React.Component<IVendorMappingFormProps, IState> {

  constructor(props: IVendorMappingFormProps) {
    super(props);

    this.state = {
      requestNo:'',
      projectCode: '',
      projectTitle: '',
      projectDescription: '',
      vendorName: '',
      vendorDescription: '',
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

  this.setState({ requestNo: value });

 // optional
    this.getRequestDetails(value);
  
};

  private handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ files: e.target.files });
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
  
  
  private handleSubmit = () => {
    console.log("Form Data:", this.state);
    alert("Form Submitted");
  };

  private handleSave = () => {
    console.log("Saved Data:", this.state);
    alert("Saved");
  };

  public render(): React.ReactElement<IVendorMappingFormProps> {

    return (
      <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h2>Vendor Mapping Form</h2>
          <h4>Vendor Mapping / New Vendor Registration Form</h4>

          <label>Project Code</label>
          <input value={this.state.requestNo}  onChange={this.handleRequestNoChange}  />

          <label>Project Title</label>
          <input name="projectTitle" value={this.state.projectTitle} readOnly />

          <label>Project Description</label>
          <input name="projectDescription" value={this.state.projectDescription} readOnly  >
          </input>

          <label>Select Vendor</label>
          <select name="vendorName" onChange={this.handleChange}>
            <option value="">Select Vendor</option>
            <option value="Vendor1">Vendor </option>
            <option value="Vendor2">Vendor 2</option>
          </select>

          <label>Additional Information & Remarks</label>
          <textarea name="VendorDescription" onChange={this.handleChange}></textarea>

          <label>Attach Documents</label>
          <input type="file" multiple onChange={this.handleFileChange} />

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