import * as React from 'react';
import styles from './QuotationRequestApprovalNeiBt.module.scss';
import type { IQuotationRequestApprovalNeiBtProps,IState,IForm } from './IQuotationRequestApprovalNeiBtProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import { useEffect, useState } from 'react';
import { TextField, Dropdown, PrimaryButton, formProperties } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';

const QuotationRequestApprovalNeiBt: React.FC<IQuotationRequestApprovalNeiBtProps> = (props) => {

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
      files: null,
      attachments: [],
       ApproverComment1:'',
       CurrentStatus:'',
       approver1: '',
    approver2: '',
    approver3: '',
    approver4: '',
    approver5: '',
    ActionDate1:'',
    ActionDate2:'',
     ActionDate3:'',
    DepartmentHead: '',
    RequestNo:''
   
  });

   const [itemId, setItemId] = React.useState<number | null>(null);
    const service = new SharePointService(props.context);
    const [approverComment, setApproverComment] = React.useState('');
     const [approverComment2, setApproverComment2] = React.useState('');
    const [attachments, setAttachments] = React.useState<any[]>([]);
     const [AssignedID2, setAssignedID2] = React.useState('');
     const [AssignedID3, setAssignedID3] = React.useState('');
    const [approver1, setApprover1] = React.useState('');
    const [approver2, setApprover2] = React.useState('');
    const [approver3, setApprover3] = React.useState('');
    const [approver4, setApprover4] = React.useState('');
    const [approver5, setApprover5] = React.useState('');
    const [departmentHead, setDepartmentHead] = React.useState('');
    const [isDisabled, setIsDisabled] = useState(false);
  const [History, setHistory] = useState<any[]>([]);
   const [loading, setLoading] = React.useState(false);
       const [actionType, setActionType] = React.useState<'approve' | 'reject' | ''>('');
  
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
     getApprover();// 👈 dynamic ID use karo
  }
}, [itemId]);


