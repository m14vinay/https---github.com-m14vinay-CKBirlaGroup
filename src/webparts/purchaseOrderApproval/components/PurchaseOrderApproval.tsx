import * as React from 'react';
import { useState } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './PurchaseOrderApproval.module.scss';
import { IPurchaseOrderApprovalProps } from './IPurchaseOrderApprovalProps';
import SharePointService from '../service/Service';
import Service from '../service/Service';
import { FabricPerformance } from '@fluentui/react';
import { Spinner, SpinnerSize } from '@fluentui/react';


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
    PoMaster: '',
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
    ActionDate1: '',
    ActionDate2: '',
    DepartmentHead: '',
    CurrentStatus: '',
    Approver2Id: '',
    ApprovalPath:'',
    ApproverToEmail: '',
    Approver2EmailId: 0,
    RequestNo: ''

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
  const [loading, setLoading] = React.useState(false);
  const [actionType, setActionType] = React.useState<'approve' | 'reject' | ''>('');
  const [History, setHistory] = useState<any[]>([]);



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
      setLoading(true);
      console.log("Calling API with ID:", id);
      const currentuser = await service.getUser();
      const result = await service.getItemByRequestNo(id);
      const User = await service.getUserById(result.Approver2Id);
      const historydata = await service.GetHistoryItem(id, "PO");
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
            PoMaster: result.PoMaster || '',
            ApplicableTaxes: result.ApplicableTaxes || 0,
            ProjectDescription: result.ProjectDescription || '',
            ActionDate1: result.ActionDate1 || '',
            ActionDate2: result.ActionDate2 || '',
         ApprovalPath: result.ApprovalPath || '',
            approver2: User?.Title || '',
            Approver2EmailId: result.Approver2Id,
            RequestNo: result.RequestNo,
            files: null
          }));

          if (User?.Id) {
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
        alert("No Data Found");
      }

    }
 else {
      alert("❌ This Action Has Already Taken.Please Wait For Queue");
    }
    } catch (error) {
      console.error("Error Occurred,Please Contact To System Administrator.:", error);
    }
    finally {
      setLoading(false);
    }
  };

const handleUpdateApproveHistory = async (id: number, UserAction: string, Sequence: number, comment: string) => {
    const payload = {
      UserAction: UserAction,
      ActionDate: new Date().toISOString(),
      UserComment: comment
    };
    await service.UpdateHistoryItem(id, payload, 'PO', Sequence);
  };


  const handleApprove = async () => {
    try {
      // setActionType('approve');
      setLoading(true);
      if (!approverComment) return alert("Enter Approver Comment");
      
      if (!itemId) return;
      if (!form.Approver2EmailId) {
      await service.updateItemdata(itemId, "Approved", approverComment,0,"");
      await handleUpdateApproveHistory(itemId, 'Approved', 1, approverComment);
      alert("✅ Final Approved");

      window.location.assign(`${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`);
      return;
    }

     if(form.ActionDate1==='')
     {
      await service.updateItemdata(itemId, "Pending", approverComment,form.Approver2EmailId,form.approver2 || '');
      await handleUpdateApproveHistory(itemId, 'Approved', 1, approverComment);
      alert("✅ First Level Approved Successfully.");
 const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
     window.location.assign(url); 
      return; 
     }
     else if(form.ActionDate2==='')
     {
       await service.updateItemdata2(itemId, "Approved",approverComment,'Approved');
      await handleUpdateApproveHistory(itemId, 'Approved', 2, approverComment);
       alert("✅ Final Level Approved Successfully.");
       const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
     window.location.assign(url); 
      return; // 🔥 stop again
    }
     
     
      setApproverComment('');
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
       //setActionType('reject');
        setLoading(true);
      if (!approverComment) return alert("Enter Approver Comment");
      if (!itemId) return;

      if (!approverComment) {
        alert("Comment is required for rejection ❗");
        return;
      }

        if (!form.Approver2EmailId) {
      await service.updateItemdata(itemId, "Rejected", approverComment,0,"");

      await handleUpdateApproveHistory(itemId, 'Rejected', 1, approverComment);
      alert("✅ Final Rejected successfully");

      window.location.assign(`${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`);
      return;
    }
      if (form.ActionDate1 === '') {
        await service.updateItemdata(itemId, "Rejected", approverComment, form.Approver2EmailId, "Rejected",);
        await handleUpdateApproveHistory(itemId, 'Rejected', 1, approverComment);
        alert("✅ First level Rejected successfully");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
        window.location.assign(url);
        return;

      }
      else if (form.ActionDate2 === '') {
        await service.updateItemdata2(itemId, "Rejected", approverComment, "Rejected");
        await handleUpdateApproveHistory(itemId, 'Rejected', 2, approverComment);
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
    finally {
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
          <h4>PO Approval Form</h4>
        </div>
        <div className={styles.row}>
          {/* LEFT FORM */}
          <div className={styles['col-md-9']}>
            <div className={styles.leftPanel}>
              <div className={styles.leftPanelHeader}>
                <label style={{ fontWeight: "bold" }}>PO Approval Form -{form.RequestNo}</label>
              </div>

              <div className={styles.formGroup}>
                <label>Project Code</label>
                <input value={form.projectCode} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
              <div className={styles.formGroup}>
                <label>Department</label>
                <input name="department" value={form.Department} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
              <div className={styles.formGroup}>
                <label>Project Title</label>
                <input name="projectTitle" value={form.projectTitle} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
              <div className={styles.formGroup}>
                <label>Select Vendor Name</label>
                <input name="vendorName" value={form.vendorName} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
              <div className={styles.formGroup}>
                <label>PO Amount</label>
                <input name="POAmount" value={form.POAmount} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
              <div className={styles.formGroup}>
                <label>Applicable Taxes</label>
                <input name="ApplicableTaxes" value={form.ApplicableTaxes} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
              <div className={styles.formGroup}>
                <label>PO Category</label>
                <input name="POCategory" value={form.PoMaster} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
               <div className={styles.formGroup}>
              <label>Approval Path</label>
          <input name="ApprovalPath" value={form.ApprovalPath}  readOnly style={{backgroundColor:"lightgray"}} />
          </div>
              <div className={styles.formGroup}>
                <label>Additional Information & Remarks</label>
                <input name="comments" value={form.ProjectDescription} readOnly style={{ backgroundColor: "lightgray" }} />
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
                  <button className={styles.ApproveBtn} onClick={handleApprove} disabled={isDisabled}>Approve</button>
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
                  const isUpcoming = item.UserAction === "Upcoming";
                  return (
                    <li
                      key={index}
                      className={
                        isApproved
                          ? styles.tickIcon
                          : isRejected
                            ? styles.crossIcon
                            : isInitiated ? styles.tickIcon : isUpcoming ? styles.upcomingIcon : ""
                      }
                    >
                      <span className={styles.spanHeader} style={{ fontSize: "bold" }}>{item.Designation}</span>
                      <span><b>{isInitiated ? "Initiator" : "Approver Name:"} </b>{item.UserName}</span>
                      {item.UserAction && (
                        <span>
                          <b>Action Taken:{" "}</b>
                          <span
                            className={
                              isApproved
                                ? styles.apprStatus
                                : isRejected
                                  ? styles.rejStatus
                                  : isUpcoming ? styles.upcomingstatus : ""
                            }
                          >
                            {item.UserAction}
                          </span>
                        </span>
                      )}
                      {item.ActionDate && (<span><b>Action Date: </b>
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
export default PurchaseOrderApproval;