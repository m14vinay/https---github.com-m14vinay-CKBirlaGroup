import * as React from 'react';
import styles from './ReimbursementRequestApproval.module.scss';
import type { IReimbursementRequestApprovalProps } from './IReimbursementRequestApprovalProps';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner, SpinnerSize } from '@fluentui/react';
import SharePointService from '../service/Service';
const ReimbursementRequestApproval: React.FC<IReimbursementRequestApprovalProps> = (props) => {

  const [form, setForm] = React.useState({
    ID: 0,
    RequestNo: '',
    ProjectTitle: '',
    DepartmentName: '',
    Remarks: '',
    TotalAmount: 0,
    ExpenseType: '',
    SelectedDocument: '',
    BillNo: '',
    BillAmount: 0,
    BillDate: new Date(),
    ClaimAmount: 0,
    Description: '',
    DepartmentNameID: '',
    ExpenseName: '',
    ExpenseID: '',
    DocumentName: '',
    DocumentID: '',
    CurrentStatus: '',
    Comments: '',
    ActionDate1: '',
    ActionDate2: '',
    ActionDate3: '',
    ActionDate4: '',
    FIApproverEmailId: 0,
    ComplianceHeadEmailId: 0,
    CFOEmailId: 0,
    ApprovalPath: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [History, setHistory] = React.useState<any[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const [AssignedID, setAssignedID] = React.useState<number | null>(null);
  const [AssignedToEmail, setAssignedToEmail] = React.useState<number | null>(null);
  const [Expenseform, setExpenseForm] = React.useState<{
    expenses: { Id: Number, Description: string; BillAmount: number; BillDate: Date, BillNo: string, DocumentName: string, ClaimAmount: number, ExpanseType: string, files: { FileName: string; ServerRelativeUrl: string }[] }[];
  }>({
    expenses: []
  });
  const service = new SharePointService(props.context);
  const [isDisabled, setIsDisabled] = React.useState(false);
  const [Comment, setComment] = React.useState('');
  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
    window.location.assign(url);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  //Get ID from query string ---
  const getIdFromQueryString = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('RequestId');
    return id ? parseInt(id, 10) : null;
  };
  React.useEffect(() => {
    setLoading(true);
    const id = getIdFromQueryString();
    if (id != null) {
      getRequestDetails(id);
    }
    setLoading(false);
  }, []);

  const getRequestDetails = async (requestNo: number) => {
    const currentuser = await service.getUser();
    const User = await service.getUserById(currentuser.Id);
    const data = await service.getItemByRequestNo(requestNo);
    if (data.Id > 0) {
      setItemId(requestNo);
      if (data.AssignedTo === currentuser.Title) {
        if (data.CurrentStatus === 'Pending' || data.CurrentStatus === 'Approved') {
          setItemId(data.Id);
          setForm({
            ...form,
            RequestNo: data.RequestNo,
            DepartmentName: data.DepartmentName || '',
            Remarks: data.Remarks || '',
            TotalAmount: data.TotalClaimAmount || 0,
            CurrentStatus: data.CurrentStatus,
            ActionDate1: data.ActionDate1 || '',
            ActionDate2: data.ActionDate2 || '',
            ActionDate3: data.ActionDate3 || '',
            ActionDate4: data.ActionDate4 || '',
            FIApproverEmailId: data.FIApproverEmailId || 0,
            ComplianceHeadEmailId: data.ComplianceHeadEmailId || 0,
            CFOEmailId: data.CFOEmailId || 0,
            ApprovalPath: data.ApprovalPath
          });
          if (User?.Id) {
            setAssignedID(User.Title);
            setAssignedToEmail(User.Id);
          }
          const Expensedata = await service.getItemByExpenseData(requestNo);
          if (Expensedata.value.length > 0) {
            const formattedExpenses = Expensedata.value.map((item: any) => ({
              Id: item.Id,
              Description: item.Description || "",
              BillAmount: item.BillAmount || 0,
              BillDate: item.BillDate ? new Date(item.BillDate) : new Date(),
              BillNo: item.BillNo || "",
              DocumentName: item.DocumentName || "",
              ClaimAmount: item.ClaimAmount || 0,
              ExpanseType: item.ExpanseType || "",
              files: item.AttachmentFiles ? item.AttachmentFiles.map((file: any) => ({
                FileName: file.FileName,
                ServerRelativeUrl: file.ServerRelativeUrl
              }))
                : []
            }));
            setExpenseForm({
              expenses: formattedExpenses
            });
          }
          const historydata = await service.GetHistoryItem(requestNo, "REM");
          setHistory(historydata);
        } else {
          setForm({
            RequestNo: '',
            ProjectTitle: '',
            DepartmentName: '',
            Remarks: '',
            TotalAmount: 0,
            ExpenseType: '',
            SelectedDocument: '',
            BillNo: '',
            BillAmount: 0,
            BillDate: new Date(),
            ClaimAmount: 0,
            Description: '',
            DepartmentNameID: '',
            ExpenseID: '',
            ExpenseName: '',
            DocumentName: '',
            DocumentID: '',
            ID: 0,
            CurrentStatus: '',
            Comments: '',
            ActionDate1: '',
            ActionDate2: '',
            ActionDate3: '',
            ActionDate4: '',
            FIApproverEmailId: 0,
            ComplianceHeadEmailId: 0,
            CFOEmailId: 0,
            ApprovalPath: ''
          });
          alert("Record is already Rejected.");
          return;
        }
      }
      else {
        alert("Please Wait for you queue.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
      }
    };
  }
  const handleApprove = async () => {
    try {
      setLoading(true);
      if (!form.Comments) return alert("Comment is required.");
      let payload = {};
      let CurrentSequence = 0;
      let NextSequence = 0;
      let CurrentUserAction = '';
      let NextuserAction = '';
      if (!itemId) return;
      if (form.DepartmentName == 'DH Branding' || form.DepartmentName == 'DH OGS' || form.DepartmentName == 'DH HR') {
        if (form.ActionDate1 == '') {
          payload = {
            ApproverComment1: form.Comments,
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
      else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') && form.TotalAmount > 100000) {
        if (form.ActionDate1 == '') {
          const UserApproval2 = await service.getUserById(form.FIApproverEmailId);
          payload = {
            ApproverComment1: form.Comments,
            CurrentStatus: 'Pending',
            ActionDate1: new Date().toLocaleDateString('en-GB'),
            AssignedTo: (UserApproval2?.Title),
            AssignedToEmailId: Number(UserApproval2?.Id)
          };
          CurrentSequence = 1;
          CurrentUserAction = 'Approved';
          NextSequence = 2;
          NextuserAction = 'Pending';
        }
        else if (form.ActionDate2 == '') {
          const UserApproval3 = await service.getUserById(form.CFOEmailId);
          payload = {
            ApproverComment2: form.Comments,
            CurrentStatus: 'Pending',
            ActionDate2: new Date().toLocaleDateString('en-GB'),
            AssignedTo: (UserApproval3?.Title),
            AssignedToEmailId: Number(UserApproval3?.Id)
          };
          CurrentSequence = 2;
          CurrentUserAction = 'Approved';
          NextSequence = 3;
          NextuserAction = 'Pending';
        }
        else if (form.ActionDate3 == '') {
          const UserApproval4 = await service.getUserById(form.FIApproverEmailId);
          payload = {
            ApproverComment3: form.Comments,
            CurrentStatus: 'Pending',
            ActionDate3: new Date().toLocaleDateString('en-GB'),
            AssignedTo: (UserApproval4?.Title),
            AssignedToEmailId: Number(UserApproval4?.Id)
          };
          CurrentSequence = 3;
          CurrentUserAction = 'Approved';
          NextSequence = 4;
          NextuserAction = 'Pending';
        }
        else if (form.ActionDate4 == '') {
          payload = {
            ApproverComment4: form.Comments,
            CurrentStatus: 'Approved',
            ActionDate4: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Approved',
            AssignedToEmailId: 0
          };
        }
        CurrentSequence = 4;
        CurrentUserAction = 'Approved';
        NextSequence = 0;
        NextuserAction = '';
      }
      else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') && form.TotalAmount < 100000) {
        if (form.ActionDate1 == '') {
          const UserApproval2 = await service.getUserById(form.FIApproverEmailId);
          payload = {
            ApproverComment1: form.Comments,
            CurrentStatus: 'Pending',
            ActionDate1: new Date().toLocaleDateString('en-GB'),
            AssignedTo: (UserApproval2?.Title),
            AssignedToEmailId: Number(UserApproval2?.Id)
          };
          CurrentSequence = 1;
          CurrentUserAction = 'Approved';
          NextSequence = 2;
          NextuserAction = 'Pending';
        }
        else if (form.ActionDate2 == '') {
          const UserApproval3 = await service.getUserById(form.ComplianceHeadEmailId);
          payload = {
            ApproverComment2: form.Comments,
            CurrentStatus: 'Pending',
            ActionDate2: new Date().toLocaleDateString('en-GB'),
            AssignedTo: (UserApproval3?.Title),
            AssignedToEmailId: Number(UserApproval3?.Id)
          };
          CurrentSequence = 2;
          CurrentUserAction = 'Approved';
          NextSequence = 3;
          NextuserAction = 'Pending';
        }
        else if (form.ActionDate3 == '') {
          const UserApproval4 = await service.getUserById(form.FIApproverEmailId);
          payload = {
            ApproverComment4: form.Comments,
            CurrentStatus: 'Pending',
            ActionDate3: new Date().toLocaleDateString('en-GB'),
            AssignedTo: (UserApproval4?.Title),
            AssignedToEmailId: Number(UserApproval4?.Id)
          };
          CurrentSequence = 3;
          CurrentUserAction = 'Approved';
          NextSequence = 4;
          NextuserAction = 'Pending';
        }
        else if (form.ActionDate4 == '') {
          payload = {
            ApproverComment4: form.Comments,
            CurrentStatus: 'Approved',
            ActionDate4: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Approved',
            AssignedToEmailId: 0
          };
          CurrentSequence = 4;
          CurrentUserAction = 'Approved';
          NextSequence = 0;
          NextuserAction = '';
        }
      }
      if (payload != '') {
        const updatedData = await service.updateItem(itemId, payload);
        await handleSaveApproveHistory(itemId, CurrentUserAction, NextuserAction, CurrentSequence, NextSequence, form.Comments);
        alert("Request Approved Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
        setComment('');
        return;
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };
  // Update History Item
  const handleSaveApproveHistory = async (id: number, CurrentUserAction: string, NextUserAction: string, CurrentSequence: number, NextSequence: number, comment: string) => {

    if (CurrentUserAction != '') {
      const payload = {
        UserAction: CurrentUserAction,
        ActionDate: new Date().toISOString(),
        UserComment: comment
      };
      await service.UpdateHistoryItem(id, payload, 'REM', CurrentSequence);
    }
    if (NextUserAction != '') {
      const payload = {
        UserAction: NextUserAction     
      };
      await service.UpdateHistoryItem(id, payload, 'REM', NextSequence);
    }

  };
  const handleReject = async () => {
    try {
      setLoading(true);
      if (!form.Comments) return alert("Comment is required.");
      let payload = {};
      let CurrentSequence = 0;
      let NextSequence = 0;
      let CurrentUserAction = '';
      let NextuserAction = '';
      if (!itemId) return;
      if (form.DepartmentName == 'DH Branding' || form.DepartmentName == 'DH OGS' || form.DepartmentName == 'DH HR') {
        if (form.ActionDate1 == '') {
          payload = {
            ApproverComment1: form.Comments,
            CurrentStatus: 'Rejected',
            ActionDate1: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };        
        }
        CurrentUserAction='Rejected';
        CurrentSequence=1;
      }
      else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') && form.TotalAmount > 100000) {
        if (form.ActionDate1 == '') {
          const UserApproval2 = await service.getUserById(form.FIApproverEmailId);
          payload = {
            ApproverComment1: form.Comments,
            CurrentStatus: 'Rejected',
            ActionDate1: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };        
          CurrentUserAction='Rejected';
        CurrentSequence=1;
        }
        else if (form.ActionDate2 == '') {
          const UserApproval3 = await service.getUserById(form.CFOEmailId);
          payload = {
            ApproverComment2: form.Comments,
            CurrentStatus: 'Rejected',
            ActionDate2: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };          
          CurrentUserAction='Rejected';
        CurrentSequence=2;
        }
        else if (form.ActionDate3 == '') {
          const UserApproval4 = await service.getUserById(form.FIApproverEmailId);
          payload = {
            ApproverComment3: form.Comments,
            CurrentStatus: 'Rejected',
            ActionDate3: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };       
          CurrentUserAction='Rejected';
        CurrentSequence=3;
        }
        else if (form.ActionDate4 == '') {
          payload = {
            ApproverComment4: form.Comments,
            CurrentStatus: 'Rejected',
            ActionDate4: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };        
          CurrentUserAction='Rejected';
        CurrentSequence=4;  
        }
      }
      else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') && form.TotalAmount < 100000) {
        if (form.ActionDate1 == '') {
          const UserApproval2 = await service.getUserById(form.FIApproverEmailId);
          payload = {
            ApproverComment1: form.Comments,
            CurrentStatus: 'Rejected',
            ActionDate1: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };         
          CurrentUserAction='Rejected';
        CurrentSequence=1; 
        }
        else if (form.ActionDate2 == '') {
          const UserApproval3 = await service.getUserById(form.ComplianceHeadEmailId);
          payload = {
            ApproverComment2: form.Comments,
            CurrentStatus: 'Rejected',
            ActionDate2: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };     
          CurrentUserAction='Rejected';
        CurrentSequence=2;     
        }
        else if (form.ActionDate3 == '') {
          const UserApproval4 = await service.getUserById(form.FIApproverEmailId);
          payload = {
            ApproverComment3: form.Comments,
            CurrentStatus: 'Rejected',
            ActionDate3: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };          
          CurrentUserAction='Rejected';
        CurrentSequence=3;
        }
        else if (form.ActionDate4 == '') {
          payload = {
            ApproverComment4: form.Comments,
            CurrentStatus: 'Rejected',
            ActionDate4: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };    
          CurrentUserAction='Rejected';
        CurrentSequence=4;    
        }
      }
      if (payload != '') {
        const updatedData = await service.updateItem(itemId, payload);
        await handleSaveApproveHistory(itemId, CurrentUserAction, NextuserAction, CurrentSequence, NextSequence, form.Comments);
        alert("Request Rejected Successfully.");
        setComment('');
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
          <h2>Reimbursement Request Approval Form
            <span>Digiflow / Reimbursement Request Form / Request Approval</span>
          </h2>
        </div>
        <div className={styles.row}>
          <div className={styles['col-md-9']}>
            <div className={styles.leftPanelHeader}>
              <h4>Reimbursement Request Approval- <b>{form.RequestNo}</b></h4>
              <h4>Current Status:  <span className={
                form.CurrentStatus === "Approved"
                  ? styles.Approved
                  : form.CurrentStatus === "Rejected"
                    ? styles.Rejected
                    : styles.Pending}>{form.CurrentStatus}</span></h4>
            </div>
            <div className={styles.content}>
              <div className={styles.selectDep}>
                <div className={styles.selectDepInner}>
                  <label>Department</label>
                  <input type='text' className="form-control" name="DepartmentName" value={form.DepartmentName} readOnly style={{ backgroundColor: "lightgray" }} />
                </div>
              </div>
              <div style={{ paddingBottom: "2%" }}></div>
              <div className='row'>
                {Expenseform.expenses.map((exp: any, index: number) => (
                  <div className="col-md-4" key={index}>
                    <div className={styles.remBox}>
                      <h6>Reimbursement Details- {exp.ExpanseType}</h6>
                      <p>
                        <label>Expense Type: </label>
                        <label>{exp.ExpanseType}</label>
                      </p>
                      <p>
                        <label>Bill Number: </label>
                        <label>{exp.BillNo}</label>
                      </p>
                      <p>
                        <label>Bill Amount: </label>
                        <label>{exp.BillAmount}</label>
                      </p>
                      <p>
                        <label>Bill Date: </label>
                        <label>{exp.BillDate
                          ? new Date(exp.BillDate).toISOString().split('T')[0]
                          : ''}</label>
                      </p>
                      <p>
                        <label>Claim Amount: </label>
                        <label>{exp.ClaimAmount}</label>
                      </p>
                      <p>
                        <label>Description: </label>
                        <label>{exp.Description}</label>
                      </p>
                      <p>
                        <label>Document: </label>
                        <label>{exp.DocumentName}</label>
                      </p>
                      <p>
                        {exp.files?.length > 0 && (
                          <ul style={{ listStyle: "none", padding: 0 }}>
                            {exp.files.map((file: any, index: any) => (
                              <li
                                key={index}
                                style={{ display: "flex", alignItems: "center", gap: "10px" }}
                              >
                                <a
                                  href={file.ServerRelativeUrl}
                                  rel="noopener noreferrer"
                                >
                                  {file.FileName}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.form}>
                <div className={styles['form-group']}>
                  <label>Approval Path</label>
                  <input type='text' className="form-control" name="ApprovalPath" value={form.ApprovalPath} readOnly style={{ backgroundColor: "lightgray" }} />
                </div>
                <div className={styles['form-group']}>
                  <label>Total Amount</label>
                  <input type='number' className="form-control" name="TotalAmount" value={form.TotalAmount} readOnly style={{ backgroundColor: "lightgray" }} />
                </div>
                <div className={styles['form-group']}>
                  <label>Remarks</label>
                  <input type='text' className="form-control" name="Remarks" value={form.Remarks} style={{ backgroundColor: "lightgray" }} readOnly />
                </div>
                <div className={styles['form-group']}>
                  <label>Comments</label>
                  <input type='text' className="form-control" name="Comments" value={form.Comments} onChange={handleChange} />
                </div>
                {/* Buttons */}
                <div className={styles['btn-group']}>
                  <button className={styles.btnSubmit} onClick={handleApprove} disabled={isDisabled}>Approve</button>
                  <button className={styles.btnReject} onClick={handleReject} disabled={isDisabled}>Reject</button>
                  <button className={styles.btnCancel} onClick={handleCancel}>Cancel</button>
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
}
export default ReimbursementRequestApproval;

