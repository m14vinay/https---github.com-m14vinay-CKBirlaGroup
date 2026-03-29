import * as React from 'react';
import { useState } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './VendorMappingDetails.module.scss'
import { IVendorMappingDetailsProps } from './IVendorMappingDetailsProps';
import SharePointService from '../service/Service';




const VendorMappingForm: React.FC<IVendorMappingDetailsProps> = (props) => {

  const [form, setForm]=React.useState({
    projectCode: '',
    projectTitle: '',
    projectDescription: '',
    vendorName: '',
    vendorDescription: '',
    files: null as FileList | null,
     attachments: []
  });

  ;
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
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
        // 👈 dynamic ID use karo
     }
   }, [itemId]);
  
//FETCH DATA-----
const handleFetchById = async (id: number) => {
    try {
      console.log("Calling API with ID:", id);

      const result = await service.getItemByRequestNo(id);

      console.log("Result:", result);

      if (result) {
        setItemId(result.Id);

        setForm(prev => ({
        ...prev,
          projectCode: result.ProjectCode || '',
          projectTitle: result.ProjectTitle || '',
          projectDescription: result.ProjectDescription || '',
          vendorName: result.VendorName || '',
          vendorDescription: result.VendorDescription || '',
          files: null
        }));
      

      } else {
        alert("No data found");
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };


    



  // --- RENDER ---
  return (
    <div className={styles.container}>

      <div className={styles.leftPanel}>
        <h2>Vendor Mapping Approval Form</h2>
       
        <label>Project Code <span className={styles.required}>*</span></label>
        <input name="projectCode" value={form.projectCode}   readOnly />
       
       
        <label>Project Title</label>
        <input name="projectTitle" value={form.projectTitle}   readOnly />

        <label>Project Description</label>
        <input name="projectDescription" value={form.projectDescription}  readOnly />
        
        <label>Select Vendor <span className={styles.required}>*</span></label>
      <input name="vendorName" value={form.vendorName}  readOnly />

        <label>Additional Information & Remarks</label>
        <input name="vendorDescription" value={form.vendorDescription}  readOnly />
        
       <div style={{ display: "flex", alignItems: "flex-start" , gap: "10px" }}>
           <label>
            Attachments <span className={styles.required}>*</span>
            </label>
     
    <div style={{ display: "flex", flexDirection: "column" ,gap: "6px", }}>
      {attachments.map((file: any, index: number) => (
        <a
          key={index}
            href={file.ServerRelativeUrl} target="_blank" rel="noopener noreferrer">
          {file.FileName}
        </a>
       ))}
    </div>
 
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