const handleFetchById = async (id: number) => {
    try {
       setLoading(true);
      console.log("Calling API with ID:", id);
      const currentuser= await service.getUser();
      const result = await service.getItemByRequestNo(id);
      if (result.Approval2Id) {
  const user2 = await service.getUserById(result.Approval2Id);
  if (user2?.Title) {
    setAssignedID2(user2.Title);
  }
}
if (result.Approval3Id) {
  const user3 = await service.getUserById(result.Approval3Id);
  if (user3?.Title) {
    setAssignedID3(user3.Title);
  }
}
        const User=await service.getUserById(result.Approval2Id);
    const historydata=await service.GetHistoryItem(id,"QANEIBT");
     setHistory(historydata); 
      console.log("Result:", result);

       if (result.AssignedTo === currentuser.Title) {
      if (result.CurrentStatus==='Pending' || result.CurrentStatus==='Approved' ) {
      setItemId(result.Id);

      setForm(prev => ({
        ...prev,
        ProjectTitle: result.ProjectTitle || '',
        ProjectReffNo: result. ProjectReffNo || '',
        ProjectDescription: result.ProjectDescription || '',
        TotalProjectAmount: result.TotalProjectAmount || 0,
         ApplicableTaxes: result.ApplicableTaxes || 0,
          Vendor1: result.Vendor1 || '',
      Vendor2: result.Vendor2 || '',
      Vendor3: result.Vendor3 || '',
      Quote1: result.Quote1 || '',
      Quote2:result.Quote2 || '',
      Quote3: result.Quote3 || '',
      Selectedvendor: result.Selectedvendor || '',
      SelectedQuote: result.SelectedQuote || '',
      Department: result.Department || '',
      Advancepayment: result.Advancepayment || 0,
      ApprovalPath: result.ApprovalPath || '',
      RequestNo : result.RequestNo || '',
       ActionDate1:result.ActionDate1 || '',
          ActionDate2:result.ActionDate2 || '',
          ActionDate3:result.ActionDate3 || '',

      files: null
      }));
   


  if (!result.ActionDate1 || !result.ActionDate2 || !result.ActionDate3) {
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
   finally
  {
    setLoading(false);
  }
};


const handleSaveApproveHistory = async (id: number) => {

  const currentuser = await service.getUser();

  const payload = {
    Title: 'QANEIBT',
    FID: id,  
    UserName: currentuser.Title,
    UserAction: 'Approved',
    ActionDate: new Date().toISOString(),
     Designation: currentuser.JobTitle, 
      UserComment: approverComment
  };

  await service.createHistoryItem(payload);
};

const handleSaveRejectedHistory = async (id: number) => {

  const currentuser = await service.getUser();

  const payload = {
    Title: 'QANEIBT',
    FID: id,  
    UserName: currentuser.Title,
    UserAction: 'Rejected',
    ActionDate: new Date().toISOString(),
     Designation: currentuser.JobTitle,
     UserComment: approverComment
      
  };

  await service.createHistoryItem(payload);
};



  const handleApprove = async () => {
  try {
     //setActionType('approve');
      setLoading(true);
       if (!approverComment) return alert("Approver Comment required");
    if (!itemId) return;
if(form.ActionDate1==='')
     {
      await service.updateItemdata(itemId, "Approved", approverComment,AssignedID2);
        await handleSaveApproveHistory(itemId);
        alert("✅ First level approved");
 const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url); 
      return; 
     }
     else if(form.ActionDate2==='')
     {
       await service.updateItemdata2(itemId, "Approved",approverComment,AssignedID3);
       await handleSaveApproveHistory(itemId);
       alert("✅ Second level approved");
       const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url); 
      return; // 🔥 stop again
    }
    else if(form.ActionDate3==='')
     {
       await service.updateItemdata3(itemId, "Approved",approverComment,"Approved");
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
  finally
  {
    setLoading(false);
  }
};

const handleReject = async () => {
  try {
     //setActionType('approve');
      setLoading(true);
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
        alert("✅ Second level Rejected successfully");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url); 
      return; // 🔥 stop again
       
     }
      else if(form.ActionDate3==='')
     {
       await service.updateItemdata3(itemId, "Rejected", approverComment,"Rejected");
         await handleSaveRejectedHistory(itemId);
        alert("✅ Final level Rejected successfully");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url); 
      return; // 🔥 stop again
       
     }
      alert("❌ Rejected successfully");
     
    setApproverComment('');
  } catch (error) {
    console.error(error);
  }
  finally
  {
    setLoading(false);
  }
};

  
    
  
   return (
            <section>
              {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(255,255,255,0.6)',
          zIndex: 9999
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
            <Spinner label="Processing..." size={SpinnerSize.large} />
          </div>
        </div>
      )}
      <div className={styles.container}>
        {/* LEFT FORM */}
        <div className={styles.header}>
          <h4>Quotation Approval Form-NEI BT Admin</h4>
          </div>
              <div className={styles.row}>
        {/* LEFT FORM */}
        <div className={styles['col-md-9']}>
          <div className={styles.leftPanel}>
            <div className={styles.leftPanelHeader}>
              <label style={{fontWeight: "bold"}}>Quotation Approval NEI BT Admin-{form.RequestNo} </label>
            </div>
            
          <label>Project Title</label>
          <input name="ProjectTitle" value={form.ProjectTitle} readOnly style={{backgroundColor:"lightgray"}} />

          <label>Project Reference No</label>
          <input name="ProjectReffNo" value={form.ProjectReffNo}  readOnly style={{backgroundColor:"lightgray"}} >
          </input>

          <label>Project Description & Advance Payment Details</label>
          <input name="projectDescription" value={form.ProjectDescription}  readOnly style={{backgroundColor:"lightgray"}} >
          </input>

          <label>Total Project Amount</label>
          <input name="TotalProjectAmount" value={form.TotalProjectAmount } readOnly style={{backgroundColor:"lightgray"}} />

          <label>Applicable Taxes</label>
          <input name="ApplicableTaxes" value={form.ApplicableTaxes} readOnly style={{backgroundColor:"lightgray"}}  >
          </input>

          <label>Vendor 1</label>
          <input name="Vendor1" value={form.Vendor1} readOnly style={{backgroundColor:"lightgray"}}/>

          <label>Vendor 2</label>
          <input name="Vendor2" value={form.Vendor2} readOnly style={{backgroundColor:"lightgray"}} />

          <label>Vendor 3</label>
          <input name="Vendor3" value={form.Vendor3} readOnly style={{backgroundColor:"lightgray"}} />

          <label>Quote 1</label>
          <input name="Quote1" value={form.Quote1} readOnly style={{backgroundColor:"lightgray"}} />

          <label>Quote 2</label>
          <input name="Quote2" value={form.Quote2} readOnly style={{backgroundColor:"lightgray"}} />

          <label>Quote 3</label>
          <input name="Quote3" value={form.Quote3} readOnly style={{backgroundColor:"lightgray"}} />

          <label>Select Vendor</label>
          <input name="Selectedvendor" value={form.Selectedvendor} readOnly style={{backgroundColor:"lightgray"}} />

          <label>Select Quote</label>
          <input name="SelectedQuote" value={form.SelectedQuote} readOnly  style={{backgroundColor:"lightgray"}} >
          </input>

          <label>Department</label>
          <input name="Department" value={form.Department}  readOnly style={{backgroundColor:"lightgray"}} >
          </input>

          <label>Advance Amount</label>
          <input name="AdvancePayment" value={form.Advancepayment} readOnly  style={{backgroundColor:"lightgray"}}>
          </input>

          <label>Approval Path</label>
          <input name="ApprovalPath" value={form.ApprovalPath}  readOnly style={{backgroundColor:"lightgray"}}>
          </input>          
 <div style={{ display: "flex", alignItems: "flex-start" , gap: "10px" , marginBottom:"10px"}}>
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

<label></label>
        <label></label>
        <label>Approver Comments <span className={styles.required}>*</span></label>
       <textarea value={approverComment} onChange={(e) => setApproverComment(e.target.value)}/>
          {/* Buttons */}
         <div className={styles.buttonGroup}>
            <button className={styles.ApproveBtn} onClick={handleApprove} disabled={isDisabled}>Approve</button>
                <button className={styles.RejectBtn} onClick={handleReject} disabled={isDisabled}>Reject</button>
            <button className={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      </div>
     


        {/* RIGHT PANEL */}
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
            {item.ActionDate && ( <span><b>Action Date: </b>
    {new Date(item.ActionDate).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(',', ' AT')}
  </span>
)}
             {item.UserComment && <span><b>Comments:</b> {item.UserComment}</span>}
           </li>
         );
       })}
                 </ul>
               </div>
             </div>
          </div>
          </div>
      </section>
    );
  }


export default QuotationRequestApprovalNeiBt;