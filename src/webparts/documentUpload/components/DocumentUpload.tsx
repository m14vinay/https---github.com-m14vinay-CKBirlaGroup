import * as React from 'react';
import styles from './DocumentUpload.module.scss';
import { IDocumentUploadProps } from './IDocumentUploadProps';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';

const DocumentUpload: React.FC<IDocumentUploadProps> = (props) => {

  // State
  const [form, setForm] = React.useState({
    TypeOfDocument:'',
      TypeOfDocumentID:'',
      Title: '',
      BillNumber: '',
      BillDate: new Date(),
      VendorName: '',
      BillAmount : 0,
      Remarks: '',
    files: null as FileList | null
  });

  const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
const handleCancel = () => {
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
  window.location.assign(url);
};
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({
    ...form,
    files: e.target.files
  });
};
  // 🔹 Load data
  React.useEffect(() => {
    loadMaster();
  }, []);

  const loadMaster = async () => {
    const data = await service.getMasterDocument();
    const options = data.map((item: any) => ({
      key: item.Id,
      text: item.Title
    }));
    setDepartmentOptions(options);
  };


  // Handle input change
 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value } = e.target;
  setForm({
    ...form,
    [name]: value
  });
};

  // Save Data
  const handleSave = async () => {
  const payload = {
    TypeOfDocument:form.TypeOfDocument,
      Title:form.Title,
      BillNumber: form.BillNumber,
      BillDate: form.BillDate,
      VendorName:form.VendorName,
      BillAmount : form.BillAmount,
      Remarks: form.Remarks
  };
  try {    
      // CREATE
      const res = await service.createItem(payload);
      setItemId(res.Id); 
      if(res.Id>0){      
      if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(res.Id, form.files[i]);
      }
    }
      alert("Data Saved Successfully✅");  
      resetForm();
  }  
  else{
    alert("Data Not Saved.");
  }
  } catch (error) {
    console.error(error);
    alert("Error occurred");
  }
};
const resetForm = () => {
  ({
      TypeofDocument:'',
      TypeofDocumentID:'',
      NameofDocument: '',
      BillNumber: '',
      BillDate: new Date(),
      VendorName: '',
      BillAmount : 0,
      Remarks: '',
      files:  null
  });
};

  // 🔹 UI
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <h2>Upload New Document</h2>
          <h4>My Document List/ Upload New Document</h4>
          <label>Type of Document</label>
        <Dropdown
          options={departmentOptions}
          selectedKey={form.TypeOfDocumentID}
          onChange={(e, option) =>
            setForm({ ...form, TypeOfDocument: option?.text as string,TypeOfDocumentID: option?.key as string, })
          }
        />
        <label>Name of Document</label>
        <input name="Title" value={form.Title}  onChange={handleChange} />
          <label>Vendor Name</label>
          <input name="VendorName" value={form.VendorName}  onChange={handleChange} />
          <label>Bill Number</label>
          <input name="BillNumber" value={form.BillNumber} onChange={handleChange}  >
          </input>
          <label>Bill Date</label>
          <input name="BillDate" type="date" value={form.BillDate.toISOString().split('T')[0]}  />
          <label>Bill Amount</label>
          <input name="BillAmount" value={form.BillAmount} onChange={handleChange} />
          <label>Remarks</label>
          <input name="Remarks" value={form.Remarks} onChange={handleChange}  >
          </input>

        <label>Attachments</label>
       <input type="file" multiple onChange={handleFileChange} />

        <div className={styles.buttonGroup}>
            <button className={styles.submitBtn} onClick={handleSave}>Submit</button>
            <button className={styles.cancelBtn}>Cancel</button>
          </div>
      </div>
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
};

export default DocumentUpload;