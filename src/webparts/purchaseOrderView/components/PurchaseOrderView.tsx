import * as React from 'react';
import { useState } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './PurchaseOrderView.module.scss';
import { IPurchaseOrderViewProps } from './IPurchaseOrderViewProps';
import SharePointService from '../Service/Service';



const PurchaseOrderView: React.FC<IPurchaseOrderViewProps> = (props) => {

  const [form, setForm]=React.useState({
    POrequestNo:'',
      projectCode: '',
      projectTitle: '',
      vendorName: '',
      RemainingAmount: 0,
      Department:'',
      POAmount: 0,
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
   CurrentStatus: ''
    
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
      console.log("Calling API with ID:", id);

      const result = await service.getItemByRequestNo(id);

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
        ApplicableTaxes: result.ApplicableTaxes || 0,
        ProjectDescription: result.ProjectDescription || '',
        CurrentStatus: result.Currentstatus || '',
        files: null
      }));

      setApproverComment(result.ApproverComment1 || '');

    } else {
      alert("No data found");
    }

  } catch (error) {
    console.error("Error:", error);
  }
};


  const handleApprove = async () => {
  try {
       if (!approverComment) return alert("Approver Comment required");
    if (!itemId) return;

    await service.updateItemdata(itemId, "Approved", approverComment);

    alert("✅ Approved successfully");
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

    await service.updateItemdata(itemId, "Rejected", approverComment);

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
        <h4>PO Approval Details & Status</h4>
      </div>
      <div className={styles.row}>
        {/* LEFT FORM */}
        <div className={styles['col-md-9']}>
          <div className={styles.leftPanel}>
            <div className={styles.leftPanelHeader}>
              <h4>CKBCSL/25-26/IV/Finance/12</h4>
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
            <div className={styles.formGroup}>
              <label>Project Code</label>
              <input value={form.projectCode} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>Department</label>
              <input name="department" value={form.Department} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>Project Title</label>
              <input name="projectTitle" value={form.projectTitle} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>Select Vendor Name</label>
              <input name="vendorName" value={form.vendorName} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>PO Amount</label>
              <input name="POAmount" value={form.POAmount} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>Applicable Taxes</label>
              <input name="ApplicableTaxes" value={form.ApplicableTaxes} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>PO Category</label>
              <input name="POCategory" value={form.POCategory} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>Additional Information & Remarks</label>
              <input name="comments" value={form.ProjectDescription} readOnly />
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


export default PurchaseOrderView;