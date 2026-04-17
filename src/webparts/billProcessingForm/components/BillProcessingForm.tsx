import * as React from 'react';
import styles from './BillProcessingForm.module.scss';
import { IBillProcessingFormProps } from './IBillProcessingFormProps';
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
const BillProcessingForm: React.FC<IBillProcessingFormProps> = (props) => {

  // State
  const [form, setForm] = React.useState({
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
    ApprovalPath:''
  });
  const [POOptions, setPOOptions] = React.useState<IDropdownOption[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [POAmount, setPOAmount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(false);
  const MAX_TOTAL_SIZE_MB = 25;
  const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/

  // --- 1️⃣ Get ID from query string ---
  const getIdFromQueryString = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('RequestId');
    return id ? parseInt(id, 10) : null;
  };
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
  //FETCH DATA-----
  const handleFetchById = async (id: number) => {
    try {
      setLoading(true);
      console.log("Calling API with ID:", id);
      const result = await service.getItemByRequestNo(id);
      console.log("Result:", result);
      const currentuser = await service.getUser();
      if (result.Author.Id == currentuser.Id) {
        if (result.CurrentStatus === 'Draft') {
          setItemId(result.Id);
          const resultdata = await service.getRequestDetails(result.ProjectCode);
          if (resultdata.length > 0) {
            const options = resultdata.map((item: any) => ({
              key: item.RequestNo,
              text: item.RequestNo
            }));
            setPOOptions(options);
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
              AttachedSignedPO: result.AttachedSignedPO == "True" ? true : false
            }));
          }

        } else {
          alert("Record is already successfully submitted.");
        }
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
  // Get Data Using PO Request Change
  const handleDocumentChange = async (option?: IDropdownOption) => {
    setLoading(true);
    if (!option) return;
    const data = await service.getDocumentDetailsID(option.text);
    console.log(data);
    setPOAmount(data[0].POAmount);
    setForm(prev => ({
      ...prev,
      PORequestNo: option?.text as string,
      PORequestNoID: option.key as string
    }))
    setLoading(false);
  };
  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
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
      ProjectCode: value
    }));
    if (!value) {
      return;
    }
    try {
      const result = await service.getRequestDetails(value);
      if (result.length > 0) {
        setForm(prev => ({
          ...prev,
          ProjectCode: value,
          vendorcode: result[0].vendorcode,
          VendorName: result[0].VendorName,
          projectTitle: result[0].ProjectTitle,
          DepartmentName: result[0].Department
        }));
        const options = result.map((item: any) => ({
          key: item.Id,
          text: item.RequestNo
        }));
        setPOOptions(options);
      }
      else {
        setForm(prev => ({
          ...prev,
          ProjectCode: value,
          vendorCode: '',
          VendorName: '',
          projectTitle: '',
          DepartmentName: ''
        }));
      }
    }

    catch (error) {
      console.error("Error fetching data:", error);

    }
  };
  // // 🔹 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };
  const handleBillDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const selectedDate = new Date(value);
  const today = new Date();
  // remove time part
  today.setHours(0, 0, 0, 0);
  if (selectedDate > today) {
    alert("Bill date cannot be greater than current date");
    return; // ❌ stop updating state
  }
  setForm({
    ...form,
    [name]: value
  });
  };

  const handleAmountCalculateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
    if (Number(value) > Number(POAmount)) {
      setForm(prev => ({
        ...prev,
        BillAmount: 0
      }));
      alert("Bill Amount must be less than PO Amount.");
      return;
    }
    else {
      setForm(prev => ({
        ...prev,
        TotalAmount: Number(value) + Number(form.CalculatedTaxes)
      }));
    }
  };
  // HandleTaxes
  const handleTaxCalculateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
      TotalAmount: Number(form.BillAmount) + Number(value)
    });
  };
  const handleSaveHistory = async (id: number, Title: string, UserName: string, UserAction: string, Designation: string, ActionDate: Date, Sequence: number) => {
    let payload: {};
    if (Sequence == 0) {
      payload = {
        Title: Title,
        FID: id,
        UserName: UserName,
        UserAction: UserAction,
        ActionDate: ActionDate,
        Designation: Designation,
        Sequence: Sequence
      };
    }
    else {
      payload = {
        Title: Title,
        FID: id,
        UserName: UserName,
        UserAction: UserAction,
        Designation: Designation,
        Sequence: Sequence
      };
    }

    await service.createHistoryItem(payload);
  };
  // Save
  const handleSaveOrUpdate = async () => {
    setLoading(true);
    const payload = {
      Vendorcode: form.vendorcode,
      VendorName: form.VendorName,
      ProjectTitle: form.projectTitle,
      ProjectCode: form.ProjectCode,
      PORequestNo: form.PORequestNo,
      BillNo: form.BillNo,
      BillDate: form.BillDate,
      BillAmount: form.BillAmount,
      CalculatedTaxes: form.CalculatedTaxes.toString(),
      TotalAmount: form.TotalAmount.toString(),
      Department: form.DepartmentName,
      CurrentStatus: 'Draft',
      BillDescription: form.Comments,
      PODescription: form.Comments,
      ProjectDescription: form.Comments,
      AttachedSignedPO: isChecked ? "True" : "False"
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
          alert("Saved Successfully.✅");
          await service.updateItem(res.Id, {
            RequestNo: `FBP-${res.Id}`
          });
        }
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
      if (!isChecked) {
        alert("Please check PO Signed.");
        return;
      }
      if ((!form.files || form.files.length === 0) && (attachments.length <= 0)) {
        setLoading(false);
        return alert("Please Attach files");
      }
      const data = await service.GetApprover(form.DepartmentName);
      const User = await service.getUserById(data.Departmenthead.Id);
      const dataFinanceApprover = await service.GetApproverFromFinance(form.DepartmentName);
      const databillingApprover = await service.GetApproverFromFinance(form.DepartmentName);
      const currentuser = await service.getUser();
      let payload = {};
      payload = {
        CurrentStatus: 'Pending',
        ProjectCode: form.ProjectCode,
        AttachedSignedPO: isChecked ? "True" : "False",
        Vendorcode: form.vendorcode,
        VendorName: form.VendorName,
        ProjectTitle: form.projectTitle,
        BillNo: form.BillNo,
        PORequestNo: form.PORequestNo,
        BillDate: form.BillDate,
        BillDescription: form.Comments,
        PODescription: form.Comments,
        ProjectDescription: form.Comments,
        BillAmount: form.BillAmount,
        CalculatedTaxes: form.CalculatedTaxes.toString(),
        TotalAmount: form.TotalAmount.toString(),
        Department: form.DepartmentName,
        AssignedTo: User?.Title,
        AssignedToEmailId: User?.Id,
        DepartmentHeadId: data.Departmenthead?.Id,
        Approver2Id: databillingApprover.Billing2ndApprover?.Id,
        Approver3Id: dataFinanceApprover.FinanceController?.Id,
        Approver5Id: databillingApprover.Billing2ndApprover?.Id,
        ApprovalPath:'1.'+User?.Title.toString()+' 2.'+databillingApprover.Billing2ndApprover?.Title.toString()+' 3.'+databillingApprover.Billing2ndApprover?.Title.tostring()
      };
      if (!itemId) {
        // 🔹 CREATE
        const res = await service.createItem(payload);
        setItemId(res.Id); // store ID for future updates
        if (res.Id > 0 && form.files.length > 0) {
          for (let i = 0; i < form.files.length; i++) {
            await service.uploadFile(res.Id, form.files[i]);
          }
          alert("Submitted Successfully.");
          await service.updateItem(res.Id, {
            RequestNo: `FBP-${res.Id}`
          });
          await handleSaveHistory(res.Id, 'FBP', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(res.Id, 'FBP', data.Departmenthead?.Title, '', 'Department Head', new Date(), 1);
          await handleSaveHistory(res.Id, 'FBP', databillingApprover.Billing2ndApprover?.Title, '', 'Billing and Approver', new Date(), 2);
          await handleSaveHistory(res.Id, 'FBP', dataFinanceApprover.FinanceController?.Title, '', 'Finance Controller', new Date(), 3);
          await handleSaveHistory(res.Id, 'FBP', databillingApprover.Billing2ndApprover?.Title, '', 'Billing and Approver', new Date(), 4);
          const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
          window.location.assign(url);
        }
      } else {
        // 🔹 UPDATE
        await service.updateItem(itemId, payload);
        if (form.files.length > 0) {
          for (let i = 0; i < form.files.length; i++) {
            await service.uploadFile(itemId, form.files[i]);
          }
        }
        await handleSaveHistory(itemId, 'FBP', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
        await handleSaveHistory(itemId, 'FBP', data.Departmenthead?.Title, '', 'Department Head', new Date(), 1);
        await handleSaveHistory(itemId, 'FBP', databillingApprover.Billing2ndApprover?.Title, '', 'Billing and Approver', new Date(), 2);
        await handleSaveHistory(itemId, 'FBP', dataFinanceApprover.FinanceController?.Title, '', 'Finance Controller', new Date(), 3);
        await handleSaveHistory(itemId, 'FBP', databillingApprover.Billing2ndApprover?.Title, '', 'Billing and Approver', new Date(), 4);
        alert("Submitted Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
      }
    }
    catch (error) {
      console.error(error);
      alert("Error Occurred:" + error);
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
        <div className={styles.row}>
          <div className={styles['col-md-9']}>
            <div className={styles.leftPanel}>
              <h2>Bill Processing Form</h2>
              <h4>Bill Processing / Request Form</h4>
              <div className={styles['col-md-12']}>
                <div className={styles["formGroup"]}>
                  <label style={{ display: "inline-flex" }}>Bill Signed<span className={styles.required}>*</span></label>
                  <input style={{ width: "15%" }} type="checkbox" name='POsigned' checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />
                </div>
              </div>
              <label>Project Code <span className={styles.required}>*</span></label>
              <input type='text'
                name="ProjectCode"
                value={form.ProjectCode}
                onChange={handleRequestNoChange}
              />
              <label>Vendor Name</label>
              <input name="VendorName" value={form.vendorcode + "-" + form.VendorName} type='text' readOnly>
              </input>
              <label>Project Title</label>
              <input name="projectTitle" value={form.projectTitle} readOnly />
              <label>Additional Information & Remarks</label>
              <input name="Comments" value={form.Comments} onChange={handleChange}  >
              </input>
              <label>PO Request No</label>
              <Dropdown
                placeholder="Select Request No"
                options={POOptions}
                selectedKey={form.PORequestNoID}
                onChange={(e, option) => handleDocumentChange(option)}
              />
              <label>Bill No</label>
              <input name="BillNo" value={form.BillNo} type='text' onChange={handleChange}>
              </input>
              <label>Bill Date</label>
              <input name="BillDate" type="date" value={
                form.BillDate
                  ? new Date(form.BillDate).toISOString().split('T')[0]
                  : ''
              } onChange={handleBillDateChange}>
              </input>

              <label>Bill Amount</label>
              <input name="BillAmount" value={form.BillAmount} type='number' onChange={handleAmountCalculateChange} />

              <label>Calculated Taxes</label>
              <input name="CalculatedTaxes" value={form.CalculatedTaxes} type='number' onChange={handleTaxCalculateChange} />

              <label>Total Amount</label>
              <input name="TotalAmount" value={form.TotalAmount} readOnly type='text' />
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
                <button className={styles.submitBtn} onClick={handleUpdate}>Submit</button>
                <button className={styles.saveBtn} onClick={handleSaveOrUpdate}>Save</button>
                <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          </div>
          <div className={styles['col-md-3']}>
            <div className={styles.leftPanelHeader}>
            </div>
            <div className={styles.rightPanel}>
              {/* Templates */}
              <div className={styles.card}>
                <div>
                  <h6>Templates</h6>
                </div>
                <ol>
                  <li>
                  </li>
                </ol>
              </div>
              {/* Guidelines */}
              <div className={styles.card}>
                <div>
                  <h6>Importance Guidelines</h6>
                </div>
                <ol>
                  <li>Select approval path carefully.</li>
                  <li>Use project reference if needed.</li>
                  <li>Attach all documents (Max 25 MB).</li>
                  <li>Avoid special characters in file names.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default BillProcessingForm;