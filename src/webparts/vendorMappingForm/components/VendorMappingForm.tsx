import * as React from 'react';
import { useState } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './VendorMappingForm.module.scss';
import { IVendorMappingFormProps } from './IVendorMappingFormProps';
import SharePointService from '../service/Service';
import Service from '../service/Service';


const VendorMappingForm: React.FC<IVendorMappingFormProps> = (props) => {

  const [form, setForm]=React.useState({
    projectCode: '',
    projectTitle: '',
    projectDescription: '',
    vendorName: '',
    vendorDescription: '',
    files: [] as File[],
    Attachments: [],
    CurrentStatus:''
  });

  const [requestNo, setRequestNo] = React.useState('');
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [projectTitle, setProjectTitle] = React.useState('');
  const [projectDescription, setProjectDescription] = React.useState('');
  const [requestNoError, setRequestNoError] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState('');
  const MAX_TOTAL_SIZE_MB = 25;
  const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/
   const [attachments, setAttachments] = React.useState<any[]>([]);



  // --- 1️⃣ Get ID from query string ---
    const getIdFromQueryString = (): number | null => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('ID');
      return id ? parseInt(id, 10) : null;
    };
  
    // --- 3️⃣ Load data on mount ---
    React.useEffect(() => {
      const id = getIdFromQueryString();
      if (id) {
        handleFetchById(id);
      }
    }, []);
  
  
     const loadAttachments = async (id:number) => {
      try{
    const files = await service.getAttachments(id);
    console.log("Attachments:", files);
    setAttachments(files);
      }catch(error)
      {
        console.error(error);
      }
     };
     React.useEffect(() => {
       if (itemId) {
         loadAttachments(itemId);
        
       }
     }, [itemId]);
    const handleFetchById = async (id: number) => {
    try {
     
      console.log("Calling API with ID:", id);

      const result = await service.getItemByRequestNo(id);

      console.log("Result:", result);

      if (result.CurrentStatus==='Draft') {
        setItemId(result.Id);

        setForm(prev => ({
        ...prev,
          projectCode: result.ProjectCode || '',
          projectTitle: result.ProjectTitle || '',
          projectDescription: result.ProjectDescription || '',
          vendorName: result.VendorName || '',
          vendorDescription: result.VendorDescription || ''
          //attachments: result.Attachments || []

          
        }));
          
      } else {
        alert("No data found");
      }
      
    } catch (error) {
      console.error("Error:", error);
    }
  };


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

const removeExistingFile = async (index: number) => {
 const file = attachments[index];
await service.deleteAttachmentFromSP(file);
  setAttachments(prev => prev.filter((_, i) => i !== index));
};




  // const handleRequestNoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   setRequestNo(value);
   
  //   const errorMsg = validateProjectCode(value);
  // setRequestNoError(errorMsg);

  // if (errorMsg) {
  //   // validation failed → reset dependent fields
  //   setProjectTitle('');
  //   setProjectDescription('');
  //   return; // API call skip karo
  // }
  //   if (!value) {
  //   setProjectTitle('');
  //    setProjectDescription('');
  //   return;
  // }
  //   try {
  //     const result =  await service.getRequestDetails(value);

  //     if (result.length > 0) {
  //       setProjectTitle(result[0].ProjectTitle || '');
  //       setProjectDescription(result[0].ProjectDescription || '');
  //     } else { 
  //       setProjectTitle('');
  //       setProjectDescription('');
  //     }
  
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };


const handleRequestNoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  // ✅ form me update karo (IMPORTANT)
  setForm(prev => ({
    ...prev,
    projectCode: value
  }));

  // validation
  const errorMsg = validateProjectCode(value);
  setRequestNoError(errorMsg);

  if (errorMsg || !value) {
    setForm(prev => ({
      ...prev,
      projectTitle: '',
      projectDescription: ''
    }));
    return;
  }

  try {
    const result = await service.getRequestDetails(value);

    if (result.length > 0) {
      setForm(prev => ({
        ...prev,
        projectTitle: result[0].ProjectTitle || '',
        projectDescription: result[0].ProjectDescription || ''
      }));
    } else {
      setForm(prev => ({
        ...prev,
        projectTitle: '',
        projectDescription: ''
      }));
    }

  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

  // 🔹 Handle input change
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };


  //SAVE DRAFT DATA

  const handleSaveOrUpdate = async () => {
  // 🔹 Validations
  if (!form.projectCode) return alert("Project Code required");
  if (!form.vendorName) return alert("Select Vendor");
 if (
  (!form.files || form.files.length === 0) &&
  (!attachments || attachments.length === 0)
) {
  return alert("Attach files");
}

  // 🔹 Payload (common)
  const payload = {
    
    ProjectCode: form.projectCode,
    ProjectTitle: form.projectTitle,
    ProjectDescription: form.projectDescription,
    VendorName: form.vendorName,
    VendorDescription: form.vendorDescription,
    CurrentStatus: 'Draft'
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
       await service.updateItem(res.Id, {
       RequestNo: `VMR-${res.Id}`
  });

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
  
  
// SUBMIT DATA
const handleUpdate = async () => {
   if (!form.projectCode) return alert("Project Code required");
    if (!form.vendorName) return alert("Select Vendor");
    if (
  (!form.files || form.files.length === 0) &&
  (!attachments || attachments.length === 0)
) {
  return alert("Attach files");
}
  const payload = {
    ProjectCode: form.projectCode,
     ProjectDescription: form.projectDescription,
    ProjectTitle: form.projectTitle,
    VendorName:  form.vendorName, 
    VendorDescription: form.vendorDescription,
    CurrentStatus: 'Pending'
  };
  try {
    if (itemId) {
      //  UPDATE
     await service.updateItem(itemId, payload);
    if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(itemId, form.files[i]);
      }
    }
   
      alert("Data Submitted Successfully ✅");  
      const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url);     
       // Reset form
  // setForm({
  //   projectCode: '',
  //   projectTitle: '',
  //   projectDescription: '',
  //   vendorName: '',
  //   vendorDescription: '',
  //   files: [] as File[]
  // });
  // setRequestNo('');
  // setProjectTitle('');
  // setProjectDescription('');
  // setItemId(null);
  //setIsSubmitted(true); // freeze inputs
};
    
  } catch (error) {
    console.error(error);
    alert("Error occurred");
  }
};











  // --- RENDER ---
  return (
    <div className={styles.container}>

      <div className={styles.leftPanel}>
        <h2>Vendor Mapping Form</h2>
        
        <label>Project Code <span className={styles.required}>*</span></label>
        <input name="projectCode" value={form.projectCode} onChange={handleRequestNoChange}   />
       {requestNoError && <span className={styles.error}>{requestNoError}</span>}
       
        <label>Project Title</label>
        <input name="projectTitle" value={form.projectTitle} readOnly   />

        <label>Project Description</label>
        <input name="projectDescription" value={form.projectDescription} readOnly  />


        <label>Select Vendor <span className={styles.required}>*</span></label>
      <select name="vendorName" value={form.vendorName} onChange={(e) =>setForm(prev => ({
      ...prev,vendorName: e.target.value}))} >
       <option value="">Select Vendor</option>
  <option value="Vendor1">Vendor 1</option>
  <option value="Vendor2">Vendor 2</option>
</select>
        <label>Additional Information & Remarks</label>
        <input name="vendorDescription" value={form.vendorDescription} onChange={handleChange}  />
        

        <label>Attachments <span className={styles.required}>*</span></label>
       <input type="file" multiple onChange={handleFileChange}  />

       {/*  Existing Files (API se) */}
{attachments?.length > 0 && (
  <ul style={{ listStyle: "none", padding: 0 }}>
    {attachments.map((file, index) => (
      <li
        key={index}
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        {/* ❌ Remove Button */}
        <span
          style={{
            color: "red",
            cursor: "pointer",
            fontWeight: "bold"
          }}
          onClick={() => removeExistingFile(index)}
        >
          ✕
        </span>

        {/* 📄 File Link */}
        <a
          href={file.ServerRelativeUrl}
         
          rel="noopener noreferrer"
        >
          {file.FileName}
        </a>
      </li>
    ))}
  </ul>
)}
      
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
            <button className={styles.cancelBtn} onClick={handleCancel} >Cancel</button>
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