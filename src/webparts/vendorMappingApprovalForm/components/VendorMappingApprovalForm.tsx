import * as React from 'react';
import { useState } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './VendorMappingApprovalForm.module.scss';
import { IVendorMappingApprovalFormProps } from './IVendorMappingApprovalFormProps';
import SharePointService from '../service/Service';
import Service from '../service/Service';


const VendorMappingForm: React.FC<IVendorMappingApprovalFormProps> = (props) => {

  const [form, setForm]=React.useState({
    projectCode: '',
    projectTitle: '',
    projectDescription: '',
    vendorName: '',
    vendorDescription: '',
    files: null as FileList | null
  });

  const [requestNo, setRequestNo] = React.useState('');
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [projectTitle, setProjectTitle] = React.useState('');
  const [projectDescription, setProjectDescription] = React.useState('');
  const [requestNoError, setRequestNoError] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const MAX_TOTAL_SIZE_MB = 25;
  const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.-]/; 




  
  // --- VALIDATIONS ---
  const validateProjectCode = (value: string): string => {
    if (!value) return 'Project Code is required';
    if (!/^[a-zA-Z0-9-]+$/.test(value)) return 'Project Code must be alphanumeric';
    if (value.length > 10) return 'Project Code must be at most 10 characters';
    return '';
  }

  const validateVendorName = (value: string): string => {
    if (!value) return 'Vendor selection is required';
    return '';
  }

  const validateFiles = (files: FileList | null): string => {
    if (!files || files.length === 0) return 'At least one file is required';
    return '';
  }

  // --- HANDLE FIELD CHANGES ---
  
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

     setForm({
       ...form,
       files: event.target.files
     });
   };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = Number(e.target.value);

  if (!value) return;

  handleFetchById(value);
};

  // 🔹 Handle input change
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };


  //SAVE DRAFT

  const handleSaveOrUpdate = async () => {
  // 🔹 Validations
  if (!requestNo) return alert("Project Code required");
  if (!form.vendorName) return alert("Select Vendor");
  if (!form.files || form.files.length === 0) return alert("Attach files");

  // 🔹 Payload (common)
  const payload = {
    ProjectCode: requestNo,
    ProjectTitle: projectTitle,
    ProjectDescription: projectDescription,
    VendorName: form.vendorName,
    VendorDescription: form.vendorDescription
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
  
    // Save Data
    const handleSave = async () => {
    if (!requestNo) return alert("Project Code required");
    if (!form.vendorName) return alert("Select Vendor");
    if (!form.files || form.files.length === 0) return alert("Attach files");
    const payload = {
      ProjectCode: requestNo,
      ProjectTitle: projectTitle,
      ProjectDescription: projectDescription,
      VendorName: form.vendorName,
      VendorDescription:form.vendorDescription
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
    }  
    else{
      alert("Data Not Saved.");
    }
    } catch (error) {
      console.error(error);
      alert("Error occurred");
    }
  };
  
  

// Update
const handleUpdate = async () => {
   if (!requestNo) return alert("Project Code required");
    if (!form.vendorName) return alert("Select Vendor");
    if (!form.files || form.files.length === 0) return alert("Attach files");
  const payload = {
    Title:"Testing",
    ProjectCode: requestNo,
     ProjectDescription: projectDescription,
    ProjectTitle: projectTitle,
    VendorName:  form.vendorName, 
    VendorDescription: form.vendorDescription
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
    setIsSubmitted(true); 
      alert("Data Submitted Successfully ✅");      
    }
  } catch (error) {
    console.error(error);
    alert("Error occurred");
  }
};

//FETCH
const handleFetchById = async (id: number) => {
  try {
    const result = await service.getItemByRequestNo(id);

    if (result) {
      setRequestNo(result.ProjectCode);
      setProjectTitle(result.ProjectTitle);
      setProjectDescription(result.ProjectDescription);

      setForm(prev => ({
        ...prev,
        vendorName: result.VendorName || '',
        vendorDescription: result.VendorDescription || ''
      }));

      console.log("Attachments:", result.Attachments);
    }

  } catch (error) {
    console.error("Error fetching by ID:", error);
  }
};

    // console.log("Attachments:", result.Attachments);
    // console.log("Comments:", result.ApproverComments);
  



  // --- RENDER ---
  return (
    <div className={styles.container}>

      <div className={styles.leftPanel}>
        <h2>Vendor Mapping Approval Form</h2>
       
        <label>Project Code <span className={styles.required}>*</span></label>
        <input name="projectCode" value={requestNo} onChange={handleIdChange}  readOnly />
       {requestNoError && <span className={styles.error}>{requestNoError}</span>}
       
        <label>Project Title</label>
        <input name="projectTitle" value={projectTitle} onChange={handleIdChange}   readOnly />

        <label>Project Description</label>
        <input name="projectDescription" value={projectDescription} onChange={handleIdChange}  readOnly />
        
        <label>Select Vendor <span className={styles.required}>*</span></label>
      <input name="vendorName" value={form.vendorName} onChange={handleIdChange} readOnly />

        <label>Additional Information & Remarks</label>
        <input name="vendorDescription" value={form.vendorDescription} onChange={handleChange}  readOnly />
        

        <label>Attachments <span className={styles.required}>*</span></label>
       <input type="file" multiple onChange={handleFileChange}   />
        
       {/* Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.ApproveBtn} >Approve</button>
            <button className={styles.RejectBtn} >Reject</button>
            <button className={styles.cancelBtn}>Cancel</button>
          </div>
        
      
        </div>

      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <h4>Templates</h4>
          <ul>
            <li>Vendor_Registration_Form_v1.0.xlsx</li>
            <li>SOP_Procurement_of_Goods_Services.pdf</li>
            <li>DigiFlow_Training_Manual.pdf</li>
          </ul>
        </div>

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

export default VendorMappingForm;