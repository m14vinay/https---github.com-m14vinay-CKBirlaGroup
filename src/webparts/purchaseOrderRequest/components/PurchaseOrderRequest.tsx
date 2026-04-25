import * as React from 'react';
import styles from './PurchaseOrderRequest.module.scss';
import { IPurchaseOrderRequestProps } from './IPurchaseOrderRequestProps';
import { SPHttpClient } from '@microsoft/sp-http';
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
import { PageContext } from '@microsoft/sp-page-context';
import { Spinner, SpinnerSize } from '@fluentui/react';
const PurchaseOrderRequest: React.FC<IPurchaseOrderRequestProps> = (props) => {

  // State
  const [form, setForm] = React.useState({
    projectCode: '',
    department: '',
    projectTitle: '',
    vendorName: '',
    vendorNameID: '',
    RemainingAmount: 0,
    TotalAmount: 0,
    OccupiedAmount: 0,
    Department: '',
    POAmount: 0,
    ApplicableTaxes: '',
    AssignedTo: '',
    PoMaster: '',
    ApprovalPath: '',
    POCategory: '',
    Comments: '',
    files: [] as File[],
    Attachments: [],
    POrequestNo: '',
    CurrentStatus: '',
    RequestNo: ''
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
      const currentUser = await service.getUser();
      console.log("Result:", result);
      if (result.AuthorId !== currentUser.Id) {
        alert("You Are Not Authorized ❌ ");
      }
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
      console.error("Error Occurred.:", error);
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
    window.open(url, '_blank');
  }
  const handleFileChange = (event?: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target?.files;
    if (!files) return;

    const allowedExtensions = ['pdf', 'xlsx', 'docx'];
    const filesArray = Array.from(files);
    const validatePO = (value: string) => {
      if (!value) return "Project Code is required";
      if (!/^[a-zA-Z0-9-]+$/.test(value)) return "Only alphanumeric allowed";
      return "";
    };
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
  const resetFields = () => {
    setForm(prev => ({
      ...prev,
      Department: '',
      ProjectTitle: '',
      department: '',
      projectTitle: '',
      vendorName: '',
      vendorNameID: '',
      RemainingAmount: 0,
      TotalAmount: 0,
      OccupiedAmount: 0,
      POAmount: 0,
      ApplicableTaxes: '',
      AssignedTo: '',
      PoMaster: '',
      Comments: '',
      files: [] as File[],
      Attachments: [],
      POrequestNo: '',
      CurrentStatus: '',
      RequestNo: ''
    }));

    setApprover2ID(null);
    setDepartmentHead(null);
  };

  const handlecheckamount = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
    if (Number(value) > (form.RemainingAmount)) {
      setForm(prev => ({
        ...prev,
        POAmount: 0
      }));
      alert("Please Enter PO Amount Less or Equal To Remaining Amount.");
    }
  }
  const handleRequestNoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setForm(prev => ({
      ...prev,
      projectCode: value
    }));
    if (!value) {
      resetFields();
      return;
    }

    try {
      const result = await service.getRequestDetails(value);
      const data = result[0].RequestNo
      const Vendor = await service.getRequestVendorDetails(data);
      if (Vendor.length > 0) {
        if (result.length > 0) {
          const item = result[0];
          const OccupiedAmount = await service.getTotaloccupiedAmount(value);
          let total = 0;
          if (OccupiedAmount.length > 0) {
            total = OccupiedAmount.reduce((sum: number, items: any) => {
              return sum + Number(items.POAmount || 0);
            }, 0);
          }
          if (item.CurrentStatus === 'Approved') {
            // 👉 Form fields update
            setForm(prev => ({
              ...prev,
              Department: item.Department || '',
              projectTitle: item.ProjectTitle || '',
              // vendorName: item.Selectedvendor || '',
              vendorName: Vendor[0].VendorName || '',
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
            resetFields();
          }
        }
        else {
          resetFields();
        }
      }
      else {
        alert("Request is not approved.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      resetFields();
    }
  };

  // 🔹 PO Category Options
  const poOptions: IChoiceGroupOption[] = [
    { key: '1', text: 'Issue To Vendor' },
    { key: '2', text: 'Internal Compliance' }
  ];
  const getShortName = (value: string) => {
    switch (value) {
      case "Issue To Vendor":
        return "IV";
      case "Internal Compliance":
        return "IC";
      default:
        return "";
    }
  };
  const getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Jan = 0

    let startYear = month >= 4 ? year : year - 1;
    let endYear = startYear + 1;

    return `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`;
  };

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

  const CounterfyPOCategory = async () => {

    const fy = getFinancialYear();
    const type = getShortName(form.PoMaster);


    let counterItem = await service.getCounterByFY(fy);
    let newCounter = 0;

    if (!counterItem) {
      const res = await service.createCounter(fy, type);

      counterItem = {
        ID: res?.ID || res?.Id || res?.data?.ID,
        IV: type === "IV" ? 1 : 0,
        IC: type === "IC" ? 1 : 0
      };

      newCounter = 1;
    } else {
      const itemId = counterItem[0].ID || counterItem[0].Id;

      if (type === "IV") {
        newCounter = Number(counterItem[0].IV || 0) + 1;

        await service.updateCounter(itemId, {
          IV: newCounter
        });
      } else {
        newCounter = Number(counterItem[0].IC || 0) + 1;

        await service.updateCounter(itemId, {
          IC: newCounter
        });
      }
    }

    const requestNo = `CKBCSL/${fy}/${type}/${form.Department}/${newCounter}`;

    return {
      counter: newCounter,
      requestNo
    };
  };


  //SAVE DRAFT DATA

  const handleSaveOrUpdate = async () => {
     try {
    setLoading(true);
    // 🔹 Validations
    // if (!form.projectCode) return alert("Enter Project Code");
    // if (!form.POAmount) return alert("Enter POAmount");
    // if (!form.ApplicableTaxes) return alert("Enter Applicable Taxes");
    // if (!form.POAmount) return alert("Please Choose POCategory");
    // if (
    //   (!form.files || form.files.length === 0) &&
    //   (!attachments || attachments.length === 0)
    // ) {
    //   return alert("Please Attach files");
    // }

    // 🔹 Payload (common)
    const payload = {
      ProjectCode: form.projectCode,
      Department: form.Department,
      ProjectTitle: form.projectTitle,
      VendorName: form.vendorName,
      TotalAmount: Number(form.TotalAmount),
      OccupiedAmount: Number(form.OccupiedAmount),
      RemainingAmount: Number(form.RemainingAmount),
      POAmount: form.POAmount,
      ApplicableTaxes: form.ApplicableTaxes,
      PoMaster: form.PoMaster,
      ProjectDescription: form.Comments,
      CurrentStatus: 'Draft'
    };

   
      if (!itemId) {
        // 🔹 CREATE
        const res = await service.createItem(payload);
        setItemId(res.Id); // store ID for future updates

        if (res.Id > 0 && form.files.length > 0) {
          for (let i = 0; i < form.files.length; i++) {
            await service.uploadFile(res.Id, form.files[i]);

          }
        }
        alert("Request Saved Successfully.");
        const counterResult = await CounterfyPOCategory();
        await service.updateItem(res.Id, {
          RequestNo: counterResult.requestNo
          //RequestNo : `CKBCSL/${getFinancialYear()}/${getShortName(form.PoMaster)}/${form.Department}/${res.Id}`
        });
      } else {
        // 🔹 UPDATE
        await service.updateItem(itemId, payload);

        if (form.files.length > 0) {
          for (let i = 0; i < form.files.length; i++) {
            await service.uploadFile(itemId, form.files[i]);
          }
        }
        alert("Request Updated Successfully ");
      }
    
    } catch (error) {
      console.error(error);
      alert("Error Occurred,Please Contact To System Administrator.❌");
    }
    finally {
      setLoading(false);
    }
  };


  const handleUpdate = async () => {
    try {
      setLoading(true);
      if (!form.projectCode) return alert("Enter Project Code ");
      if (!form.POAmount) return alert("Enter POAmount");
      if (!form.ApplicableTaxes) return alert("Enter Applicable Taxes");
      if (!form.PoMaster) return alert("Please Choose POCategory");
      if (
        (!form.files || form.files.length === 0) &&
        (!attachments || attachments.length === 0)
      ) {
        return alert("Please Attach files");
      }

      const dataApprover = await service.GetApproverFromFinance(form.PoMaster);
      const approvalPathIC = [
        { name: AssignedID },
        { name: dataApprover?.FinanceController?.Title, }

      ];
      const currentuser = await service.getUser();
      
      let payload = {};
      const UserDepartment = await service.getUserById(Number(Departmenthead));
      if (form.PoMaster === 'Internal Compliance') {
        payload = {

          Title: "Testing",
          ProjectCode: form.projectCode,
          ProjectTitle: form.projectTitle,
          VendorName: form.vendorName,
          TotalAmount: Number(form.TotalAmount),
          OccupiedAmount: Number(form.OccupiedAmount),
          RemainingAmount: Number(form.RemainingAmount),
          Department: form.Department,
          POAmount: form.POAmount,
          ApplicableTaxes: form.ApplicableTaxes,
          PoMaster: form.PoMaster,
          ProjectDescription: form.Comments,
          CurrentStatus: 'Pending',
          AssignedTo: dataApprover?.FinanceController?.Title,
          ApprovalPath: dataApprover?.FinanceController?.Title,
          DepartmentHeadId: dataApprover?.FinanceController?.Id,
          AssignedToEmailId: dataApprover?.FinanceController?.Id
          //Approver2Id: dataApprover?.FinanceController?.Id
        }
      }
      else
        payload = {

          Title: "Testing",
          ProjectCode: form.projectCode,
          ProjectTitle: form.projectTitle,
          VendorName: form.vendorName,
          TotalAmount: Number(form.TotalAmount),
          OccupiedAmount: Number(form.OccupiedAmount),
          RemainingAmount: Number(form.RemainingAmount),
          Department: form.Department,
          POAmount: form.POAmount,
          ApplicableTaxes: form.ApplicableTaxes,
          PoMaster: form.PoMaster,
          ProjectDescription: form.Comments,
          CurrentStatus: 'Pending',
          ApprovalPath: approvalPathIC.map(a => a.name).join(" > "),
          AssignedTo: AssignedID,
          DepartmentHeadId: Number(Departmenthead),
          AssignedToEmailId: Number(Departmenthead),
          Approver2Id: dataApprover?.FinanceController?.Id
        }
      if (itemId) {
        await service.updateItem(itemId, payload);
        if (form.PoMaster === 'Internal Compliance') {
          await handleSaveHistory(itemId, 'PO', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(itemId, 'PO', dataApprover?.FinanceController?.Title, 'Pending', 'Finance Controller', new Date(), 1);
        }
        else {
          await handleSaveHistory(itemId, 'PO', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(itemId, 'PO', UserDepartment?.Title, 'Pending', 'Department Head', new Date(), 1);
          await handleSaveHistory(itemId, 'PO', dataApprover?.FinanceController?.Title, 'Upcoming', 'Finance Controller', new Date(), 2);
        }
        if (form.files && form.files.length > 0) {
          for (let i = 0; i < form.files.length; i++) {
            await service.uploadFile(itemId, form.files[i]);
          }
        }
        alert("Request Submitted Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
      }
      else {
        const res = await service.createItem(payload);
        setItemId(res.Id);
         if (form.PoMaster === 'Internal Compliance') {
          await handleSaveHistory(res.Id, 'PO', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(res.Id, 'PO', dataApprover?.FinanceController?.Title, 'Pending', 'Finance Controller', new Date(), 1);
        }
        else {
           await handleSaveHistory(res.Id, 'PO', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(res.Id, 'PO', UserDepartment?.Title, 'Pending', 'Department Head', new Date(), 1);
          await handleSaveHistory(res.Id, 'PO', dataApprover?.FinanceController?.Title, 'Upcoming', 'Finance Controller', new Date(), 2);
        }
        if (res.Id > 0) {
          if (res.Id > 0 && form.files.length > 0) {
            for (let i = 0; i < form.files.length; i++) {
              await service.uploadFile(res.Id, form.files[i]);
            }
            alert("Request Submitted Successfully.");
            const counterResult = await CounterfyPOCategory();
            await service.updateItem(res.Id, {
              RequestNo: counterResult.requestNo
            });
            const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
            window.location.assign(url);

          }
        }
      }
    }


    catch (error) {
      console.error(error);
      alert("Error Occurred,Please Contact To System Administrator.❌");
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
          <h4>PO Approval Request Form </h4>
        </div>
        <div className={styles.row}>
          <div className={styles['col-md-9']}>
            <div className={styles.leftPanel}>
              <div className={styles.leftPanelHeader}>
                <h4>PO Approval Form</h4>
              </div>
              {/* <button style={{ backgroundColor: 'purple', color: 'white', fontSize: 'bold', width: '100%' }} onClick={handleDownload}>Download Purchase Order</button> */}
              <div></div>
              <label>Project Code <span className={styles.required}>*</span> </label>
              <input name="projectCode" value={form.projectCode} onChange={handleRequestNoChange} />

              <label>Department</label>
              <input name="Department" value={form.Department} readOnly style={{ backgroundColor: "lightgray" }} />

              <label>Project Title</label>
              <input name="projectTitle" value={form.projectTitle} readOnly style={{ backgroundColor: "lightgray" }} />

              <label>Vendor Name</label>
              <input name="VendorName" value={form.vendorName} readOnly style={{ backgroundColor: "lightgray" }} />

              <label>Total Amount</label>
              <input name="TotalAmount" value={form.TotalAmount} onChange={handleChange} readOnly style={{ backgroundColor: "lightgray" }} />

              <label>Occupied Amount</label>
              <input name="OccupiedAmount" value={form.OccupiedAmount} onChange={handleChange} readOnly style={{ backgroundColor: "lightgray" }} />

              <label>Remaining Amount</label>
              <input name="RemainingAmount" value={form.RemainingAmount} onChange={handleChange} readOnly style={{ backgroundColor: "lightgray" }} />

              <label>PO Amount <span className={styles.required}>*</span></label>
              <input name="POAmount" value={form.POAmount} onChange={handlecheckamount} type='number' />

              <label>Applicable Taxes <span className={styles.required}>*</span></label>
              <input name="ApplicableTaxes" value={form.ApplicableTaxes} onChange={handleChange} type='number' />

              <ChoiceGroup
                label="PO Category"
                options={poOptions}
                selectedKey={poOptions.find(opt => opt.text === form.PoMaster)?.key}
                //selectedKey={form.PoMaster}
                onChange={(_, option) => {
                  setForm(prev => ({
                    ...prev,
                    PoMaster: option?.text || "" // text store karo
                  }));
                }}
              />
              <label>Additional Information & Remarks</label>
              <input name="Comments" value={form.Comments} onChange={handleChange} />

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
                <button className={styles.submitBtn} onClick={handleUpdate}  >Submit</button>
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
                    <a
                      href="https://ckbcsl.sharepoint.com/sites/DigiflowUAT/SampleDocuments/PO_v1.0.xlsx"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PO_v1.0.xlsx
                    </a>
                  </li>
                </ol>
              </div>
              {/* Guidelines */}
              <div className={styles.card}>
                <div>
                  <h6>Importance Guidelines</h6>
                </div>
                <ol>
                  <li>To find your project code, please refer to the home page and 'my requests' section. Please take note that the system would not allow to create a 'purchase order'
                    approval request unless the previous stage vendor mapping request is approved.</li>
                  <li>Attach all documents (excel form, pdf, emails, scan documents etc) before submitting the form. Once form is submitted it is non-editable. Total attachment size limit is 25 MB.
                    It is recommended that the attachment name to not have spaces in it.</li>

                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default PurchaseOrderRequest;