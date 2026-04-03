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
     attachments: [],
     RequestNo:'',
     CurrentStatus:'',
     AuthorId:'',
     Created:'',
     Actiondate1:'',
     ApproverComment: ''
  });

  ;
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
   const [attachments, setAttachments] = React.useState<any[]>([]);
   const [History, setHistory] = React.useState<any[]>([]);
  
 
  
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
 function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const day = d.getUTCDate() < 10 ? '0' + d.getUTCDate() : d.getUTCDate().toString();
  const month = d.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
  const year = d.getFullYear();
  let hours = d.getUTCHours();
  const minutes = d.getUTCMinutes() < 10 ? '0' + d.getUTCMinutes() : d.getUTCMinutes().toString();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // convert to 12-hour
  return `${day} ${month} ${year} AT ${hours}:${minutes} ${ampm}`;
}
//FETCH DATA-----
const handleFetchById = async (id: number) => {
    try {
      console.log("Calling API with ID:", id);

      const result = await service.getItemByRequestNo(id);
     const user = await service.getUser();
     const historydata=await service.GetHistoryItem(id,"VMR");
     setHistory(historydata);
    console.log("Result:", result);

      if (result) {
        setItemId(result.Id);

        setForm(prev => ({
        ...prev,
        RequestNo:result.RequestNo || '',
          projectCode: result.ProjectCode || '',
          projectTitle: result.ProjectTitle || '',
          projectDescription: result.ProjectDescription || '',
          vendorName: result.VendorName || '',
          vendorDescription: result.VendorDescription || '',
          files: null,
          CurrentStatus:result.CurrentStatus || '',
          Author:result.Author || '',
          Created:formatDate(result.Created),
          Actiondate1: formatDate(result.Actiondate1),
          ApproverComment:result.ApproverComment || ''
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
      <div className={styles.header}>
             <h4>Vendor Mapping Detals & Status</h4>
           </div>
      
      <div className={styles.row}>
        <div className={styles['col-md-9']}>
          <div className={styles.leftPanel}>
            <div className={styles.leftPanelHeader}>
              <h4>{form.RequestNo}</h4>
              <h4>Current Status:  <span className={
    form.CurrentStatus === "Approved"
      ? styles.Approved
      : form.CurrentStatus === "Rejected"
      ? styles.Rejected
      : styles.Pending }>{form.CurrentStatus}</span></h4>
            </div>
             <div className={styles.leftPanelStatusHeader}>
                          <div className={styles.statusBox}>
                            <div className={styles.content}>
                            <h5>Vinay Kumar</h5>
                            <h6>Department Head</h6>
                            <h4>Approved</h4>
                            </div>
                          </div>
                          </div>
          <div className={styles.formGroup}>
                      <label>Project Code</label>
                    <input name="projectCode" value={form.projectCode}   readOnly />
                    </div>
         <div className={styles.formGroup}>
        <label>Project Title</label>
        <input name="projectTitle" value={form.projectTitle}   readOnly />
</div>
<div className={styles.formGroup}>
        <label>Project Description</label>
        <input name="projectDescription" value={form.projectDescription}  readOnly />
        </div>
       <div className={styles.formGroup}>
        <label>Select Vendor <span className={styles.required}>*</span></label>
      <input name="vendorName" value={form.vendorName}  readOnly />
  </div>
  <div className={styles.formGroup}>
        <label>Additional Information & Remarks</label>
        <input name="vendorDescription" value={form.vendorDescription}  readOnly />
        </div>

       <div className={styles.formGroup}>
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
</div> 
</div> 
     <div className={styles['col-md-3']}>
          <div className={styles.rightPanel}>
            <div className={styles.rightPanelHeader}>
              <h4>Timeline of the Request - {form.RequestNo}</h4>
            </div>
            <ul>              
              {History.map((item, index) => {
    const isApproved = item.UserAction === "Approved";
    const isRejected = item.UserAction === "Rejected";
    const isInitiated = item.UserAction === "Request Initiator";
    return (
      <li
        key={index}
        className={
          isApproved
            ? styles.tickIcon
            : isRejected
            ? styles.crossIcon
            : isInitiated ?styles.tickIcon:""
        }
      >
        <span className={styles.spanHeader}>{item.Designation}</span>
        <span>Approver Name: {item.UserName}</span>
        {item.UserAction && (
          <span>
            Action Taken:{" "}
            <span
              className={
                isApproved
                  ? styles.apprStatus
                  : isRejected
                  ? styles.rejStatus
                  : ""
              }
            >
              {item.UserAction}
            </span>
          </span>
        )}
        {item.ActionDate && <span>Action Date: {item.ActionDate}</span>}
        {item.UserComment && <span>Comments: {item.UserComment}</span>}
      </li>
    );
  })}
            </ul>
          </div>
        </div>
    </div>
    </div>
  );
};

export default VendorMappingForm;