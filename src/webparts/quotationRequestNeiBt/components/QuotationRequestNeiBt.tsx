import * as React from 'react';
import styles from './QuotationRequestNeiBt.module.scss';
import type { IQuotationRequestNeiBtProps } from './IQuotationRequestNeiBtProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import SharePointService from '../service/Service';
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption } from '@fluentui/react';


//const QuotationRequestNeiBt: React.FC<IQuotationRequestNeiBtProps> = (props) => {

  const QuotationRequestNeiBt: React.FC<IQuotationRequestNeiBtProps> = (props) => {

  // State
  const [form, setForm] = React.useState({
      ProjectTitle:'',
      ProjectReffNo:'',
      ProjectDescription: '',
      TotalProjectAmount:0,
      ApplicableTaxes:0,
      Vendor1: '',
      Vendor2: '',
      Vendor3: '',
      Quote1:'',
      Quote2:'',
      Quote3:'',
      Selectedvendor:'',
      SelectedQuote:'',
      Department:'',
      Advancepayment:0,
      ApprovalPath: '',
      files: [] as File[],
      CurrentStatus:''
  });


 
    const [itemId, setItemId] = React.useState<number | null>(null);
    const service = new SharePointService(props.context);
     const [POrequestNo, setPORequestNo] = React.useState('');
    const [POrequestNoError, setPORequestNoError] = React.useState('');
    const [department, setDepartment] = React.useState('');
    const [projectTitle, setProjectTitle] = React.useState('');
    const MAX_TOTAL_SIZE_MB = 25;
    const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/
const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
  


  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
    window.location.assign(url);
  };

  const handleFileChange = (event?: React.ChangeEvent<HTMLInputElement>) => {
      const files = event?.target?.files;
    if (!files) return;
  
    
    const filesArray = Array.from(files);
  
    const totalSizeMB = filesArray.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      alert(`Total file size must not exceed ${MAX_TOTAL_SIZE_MB} MB`);
      return;
    }
     // Invalid filename check
    const invalidFiles = filesArray.filter(file => INVALID_FILENAME_REGEX.test(file.name));
    if (invalidFiles.length > 0) {
      alert(`File names cannot have special characters: ${invalidFiles.map(f => f.name).join(", ")}`);
      return;
    }
     if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
  
      setForm((prev: any) => ({
        ...prev,
        files: [...prev.files, ...selectedFiles]
      }));
    }
  };
  
  const removeFile = (index: number) => {
    setForm((prev: any) => ({
      ...prev,
      files: prev.files.filter((_: File, i: number) => i !== index)
    }));
  };
  
   const loadDepartments = async () => {
      const data = await service.getDepartments();
      const options = data.map((item: any) => ({
        key: item.Id,
        text: item.DepartmentName
      }));
  
      setDepartmentOptions(options);
    };
  // 🔹 Load data
    React.useEffect(() => {
      loadDepartments();
      //loadVendor();
    }, []);
  
 
 // 🔹 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { name, value } = e.target;
 
   setForm({
     ...form,
     [name]: value
   });
  };
   const handleSaveOrUpdate = async () => {
  // 🔹 Validations
  
    if(!form.ProjectTitle) return alert("Project Title required");
    if(!form.Vendor1) return alert("Enter Vendor1 ");
    if(!form.Quote1) return alert("Enter Quote1");
    if(!form.Selectedvendor) return alert("Select Vendor");
    if(!form.Quote1) return alert("Selected Quote");
    if(!form.Department) return alert("Select Department Name");
    if(!form.Advancepayment) return alert("Select Advance Payemnt");
     if (!form.files || form.files.length === 0) return alert("Attach files");

  // 🔹 Payload (common)
  const payload = {
    ProjectTitle: form.ProjectTitle,
    ProjectReffNo: form.ProjectReffNo,
     ProjectDescription: form.ProjectDescription,
     //TotalProjectAmount:form.TotalProjectAmount,
     //ApplicableTaxes: form.ApplicableTaxes,
     Vendor1:form.Vendor1,
     Vendor2:form.Vendor2,
      Vendor3: form.Vendor3,
      Quote1: form.Quote1,
      Quote2: form.Quote2,
      Quote3: form.Quote3,
      Selectedvendor: form.Selectedvendor,
      SelectedQuote: form.SelectedQuote,
      Department: form.Department,
      Advancepayment:form.Advancepayment,
      ApprovalPath: form.ApprovalPath,
      CurrentStatus:'Draft'
   
  };

  try {
    if (!itemId) {
      // 🔹 CREATE
      const res = await service.createItem(payload);
      setItemId(res.Id); // store ID for future updates

      if (res.Id > 0 && form.files.length > 0) {
        for (let i = 0; i < form.files.length; i++) {
          await service.uploadFile(res.Id, form.files[i]);
        }
      }
      alert("Data Saved Successfully ✅");
    } else {
      // 🔹 UPDATE
      await service.updateItem(itemId, payload);

      if (form.files.length > 0) {
        for (let i = 0; i < form.files.length; i++) {
          await service.uploadFile(itemId, form.files[i]);
        }
      }
      alert("Data Updated Successfully ✅");
    }
  } catch (error) {
    console.error(error);
    alert("Error occurred ❌");
  }
};

  

