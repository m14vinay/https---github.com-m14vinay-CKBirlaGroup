import * as React from 'react';
import styles from './BillProcessingDetailView.module.scss';
import { IBillProcessingDetailViewProps } from './IBillProcessingDetailViewProps';
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption, Modal } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
import 'bootstrap/dist/css/bootstrap.min.css';
const BillProcessingDetailView: React.FC<IBillProcessingDetailViewProps> = (props) => {
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
    ApprovalPath: '',
    OccupiedAmount: '',
    RemainingAmount: '',
    Email: '',
    ApproverComment5: ''
  });
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [History, setHistory] = React.useState<any[]>([]);
  const [isChecked, setIsChecked] = React.useState(false);
  const [isOpen, setisOpen] = React.useState(false);
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
      const result = await service.getItemByRequestNo(id);
      console.log("Result:", result);
      const currentuser = await service.getUser();
      if (result.Id>0 || result.Author.Id == currentuser.Id) {
        loadAttachments(id);
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
          BillDate: result.BillDate||'',
          BillAmount: result.BillAmount || 0,
          CalculatedTaxes: result.CalculatedTaxes || 0,
          PORequestNo: result.PORequestNo || '',
          PORequestNoID: result.PORequestNo || '',
          AttachedSignedPO: result.AttachedSignedPO == "True" ? true : false,
          RequestNo: result.RequestNo,
          CurrentStatus: result.CurrentStatus,
          ApprovalPath: result.ApprovalPath,
          OccupiedAmount: result.OccupiedAmount,
          RemainingAmount: result.RemainingAmount,
          ApproverComment5: result.ApproverComment5 || ''
        }));
        const historydata = await service.GetHistoryItem(Number(id), "FBP");
        setHistory(historydata);
      }
      else {
        alert("You are not an authorized user.");
      }
    } catch (error) {
      console.error("Error Occurred: ", error);
    }
    finally {
      setLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
    window.location.assign(url);
  };
  const handleEmail = async () => {
    if (form.vendorcode != '') {
      const vendor = await service.getVendorEmailByVendorCode(form.vendorcode);
      if (vendor != null) {
        setForm(
          prev => ({
            ...prev,
            Email: vendor.RegEmailId || ''
          }));
      }
    }
    setisOpen(true);
  }
  const handleSendEmail = async () => {
    if (!form.Email || !form.Email.includes('@')) {
      setisOpen(true);
      alert('Please enter correct email address.');
      return;

    }
    setLoading(true);
    const payload = {
      Title: form.VendorName.includes("-") ? form.VendorName.split("-")[1] : form.VendorName,
      VendorEmail: form.Email,
      Comment: form.ApproverComment5,
      Subject: 'Invoice is released to your account.',
      Message: 'Your invoice amount is released to you with the mentioned details.'
    };
    try {
      const res = await service.createEmailList(payload);
      if (res.Id > 0) {
        alert("Email Send Successfully.✅");
        setisOpen(false);
      }
    }
    catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  }
  const stripHtml = (html: string) => {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || "";
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
        <Modal
          isOpen={isOpen}
          onDismiss={() => setisOpen(false)}
          isBlocking={true}>
          <div className={styles.searchBox} style={{ marginBottom: "0px",width:"500px" }}>
            <h3>Send Email To Vendor</h3>
            <div className={styles.formGroup} style={{ display: "inline-flex", padding: "10px 10px 10px 10px",width:"100%" }}>
              <label style={{ width: '30%' }}>Vendor Email<span style={{ color: "red" }}>*</span></label>
              <input className="form-control" name='Email' type='email' placeholder='xxx@mail.com' value={form.Email} style={{ width: '100%' }}
                onChange={handleChange}
              />
            </div>
            <div className={styles.buttonGroup} style={{ padding: "10px 10px 10px 10px" }}>
              <button className={styles.submitBtn} onClick={handleSendEmail}>Send Email</button>
              <button className={styles.cancelBtn} onClick={() => setisOpen(false)} >Close</button>
            </div>
          </div>
        </Modal>
        <div className={styles.header}>
          <h4>Bill Processing Details & Status</h4>
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
              <div className={styles.leftPanelStatusHeader}>
                {History.filter(item => item.UserAction !== "Request Initiator").map((item, index) => {
                  let statusClass = styles.statusBox;
                  if (item.UserAction === "Approved") {
                    statusClass = `${styles.statusBox}`;
                  }
                  else if (item.UserAction === "Rejected") {
                    statusClass = `${styles.statusBox} ${styles.rejectedBox}`;
                  }
                  else if (item.UserAction === "Upcoming" || item.UserAction === "Hold") {
                    statusClass = `${styles.statusBox} ${styles.upcomingBox}`;
                  }
                  else if (item.UserAction === "Pending") {
                    statusClass = `${styles.statusBox} ${styles.pendingBox}`;
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
              <input name="VendorName" value={form.VendorName} type='text' readOnly style={{ backgroundColor: "lightgray" }}>
              </input>
              <label>Project Title</label>
              <input name="projectTitle" value={form.projectTitle} readOnly style={{ backgroundColor: "lightgray" }} />
              <label>Additional Information & Remarks</label>
              <input name="Comments" value={stripHtml(form.Comments)} readOnly style={{ backgroundColor: "lightgray" }}>
              </input>
              <label>Occupied Amount</label>
              <input name="OccupiedAmount" value={form.OccupiedAmount} type='text' readOnly style={{ backgroundColor: "lightgray" }} />
              <label>Remaining Amount</label>
              <input name="RemainingAmount" value={form.RemainingAmount} type='text' readOnly style={{ backgroundColor: "lightgray" }} />
              <label>Bill No</label>
              <input name="BillNo" value={form.BillNo} readOnly style={{ backgroundColor: "lightgray" }}>
              </input>
              <label>Bill Date</label>
              <input name="BillDate" type="text" value={form.BillDate ? form.BillDate.toString() : ''} readOnly style={{ backgroundColor: "lightgray" }}>
              </input>
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
                        href={`${window.location.origin}${file.ServerRelativeUrl}`} target='_blank'
                        rel="noopener noreferrer">
                        {file.FileName}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <div className={styles.buttonGroup}>
                <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                <button name='btnSendEmail' style={{ display: form.ApproverComment5 != '' ? 'block' : 'none' }} className={styles.submitBtn} onClick={handleEmail}>Send Email to Vendor</button>
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
                  const isHold = item.UserAction === "Hold";
                  return (
                    <li
                      key={index}
                      className={
                        isApproved
                          ? styles.tickIcon
                          : isRejected
                            ? styles.crossIcon
                            : isInitiated ? styles.tickIcon : isUpcoming ? styles.upcomingIcon : isPending ? styles.pendingIcon : isHold ? styles.upcomingIcon : ""
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
                                  : isUpcoming ? styles.upcomingstatus : isPending ? styles.pendingstatus : isHold ? styles.upcomingstatus : ""
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
export default BillProcessingDetailView;