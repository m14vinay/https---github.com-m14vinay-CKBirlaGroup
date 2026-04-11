import * as React from 'react';
import { useState } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './PurchaseOrderView.module.scss';
import { IPurchaseOrderViewProps } from './IPurchaseOrderViewProps';
import SharePointService from '../Service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';



const PurchaseOrderView: React.FC<IPurchaseOrderViewProps> = (props) => {

  const [form, setForm]=React.useState({
    POrequestNo:'',
      projectCode: '',
      projectTitle: '',
      vendorName: '',
      RemainingAmount: 0,
      Department:'',
      POAmount: 0,
       PoMaster: '',
     ApplicableTaxes:0,
     POCategory:'',
     ProjectDescription: '',
     ApproverComment1:'',
     ApproverCommentsError:'',
     files:  null,
     attachments: [],
    approver1: '',
   approver2: '',
   approver3: '',
   approver4: '',
   approver5: '',
   DepartmentHead: '',
   CurrentStatus: '',
   RequestNo:''
    
  });

  
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [approverComment, setApproverComment] = React.useState('');
  const [attachments, setAttachments] = React.useState<any[]>([]);
 const [approver1, setApprover1] = React.useState('');
const [approver2, setApprover2] = React.useState('');
const [approver3, setApprover3] = React.useState('');
const [approver4, setApprover4] = React.useState('');
const [approver5, setApprover5] = React.useState('');
const [departmentHead, setDepartmentHead] = React.useState('');
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

// componentDidMount(): void {
//   this.loadAttachments();
//   this.GetApprover();
// }
  
//FETCH DATA-----
const handleFetchById = async (id: number) => {
    try {
       setLoading(true);
      console.log("Calling API with ID:", id);

      const result = await service.getItemByRequestNo(id);
       const user = await service.getUser();
     const historydata=await service.GetHistoryItem(id,"PO");
     setHistory(historydata);
      console.log("Result:", result);

      if (result) {
      setItemId(result.Id);

      setForm(prev => ({
        ...prev,
        POrequestNo: result.POrequestNo || '',
          projectCode: result.ProjectCode || '',
          Department: result.Department || '',
          projectTitle: result.ProjectTitle || '',
          vendorName: result.VendorName || '',
          POAmount: result.POAmount || 0,
         PoMaster: result.PoMaster || '',
          ApplicableTaxes: result.ApplicableTaxes || 0,
          ProjectDescription: result.ProjectDescription || '',
          RequestNo: result.RequestNo,
          CurrentStatus: result.CurrentStatus,
        files: null
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


  
    
 


  // --- RENDER ---
  // --- RENDER ---
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
        <h4>PO Approval Details & Status</h4>
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
              <input name="department" value={form.Department} readOnly style={{backgroundColor:"lightgray"}}/>
            </div>
            <div className={styles.formGroup}>
              <label>Project Title</label>
              <input name="projectTitle" value={form.projectTitle} readOnly style={{backgroundColor:"lightgray"}}/>
            </div>
            <div className={styles.formGroup}>
              <label>Select Vendor Name</label>
              <input name="vendorName" value={form.vendorName} readOnly style={{backgroundColor:"lightgray"}} />
            </div>
            <div className={styles.formGroup}>
              <label>PO Amount</label>
              <input name="POAmount" value={form.POAmount} readOnly style={{backgroundColor:"lightgray"}} />
            </div>
            <div className={styles.formGroup}>
              <label>Applicable Taxes</label>
              <input name="ApplicableTaxes" value={form.ApplicableTaxes} readOnly style={{backgroundColor:"lightgray"}} />
            </div>
            <div className={styles.formGroup}>
              <label>PO Category</label>
              <input name="POCategory" value={form.PoMaster} readOnly style={{backgroundColor:"lightgray"}} />
            </div>
            <div className={styles.formGroup}>
              <label>Additional Information & Remarks</label>
              <input name="comments" value={form.ProjectDescription} readOnly style={{backgroundColor:"lightgray"}} />
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


export default PurchaseOrderView;