import * as React from 'react';
import styles from './DocumentUpload.module.scss';
import { IDocumentUploadProps, IState } from './IDocumentUploadProps';
import SharePointService from '../service/Service';
import { Dropdown, IDropdownOption } from '@fluentui/react';


const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
export default class DocumentUpload extends React.Component<IDocumentUploadProps, IState> {
  private service: SharePointService;
  constructor(props: IDocumentUploadProps) {
    super(props);
    this.service = new SharePointService(props.context);
    this.state = {
      TypeofDocument:'',
      TypeofDocumentID:'',
      NameofDocument: '',
      BillNumber: '',
      BillDate: new Date(),
      vendorName: '',
      BillAmount : 0,
      Remarks: '',
      files:  null
    };
  }
  
private loadDepartments = async () => {
    const data = await this.service.getMasterDocument();
    const options = data.map((item: any) => ({
      key: item.Id,
      text: item.Title
    }));

    setDepartmentOptions(options);
  };
/*
componentDidMount(): void {
  this.loadDepartments();
}*/
private handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  this.setState({
    ...this.state,
    files: e.target.files
  });
};
private handleSave = async () => {
  const payload = {
      TypeofDocument:this.state.TypeofDocument,
      NameofDocument:this.state.NameofDocument,
      BillNumber: this.state.BillNumber,
      BillDate: this.state.BillDate,
      vendorName: this.state.vendorName,
      BillAmount : this.state.BillAmount,
      Remarks: this.state.Remarks,
  };
  try {    
      // CREATE
      const res = await this.service.createItem(payload);
      if(res.Id>0){      
      if (this.state.files && this.state.files.length > 0) {
      for (let i = 0; i < this.state.files.length; i++) {
        await this.service.uploadFile(res.Id, this.state.files[i]);
      }
    }
      alert("Data Saved Successfully✅");  
      this.resetForm();
  }  
  else{
    alert("Data Not Saved.");
  }
  } catch (error) {
    console.error(error);
    alert("Error occurred");
  }
};
private resetForm = () => {
  this.setState({
    TypeofDocument:'',
      TypeofDocumentID:'',
      NameofDocument: '',
      BillNumber: '',
      BillDate: new Date(),
      vendorName: '',
      BillAmount : 0,
      Remarks: '',
      files:  null
  });
};
  public render(): React.ReactElement<IDocumentUploadProps> {
    return (
      <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h2>Upload New Document</h2>
          <h4>My Document List/ Upload New Document</h4>

          <label>Type of Document</label>
          <Dropdown
                    options={departmentOptions}
                    selectedKey={this.state.TypeofDocumentID}
                    onChange={(e, option) =>
                      this.setState({
      TypeofDocumentID: option?.key as string,
      TypeofDocument: option?.text as string
    })
                    }
                  />

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

          {/* Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.submitBtn} onClick={this.handleSave}>Submit</button>
            <button className={styles.cancelBtn}>Cancel</button>
          </div>
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
