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
  const [form, setForm] = React.useState({
    BPRequestNo: '',
    BPRequestErrorNo: '',
    POsigned: false,
    ProjcetCode: '',
    vendorCode: '',
    vendorName: '',
    projectTitle: '',
    Comments: '',
    PORequestNo: '',
    BillNo: '',
    BillDate: new Date(),
    BillAmount: 0,
    CalculatedTaxes: 0,
    TotalAmount: 0,
    UploadDocument: '',
    files: [],
    CurrentStatus: ''
  });
  const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const [FinanceController, setApprover2ID] = React.useState<number | null>(null);
  const [AssignedID, setAssignedID] = React.useState<number | null>(null);
  const [Departmenthead, setDepartmentHead] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [occupiedAmount, setoccupiedAmount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const MAX_TOTAL_SIZE_MB = 25;
  const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/
  const [History, setHistory] = React.useState<any[]>([]);


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
      //getApprover();
    }
  }, [itemId]);

  //FETCH DATA-----
  const handleFetchById = async (id: number) => {
    try {
      setLoading(true);
      console.log("Calling API with ID:", id);

      const result = await service.getItemByRequestNo(id);

      console.log("Result:", result);

      if (result.CurrentStatus === 'Draft') {
        setItemId(result.Id);

        const selectedOption = poOptions.find(
          opt => opt.text === result.PoMaster
        );
        setForm(prev => ({
          ...prev,

          projectCode: result.ProjectCode || '',
          Department: result.Department || '',
          projectTitle: result.ProjectTitle || '',
          vendorName: result.VendorName || '',
          VendorNameID: result.VendorNameID || '',
          RemainingAmount: result.RemainingAmount || '',
          TotalAmount: result.TotalAmount || '',
          OccupiedAmount: result.OccupiedAmount || 0,
          POAmount: result.POAmount || 0,
          ApplicableTaxes: result.ApplicableTaxes || 0,
          Comments: result.ProjectDescription || '',
          POCategory: selectedOption?.text || ''
        }));
        const data = await service.GetApprover(result.Department);
        if (data?.Id > 0) {
          setDepartmentHead(data.Departmenthead?.Id || null);
          const User = await service.getUserById(data.Departmenthead.Id);
          if (User?.Id) {
            setAssignedID(User.Title);
          }
          const dataApprover = await service.GetApproverFromFinance(result.PoMaster);
          if (dataApprover?.Id) {
            setApprover2ID(dataApprover.FinanceController?.Id || null);
          }
        }

      } else {
        alert("No Data Found");
      }

    } catch (error) {
      console.error("Error Occurred,Please Contact To System Administrator.:", error);
    }
    finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
    window.location.assign(url);
  };
  const handleDownload = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/sites/DigiflowUAT/Shared%20Documents/PO_Format%20(1).xlsx?d=w7b16074a3861495c96494464b6b1818d&csf=1&web=1&e=rkBQLk`;
    window.location.assign(url);
  };
  const handleFileChange = (event?: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target?.files;
    if (!files) return;

    const allowedExtensions = ['pdf', 'xlsx', 'docx'];
    const filesArray = Array.from(files);

    // 🔹 Check each file
    for (let file of filesArray) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || allowedExtensions.indexOf(fileExtension) === -1) {
        alert(`File Type Not Allowed: ${file.name}. Only PDF, XLSX, DOCX are Allowed.`);
        return; // stop execution
      }
    }

    // 🔹 Total size check
    const totalSizeMB = filesArray.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      alert(`Total File Sie Must Not Exceed ${MAX_TOTAL_SIZE_MB} MB`);
      return;
    }

    // 🔹 Invalid filename check
    const invalidFiles = filesArray.filter(file => INVALID_FILENAME_REGEX.test(file.name));
    if (invalidFiles.length > 0) {
      alert(`File Names Cannot Have Special Characters: ${invalidFiles.map(f => f.name).join(", ")}`);
      return;
    }

    // ✅ Add valid files to form state
    setForm((prev: any) => ({
      ...prev,
      files: [...prev.files, ...filesArray]
    }));
  };
  const removeFile = (index: number) => {
    setForm((prev: any) => ({
      ...prev,
      files: prev.files.filter((_: File, i: number) => i !== index)
    }));
  };

  const removeExistingFile = async (index: number) => {
    const file = attachments[index];


    await service.deleteAttachmentFromSP(file);
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  const handleRequestNoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setForm(prev => ({
      ...prev,
      projectCode: value
    }));
    if (!value) {
      return;
    }

    try {
      const result = await service.getRequestDetails(value);
      if (result.length > 0) {
        const item = result[0];
        const OccupiedAmount = await service.getTotaloccupiedAmount(value);
        let total = 0;
        if (OccupiedAmount.length > 0) {
          total = OccupiedAmount.reduce((sum: number, items: any) => {
            return sum + Number(items.POAmount || 0);
          }, 0);
        }
        if (item.Status === 'Approved') {
          // 👉 Form fields update
          setForm(prev => ({
            ...prev,
            Department: item.Department || '',
            projectTitle: item.ProjectTitle || '',
            vendorName: item.Selectedvendor || '',
            TotalAmount: item.TotalProjectAmount || 0,
            OccupiedAmount: total || 0,
            RemainingAmount: item.TotalProjectAmount - total
          }));

          // 👉 Approver API call
          const data = await service.GetApprover(item.Department);
          if (data?.Id > 0) {
            setDepartmentHead(data.Departmenthead?.Id || null);
            const User = await service.getUserById(data.Departmenthead.Id);
            if (User?.Id) {
              setAssignedID(User.Title);
            }
            const dataApprover = await service.GetApproverFromFinance(item.PoMaster);
            if (dataApprover?.Id) {
              setApprover2ID(dataApprover.FinanceController?.Id || null);
            }
          }
        }
        else {
          alert("This Request is Not Approved ✅");
        }
      }
      else {

      }
    } catch (error) {
      console.error("Error fetching data:", error);

    }
  };

  // 🔹 PO Category Options
  const poOptions: IChoiceGroupOption[] = [
    { key: '1', text: 'Issue To Vendor' },
    { key: '2', text: 'Internal Compliance' }
  ];


  const loadDepartments = async () => {
    const data = await service.getDepartments();
    const options = data.map((item: any) => ({
      key: item.Id,
      text: item.DepartmentName
    }));

    setDepartmentOptions(options);
  };
  // 🔹 Load data
  React.useEffect(() => {
    loadDepartments();
  }, []);

  // // 🔹 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };


  const handleSaveHistory = async (id: number) => {

    const currentuser = await service.getUser();

    const payload = {
      Title: 'PO',
      FID: id,
      UserName: currentuser.Title,
      UserAction: 'Request Initiator',
      ActionDate: new Date().toISOString(),
      Designation: 'Request Initiator',
    };

    await service.createHistoryItem(payload);
  };


  //SAVE DRAFT DATA

  const handleSaveOrUpdate = async () => {
    setLoading(true);
    if (
      (!form.files || form.files.length === 0) &&
      (!attachments || attachments.length === 0)
    ) {
      return alert("Please Attach files");
    }
    // 🔹 Payload (common)
    const payload = {
      CurrentStatus: 'Draft'
    };
    try {
      if (!itemId) {
        // 🔹 CREATE
        const res = await service.createItem(payload);
        setItemId(res.Id); // store ID for future updates
        if (res.Id > 0 && form.files.length > 0) {
          for (let i = 0; i < form.files.length; i++) {
            await service.uploadFile(res.Id, form.files[i]);
          }
        }
        alert("Saved Successfully.✅");
        await service.updateItem(res.Id, {
          RequestNo: `CKBCSL/25-26/IV/Finance/${res.Id}`
        });
      } else {
        // 🔹 UPDATE
        await service.updateItem(itemId, payload);

        if (form.files.length > 0) {
          for (let i = 0; i < form.files.length; i++) {
            await service.uploadFile(itemId, form.files[i]);
          }
        }
        alert(" Updated Successfully ✅");
      }
    } catch (error) {
      console.error(error);
      alert("Error Occurred,Please Contact To System Administrator.❌");
    }
    finally {
      setLoading(false);
    }
  };



  // Update
  const handleUpdate = async () => {
    try {
      setLoading(true);
    }
    catch (error) {
      console.error(error);
      alert("Error Occurred,Please Contact To System Administrator.");
    }
    finally {
      setLoading(false);
    }
  };
  const validatePO = (value: string) => {
    if (!value) return "Project Code is required";
    if (!/^[a-zA-Z0-9-]+$/.test(value)) return "Only alphanumeric allowed";
    return "";
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
                <h4>{form.BPRequestNo}</h4>
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
              <label>Bill Signed</label>
              <input type="checkbox" checked={form.POsigned} onChange={handleRequestNoChange} />
              <label>Project Code <span className={styles.required}>*</span></label>
              <input
                name="PorequestNo"
                value={form.BPRequestNo}
                onChange={handleRequestNoChange}
                className={form.BPRequestErrorNo ? styles.buttonGroup : ''}
              />
              {form.BPRequestErrorNo && <span className={styles.error}>{form.BPRequestErrorNo}</span>}
              <label>Select Vendor Code</label>
              <input name="vendorCode" value={form.vendorCode}   >
              </input>
              <label>Select Vendor Name</label>
              <input name="vendorName" value={form.vendorName}   >
              </input>
              <label>Project Title</label>
              <input name="projectTitle" value={form.projectTitle} />
              <label>Additional Information & Remarks</label>
              <input name="comments" value={form.Comments}   >
              </input>
              <label>PO Request No</label>
              <input name="PORequestNo" value={form.PORequestNo} />
              <label>Bill No</label>
              <input name="BillNo" value={form.BillNo}   >
              </input>
              <label>Bill Date</label>
              <input name="BillDate" type="date" value={form.BillDate.toISOString().split('T')[0]}   >
              </input>

              <label>Bill Amount</label>
              <input name="BillAmount" value={form.BillAmount} />

              <label>Calculated Taxes</label>
              <input name="CalculatedTaxes" value={form.CalculatedTaxes} />

              <label>Total Amount</label>
              <input name="TotalAmount" value={form.TotalAmount} />
              <label>Attachments <span className={styles.required}>*</span></label>
              <input type="file" multiple onChange={handleFileChange} />
              {/*  Existing Files (API se) */}
              {attachments?.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {attachments.map((file, index) => (
                    <li
                      key={index}
                      style={{ display: "flex", alignItems: "center", gap: "10px" }}
                    >
                      {/* ❌ Remove Button */}
                      <span
                        style={{
                          color: "red",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                        onClick={() => removeExistingFile(index)}
                      >
                        ✕
                      </span>

                      {/* 📄 File Link */}
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

              {/* Selected Files */}
              {form.files.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {form.files.map((file: File, index: number) => (
                    <li key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                      {/* ❌ Remove */}
                      <span
                        style={{ cursor: "pointer", color: "red", fontWeight: "bold" }}
                        onClick={() => removeFile(index)}
                      >
                        ✕
                      </span>

                      {/* File Name */}
                      <span>{file.name}</span>

                    </li>
                  ))}
                </ul>
              )}
              <div className={styles.buttonGroup}>
                <button className={styles.submitBtn} onClick={handleSaveOrUpdate}>Submit</button>
                <button className={styles.submitBtn}>Paid</button>
                <button className={styles.submitBtn}>Hold</button>
                <button className={styles.RejectBtn} >Reject</button>
                <button className={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          </div>
          <div className={styles['col-md-3']}>
            <div className={styles.rightPanel}>
              <div className={styles.rightPanelHeader}>
                <h4>Timeline of the Request - {form.BPRequestNo}</h4>
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
export default BillProcessingApproval;