import * as React from 'react';
import styles from './BillProcessingApproval.module.scss';
import { IBillProcessingApprovalProps } from './IBillProcessingApprovalProps';
import { SPHttpClient } from '@microsoft/sp-http';
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
import { PageContext } from '@microsoft/sp-page-context';
import { Spinner, SpinnerSize } from '@fluentui/react';
const BillProcessingApproval: React.FC<IBillProcessingApprovalProps> = (props) => {

  // State
  // State
  const [form, setForm] = React.useState({
    RequestNo: '',
    ProjectCode: '',
    PORequestNo: '',
    PORequestNoID: '',
    vendorcode: '',
    VendorName: '',
    projectTitle: '',
    Comments: '',
    BillNo: '',
    BillDate: new Date(),
    BillAmount: 0,
    CalculatedTaxes: 0,
    TotalAmount: 0,
    UploadDocument: '',
    files: [],
    CurrentStatus: '',
    DepartmentName: '',
    POAmount: 0,
    AttachedSignedPO: false,
    ActionDate1: '',
    ActionDate2: '',
    ActionDate3: '',
    ActionDate5: '',
    DepartmentHeadId: 0,
    Approver2Id: 0,
    Approver3Id: 0,
    Approver5Id: 0,
    ApprovalComment: '',
    ApprovalPath: '',
    OccupiedAmount: '',
    RemainingAmount: ''
  });
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [History, setHistory] = React.useState<any[]>([]);
  const [AssignedID, setAssignedID] = React.useState<number | null>(null);
  const [AssignedToEmail, setAssignedToEmail] = React.useState<number | null>(null);
  const [showApproveButton, setShowApproveButton] = React.useState(false);
  const [showPaidButton, setShowPaidButton] = React.useState(false);
  const [showResumeButton, setShowResumeButton] = React.useState(false);
  const [showHoldButton, setShowHoldButton] = React.useState(false);
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
      loadAttachments(id);
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  //FETCH DATA-----
  const handleFetchById = async (id: number) => {
    try {
      setLoading(true);
      console.log("Calling API with ID:", id);
      const result = await service.getItemByRequestNo(id);
      console.log("Result:", result);
      const currentuser = await service.getUser();
      const User = await service.getUserById(currentuser.Id);
      if (result.AssignedTo === currentuser.Title) {
        if (result.CurrentStatus === 'Pending' || result.CurrentStatus === 'Approved') {
          setItemId(result.Id);
          setForm(prev => ({
            ...prev,
            VendorName: result.VendorName || '',
            projectTitle: result.ProjectTitle || '',
            DepartmentName: result.Department || '',
            ProjectCode: result.ProjectCode || '',
            vendorName: result.VendorName || '',
            TotalAmount: result.TotalAmount || '',
            Comments: result.ProjectDescription || '',
            vendorcode: result.Vendorcode || '',
            BillNo: result.BillNo || '',
            BillDate: result.BillDate,
            BillAmount: result.BillAmount || 0,
            CalculatedTaxes: result.CalculatedTaxes || 0,
            PORequestNo: result.PORequestNo || '',
            PORequestNoID: result.PORequestNo || '',
            AttachedSignedPO: result.AttachedSignedPO == "True" ? true : false,
            RequestNo: result.RequestNo,
            CurrentStatus: result.CurrentStatus,
            ActionDate1: result.ActionDate1 || '',
            ActionDate2: result.ActionDate2 || '',
            ActionDate3: result.ActionDate3 || '',
            ActionDate5: result.ActionDate5 || '',
            DepartmentHeadId: result.DepartmentHeadId || 0,
            Approver2Id: result.Approver2Id || 0,
            Approver3Id: result.Approver3Id || 0,
            Approver5Id: result.Approver5Id || 0,
            ApprovalPath: result.ApprovalPath,
            OccupiedAmount: result.OccupiedAmount,
            RemainingAmount: result.RemainingAmount
          }));
          if (User?.Id) {
            setAssignedID(User.Title);
            setAssignedToEmail(User.Id);
          }
          if (result.ActionDate1 != '' && result.ActionDate2 != '' && result.ActionDate3 != '' && result.ActionDate5 == '' && result.CurrentStatus == 'Approved') {
            setShowApproveButton(false);
            setShowResumeButton(true);
            setShowPaidButton(true);
            setShowHoldButton(true);
          }
          else {
            if (result.CurrentStatus == 'Hold') {
              setShowResumeButton(true);
              setShowApproveButton(false);
              setShowPaidButton(false);
              setShowResumeButton(false);
            }
            else if (result.CurrentStatus == 'Resume') {
              setShowResumeButton(false);
              setShowHoldButton(true);
              setShowApproveButton(false);
              setShowPaidButton(true);
            }
            else {
              setShowResumeButton(false);
              setShowHoldButton(false);
              setShowApproveButton(true);
              setShowPaidButton(false);
            }
          }
          const historydata = await service.GetHistoryItem(Number(id), "FBP");
          setHistory(historydata);
        }
        else {
          setForm({
            RequestNo: '',
            ProjectCode: '',
            PORequestNo: '',
            PORequestNoID: '',
            vendorcode: '',
            VendorName: '',
            projectTitle: '',
            Comments: '',
            BillNo: '',
            BillDate: new Date(),
            BillAmount: 0,
            CalculatedTaxes: 0,
            TotalAmount: 0,
            UploadDocument: '',
            files: [],
            CurrentStatus: '',
            DepartmentName: '',
            POAmount: 0,
            AttachedSignedPO: false,
            ActionDate1: '',
            ActionDate2: '',
            ActionDate3: '',
            ActionDate5: '',
            DepartmentHeadId: 0,
            Approver2Id: 0,
            Approver3Id: 0,
            Approver5Id: 0,
            ApprovalComment: '',
            ApprovalPath: '',
            OccupiedAmount: '',
            RemainingAmount: ''
          });
          alert("Request Record is already Rejected.");
          return;
        }
      }
      else {
        alert("Please Wait for you queue.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
      }
    } catch (error) {
      console.error("Error Occurred: ", error);
    }
    finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
    window.location.assign(url);
  };
  const handleApprove = async () => {
    try {
      setLoading(true);
      if (!form.ApprovalComment) return alert("Comment is required.");
      let payload = {};
      let CurrentSequence = 0;
      let NextSequence = 0;
      let CurrentUserAction = '';
      let NextuserAction = '';
      if (!itemId) return;
      if (form.ActionDate1 == '') {
        const UserApproval2 = await service.getUserById(form.Approver2Id);
        payload = {
          ApproverComment1: form.Comments,
          CurrentStatus: 'Pending',
          ActionDate1: new Date().toLocaleDateString('en-GB'),
          AssignedTo: UserApproval2?.Title,
          AssignedToEmailId: Number(UserApproval2?.Id)
        };
        CurrentSequence = 1;
        CurrentUserAction = 'Approved';
        NextSequence = 2;
        NextuserAction = 'Pending';
      }
      else if (form.ActionDate2 == '') {
        const UserApproval3 = await service.getUserById(form.Approver3Id);
        payload = {
          ApproverComment2: form.Comments,
          CurrentStatus: 'Pending',
          ActionDate2: new Date().toLocaleDateString('en-GB'),
          AssignedTo: UserApproval3?.Title,
          AssignedToEmailId: Number(UserApproval3?.Id)
        };
        CurrentSequence = 2;
        CurrentUserAction = 'Approved';
        NextSequence = 3;
        NextuserAction = 'Pending';
      }
      else if (form.ActionDate3 == '') {
        const UserApproval5 = await service.getUserById(form.Approver5Id);
        payload = {
          ApproverComment3: form.Comments,
          CurrentStatus: 'Pending',
          ActionDate3: new Date().toLocaleDateString('en-GB'),
          AssignedTo: UserApproval5?.Title,
          AssignedToEmailId: Number(UserApproval5?.Id)
        };
        CurrentSequence = 3;
        CurrentUserAction = 'Approved';
        NextSequence = 4;
        NextuserAction = 'Pending';
      }
      else if (form.ActionDate5 == '') {
        payload = {
          ApproverComment5: form.Comments,
          CurrentStatus: 'Approved',
          ActionDate5: new Date().toLocaleDateString('en-GB'),
          AssignedTo: 'Approved',
          AssignedToEmailId: 0
        };
        CurrentSequence = 4;
        CurrentUserAction = 'Approved';
        NextSequence = 0;
        NextuserAction = '';
      }
      if (payload != '') {
        const updatedData = await service.updateItem(itemId, payload);
        await handleSaveApproveHistory(itemId, CurrentUserAction, NextuserAction, CurrentSequence, NextSequence, form.ApprovalComment);
        alert("Request Approved Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
        return;
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };
  const handleSaveApproveHistory = async (id: number, CurrentUserAction: string, NextUserAction: string, CurrentSequence: number, NextSequence: number, comment: string) => {

    if (CurrentUserAction != '') {
      const payload = {
        UserAction: CurrentUserAction,
        ActionDate: new Date().toISOString(),
        UserComment: comment
      };
      await service.UpdateHistoryItem(id, payload, 'FBP', CurrentSequence);
    }
    if (NextUserAction != '') {
      const payload = {
        UserAction: NextUserAction,
        ActionDate: new Date().toISOString(),
        UserComment: comment
      };
      await service.UpdateHistoryItem(id, payload, 'FBP', NextSequence);
    }

  };
  const handleReject = async () => {
    try {
      setLoading(true);
      if (!form.ApprovalComment) return alert("Comment is required.");
      let payload = {};
      let CurrentSequence = 0;
      let NextSequence = 0;
      let CurrentUserAction = '';
      let NextuserAction = '';
      if (!itemId) return;
      if (form.ActionDate1 == '') {
        const UserApproval2 = await service.getUserById(form.Approver2Id);
        payload = {
          ApproverComment1: form.Comments,
          CurrentStatus: 'Rejected',
          ActionDate1: new Date().toLocaleDateString('en-GB'),
          AssignedTo: 'Rejected',
          AssignedToEmailId: 0
        };
        CurrentSequence = 1;
        NextSequence=2;
        CurrentUserAction='Rejected';
        NextuserAction='Rejected';
      }
      else if (form.ActionDate2 == '') {
        const UserApproval3 = await service.getUserById(form.Approver3Id);
        payload = {
          ApproverComment2: form.Comments,
          CurrentStatus: 'Rejected',
          ActionDate2: new Date().toLocaleDateString('en-GB'),
          AssignedTo: 'Rejected',
          AssignedToEmailId: 0
        };
        CurrentSequence = 2;
        NextSequence=3;
        CurrentUserAction='Rejected';
        NextuserAction='Rejected';
      }
      else if (form.ActionDate3 == '') {
        const UserApproval5 = await service.getUserById(form.Approver5Id);
        payload = {
          ApproverComment3: form.Comments,
          CurrentStatus: 'Rejected',
          ActionDate3: new Date().toLocaleDateString('en-GB'),
          AssignedTo: 'Rejected',
          AssignedToEmailId: 0
        };
        CurrentSequence = 3;
        NextSequence=4;
        CurrentUserAction='Rejected';
        NextuserAction='Rejected';
      }
      else if (form.ActionDate5 == '') {
        payload = {
          ApproverComment5: form.Comments,
          CurrentStatus: 'Rejected',
          ActionDate5: new Date().toLocaleDateString('en-GB'),
          AssignedTo: 'Rejected',
          AssignedToEmailId: 0
        };
        CurrentSequence = 4;
        NextSequence=0;
        CurrentUserAction='Rejected';
        NextuserAction='';
      }
      if (payload != '') {
        const updatedData = await service.updateItem(itemId, payload);
        await handleSaveApproveHistory(itemId, CurrentUserAction, NextuserAction, CurrentSequence, NextSequence, form.ApprovalComment);
        alert("Request Rejected Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
        return;
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };
  const handleHold = async () => {
    try {
      setLoading(true);
      if (!form.ApprovalComment) return alert("Comment is required.");
      let payload = {};
      let CurrentSequence = 4;
      let CurrentUserAction='Hold';
      let NextuserAction='';
      let NextSequence=0;
      if (!itemId) return;
      payload = {
        ApproverComment5: form.Comments,
        CurrentStatus: 'Hold',
        ActionDate5: new Date().toLocaleDateString('en-GB'),
        AssignedTo: 'Hold',
        AssignedToEmailId: 0
      };
      if (payload != '') {
        const updatedData = await service.updateItem(itemId, payload);
        await handleSaveApproveHistory(itemId, CurrentUserAction, NextuserAction, CurrentSequence, NextSequence, form.ApprovalComment);
        alert("Request Approved Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
        return;
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };
  const handleResume = async () => {
    try {
      setLoading(true);
      if (!form.ApprovalComment) return alert("Comment is required.");
      let payload = {};
      let CurrentSequence = 4;
      let CurrentUserAction='Resume';
      let NextuserAction='';
      let NextSequence=0;
      if (!itemId) return;
      payload = {
        ApproverComment5: form.Comments,
        CurrentStatus: 'Resume',
        ActionDate5: new Date().toLocaleDateString('en-GB'),
        AssignedTo: 'Resume',
        AssignedToEmailId: 0
      };
      if (payload != '') {
        const updatedData = await service.updateItem(itemId, payload);
        await handleSaveApproveHistory(itemId, CurrentUserAction, NextuserAction, CurrentSequence, NextSequence, form.ApprovalComment);
        alert("Request Approved Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
        return;
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };
  const handlePaid = async () => {
    try {
      setLoading(true);
      if (!form.ApprovalComment) return alert("Comment is required.");
      let payload = {};
      let CurrentSequence = 4;
      let CurrentUserAction='Approved';
      let NextuserAction='';
      let NextSequence=0;
      if (!itemId) return;
      if (form.ActionDate5 == '') {
        payload = {
          ApproverComment5: form.Comments,
          CurrentStatus: 'Approved',
          ActionDate5: new Date().toLocaleDateString('en-GB'),
          AssignedTo: 'Approved',
          AssignedToEmailId: 0
        };
      }
      if (payload != '') {
        const updatedData = await service.updateItem(itemId, payload);
        await handleSaveApproveHistory(itemId, CurrentUserAction, NextuserAction, CurrentSequence, NextSequence, form.ApprovalComment);
        alert("Request Approved Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
        return;

      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };
  // 🔹 UI
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
          <h4>Bill Processing Approval</h4>
        </div>
        <div className={styles.row}>
          <div className={styles['col-md-9']}>
            <div className={styles.leftPanel}>
              <div className={styles.leftPanelHeader}>
                <h4>{form.RequestNo}</h4>
                <h4>Current Status:  <span className={
                  form.CurrentStatus === "Approved"
                    ? styles.Approved
                    : form.CurrentStatus === "Rejected"
                      ? styles.Rejected
                      : styles.Pending}>{form.CurrentStatus}</span></h4>
              </div>
              <div className={styles['col-md-12']}>
                <div className={styles["formGroup"]}>
                  <label style={{ display: "inline-flex" }}>Bill Signed</label>
                  <input style={{ width: "15%", backgroundColor: "lightgray" }} type="checkbox" name='POsigned' checked={form.AttachedSignedPO} readOnly />
                </div>
              </div>
              <label>Project Code</label>
              <input type='text' name="ProjectCode" value={form.ProjectCode} readOnly style={{ backgroundColor: "lightgray" }} />
              <label>PO Request No</label>
              <input name="PORequestNo" value={form.PORequestNo} readOnly style={{ backgroundColor: "lightgray" }} />
              <label>Vendor Name</label>
              <input name="VendorName" value={form.vendorcode + "-" + form.VendorName} type='text' readOnly style={{ backgroundColor: "lightgray" }}>
              </input>
              <label>Project Title</label>
              <input name="projectTitle" value={form.projectTitle} readOnly style={{ backgroundColor: "lightgray" }} />
              <label>Additional Information & Remarks</label>
              <input name="Comments" value={form.Comments} readOnly style={{ backgroundColor: "lightgray" }}>
              </input>
              <label>Bill No</label>
              <input name="BillNo" value={form.BillNo} readOnly style={{ backgroundColor: "lightgray" }}>
              </input>
              <label>Bill Date</label>
              <input name="BillDate" type="text" value={
                form.BillDate
                  ? new Date(form.BillDate).toISOString().split('T')[0]
                  : ''} readOnly style={{ backgroundColor: "lightgray" }}>
              </input>
              <label>Occupied Amount</label>
              <input name="OccupiedAmount" value={form.OccupiedAmount} type='text' readOnly style={{ backgroundColor: "lightgray" }} />
              <label>Remaining Amount</label>
              <input name="RemainingAmount" value={form.RemainingAmount} type='text' readOnly style={{ backgroundColor: "lightgray" }} />
              <label>Bill Amount</label>
              <input name="BillAmount" value={form.BillAmount} readOnly style={{ backgroundColor: "lightgray" }} />
              <label>Calculated Taxes</label>
              <input name="CalculatedTaxes" value={form.CalculatedTaxes} readOnly style={{ backgroundColor: "lightgray" }} />
              <label>Total Amount</label>
              <input name="TotalAmount" value={form.TotalAmount} readOnly style={{ backgroundColor: "lightgray" }} />
              <label>Approval Path</label>
              <input name="ApprovalPath" value={form.ApprovalPath} readOnly style={{ backgroundColor: "lightgray" }} />
              <label>Attachments</label>
              {attachments?.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {attachments.map((file, index) => (
                    <li
                      key={index}
                      style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <a
                        href={file.ServerRelativeUrl}
                        rel="noopener noreferrer">
                        {file.FileName}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <div style={{ paddingBottom: "2%" }}>
                <label>Comments<span className={styles.required}>*</span></label>
                <input type='text' className="form-control" name="ApprovalComment" value={form.ApprovalComment} onChange={handleChange} />
              </div>
              <div className={styles.buttonGroup}>
                <button name='btnapprove' style={{ display: showApproveButton ? 'block' : 'none' }} className={styles.submitBtn} onClick={handleApprove}>Approve</button>
                <button name='btnReject' className={styles.RejectBtn} onClick={handleReject}>Reject</button>
                <button name='btnResume' style={{ display: showResumeButton ? 'block' : 'none' }} className={styles.RejectBtn} onClick={handleResume}>Resume</button>
                <button name='btnPaid' style={{ display: showPaidButton ? 'block' : 'none' }} className={styles.submitBtn} onClick={handlePaid}>Paid</button>
                <button name='btnhold' style={{ display: showHoldButton ? 'block' : 'none' }} className={styles.submitBtn} onClick={handleHold}>Hold</button>
                <button name='btncancel' className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
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
export default BillProcessingApproval;