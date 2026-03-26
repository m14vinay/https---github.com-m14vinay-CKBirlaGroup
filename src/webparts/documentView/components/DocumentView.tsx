import * as React from 'react';
import styles from './DocumentView.module.scss';
import { IDocumentViewProps } from './IDocumentViewProps';
import { SPHttpClient } from '@microsoft/sp-http';

interface IState {
  TypeofDocument:string;
  NameofDocument: string;
  BillNumber: string;
  BillDate: Date;
  vendorName: string;
  BillAmount: number;
  Remarks: string;
  files: FileList | null;
}
export default class DocumentView extends React.Component<IDocumentViewProps, IState> {

  constructor(props: IDocumentViewProps) {
    super(props);

    this.state = {
      TypeofDocument:'',
      NameofDocument: '',
      BillNumber: '',
      BillDate: new Date(),
      vendorName: '',
      BillAmount : 0,
      Remarks: '',
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
      TypeofDocument: data.value[0].ProjectTitle,
      NameofDocument: data.value[0].ProjectDescription,
      BillNumber: data.value[0].ProjectTitle,
      BillDate: new Date(data.value[0].Created),
      vendorName: data.value[0].VendorName,
      BillAmount: data.value[0].RemainingAmount,
      Remarks: data.value[0].Department      
    });
  } else {
   
    this.setState({
      TypeofDocument: '',
      NameofDocument: '',
      BillNumber: '',
      BillDate: new Date(),
      vendorName: '',
      BillAmount: 0,
      Remarks:''
    });
  }
};
 
private handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  this.setState({ NameofDocument: value });

 // optional
    this.getRequestDetails(value);
  
};

  private handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ files: e.target.files });
  };
  private saveData = async () => {

  const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VendorMapping')/items?$format=json`;

  const body = {
    NameofDocument: this.state.NameofDocument,
    TypeofDocument: this.state.TypeofDocument,
    BillNumber: this.state.BillNumber,
    BillDate: this.state.BillDate.toISOString(),
    vendorName: this.state.vendorName,
    BillAmount: this.state.BillAmount,
    Remarks: this.state.Remarks
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

  public render(): React.ReactElement<IDocumentViewProps> {

    return (
      <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h2>Upload Document</h2>
          <h4>My Document List/ Uploaded Document</h4>

          <label>Type of Document</label>
          <input value={this.state.TypeofDocument}  onChange={this.handleChange}  />

          <label>Name of Document</label>
          <input name="NameofDocument" value={this.state.NameofDocument}  />

          <label>Vendor Name</label>
          <input name="vendorName" value={this.state.vendorName}  />

          <label>Bill Number</label>
          <input name="BillNumber" value={this.state.BillNumber}   >
          </input>

          <label>Bill Date</label>
          <input name="BillDate" type="date" value={this.state.BillDate.toISOString().split('T')[0]}  />

          <label>Bill Amount</label>
          <input name="BillAmount" value={this.state.BillAmount}  />

          <label>Remarks</label>
          <input name="Remarks" value={this.state.Remarks}   >
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
              <li></li>
              <li></li>
              <li></li>
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
