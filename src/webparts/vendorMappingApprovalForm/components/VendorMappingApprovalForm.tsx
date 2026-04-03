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
    files: null as FileList | null,
     attachments: [],
     CurrentStatus:'',
     RequestNo:'',
     AssignedTo:'',
      AuthorId:'',
     Created:'',
     Actiondate1:'',
     ApproverComment: ''
    
  });

  ;
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [approverComment, setApproverComment] = React.useState('');
   const [Actiondate1, setactiondate1] = React.useState('');
   const [attachments, setAttachments] = React.useState<any[]>([]);
   const [history, setHistory] = React.useState<any[]>([]);
  const [currentUser, setCurrentUser] = React.useState('');
  const [isDisabled, setIsDisabled] = useState(false);
 
  
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
      loadHistory(itemId, "VMR");
       //CurrentUser();
      
     }
   }, [itemId]);
  

const loadHistory = async (id:Number,FormCode:string) => {
    try{
  const historyData = await service.GetHistoryItem(id,FormCode);
 console.log("History:", historyData);
  setHistory(historyData);
    }catch(error)
    {
      console.error(error);
    }
   };

//FETCH DATA-----
const handleFetchById = async (id: number) => {
    try {
      
    
      console.log("Calling API with ID:", id);
      const currentuser= await service.getUser();
      const result = await service.getItemByRequestNo(id);

      console.log("Result:", result);
    

      if (result.AssignedTo === currentuser.Title) {

      if (result.CurrentStatus === 'Pending' || result.CurrentStatus === 'Approved') {

        setItemId(result.Id);

        setForm(prev => ({
          ...prev,
          RequestNo: result.RequestNo || '',
          projectCode: result.ProjectCode || '',
          projectTitle: result.ProjectTitle || '',
          projectDescription: result.ProjectDescription || '',
          vendorName: result.VendorName || '',
          vendorDescription: result.VendorDescription || '',
          AssignedTo: result.AssignedTo || '',
          Author:result.Author || '',
          Created:(result.Created),
          Actiondate1: (result.Actiondate1),
          ApproverComment:result.ApproverComment || '',
          files: null
        }));
       
         if (!result.Actiondate1) {
  setIsDisabled(false);  // enable
} else {
  setIsDisabled(true);   // disable
}

      } else {
        alert("No data found");
      }

    } else {
      alert("❌ This action has already taken.Please wait for queue");
    }
    } catch (error) {
      console.error("Error:", error);
    }
  };


   const handleSaveApproveHistory = async (id: number) => {

  const currentuser = await service.getUser();

  const payload = {
    Title: 'VMR',
    FID: id,  
    UserName: currentuser.Title,
    UserAction: 'Approved',
    ActionDate: new Date().toISOString(),
     Designation: currentuser.JobTitle, 
  };

  await service.createHistoryItem(payload);
};

const handleSaveRejectedHistory = async (id: number) => {

  const currentuser = await service.getUser();

  const payload = {
    Title: 'VMR',
    FID: id,  
    UserName: currentuser.Title,
    UserAction: 'Rejected',
    ActionDate: new Date().toISOString(),
     Designation: currentuser.JobTitle, 
  };

  await service.createHistoryItem(payload);
};

  const handleApprove = async () => {
  try {
       if (!approverComment) return alert("Approver Comment required");
    if (!itemId) return;

    await service.updateItemdata(itemId, "Approved", approverComment,"Approved");
     await handleSaveApproveHistory(itemId);
    alert("✅ Approved successfully");
     const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url);  
    //setApproverComment('');
  } catch (error) {
    console.error(error);
  }
};

const handleReject = async () => {
  try {
    if (!approverComment) return alert("Approver Comment required");
    if (!itemId) return;

    if (!approverComment) {
      alert("Comment is required for rejection ❗");
      return;
    }

    await service.updateItemdata(itemId, "Rejected", approverComment,"Rejected");
    await handleSaveRejectedHistory(itemId);
    alert("❌ Rejected successfully");
     const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url);  
    //setApproverComment('');
  } catch (error) {
    console.error(error);
  }
};

    
 


  // --- RENDER ---
  return(
  <div className={styles.container}>
        <div className={styles.header}>
                <h4>Vendor Mapping Approval Form</h4>
             </div>
        
        <div className={styles.row}>
          <div className={styles['col-md-9']}>
            <div className={styles.leftPanel}>
              <div className={styles.leftPanelHeader}>
             <label style={{fontWeight: "bold"}}>Vendor Mapping- {form.RequestNo}</label>
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
  
       <label>Approver Comments <span className={styles.required}>*</span></label>
       <textarea value={approverComment} onChange={(e) => setApproverComment(e.target.value)}  style={{ marginBottom: "15px" }} />
        
       {/* Buttons */}
       <div>
          <div className={styles.buttonGroup} >
            <button className={styles.ApproveBtn} onClick={handleApprove} disabled={isDisabled}>Approve</button>
            <button className={styles.RejectBtn} onClick={handleReject} disabled={isDisabled} >Reject</button>
            <button className={styles.cancelBtn}>Cancel</button>
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
                <li className={styles.tickIcon}>
                  <span className={styles.spanHeader}>Request Initiated</span>
                    <span>Request Initiator:{form.AuthorId}</span>
                  <span>Date & Time: {form.Created}</span>
                </li>
                <li className={styles.tickIcon}>
                  <span className={styles.spanHeader}>Finance Controller</span>
                  <span>Approver Name: Indrajit Ghatak</span>
                  <span>Action Taken: <span className={styles.apprStatus}>{form.CurrentStatus}</span></span>
                  <span>Action Date: {form.Actiondate1}</span>
                  <span>Comments: {form.ApproverComment}</span>
                </li>
                <li className={styles.tickIcon}>
                  <span className={styles.spanHeader}>Billing Approver</span>
                  <span>Approver Name: Sanjay Tiwari</span>
                  <span>Action Taken: <span className={styles.apprStatus}>Approved</span></span>
                  <span>Action Date: 14 mar 2026 AT 02:00 PM</span>
                  <span>Comments: Comments submitted by approver while taking action.</span>
                </li>
                <li className={styles.crossIcon}>
                  <span className={styles.spanHeader}>Finance Controller</span>
                  <span>Approver Name: Indrajeet Singh</span>
                  <span>Action Taken: <span className={styles.rejStatus}>Rejected</span></span>
                  <span>Action Date: 14 mar 2026 AT 02:00 PM</span>
                  <span>Comments: Comments submitted by approver while taking action.</span>
                </li>
                <li>
                  <span className={styles.spanHeader}>Billing Approver</span>
                  <span>Approver Name: Sanjay Tiwari</span>
                </li>
              </ul>
            </div>
          </div>
     </div>
      </div>
   );
};

export default VendorMappingForm;