// Update
const handleUpdate = async () => {
   if(!form.ProjectTitle) return alert("Project Title required");
    if(!form.Vendor1) return alert("Enter Vendor1 ");
    if(!form.Quote1) return alert("Enter Quote1");
    if(!form.Selectedvendor) return alert("Select Vendor");
    if(!form.SelectedQuote) return alert("Selected Quote");
    if(!form.Department) return alert("Select Department Name");
    if(!form.Advancepayment) return alert("Select Advance Payemnt");
     if (!form.files || form.files.length === 0) return alert("Attach files");
  const payload = {
    ProjectTitle: form.ProjectTitle,
    ProjectReffNo: form.ProjectReffNo,
     ProjectDescription: form.ProjectDescription,
     //TotalProjectAmount:form.TotalProjectAmount,
     //ApplicableTaxes: form.ApplicableTaxes,
     Vendor1:form.Vendor1,
     Vendor2:form.Vendor2,
      Vendor3: form.Vendor3,
      Quote1: form.Quote1,
      Quote2: form.Quote2,
      Quote3: form.Quote3,
      Selectedvendor: form.Selectedvendor,
      SelectedQuote: form.SelectedQuote,
      Department: form.Department,
      Advancepayment:form.Advancepayment,
      ApprovalPath: form.ApprovalPath,
       CurrentStatus:'Pending'
  };
  try {
    if (itemId) {
      // 🔥 UPDATE
     await service.updateItem(itemId, payload);
    if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(itemId, form.files[i]);
      }
    }
      alert("Data Submitted Successfully ✅");    
      const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url);  
    }
  } catch (error) {
    console.error(error);
    alert("Error occurred");
  }
};
    return (
      <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h4>Quotation Approval Form-NEI BT Admin</h4>
        
          <label>Project Title <span className={styles.required}>*</span></label>
          <input name="ProjectTitle" value={form.ProjectTitle}  onChange={handleChange}  />

          <label>Project Reference No</label>
          <input name="ProjectReffNo" value={form.ProjectReffNo} onChange={handleChange}  />
        

          <label>Project Description & Advance Payment Details</label>
          <input name="ProjectDescription" value={form.ProjectDescription} onChange={handleChange} />
          

          <label>Total Project Amount</label>
          <input name="TotalProjectAmount" value={form.TotalProjectAmount }onChange={handleChange}  />

          <label>Applicable Taxes</label>
          <input name="ApplicableTaxes" value={form.ApplicableTaxes} onChange={handleChange}/>
        
{/* 
          <label>Vendor 1 <span className={styles.required}>*</span></label>
          <input name="Vendor1" value={form.Vendor1} onChange={handleChange}  /> */}

        <label>Vendor1 <span className={styles.required}>*</span></label>
              <select name="vendorName" value={form.Vendor1} onChange={(e) =>setForm(prev => ({
              ...prev,Vendor1: e.target.value}))} >
               <option value="">Select Vendor</option>
          <option value="Vendor1">Vendor 1</option>
          <option value="Vendor2">Vendor 2</option>
        </select>

           <label>Vendor2 <span className={styles.required}>*</span></label>
              <select name="vendorName" value={form.Vendor2} onChange={(e) =>setForm(prev => ({
              ...prev,Vendor2: e.target.value}))} >
               <option value="">Select Vendor</option>
          <option value="Vendor1">Vendor 1</option>
          <option value="Vendor2">Vendor 2</option>
        </select>

        <label>Vendor3 <span className={styles.required}>*</span></label>
              <select name="vendorName" value={form.Vendor3} onChange={(e) =>setForm(prev => ({
              ...prev,Vendor3: e.target.value}))} >
               <option value="">Select Vendor</option>
          <option value="Vendor1">Vendor 1</option>
          <option value="Vendor2">Vendor 2</option>
        </select>

          <label>Quote 1 <span className={styles.required}>*</span></label>
          <input name="Quote1" value={form.Quote1} onChange={handleChange} />

          <label>Quote 2</label>
          <input name="Quote2" value={form.Quote2} onChange={handleChange} />

          <label>Quote 3</label>
          <input name="Quote3" value={form.Quote3} onChange={handleChange} />

         <label>Select Vendor <span className={styles.required}>*</span></label>
              <select name="vendorName" value={form.Selectedvendor} onChange={(e) =>setForm(prev => ({
              ...prev,vendorName: e.target.value}))} >
               <option value="">Select Vendor</option>
          <option value="Vendor1">Vendor 1</option>
          <option value="Vendor2">Vendor 2</option>
        </select>

          <label>Selected Quote <span className={styles.required}>*</span></label>
          <input name="SelectedQuote" value={form.SelectedQuote} onChange={handleChange} />
          
    
        <label>Department</label>
        <Dropdown
          placeholder="Select Department"
          options={departmentOptions}
          selectedKey={form.Department}
  onChange={(e, option) =>
    setForm(prev => ({
      ...prev,
      Department: option?.key as string // safe default empty string
    }))
  }
/>
          {/* <label>Department</label>
          <input name="Department" value={form.Department} onChange={handleChange}   /> */}
       
          <label>Advance Amount <span className={styles.required}>*</span></label>
          <input name="Advancepayment" value={form.Advancepayment} onChange={handleChange}    />
          

          <label>Approval Path <span className={styles.required}>*</span></label>
          <input name="ApprovalPath" value={form.ApprovalPath} onChange={handleChange} readOnly   />
             

        <label>Attachments <span className={styles.required}>*</span></label>
               <input type="file" multiple onChange={handleFileChange}  />
                {/* Selected Files */}
               {form.files.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {form.files.map((file: File, index: number) => (
                <li key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  
                  {/* ❌ Remove */}
                  <span
                    style={{ cursor: "pointer", color: "red", fontWeight: "bold" }}
                    onClick={() => removeFile(index)}
                  >
                    ✕
                  </span>
        
                  {/* File Name */}
                  <span>{file.name}</span>
        
                </li>
              ))}
            </ul>
               )}

          {/* Buttons */}
          <div className={styles.buttonGroup}>
           <button className={styles.submitBtn} onClick={handleUpdate}>Submit</button>
          <button className={styles.saveBtn} onClick={handleSaveOrUpdate}>Save</button>
          <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
          </div>
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
};




export default QuotationRequestNeiBt;
