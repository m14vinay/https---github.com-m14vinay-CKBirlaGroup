import * as React from 'react';
import { useState } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './VendorMappingApprovalForm.module.scss';
import { IVendorMappingApprovalFormProps } from './IVendorMappingApprovalFormProps';
import SharePointService from '../service/Service';
import Service from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';



const VendorMappingForm: React.FC<IVendorMappingApprovalFormProps> = (props) => {

  const [form, setForm] = React.useState({
    projectCode: '',
    projectTitle: '',
    projectDescription: '',
    vendorName: '',
    vendorDescription: '',
    files: null as FileList | null,
    attachments: [],
    CurrentStatus: '',
    RequestNo: '',
    AssignedTo: '',
    vendorId: '',
    AuthorId: '',
    Created: '',
    Actiondate1: '',
    ApproverComment: '',
    AssignedToEmail: ''

  });

  ;
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [approverComment, setApproverComment] = React.useState('');
  const [Actiondate1, setactiondate1] = React.useState('');
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = React.useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [loading, setLoading] = React.useState(false);
  const [vendorId, setVendorId] = useState<string>('');



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
 const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
    window.location.assign(url);
  };

  const loadAttachments = async (id: number) => {
    try {
      const files = await service.getAttachments(id);
      console.log("Attachments:", files);
      setAttachments(files);
    } catch (error) {
      console.error(error);
    }
  };
  React.useEffect(() => {
    if (itemId) {
      loadAttachments(itemId);
    }
  }, [itemId]);

  //FETCH DATA-----
  const handleFetchById = async (id: number) => {
    try {
      setLoading(true);

      console.log("Calling API with ID:", id);
      const currentuser = await service.getUser();
      const result = await service.getItemByRequestNo(id);
      const historydata = await service.GetHistoryItem(id, "VMR");
      setHistory(historydata);
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
            Author: result.Author || '',
            Created: (result.Created),
            Actiondate1: (result.Actiondate1),
            ApproverComment: result.ApproverComment || '',
            AssignedToEmail: result.AssignedToEmail || '',

            files: null
          }));
          const value = result.VendorName || '';
          const Id = value.includes("/") ? value.split("/")[1].split("-")[0] : value;
          setVendorId(Id);
          if (!result.Actiondate1) {
            setIsDisabled(false);  // enable
          } else {
            setIsDisabled(true);   // disable
          }

        } else {
          alert("No Data Found.");
        }

      } else {
        alert("❌ Unauthorized Access! You are not the current approver");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
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
    await service.UpdateHistoryItem(id, payload, 'VMR', Sequence);
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      if (!approverComment) return alert("Approver Comment required");
      let payload = {};
      let CurrentSequence = 0;
      let NextSequence = 0;
      let CurrentUserAction = '';
      let NextuserAction = '';

      if (!itemId) return;
      payload = {
        ApproverComment: approverComment,
        CurrentStatus: 'Approved',
        Actiondate1: new Date().toLocaleDateString('en-GB'),
        AssignedTo: 'Approved',
        AssignedToEmailId: null,

      };
      CurrentSequence = 1;
      CurrentUserAction = 'Approved';
      if (payload != '') {
        const updatedData = await service.updateItem(itemId, payload);
        await handleSaveApproveHistory(itemId, CurrentUserAction, CurrentSequence, approverComment);
        alert("Request Approved Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);

      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleSaveApproveHistory = async (id: number, CurrentUserAction: string, CurrentSequence: number, comment: string) => {

    if (CurrentUserAction != '') {
      const payload = {
        UserAction: CurrentUserAction,
        ActionDate: new Date().toISOString(),
        UserComment: comment
      };
      await service.UpdateHistoryItem(id, payload, 'VMR', CurrentSequence);
    }

  };


  const handleReject = async () => {
    try {
      setLoading(true);
      if (!approverComment) return alert("Approver Comment required");
      if (!itemId) return;
      let payload = {};
      let CurrentSequence = 0;
      let NextSequence = 0;
      let CurrentUserAction = '';
      let NextuserAction = '';
      if (!itemId) return;
      payload = {
        ApproverComment: approverComment,
        CurrentStatus: 'Rejected',
        Actiondate1: new Date().toLocaleDateString('en-GB'),
        AssignedTo: 'Rejected',
        AssignedToEmailId: null
      };
      CurrentUserAction = 'Rejected';
      CurrentSequence = 1;

      if (payload != '') {
        const updatedData = await service.updateItem(itemId, payload);
        await handleSaveApproveHistory(itemId, CurrentUserAction, CurrentSequence, approverComment);
        alert("Request Rejected Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
       
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };

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
          <h4>Vendor Mapping Approval Form</h4>
        </div>

        <div className={styles.row}>
          <div className={styles['col-md-9']}>
            <div className={styles.leftPanel}>
              <div className={styles.leftPanelHeader}>
                <label style={{ fontWeight: "bold" }}>Vendor Mapping- {form.RequestNo}</label>
              </div>

              <div className={styles.formGroup}>
                <label>Project Code</label>
                <input name="projectCode" value={form.projectCode} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
              <div className={styles.formGroup}>
                <label>Project Title</label>
                <input name="projectTitle" value={form.projectTitle} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
              <div className={styles.formGroup}>
                <label>Project Description</label>
                <input name="projectDescription" value={form.projectDescription} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
              <div className={styles.formGroup}>
                <label>Select Vendor <span className={styles.required}>*</span></label>
                <input name="vendorName" value={form.vendorName} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
              <div className={styles.formGroup}>
                <label>Additional Information & Remarks</label>
                <input name="vendorDescription" value={form.vendorDescription} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>

              <p>If you want to verfiy the document.
                <a
                  href={`${props.context.pageContext.web.absoluteUrl}/SitePages/VendorRegistrationDetails.aspx?RequestId=${vendorId}&PageName=VendorMappingApprovalForm_${new URLSearchParams(window.location.search).get('RequestId')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Click Here
                </a>
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <label>
                  Attachments <span className={styles.required}>*</span>
                </label>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", }}>
                  {attachments.map((file: any, index: number) => (
                    <a
                      key={index}
                      href={file.LinkageUrl} target="_blank" rel="noopener noreferrer">
                      {file.FileName}
                    </a>
                  ))}
                </div>
              </div>

              <label>Approver Comments <span className={styles.required}>*</span></label>
              <textarea value={approverComment} onChange={(e) => setApproverComment(e.target.value)} style={{ marginBottom: "15px" }} />

              {/* Buttons */}
              <div>
                <div className={styles.buttonGroup} >
                  <button className={styles.ApproveBtn} onClick={handleApprove} disabled={isDisabled}>Approve</button>
                  <button className={styles.RejectBtn} onClick={handleReject} disabled={isDisabled} >Reject</button>
                  <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
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
                {history.map((item, index) => {
                  const isApproved = item.UserAction === "Approved";
                  const isRejected = item.UserAction === "Rejected";
                  const isInitiated = item.UserAction === "Request Initiator";
                  const isUpcoming = item.UserAction === "Upcoming";
                  const isPending = item.UserAction === "Pending";
                  return (
                    <li
                      key={index}
                      className={
                        isApproved
                          ? styles.tickIcon
                          : isRejected
                            ? styles.crossIcon
                            : isInitiated ? styles.tickIcon : isUpcoming ? styles.upcomingIcon : isPending ? styles.pendingIcon : ""
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
                                  : isUpcoming ? styles.upcomingstatus : isPending ? styles.pendingstatus : ""
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
export default VendorMappingForm;