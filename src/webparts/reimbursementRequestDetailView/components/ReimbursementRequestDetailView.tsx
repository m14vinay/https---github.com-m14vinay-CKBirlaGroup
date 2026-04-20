import * as React from 'react';
import styles from './ReimbursementRequestDetailView.module.scss';
import type { IReimbursementRequestDetailViewProps } from './IReimbursementRequestDetailViewProps';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner, SpinnerSize } from '@fluentui/react';
import SharePointService from '../service/Service';
const ReimbursementRequestDetailView: React.FC<IReimbursementRequestDetailViewProps> = (props) => {

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
    ApprovalPath: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [History, setHistory] = React.useState<any[]>([]);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [Expenseform, setExpenseForm] = React.useState<{
    expenses: { Id: Number, Description: string; BillAmount: number; BillDate: Date, BillNo: string, DocumentName: string, ClaimAmount: number, ExpanseType: string, files: { FileName: string; ServerRelativeUrl: string }[] }[];
  }>({
    expenses: []
  });
  const service = new SharePointService(props.context);
  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
    window.location.assign(url);
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
    const data = await service.getItemByRequestNo(requestNo);
    const currentUser = await service.getUser();
    if (data.AuthorId !== currentUser.Id) {
      alert("You Are Not Authorized ❌ ");
    }
    if (data.Id > 0) {
      setForm({
        ...form,
        RequestNo: data.RequestNo,
        DepartmentName: data.DepartmentName,
        Remarks: data.Remarks,
        TotalAmount: data.TotalClaimAmount,
        CurrentStatus: data.CurrentStatus,
        ApprovalPath: data.ApprovalPath
      });
      const Expensedata = await service.getItemByExpenseData(requestNo);
      if (Expensedata.value.length > 0) {
        {
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
        ApprovalPath: ''
      });
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
                else if (item.UserAction === "Upcoming") {
                  statusClass = `${styles.statusBox} ${styles.upcomingBox}`;
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
                {Expenseform.expenses.map((exp: any, index: any) => (
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
                            {exp.files.map((file: any, index:any) => (
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
                {/* Buttons */}
                <div className={styles['btn-group']}>
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
export default ReimbursementRequestDetailView;

