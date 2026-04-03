import * as React from 'react';
import styles from './QuotationRequestDetailViewNeiBt.module.scss';
import type { IQuotationRequestDetailViewNeiBtProps } from './IQuotationRequestDetailViewNeiBtProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import { useEffect, useState } from 'react';
import { TextField, Dropdown, PrimaryButton, formProperties } from '@fluentui/react';
import SharePointService from '../service/Service';

const QuotationRequestDetailViewNeiBt: React.FC<IQuotationRequestDetailViewNeiBtProps> = (props) => {

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
       CurrentStatus: '',
       RequestNo:''
    
  });

   const [itemId, setItemId] = React.useState<number | null>(null);
    const service = new SharePointService(props.context);
    const [approverComment, setApproverComment] = React.useState('');
    const [attachments, setAttachments] = React.useState<any[]>([]);
  // useEffect(() => {
  //   loadDepartments();
  // }, []);

  // const loadDepartments = async () => {
  //   const res = await fetch(
  //     `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('DepartmentMasterNEI')/items`,
  //     { headers: { Accept: 'application/json;odata=verbose' } }
  //   );
  //   const data = await res.json();
  //   setDepartments(data.d.results);
  // };

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


const handleFetchById = async (id: number) => {
    try {
      console.log("Calling API with ID:", id);

      const result = await service.getItemByRequestNo(id);

      console.log("Result:", result);

      if (result) {
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
      CurrentStatus: result.Currentstatus || '',
        RequestNo: result.RequestNo || '',
      files: null,
      
      }));
  setApproverComment(result.ApproverComment1 || '');
    } else {
      alert("No data found");
    }

  } catch (error) {
    console.error("Error:", error);
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
  
 
//  // 🔹 File upload
//   const handleFile = (e: any) => {
//     setForm({ ...form, files: Array.from(e.target.files) });
//   };

  
    
  
    return (
      <div className={styles.container}>
      <div className={styles.header}>
        <h4>Quotation Approval NEI BT Admin Request Details & Status</h4>
      </div>
      <div className={styles.row}>
        {/* LEFT FORM */}
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
              <div className={`${styles.statusBox} ${styles.pendingBox}`}>
                <div className={styles.content}>
                  <h5>Vinay Kumar</h5>
                  <h6>Department Head</h6>
                  <h4>Pending</h4>
                </div>
              </div>
              <div className={`${styles.statusBox} ${styles.rejectedBox}`}>
                <div className={styles.content}>
                  <h5>Vinay Kumar</h5>
                  <h6>Department Head</h6>
                  <h4>Rejected</h4>
                </div>
              </div>
              <div className={`${styles.statusBox} ${styles.upcomingBox}`}>
                <div className={styles.content}>
                  <h5>Vinay Kumar</h5>
                  <h6>Department Head</h6>
                  <h4>Upcoming Approver</h4>
                </div>
              </div>
            </div>
          <label>Project Title</label>
          <input name="ProjectTitle" value={form.ProjectTitle} readOnly />

          <label>Project Reference No</label>
          <input name="ProjectReffNo" value={form.ProjectReffNo}  readOnly >
          </input>

          <label>Project Description & Advance Payment Details</label>
          <input name="projectDescription" value={form.ProjectDescription} readOnly  >
          </input>

          <label>Total Project Amount</label>
          <input name="TotalProjectAmount" value={form.TotalProjectAmount } readOnly />

          <label>Applicable Taxes</label>
          <input name="ApplicableTaxes" value={form.ApplicableTaxes} readOnly  >
          </input>

          <label>Vendor 1</label>
          <input name="Vendor1" value={form.Vendor1} readOnly />

          <label>Vendor 2</label>
          <input name="Vendor2" value={form.Vendor2} readOnly  />

          <label>Vendor 3</label>
          <input name="Vendor3" value={form.Vendor3} readOnly />

          <label>Quote 1</label>
          <input name="Quote1" value={form.Quote1} readOnly />

          <label>Quote 2</label>
          <input name="Quote2" value={form.Quote2} readOnly  />

          <label>Quote 3</label>
          <input name="Quote3" value={form.Quote3} readOnly />

          <label>Select Vendor</label>
          <input name="Selectedvendor" value={form.Selectedvendor} readOnly />

          <label>Select Quote</label>
          <input name="SelectedQuote" value={form.SelectedQuote} readOnly  >
          </input>

          <label>Department</label>
          <input name="Department" value={form.Department} readOnly  >
          </input>

          <label>Advance Amount</label>
          <input name="AdvancePayment" value={form.Advancepayment} readOnly  >
          </input>

          <label>Approval Path</label>
          <input name="ApprovalPath" value={form.ApprovalPath} readOnly  >
          </input>          
 <div style={{ display: "flex", alignItems: "flex-start" , gap: "10px" , marginBottom:"10px"}}>
           <label>
            Attachments <span className={styles.required}></span>
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


        

         <div className={styles['col-md-3']}>
          <div className={styles.rightPanel}>
            <div className={styles.rightPanelHeader}>
              <h4>Timeline of the Request - FBP-543</h4>
            </div>
            <ul>
              <li className={styles.tickIcon}>
                <span className={styles.spanHeader}>Request Initiated</span>
                <span>Initiator: M.Ponnamalai</span>
                <span>Date & Time: 10 mar 2026 AT 10:00 AM</span>
              </li>
              <li className={styles.tickIcon}>
                <span className={styles.spanHeader}>Department Head</span>
                <span>Approver Name: Vinay Kumar</span>
                <span>Action Taken: <span className={styles.apprStatus}>Approved</span></span>
                <span>Action Date: 12 mar 2026 AT 12:00 AM</span>
                <span>Comments: Comments submitted by approver while taking action.</span>
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
export default QuotationRequestDetailViewNeiBt;