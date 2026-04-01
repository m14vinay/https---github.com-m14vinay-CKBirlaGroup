import * as React from 'react';
import styles from './DocumentUpload.module.scss';
import { IDocumentUploadProps } from './IDocumentUploadProps';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
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
const [loading, setLoading] = React.useState(false);
  const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const [errors, setErrors] = React.useState<any>({});
  const service = new SharePointService(props.context);
  const validateForm = () => {
  let newErrors: any = {};

  if (!form.TypeOfDocument) {
    newErrors.TypeOfDocument = "*";
  }
  if (!form.files) {
    newErrors.files = "*";
  }
  if (!form.Title) {
    newErrors.Title = "*";
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
const handleCancel = () => {
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
  window.location.assign(url);
};
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files ? e.target.files[0] : null;
  if (!file) return;
  const maxSize = 25 * 1024 * 1024; // 25 MB in bytes
  if (file.size > maxSize) {
    alert("File size must be less than 25 MB");
    e.target.value = ""; // reset file input
    return;
  }
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
const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setForm({
    ...form,
    [name]: name === "BillDate" ? new Date(value) : value
  });
};
  // Save Data
  const handleSave = async () => {
    const dateOnly =
  String(form.BillDate.getDate()) +
  String(form.BillDate.getMonth() + 1) +
  form.BillDate.getFullYear();
  if (!validateForm()) {
    return;
  }
  const payload = {
    TypeOfDocument:form.TypeOfDocument,
      Title:form.Title+'_'+dateOnly,
      BillNumber: form.BillNumber,
      BillDate: form.BillDate,
      VendorName:form.VendorName,
      BillAmount : form.BillAmount,
      Remarks: form.Remarks
  };
  try {    
    setLoading(true);
      // CREATE
      const resutldata=await service.getItemByTitle(form.Title+'_'+dateOnly);
      if(resutldata==0)
      {
      const res = await service.createItem(payload);
      setItemId(res.Id); 
      if(res.Id>0){      
      if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(res.Id, form.files[i]);
      }
    }
      alert("Data Saved Successfully✅");  
      setForm({
    ...form,TypeOfDocument:'',
      TypeOfDocumentID:'',
      Title: '',
      BillNumber: '',
      BillDate: new Date(),
      VendorName: '',
      BillAmount : 0,
      Remarks: '',
    files: null
  });
  }  
  else{
    alert("Data Not Saved.");
  }
      }
      else{
        alert("Record already exists with the Document ID : "+form.Title+'_'+dateOnly);
      }
  } catch (error) {
    console.error(error);
    alert("Error occurred");
  }
  finally{
    setLoading(false);
  }
};
  // 🔹 UI
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Upload New Document</h2>          
      </div>
      <div className={styles.row}>
        <div className={styles["col-md-9"]}>
          <div className={styles.leftPanel}>
            <div className={styles.leftPanelHeader}>
              <h4>Upload New Document</h4>              
            </div>
          <div className={styles.formGroup}>
                      {errors.TypeOfDocument && (
              <span style={{ color: "red" }}>
                {errors.TypeOfDocument}
              </span>
            )}
                      <label>Type of Document</label>
                    <Dropdown
                      options={departmentOptions}
                      selectedKey={form.TypeOfDocumentID}
                      onChange={(e, option) =>
                        setForm({ ...form, TypeOfDocument: option?.text as string,TypeOfDocumentID: option?.key as string, })
                      }
                    />
                    {errors.Title && (
              <span style={{ color: "red" }}>
                {errors.Title}
              </span>
            )}
            </div>
            <div className={styles.formGroup}>
           <label>Name of Document</label>
          <input name="Title" value={form.Title}  onChange={handleChange} required/>
          </div>
           <div className={styles.formGroup}>
          <label>Vendor Name</label>
          <input name="VendorName" value={form.VendorName}  onChange={handleChange} required />
          </div>
            <div className={styles.formGroup}>
          <label>Bill Number</label>
          <input name="BillNumber" value={form.BillNumber} onChange={handleChange} required />
          </div>
            <div className={styles.formGroup}>
          <label>Bill Date</label>
                    <input
            name="BillDate"
            type="date"
            value={
              form.BillDate
                ? new Date(form.BillDate).toISOString().split('T')[0]
                : ''
            }
            onChange={handleDateChange}
            required
          />
          </div>
           <div className={styles.formGroup}>
          <label>Bill Amount</label>
          <input name="BillAmount" type='number' value={form.BillAmount} onChange={handleChange} required/>
          </div>
            <div className={styles.formGroup}>
          <label>Remarks</label>
          <input name="Remarks" value={form.Remarks} onChange={handleChange}  required>
          </input>
          </div>
           <div className={styles.formGroup}>
          {errors.files && (
  <span style={{ color: "red" }}>
    {errors.files}
  </span>
)}
          <label>Attachments</label>
          <input name="files" type="file" multiple onChange={handleFileChange} required />
          </div>
        <div className={styles.buttonGroup}>
            <button className={styles.ApproveBtn} onClick={handleSave}>Submit</button>
            <button className={styles.RejectBtn} onClick={handleCancel}>Cancel</button>
          </div>
        </div>
        </div>
      <div className={styles["col-md-3"]}>
        <div className={styles.leftPanelHeader}>
        <h6>My Document List / Upload New Document</h6>          
        </div>        
      <div className={styles.rightPanel}>        
          {/* Templates */}
          <div className={styles.card}>
             <div>
              <h4>Templates</h4>              
            </div>
          </div>
          {/* Guidelines */}
          <div className={styles.card}>
             <div>
              <h4>Importance Guidelines</h4>              
            </div>
            <ol>
              <li>Select approval path carefully.</li>
              <li>Use project reference if needed.</li>
              <li>Attach all documents (Max 25 MB).</li>
              <li>Avoid special characters in file names.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DocumentUpload;