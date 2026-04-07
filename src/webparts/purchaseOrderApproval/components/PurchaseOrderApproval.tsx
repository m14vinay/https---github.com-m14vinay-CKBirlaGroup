import * as React from 'react';
import { useState } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './PurchaseOrderApproval.module.scss';
import { IPurchaseOrderApprovalProps } from './IPurchaseOrderApprovalProps';
import SharePointService from '../service/Service';
import Service from '../service/Service';
import { FabricPerformance } from '@fluentui/react';


const PurchaseOrderApproval: React.FC<IPurchaseOrderApprovalProps> = (props) => {

  const [form, setForm] = React.useState({
    POrequestNo: '',
    projectCode: '',
    projectTitle: '',
    vendorName: '',
    RemainingAmount: 0,
    Department: '',
    POAmount: 0,
    ApplicableTaxes: 0,
    POCategory: '',
    ProjectDescription: '',
    ApproverComment1: '',
    ApproverCommentsError: '',
    files: null,
    attachments: [],
    approver1: '',
    approver2: '',
    approver3: '',
    approver4: '',
    approver5: '',
    ActionDate1:'',
    ActionDate2:'',
    DepartmentHead: '',
    CurrentStatus: '',
    Approver2Id:'',
    RequestNo:''

  });


  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [approverComment, setApproverComment] = React.useState('');
   const [approverComment2, setApproverComment2] = React.useState('');
  const [attachments, setAttachments] = React.useState<any[]>([]);
   const [AssignedID, setAssignedID] = React.useState<number | null>(null);
   const [AssignedToEmail, setAssignedToEmail] = React.useState<number | null>(null);
  const [approver1, setApprover1] = React.useState('');
  const [approver2, setApprover2] = React.useState('');
  const [approver3, setApprover3] = React.useState('');
  const [approver4, setApprover4] = React.useState('');
  const [approver5, setApprover5] = React.useState('');
  const [departmentHead, setDepartmentHead] = React.useState('');
  const [isDisabled, setIsDisabled] = useState(false);
const [History, setHistory] = useState<any[]>([]);
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


  const loadAttachments = async (id: number) => {
    try {
      const files = await service.getAttachments(id);
      console.log("Attachments:", files);
      setAttachments(files);
    } catch (error) {
      console.error(error);
    }
  };


  const getApprover = async () => {
    try {
      const data = await service.getApprover('');

      console.log("Approver Data:", data);

      if (data && data.length > 0) {
        setApprover1(data[0].approver1 || '');
        setApprover2(data[0].approver2 || '');
        setApprover3(data[0].approver3 || '');
        setApprover4(data[0].approver4 || '');
        setApprover5(data[0].approver5 || '');
        setDepartmentHead(data[0].DepartmentHead || '');
      }

    } catch (error) {
      console.error(error);
    }
  };


  React.useEffect(() => {
    if (itemId) {
      loadAttachments(itemId);
      getApprover(); // 👈 dynamic ID use karo
    }
  }, [itemId]);

  
  //FETCH DATA-----
  const handleFetchById = async (id: number) => {
    try {
      console.log("Calling API with ID:", id);
       const currentuser= await service.getUser();
      const result = await service.getItemByRequestNo(id);
   const User=await service.getUserById(result.Approver2Id);
     const historydata=await service.GetHistoryItem(id,"VMR");
     setHistory(historydata);
   console.log("Result:", result);

       if (result.AssignedTo === currentuser.Title) {

      if (result.CurrentStatus === 'Pending' || result.CurrentStatus === 'Approved') {
        setItemId(result.Id);

        setForm(prev => ({
          ...prev,
          POrequestNo: result.POrequestNo || '',
          projectCode: result.ProjectCode || '',
          Department: result.Department || '',
          projectTitle: result.ProjectTitle || '',
          vendorName: result.VendorName || '',
          POAmount: result.POAmount || 0,
          POCategory: result.PoMaster || '',
          ApplicableTaxes: result.ApplicableTaxes || 0,
          ProjectDescription: result.ProjectDescription || '',
          ActionDate1:result.ActionDate1 || '',
          ActionDate2:result.ActionDate2 || '',
          approver2: User?.Title || '',
          RequestNo: result.RequestNo,
          files: null
        }));
       
        if(User?.Id)
        {
          setAssignedID(User.Title);
          setAssignedToEmail(User.Id);
        //approver2:
        }

      if (!result.ActionDate1 || !result.ActionDate2) {
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
    Title: 'PO',
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
    Title: 'PO',
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
     if(form.ActionDate1==='')
     {
      await service.updateItemdata(itemId, "Approved", approverComment,form.approver2 || '');
         await handleSaveApproveHistory(itemId);
      alert("✅ First level approved");
 const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url); 
      return; 
     }
     else if(form.ActionDate2==='')
     {
       await service.updateItemdata2(itemId, "Approved",approverComment,'Approved');
        await handleSaveApproveHistory(itemId);
       alert("✅ Final approval done");
       const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url); 
      return; // 🔥 stop again
    }
     
     
      setApproverComment('');
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
      if(form.ActionDate1==='')
      {
      await service.updateItemdata(itemId, "Rejected", approverComment,"Rejected");
         await handleSaveRejectedHistory(itemId);
      alert("✅ First level Rejected successfully");
         const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url); 
        return;

      }
       else if(form.ActionDate2==='')
     {
       await service.updateItemdata2(itemId, "Rejected", approverComment,'Rejected');
         await handleSaveRejectedHistory(itemId);
       alert("✅ Final Rejection done");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url); 
      return; // 🔥 stop again
       
     }
      alert("❌ Rejected successfully");
      setApproverComment('');
    } catch (error) {
      console.error(error);
    }
  };





  // --- RENDER ---
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>PO Approval Form</h4>
      </div>
      <div className={styles.row}>
        {/* LEFT FORM */}
        <div className={styles['col-md-9']}>
          <div className={styles.leftPanel}>
            <div className={styles.leftPanelHeader}>
              <label style={{fontWeight: "bold"}}>PO Approval Form -{form.RequestNo}</label>
            </div>
            <div className={styles.leftPanelStatusHeader}>
                        {History.filter(item => item.UserAction !== "Request Initiator").map((item, index) => {
    let statusClass = styles.statusBox;
    if (item.UserAction === "Approved") {
      statusClass = `${styles.statusBox}`;    
    } 
    else if (item.UserAction === "Rejected") {
      statusClass = `${styles.statusBox} ${styles.rejectedBox}`;
    }

    return (
      <div className={statusClass} key={index}>
        <div className={styles.content}>
          <h5>{item.UserName}</h5>
          <h6>{item.Designation}</h6>
          <h4>{item.UserAction}</h4>
        </div>
      </div>
    );
  })}
             </div>
            <div className={styles.formGroup}>
              <label>Project Code</label>
              <input value={form.projectCode} readOnly style={{backgroundColor:"lightgray"}}/>
            </div>
            <div className={styles.formGroup}>
              <label>Department</label>
              <input name="department" value={form.Department} readOnly style={{backgroundColor:"lightgray"}} />
            </div>
            <div className={styles.formGroup}>
              <label>Project Title</label>
              <input name="projectTitle" value={form.projectTitle} readOnly style={{backgroundColor:"lightgray"}} />
            </div>
            <div className={styles.formGroup}>
              <label>Select Vendor Name</label>
              <input name="vendorName" value={form.vendorName} readOnly style={{backgroundColor:"lightgray"}} />
            </div>
            <div className={styles.formGroup}>
              <label>PO Amount</label>
              <input name="POAmount" value={form.POAmount} readOnly style={{backgroundColor:"lightgray"}}/>
            </div>
            <div className={styles.formGroup}>
              <label>Applicable Taxes</label>
              <input name="ApplicableTaxes" value={form.ApplicableTaxes} readOnly style={{backgroundColor:"lightgray"}} />
            </div>
            <div className={styles.formGroup}>
              <label>PO Category</label>
              <input name="POCategory" value={form.POCategory} readOnly style={{backgroundColor:"lightgray"}}/>
            </div>
            <div className={styles.formGroup}>
              <label>Additional Information & Remarks</label>
              <input name="comments" value={form.ProjectDescription} readOnly style={{backgroundColor:"lightgray"}}/>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
              <label>
                Attachments <span className={styles.required}>*</span>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", }}>
                {attachments.map((file: any, index: number) => (
                  <a
                    key={index}
                    href={file.ServerRelativeUrl} target="_blank" rel="noopener noreferrer">
                    {file.FileName}
                  </a>
                ))}
              </div>
            </div>


            <label></label>
            <label></label>
            <label>Approver Comments <span className={styles.required}>*</span></label>
            <textarea value={approverComment} onChange={(e) => setApproverComment(e.target.value)} />

            {/* Buttons */}
            <div>
              <div className={styles.buttonGroup}>
                <button className={styles.ApproveBtn} onClick={handleApprove} disabled={isDisabled} >Approve</button>
                <button className={styles.RejectBtn} onClick={handleReject} disabled={isDisabled}>Reject</button>
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
        <span className={styles.spanHeader} style={{fontSize:"bold"}}>{item.Designation}</span>
        <span><b>{isInitiated?"Initiator":"Approver Name:"} </b>{item.UserName}</span>
        {item.UserAction && (
          <span>
            <b>Action Taken:{" "}</b>
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
        {item.ActionDate && <span><b>Action Date: </b>{item.ActionDate}</span>}
        {item.UserComment && <span><b>Comments:</b> {item.UserComment}</span>}
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
  


export default PurchaseOrderApproval;