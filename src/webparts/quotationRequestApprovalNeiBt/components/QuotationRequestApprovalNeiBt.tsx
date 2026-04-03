import * as React from 'react';
import styles from './QuotationRequestApprovalNeiBt.module.scss';
import type { IQuotationRequestApprovalNeiBtProps,IState,IForm } from './IQuotationRequestApprovalNeiBtProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import { useEffect, useState } from 'react';
import { TextField, Dropdown, PrimaryButton, formProperties } from '@fluentui/react';
import SharePointService from '../service/Service';

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
    DepartmentHead: '',
    RequestNo:''
   
  });

   const [itemId, setItemId] = React.useState<number | null>(null);
    const service = new SharePointService(props.context);
    const [approverComment, setApproverComment] = React.useState('');
     const [approverComment2, setApproverComment2] = React.useState('');
    const [attachments, setAttachments] = React.useState<any[]>([]);
     const [AssignedID, setAssignedID] = React.useState<number | null>(null);
    const [approver1, setApprover1] = React.useState('');
    const [approver2, setApprover2] = React.useState('');
    const [approver3, setApprover3] = React.useState('');
    const [approver4, setApprover4] = React.useState('');
    const [approver5, setApprover5] = React.useState('');
    const [departmentHead, setDepartmentHead] = React.useState('');
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
      console.log("Calling API with ID:", id);
      const currentuser= await service.getUser();
      const result = await service.getItemByRequestNo(id);

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
};


  const handleApprove = async () => {
  try {
       if (!approverComment) return alert("Approver Comment required");
    if (!itemId) return;
if(form.ActionDate1==='')
     {
      await service.updateItemdata(itemId, "Approved", approverComment,form.approver2 || '');
        alert("✅ First level approved");
 const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url); 
      return; 
     }
     else if(form.ActionDate2==='')
     {
       await service.updateItemdata2(itemId, "Approved",approverComment,'Approved');
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
        alert("✅ First level Rejected successfully");
         const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url); 
        return;

      }
       else if(form.ActionDate2==='')
     {
       await service.updateItemdata2(itemId, "Rejected", approverComment,'Rejected');
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


// // 🔹 Bind approval path
//   const bindPath = async (dept: string) => {
//     const res = await fetch(
//       `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('DepartmentMasterNEI')/items?$filter=DepartmentName eq '${dept}'`,
//       { headers: { Accept: 'application/json;odata=verbose' } }
//     );
//     const data = await res.json();
//     setPaths(data.d.results);
//   };

  // 🔹 Handle change
  const handleChange = (field: keyof IForm, value: any) => {
    setForm({ ...form, [field]: value });
  };
 
//  // 🔹 File upload
//   const handleFile = (e: any) => {
//     setForm({ ...form, files: Array.from(e.target.files) });
//   };

  
    
  
    return (
      <div className={styles.container}>
        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h4>Quotation Approval Form-NEI BT Admin</h4>
              <div className={styles.row}>
        {/* LEFT FORM */}
        <div className={styles['col-md-9']}>
          <div className={styles.leftPanel}>
            <div className={styles.leftPanelHeader}>
              <h4>Quotation Approval NEI BT Admin-{form.RequestNo} </h4>
              <h4>Current Status: <span className={styles.status}>Rejected</span></h4>
            </div>
  
          <label>Project Title</label>
          <input name="ProjectTitle" value={form.ProjectTitle} readOnly />

          <label>Project Reference No</label>
          <input name="ProjectReffNo" value={form.ProjectReffNo}  readOnly >
          </input>

          <label>Project Description & Advance Payment Details</label>
          <input name="projectDescription" value={form.ProjectDescription}  readOnly >
          </input>

          <label>Total Project Amount</label>
          <input name="TotalProjectAmount" value={form.TotalProjectAmount } readOnly />

          <label>Applicable Taxes</label>
          <input name="ApplicableTaxes" value={form.ApplicableTaxes} readOnly  >
          </input>

          <label>Vendor 1</label>
          <input name="Vendor1" value={form.Vendor1} readOnly />

          <label>Vendor 2</label>
          <input name="Vendor2" value={form.Vendor2} readOnly />

          <label>Vendor 3</label>
          <input name="Vendor3" value={form.Vendor3} readOnly />

          <label>Quote 1</label>
          <input name="Quote1" value={form.Quote1} readOnly />

          <label>Quote 2</label>
          <input name="Quote2" value={form.Quote2} readOnly  />

          <label>Quote 3</label>
          <input name="Quote3" value={form.Quote3} readOnly  />

          <label>Select Vendor</label>
          <input name="Selectedvendor" value={form.Selectedvendor} readOnly  />

          <label>Select Quote</label>
          <input name="SelectedQuote" value={form.SelectedQuote} readOnly   >
          </input>

          <label>Department</label>
          <input name="Department" value={form.Department}  readOnly >
          </input>

          <label>Advance Amount</label>
          <input name="AdvancePayment" value={form.Advancepayment} readOnly  >
          </input>

          <label>Approval Path</label>
          <input name="ApprovalPath" value={form.ApprovalPath}  readOnly >
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
            <button className={styles.ApproveBtn} onClick={handleApprove}>Approve</button>
            <button className={styles.RejectBtn} onClick={handleReject} >Reject</button>
            <button className={styles.cancelBtn}>Cancel</button>
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
      </div>
      </div>
      </div>
      
    );
  }


export default QuotationRequestApprovalNeiBt;