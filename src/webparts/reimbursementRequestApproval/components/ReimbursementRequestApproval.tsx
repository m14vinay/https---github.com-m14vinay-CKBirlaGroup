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
  });
  const [loading, setLoading] = React.useState(false);
  const [History, setHistory] = React.useState<any[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const [Expenseform, setExpenseForm] = React.useState<{
    expenses: { Id: Number, Description: string; BillAmount: number; BillDate: Date, BillNo: string, DocumentName: string, ClaimAmount: number, ExpanseType: string }[];
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
  //Get ID from query string ---
  const getIdFromQueryString = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('RequestID');
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
      setForm({
        ...form,
        RequestNo: data.RequestNo,
        DepartmentName: data.DepartmentName,
        Remarks: data.Remarks,
        TotalAmount: data.TotalClaimAmount,
        CurrentStatus: data.CurrentStatus
      });
      const Expensedata = await service.getItemByExpenseData(requestNo);
      if (Expensedata.value.length > 0) {
        for (let i = 0; i < Expensedata.value.length; i++) {
          {
            setExpenseForm({
              ...Expenseform,
              expenses: [...Expenseform.expenses, Expensedata.value[i]]
            });
          }
        }
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
        ActionDate4: ''
      });
    }
  };
  const handleApprove = async () => {
    try {
      // setActionType('approve');
      setLoading(true);
      if (!Comment) return alert("Approver Comment required");
      const payload = {
        Comments: form.Comments,
        CurrentStatus: 'Approved',
        Actiondate1:new Date()
      };
      if (!itemId) return;
      if (form.ActionDate1 === '') {
        await service.updateItem(itemId,payload);
        await handleSaveApproveHistory(itemId, form.Comments, 'Approved');
        alert("✅ First level approved");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
        return;
      }
      else if (form.ActionDate2 === '') {
        await service.updateItem(itemId,payload);
        await handleSaveApproveHistory(itemId, form.Comments, 'Approved');
        alert("✅ Final approval done");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dasboard.aspx`;
        window.location.assign(url);
        return; // 🔥 stop again
      }
      setComment('');
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };
  const handleSaveApproveHistory = async (id: number, comment: string, UserAction: string) => {
    const currentuser = await service.getUser();
    const payload = {
      Title: 'REM',
      FID: id,
      UserName: currentuser.Title,
      UserAction: UserAction,
      ActionDate: new Date().toISOString(),
      Designation: currentuser.JobTitle,
      UserComment: comment
    };
    await service.createHistoryItem(payload);
  };
  const handleReject = async () => {
    try {
      setLoading(true);
      if (!Comment) return alert("Approver Comment required");
      if (!itemId) return;

      if (!Comment) {
        alert("Comment is required for rejection ❗");
        return;
      }
      const payload = {
        Comments: form.Comments,
        CurrentStatus: 'Rejected',
        Actiondate1:new Date()
      };
      if (form.ActionDate1 === '') {
        await service.updateItem(itemId,payload);
        await handleSaveApproveHistory(itemId, form.Comments, 'Rejected');
        alert("✅ First level Rejected successfully");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
        return;
      }
      else if (form.ActionDate2 === '') {
        await service.updateItem(itemId,payload);
        await handleSaveApproveHistory(itemId, form.Comments, 'Rejected');
        alert("✅ Final Rejection done");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
        return; // 🔥 stop again
      }
      alert("❌ Rejected successfully");
      setComment('');
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
          <h2>Reimbursement Request Details & Status
            <span>Digiflow / Reimbursement Request Form / Request Details</span>
          </h2>
        </div>
        <div className={styles.row}>
          <div className={styles['col-md-9']}>
            <div className={styles.leftPanelHeader}>
              <h4>{form.RequestNo}</h4>
              <h4>Current Status:  <span className={
                form.CurrentStatus === "Approved"
                  ? styles.Approved
                  : form.CurrentStatus === "Rejected"
                    ? styles.Rejected
                    : styles.Pending}>{form.CurrentStatus}</span></h4>
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
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.form}>
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
                  <input type='text' className="form-control" name="Comments" value={form.Comments} />
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
                  return (
                    <li
                      key={index}
                      className={
                        isApproved
                          ? styles.tickIcon
                          : isRejected
                            ? styles.crossIcon
                            : isInitiated ? styles.tickIcon : ""
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
                                  : ""
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
export default ReimbursementRequestApproval;

