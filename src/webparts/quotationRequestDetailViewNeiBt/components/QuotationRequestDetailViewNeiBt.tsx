import * as React from 'react';
import styles from './QuotationRequestDetailViewNeiBt.module.scss';
import type { IQuotationRequestDetailViewNeiBtProps } from './IQuotationRequestDetailViewNeiBtProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import { useEffect, useState } from 'react';
import { TextField, Dropdown, PrimaryButton, formProperties } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';

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
  const [History, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
      
    

    // --- 1️⃣ Get ID from query string ---
     const getIdFromQueryString = (): number | null => {
       const params = new URLSearchParams(window.location.search);
       const id = params.get('RequestId');
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
        setLoading(true);
      console.log("Calling API with ID:", id);

      const result = await service.getItemByRequestNo(id);
      const user = await service.getUser();
     const historydata=await service.GetHistoryItem(id,"QANEIBT");
     setHistory(historydata);
      const currentUser = await service.getUser();
       if(result.AuthorId!== currentUser.Id)
      {
         alert("You Are Not Authorized ❌ ");
      } 
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
      CurrentStatus: result.CurrentStatus || '',
      RequestNo: result.RequestNo || '',
      files: null,
      
      }));
  setApproverComment(result.ApproverComment1 || '');
    } else {
      alert("No Data Found");
    }

  } catch (error) {
    console.error("Error Occurred,Please Contact To System Administrator.:", error);
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
      <div className={styles.header}>
        <h4>Quotation Approval NEI BT Admin Request Details & Status</h4>
      </div>
      <div className={styles.row}>
        <div className={styles['col-md-9']}>
          <div className={styles.leftPanel}>
            <div className={styles.leftPanelHeader}>
              <h4></h4>
             <h4>Current Status:<span className={form.CurrentStatus === "Approved"
      ? styles.Approved
      : form.CurrentStatus === "Rejected"
      ? styles.Rejected
      : styles.Pending }>{form.CurrentStatus}</span></h4>
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
          <label>Project Title</label>
          <input name="ProjectTitle" value={form.ProjectTitle} readOnly style={{backgroundColor:"lightgray"}} />
          </div>
           <div className={styles.formGroup}>
          <label>Project Reference No</label>
          <input name="ProjectReffNo" value={form.ProjectReffNo}  readOnly style={{backgroundColor:"lightgray"}}/>
         </div>
          
           <div className={styles.formGroup}>
          <label>Project Description & Advance Payment Details</label>
          <input name="projectDescription" value={form.ProjectDescription} readOnly style={{backgroundColor:"lightgray"}} />
          </div>
          
           <div className={styles.formGroup}>
          <label>Total Project Amount</label>
          <input name="TotalProjectAmount" value={form.TotalProjectAmount } readOnly style={{backgroundColor:"lightgray"}} />
          </div>

            <div className={styles.formGroup}>
          <label>Applicable Taxes</label>
          <input name="ApplicableTaxes" value={form.ApplicableTaxes} readOnly style={{backgroundColor:"lightgray"}}  />
          </div>

           <div className={styles.formGroup}>
          <label>Vendor 1</label>
          <input name="Vendor1" value={form.Vendor1} readOnly style={{backgroundColor:"lightgray"}}/>
          </div>

             <div className={styles.formGroup}>
          <label>Vendor 2</label>
          <input name="Vendor2" value={form.Vendor2} readOnly style={{backgroundColor:"lightgray"}} />
          </div>

           <div className={styles.formGroup}>
          <label>Vendor 3</label>
          <input name="Vendor3" value={form.Vendor3} readOnly style={{backgroundColor:"lightgray"}}/>
          </div>
        <div className={styles.formGroup}>
          <label>Quote 1</label>
          <input name="Quote1" value={form.Quote1} readOnly style={{backgroundColor:"lightgray"}}/>
          </div>
         
           <div className={styles.formGroup}>
          <label>Quote 2</label>
          <input name="Quote2" value={form.Quote2} readOnly  style={{backgroundColor:"lightgray"}}/>
          </div>

           <div className={styles.formGroup}>
          <label>Quote 3</label>
          <input name="Quote3" value={form.Quote3} readOnly style={{backgroundColor:"lightgray"}}/>
           </div>

             <div className={styles.formGroup}>
          <label>Select Vendor</label>
          <input name="Selectedvendor" value={form.Selectedvendor} style={{backgroundColor:"lightgray"}} />
          </div>

              <div className={styles.formGroup}>
          <label>Select Quote</label>
          <input name="SelectedQuote" value={form.SelectedQuote} style={{backgroundColor:"lightgray"}}  />
          
          </div>

<div className={styles.formGroup}>
          <label>Department</label>
          <input name="Department" value={form.Department} style={{backgroundColor:"lightgray"}}  />
         </div>
          
          <div className={styles.formGroup}>
          <label>Advance Amount</label>
          <input name="AdvancePayment" value={form.Advancepayment} style={{backgroundColor:"lightgray"}}  />
          </div>


 <div className={styles.formGroup}>
          <label>Approval Path</label>
          <input name="ApprovalPath" value={form.ApprovalPath} style={{backgroundColor:"lightgray"}}  />
          
          </div>         
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
};

export default QuotationRequestDetailViewNeiBt;