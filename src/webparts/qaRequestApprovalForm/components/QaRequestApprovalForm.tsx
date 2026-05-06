import * as React from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IQaRequestApprovalFormProps } from './IQaRequestApprovalFormProps';
import styles from './QaRequestApprovalForm.module.scss';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';

const QaRequestApprovalForm: React.FC<IQaRequestApprovalFormProps> = (props) => {
    const [form, setForm] = React.useState({
      ProjectTitle: '',
      ProjectReffNo: '',
      ProjectDescription: '',
      TotalProjectAmount: 0,
      ApplicableTaxes: 0,
      Vendor1: '',
      Vendor2: '',
      Vendor3: '',
      Quote1: '',
      Quote2: '',
      Quote3: '',
      Selectedvendor: '',
      SelectedQuote: '',
      Department: '',
      Advancepayment: 0,
      ApprovalPath: '',
      files: null,
      attachments: [],
      ApprovalComment: '',
      CurrentStatus: '',
      approver1: '',
      approver2: '',
      approver3: '',
      approver4: '',
      approver5: '',
      ActionDate1: '',
      ActionDate2: '',
      ActionDate3: '',
      Approval2: '',

      Approval3: '',
      DepartmentHead: '',
      RequestNo: '',
      Approver2EmailId: 0,
      Approver3EmailId: 0,
      ApproverTwoId: 0,
      AssignedTo: '',
      AssignedTo2: ''

    });
    const [poItems, setPoItems] = React.useState<any[]>([]);
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
    const [isDisabled, setIsDisabled] = React.useState(false);
    const [History, setHistory] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [actionType, setActionType] = React.useState<'approve' | 'reject' | ''>('');

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
    const loadPOData = async (id: number) => {
      try {
        const response = await service.getPurchaseOrderDetails(id);

        console.log("PO Data:", response); // 👈 debug

        setPoItems(response || []); // 👈 yaha data set hoga
      } catch (error) {
        console.error("Error fetching PO data:", error);
      }
    };
    React.useEffect(() => {
      if (itemId) {
        loadAttachments(itemId);
        getApprover();// 👈 dynamic ID use karo
        loadPOData(itemId);
      }
    }, [itemId]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
    };

    const handleFetchById = async (id: number) => {
      try {
        setLoading(true);
        console.log("Calling API with ID:", id);
        const currentuser = await service.getUser();
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
        const User = await service.getUserById(result.Approval2Id);
        const historydata = await service.GetHistoryItem(id, "QA");
        setHistory(historydata);
        console.log("Result:", result);

        if (result.AssignedTo === currentuser.Title || result.AssignedTo2 === currentuser.Title) {
          if (result.CurrentStatus === 'Pending' || result.CurrentStatus === 'Approved') {
            setItemId(result.Id);

            setForm(prev => ({
              ...prev,
              ProjectTitle: result.ProjectTitle || '',
              ProjectReffNo: result.ProjectReffNo || '',
              ProjectDescription: result.ProjectDescription || '',
              TotalProjectAmount: result.TotalProjectAmount || 0,
              ApplicableTaxes: result.ApplicableTaxes || 0,
              Vendor1: result.Vendor1 || '',
              Vendor2: result.Vendor2 || '',
              Vendor3: result.Vendor3 || '',
              Quote1: result.Quote1 || '',
              Quote2: result.Quote2 || '',
              Quote3: result.Quote3 || '',
              Selectedvendor: result.Selectedvendor || '',
              SelectedQuote: result.SelectedQuote || '',
              Department: result.Department || '',
              Advancepayment: result.Advancepayment || 0,
              ApprovalPath: result.ApprovalPath || '',
              RequestNo: result.RequestNo || '',
              ActionDate1: result.ActionDate1 || '',
              ActionDate2: result.ActionDate2 || '',
              ActionDate3: result.ActionDate3 || '',
              Approver2EmailId: result.Approval2Id,
              Approver3EmailId: result.Approval3Id,
              ApproverTwoId: result.Approval2Id,
              AssignedTo: result.AssignedTo,
              AssignedTo2: result.AssignedTo2,

              files: null
            }));



            if (!result.ActionDate1 || !result.ActionDate2 || !result.ActionDate3) {
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
    // ================= COMMON =================
    const handleApprove = async () => {
      try {
        setLoading(true);

        if (!form.ApprovalComment) return alert("Enter Approver Comment");
        let payload = {};
        let CurrentSequence = 0;
        let NextSequence = 0;
        let CurrentUserAction = '';
        let NextuserAction = '';
        if (!itemId) return;
        const currentuserApprove = await service.getUser();
        // 🔥 CASE 1: Only 1 approver
        if (Number(form.TotalProjectAmount) <= 200000) {
          if (form.ActionDate1 == '') {
            payload = {
              ApproverComment1: form.ApprovalComment,
              CurrentStatus: 'Approved',
              ActionDate1: new Date().toLocaleDateString('en-GB'),
              AssignedTo: 'Approved',
              AssignedToEmailId: 0
            };
            CurrentSequence = 1;
            CurrentUserAction = 'Approved';
            NextSequence = 0;
            NextuserAction = '';
          }
        }
        else if (Number(form.TotalProjectAmount) > 200000 && form.Department === "Branding") {
          if (form.ActionDate1 == '') {
            const UserApproval2 = await service.getUserById(form.Approver2EmailId);
            payload = {
              ApproverComment1: form.ApprovalComment,
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

          // 🔥 CASE 3: Second Approver
          else if (form.ActionDate2 == '') {
            payload = {
              ApproverComment2: form.ApprovalComment,
              CurrentStatus: 'Approved',
              ActionDate2: new Date().toLocaleDateString('en-GB'),
              AssignedTo: 'Approved',
              AssignedToEmailId: 0
            };
            CurrentSequence = 2;
            CurrentUserAction = 'Approved';
            NextSequence = 0;
            NextuserAction = '';
          }
        }
        else if (form.ActionDate1 == '') {
          const UserApproval2 = await service.getUserById(form.Approver2EmailId);
          const UserApproval3 = await service.getUserById(form.Approver3EmailId);
          payload = {
            ApproverComment1: form.ApprovalComment,
            CurrentStatus: 'Pending',
            ActionDate1: new Date().toLocaleDateString('en-GB'),
            AssignedTo: (UserApproval2?.Title),
            AssignedToEmailId: Number(UserApproval2?.Id),
            AssignedTo2: (UserApproval3?.Title),
            AssignedToEmail2Id: Number(UserApproval3?.Id),
          };
          CurrentSequence = 1;
          CurrentUserAction = 'Approved';
          NextSequence = 2;
          NextuserAction = 'Pending';
          await handleSaveApproveHistory(itemId, CurrentUserAction, NextuserAction, CurrentSequence, 3, form.ApprovalComment);
        }
        else if (form.ActionDate2 == '' && currentuserApprove.Title === form.AssignedTo) {
          payload = {
            ApproverComment2: form.ApprovalComment,
            CurrentStatus: (form.ActionDate3 != '' && form.AssignedTo2 == 'Approved') ? 'Approved' : (form.ActionDate3 != '' && form.AssignedTo2 == 'Rejected') ? 'Rejected' : 'Pending',
            ActionDate2: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Approved',
            AssignedToEmailId: 0,
          };
          CurrentSequence = 2;
          CurrentUserAction = 'Approved';
          NextSequence = 3;
          NextuserAction = 'Pending';
        }
        else if (form.ActionDate3 == '' && currentuserApprove.Title === form.AssignedTo2) {
          payload = {
            ApproverComment3: form.ApprovalComment,
            CurrentStatus: (form.ActionDate2 != '' && form.AssignedTo == 'Approved') ? 'Approved' : (form.ActionDate2 != '' && form.AssignedTo == 'Rejected') ? 'Rejected' : 'Pending',
            ActionDate3: new Date().toLocaleDateString('en-GB'),
            AssignedTo2: 'Approved',
            AssignedToEmail2Id: 0
          };
          CurrentSequence = 3;
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
          //return;
        }

      } catch (error) {
        console.error(error);
      }
      finally {
        setLoading(false);
      }
    }
    const handleSaveApproveHistory = async (id: number, CurrentUserAction: string, NextUserAction: string, CurrentSequence: number, NextSequence: number, comment: string) => {

      if (CurrentUserAction != '') {
        const payload = {
          UserAction: CurrentUserAction,
          ActionDate: new Date().toISOString(),
          UserComment: comment
        };
        await service.UpdateHistoryItem(id, payload, 'QA', CurrentSequence);
      }
      if (NextUserAction != '') {
        const payload = {
          UserAction: NextUserAction,
        };
        await service.UpdateHistoryItem(id, payload, 'QA', NextSequence);
      }
    };

    const handleReject = async () => {
      try {
        //setActionType('approve');
        setLoading(true);
        if (!form.ApprovalComment) return alert("Enter Approver Comment");
        let payload = {};
        let CurrentSequence = 0;
        let NextSequence = 0;
        let CurrentUserAction = '';
        let NextuserAction = '';
        if (!itemId) return;
        const currentuserReject = await service.getUser();
        // 🔥 CASE 1: Only 1 approver
        if (Number(form.TotalProjectAmount) <= 200000) {
          if (form.ActionDate1 == '') {
            payload = {
              ApproverComment1: form.ApprovalComment,
              CurrentStatus: 'Rejected',
              ActionDate1: new Date().toLocaleDateString('en-GB'),
              AssignedTo: 'Rejected',
              AssignedToEmailId: 0
            };
            CurrentSequence = 1;
            CurrentUserAction = 'Rejected';
          }
        }
        else if (Number(form.TotalProjectAmount) > 200000 && form.Department === "Branding") {
          if (form.ActionDate1 == '') {
            const UserApproval2 = await service.getUserById(form.Approver2EmailId);
            payload = {
              ApproverComment1: form.ApprovalComment,
              CurrentStatus: 'Rejected',
              ActionDate1: new Date().toLocaleDateString('en-GB'),
              AssignedTo: UserApproval2?.Title,
              AssignedToEmailId: Number(UserApproval2?.Id)
            };
            CurrentSequence = 1;
            CurrentUserAction = 'Rejected';
          }

          // 🔥 CASE 3: Second Approver
          else if (form.ActionDate2 == '') {
            payload = {
              ApproverComment2: form.ApprovalComment,
              CurrentStatus: 'Rejected',
              ActionDate2: new Date().toLocaleDateString('en-GB'),
              AssignedTo: 'Rejected',
              AssignedToEmailId: 0
            };
            CurrentSequence = 2;
            CurrentUserAction = 'Rejected';
          }
        } else
          if (form.ActionDate1 == '') {
            const UserApproval2 = await service.getUserById(form.Approver2EmailId);
            payload = {
              ApproverComment1: form.ApprovalComment,
              CurrentStatus: 'Rejected',
              ActionDate1: new Date().toLocaleDateString('en-GB'),
              AssignedTo: 'Rejected',
              AssignedToEmailId: 0
            };
            CurrentSequence = 1;
            CurrentUserAction = 'Rejected';
          }
          else if (form.ActionDate2 == '' && currentuserReject.Title === form.AssignedTo) {
            payload = {
              ApproverComment2: form.ApprovalComment,
              CurrentStatus: (form.ActionDate3 != '' && form.AssignedTo2 == 'Approved') ? 'Rejected' : (form.ActionDate3 != '' && form.AssignedTo2 == 'Rejected') ? 'Rejected' : 'Pending',
              ActionDate2: new Date().toLocaleDateString('en-GB'),
              AssignedTo: 'Rejected',
              AssignedToEmailId: 0
            };
            CurrentSequence = 2;
            CurrentUserAction = 'Rejected';
          }
          else if (form.ActionDate3 == '' && currentuserReject.Title === form.AssignedTo2) {
            payload = {
              ApproverComment3: form.ApprovalComment,
              CurrentStatus: (form.ActionDate2 != '' && form.AssignedTo == 'Approved') ? 'Rejected' : (form.ActionDate2 != '' && form.AssignedTo == 'Rejected') ? 'Rejected' : 'Pending',
              ActionDate3: new Date().toLocaleDateString('en-GB'),
              AssignedTo2: 'Rejected',
              AssignedToEmail2Id: 0
            };
            CurrentSequence = 3;
            CurrentUserAction = 'Rejected';
          }
        if (payload != '') {
          const updatedData = await service.updateItem(itemId, payload);
          await handleSaveApproveHistory(itemId, CurrentUserAction, NextuserAction, CurrentSequence, NextSequence, form.ApprovalComment);
          alert("Request Rejected Successfully.");
          const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
          window.location.assign(url);
          //return;
        }


      } catch (error) {
        console.error(error);
      }
      finally {
        setLoading(false);
      }
    }
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
            <h4>Quotation Request Approval Form</h4>
          </div>
          <div className={styles.row}>
            {/* LEFT FORM */}
            <div className={styles['col-md-9']}>
              <div className={styles.leftPanel}>
                <div className={styles.leftPanelHeader}>
                  <label style={{ fontWeight: "bold" }}>Quotation Approval -{form.RequestNo} </label>
                </div>

                <label>Project Title</label>
                <input name="ProjectTitle" value={form.ProjectTitle} readOnly style={{ backgroundColor: "lightgray" }} />

                <label>Project Reference No</label>
                <input name="ProjectReffNo" value={form.ProjectReffNo} readOnly style={{ backgroundColor: "lightgray" }} >
                </input>

                <label>Project Description & Advance Payment Details</label>
                <input name="projectDescription" value={form.ProjectDescription} readOnly style={{ backgroundColor: "lightgray" }} >
                </input>

                <label>Total Project Amount</label>
                <input name="TotalProjectAmount" value={form.TotalProjectAmount} readOnly style={{ backgroundColor: "lightgray" }} />

                <label>Applicable Taxes</label>
                <input name="ApplicableTaxes" value={form.ApplicableTaxes} readOnly style={{ backgroundColor: "lightgray" }}  >
                </input>


                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldBlock}>
                    <label>Vendor 1 <span className={styles.required}>*</span></label>
                    <input name="Vendor1" value={form.Vendor1} readOnly style={{ backgroundColor: "lightgray" }} />
                  </div>
                  <div className={styles.fieldBlock}>
                    <label>Quote 1 <span className={styles.required}>*</span></label>
                    <input name="Quote1" value={form.Quote1} readOnly style={{ backgroundColor: "lightgray" }} />
                  </div>
                </div>

                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldBlock}>
                    <label>Vendor 2</label>
                    <input name="Vendor2" value={form.Vendor2} readOnly style={{ backgroundColor: "lightgray" }} />

                  </div>
                  <div className={styles.fieldBlock}>
                    <label>Quote 2</label>
                    <input name="Quote2" value={form.Quote2} readOnly style={{ backgroundColor: "lightgray" }} />
                  </div>
                </div>

                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldBlock}>
                    <label>Vendor 3</label>
                    <input name="Quote2" value={form.Quote3} readOnly style={{ backgroundColor: "lightgray" }} />
                  </div>

                  <div className={styles.fieldBlock}>
                    <label>Quote 3</label>
                    <input name="Quote3" value={form.Quote3} readOnly style={{ backgroundColor: "lightgray" }} />

                  </div>
                </div>

                <label>Select Vendor</label>
                <input name="Selectedvendor" value={form.Selectedvendor} readOnly style={{ backgroundColor: "lightgray" }} />
                <label>Select Quote</label>
                <input name="SelectedQuote" value={form.SelectedQuote} readOnly style={{ backgroundColor: "lightgray" }} >
                </input>
                <label>Department</label>
                <input name="Department" value={form.Department} readOnly style={{ backgroundColor: "lightgray" }} >
                </input>
                <label>Advance Amount</label>
                <input name="AdvancePayment" value={form.Advancepayment} readOnly style={{ backgroundColor: "lightgray" }}>
                </input>
                <label>Approval Path</label>
                <input name="ApprovalPath" value={form.ApprovalPath} readOnly style={{ backgroundColor: "lightgray" }}>
                </input>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                  <label>
                    Attachments <span className={styles.required}>*</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", }}>
                    {attachments.map((file: any, index: number) => (
                      <a
                        key={index}
                        href={file.LinkingUrl} target="_blank" rel="noopener noreferrer">
                        {file.FileName}
                      </a>
                    ))}
                  </div>
                </div>
                <div className={styles.poSection}>
                  <h5>Purchase Order Details</h5>
                  <div className={styles.poTable}>
                    <div className={styles.poRowHeader}>
                      <div>Description</div>
                      <div>Qty</div>
                      <div>Rate</div>
                      <div>Amount</div>
                    </div>
                    {poItems.length > 0 ? (
                      poItems.map((item, index) => (
                        <div key={`${item.Description || 'po'}-${index}`} className={styles.poRow}>
                          <input value={item.Description || ''} disabled />
                          <input value={item.Quantity || ''} disabled />
                          <input value={item.Rate || ''} disabled />
                          <input value={item.Amount || ''} disabled />
                        </div>
                      ))
                    ) : (
                      <div>No purchase order details found.</div>
                    )}
                  </div>
                </div>
                <label></label>
                <label></label>
                <div style={{ paddingBottom: "2%" }}>
                  <label>Comments <span className={styles.required}>*</span></label>
                  <input type='text' className="form-control" name="ApprovalComment" value={form.ApprovalComment} onChange={handleChange} />
                </div>
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
export default QaRequestApprovalForm;
