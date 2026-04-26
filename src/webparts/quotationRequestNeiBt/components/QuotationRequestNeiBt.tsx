import * as React from 'react';
import styles from './quotationRequestNeiBt.module.scss';
import type { IQuotationRequestNeiBtProps } from './IQuotationRequestNeiBtProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption } from '@fluentui/react';


  const QuotationRequestNeiBt: React.FC<IQuotationRequestNeiBtProps> = (props) => {

  // State
  const [form, setForm] = React.useState({
      ID:0,
      ProjectTitle:'',
      ProjectReffNo:'',
      ProjectDescription: '',
      TotalProjectAmount:0,
      ApplicableTaxes:0,
      Vendor1: '',
      Vendor2: '',
      Vendor3: '',
      Quote1:0,
      Quote2:'',
      Quote3:'',
      Selectedvendor:'',
      SelectedQuote:'',
      Department:'',
      Advancepayment:'',
       AdvancepaymentStatus:'',
      ApprovalPath: '',
      files: [] as File[],
      CurrentStatus:'',
      ApprovalID:'',
    approver1: '',
    approver2: '',
    approver3: '',
    approver4: '',
    approver5: '',
    Approval1Id: null as number | null, 
  Approval2Id: null as number | null, 
  Approval3Id: null as number | null,  
    Approval1:'',
    Approval2:'',
    Approval3:'',
    AssignedTo:'',
    ActionDate1:'',
    ActionDate2:'',
    DepartmentHead: '',
    RequestNo:'',
    selectedApprover: 0
  });


 const [AssignedID, setAssignedID] = React.useState<string | null>(null);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [ApproverOptions, setApproverOptions] = React.useState<any[]>([]);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const MAX_TOTAL_SIZE_MB = 25;
  const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/
   const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
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
  const removeExistingFile = async (index: number) => {
 const file = attachments[index];


  await service.deleteAttachmentFromSP(file);
  setAttachments(prev => prev.filter((_, i) => i !== index));
};
const loadAttachments = async (id:number) => {
      try{
    const files = await service.getAttachments(id);
    console.log("Attachments:", files);
    setAttachments(files);
      }catch(error)
      {
        console.error(error);
      }
     };
     React.useEffect(() => {
       if (itemId) {
         loadAttachments(itemId);
        //getApprover();
       }
     }, [itemId]);


     //FETCH



     const handleFetchById = async (id: number) => {
    try {
       setLoading(true);
      console.log("Calling API with ID:", id);
     const result = await service.getItemByRequestNo(id);
 const currentUser = await service.getUser();
      console.log("Result:", result);
    if(result.AuthorId!== currentUser.Id)
      {
         alert("You Are Not Authorized ❌ ");
      } 
         if (result.CurrentStatus==='Draft') {
      setItemId(result.Id);
const selected = poOptions.find(
    opt =>
      opt.text.trim().toLowerCase() ===
      result.Advancepayment?.trim().toLowerCase()
  );
       setForm(prev => ({
        ...prev,
        ProjectTitle: result.ProjectTitle || '',
        ProjectReffNo: result. ProjectReffNo || '',
        ProjectDescription: result.ProjectDescription || '',
        TotalProjectAmount: result.TotalProjectAmount || 0,
         ApplicableTaxes: result.ApplicableTaxes || 0,
          Vendor1: result.Vendor1 || '',
      Vendor2: result.Vendor2 || '',
      Vendor3: result.Vendor3 || '',
      Quote1: result.Quote1 || '',
      Quote2:result.Quote2 || '',
      Quote3: result.Quote3 || '',
      Selectedvendor: result.Selectedvendor || '',
      SelectedQuote: result.SelectedQuote || '',
      Department: result.Department || '',
      Advancepayment: result.Advancepayment || 0,
      ApprovalPath: result.ApprovalPath || '',
      CurrentStatus: result.CurrentStatus || '',
      RequestNo: result.RequestNo || '',
     AdvancepaymentStatus: selected?.key || "" 
      
      }));       
    } else {
      alert("No Data Found");
    }
  } catch (error) {
    console.error("Error Occurred,Please Contact To System Administrator.:", error);
  }
  finally
  {
    setLoading(false);
  }
};
const handlecheckamount = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
    if (Number(value) > (form.TotalProjectAmount)) {
      setForm(prev => ({
        ...prev,
        SelectedQuote: ''
      }));
      alert("Please Enter SelectedQuote Amount Less or Equal To Total Project Amount.");
    }
  }

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
        alert(`File Type Not Allowed: ${file.name}. Only PDF, XLSX, DOCX are allowed.`);
        return; // stop execution
      }
    }
  
    // 🔹 Total size check
    const totalSizeMB = filesArray.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      alert(`Total File Size Must Not Exceed ${MAX_TOTAL_SIZE_MB} MB`);
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
  
   const loadDepartments = async () => {
      const data = await service.getDepartmentsNeiBT();
      const options = data.map((item: any) => ({
        key: item.DepartmentName,
        text: item.DepartmentName
      }));

      // ✅ remove duplicates
  const uniqueDepartments = Array.from(
    new Map(
      options.map(item => [item.key, item])
    ).values()
  );

  setDepartmentOptions(uniqueDepartments);
    };
  // 🔹 Load data
    React.useEffect(() => {
      loadDepartments();
    }, []);
  
  React.useEffect(() => {
  if (form.Department && form.Advancepayment) {
    loadApprovers();
  }
}, [form.Department, form.Advancepayment]);

 const poOptions: IChoiceGroupOption[] = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' }
  ];

  const loadApprovers = async () => {

  const data = await service.getDepartmentApprovers(
    form.Department,
    form.Advancepayment   // Yes / No
  );

  console.log("Department Data:", data);

//  

const approvalPaths = data.map((item: any) => {
  // ✅ Titles
  const titles = [
    item.Approval1?.Title,
    item.Approval2?.Title,
    item.Approval3?.Title
  ].filter(Boolean);

  // ✅ IDs
  const ids = [
    item.Approval1?.Id,
    item.Approval2?.Id,
    item.Approval3?.Id
  ].filter(Boolean);

  // ✅ Text (for UI)
  const text = titles
    .map((name, index) => `${index + 1}. ${name}`)
    .join(" > ");

  // ✅ Key (for backend/use)
  const key = ids.join("_"); // e.g. "12_45_78"

  return {
    key:key,
    text:text
  };
});
  setApproverOptions(approvalPaths);
};
 
 // 🔹 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

   const handleSaveOrUpdate = async () => {
  // 🔹 Validations
  try {
    setLoading(true);
    if(!form.ProjectTitle) return alert("Enter Project Title ");
    if(!form.Vendor1) return alert("Enter Vendor1 ");
    if(!form.Quote1) return alert("Enter Quote1");
    if(!form.Selectedvendor) return alert("Please Select Vendor");
    if(!form.SelectedQuote) return alert("Please Selected Quote");
    if(!form.Department) return alert("Please Select Department Name");
    if(!form.AdvancepaymentStatus) return alert("Please Select Advance Payemnt");
const User=await service.getUserById(Number(form.Approval1Id));
  if(User?.Id)
  {
  setAssignedID(User.Title);
  }
  // 🔹 Payload (common)
  const payload = {
    ProjectTitle: form.ProjectTitle,
    ProjectReffNo: form.ProjectReffNo,
     ProjectDescription: form.ProjectDescription,
     TotalProjectAmount:form.TotalProjectAmount,
     ApplicableTaxes: form.ApplicableTaxes,
     Vendor1:form.Vendor1,
     Vendor2:form.Vendor2,
      Vendor3: form.Vendor3,
      Quote1: form.Quote1,
      Quote2: form.Quote2 ,
      Quote3: form.Quote3,
      Selectedvendor: form.Selectedvendor,
      SelectedQuote: form.SelectedQuote,
      Department: form.Department,
      Advancepayment:form.Advancepayment,
      ApprovalPath: form.ApprovalPath,
  CurrentStatus:'Draft'
   
  };

  
     if (!itemId) {
      // 🔹 CREATE
      const res = await service.createItem(payload);
        setItemId(res.Id);
               // store ID for future update
       if (res.Id > 0 && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(res.Id , form.files[i]);
        }
      }      
       await service.updateItem(res.Id, {
       RequestNo: `NEI-${res.Id}`
  });
  alert("Request saved successfully.✅");
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);

    } else {
      // 🔹 UPDATE
      await service.updateItem(itemId, payload);
     
       if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(itemId, form.files[i]);
        }
      }
      alert("Request Updated Successfully ✅");
      const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
    }
  } catch (error) {
    console.error(error);
    alert("Error Occurred,Please Contact To System Administrator.❌");
  }
  finally
  {
    setLoading(false);
  }
};
  

// Update
const handleUpdate = async () => {
  try {
   setLoading(true);
   if(!form.ProjectTitle) return alert("Enter Project Title ");
    if(!form.Vendor1) return alert("Enter Vendor1 ");
    if(!form.Quote1) return alert("Enter Quote1");
    if(!form.Selectedvendor) return alert("Please Select Vendor");
    if(!form.SelectedQuote) return alert("Please Selected Quote");
    if(!form.Department) return alert("Please Select Department Name");
    if(!form.AdvancepaymentStatus) return alert("Please Select Advance Payemnt");
     if (!form.files || form.files.length === 0) return alert("Please Attach files");
      const currentuser = await service.getUser();
     const User=await service.getUserById(Number(form.ApprovalID.split('_')[0]));
      if(User?.Id)
      {
      setAssignedID(User.Title);
      }
      const User1=await service.getUserById(Number(form.ApprovalID.split('_')[1]));
         const User2=await service.getUserById(Number(form.ApprovalID.split('_')[2]));
  const payload = {
    ProjectTitle: form.ProjectTitle,
    ProjectReffNo: form.ProjectReffNo,
     ProjectDescription: form.ProjectDescription,
     TotalProjectAmount:form.TotalProjectAmount,
     ApplicableTaxes: form.ApplicableTaxes,
     Vendor1:form.Vendor1,
     Vendor2:form.Vendor2,
      Vendor3: form.Vendor3,
      Quote1: form.Quote1,
      Quote2: form.Quote2,
      Quote3: form.Quote3,
      Selectedvendor: form.Selectedvendor,
      SelectedQuote: form.SelectedQuote,
      Department: form.Department,
      Advancepayment:form.Advancepayment,
      ApprovalPath: form.ApprovalPath,
      CurrentStatus:'Pending',
      ApprovalPathID:form.ApprovalID,
      AssignedTo: User.Title, 
      AssignedToEmailId:User.Id,
      Approval1Id:form.ApprovalID.split('_')[0],
      Approval2Id:form.ApprovalID.split('_')[1],
      Approval3Id:form.ApprovalID.split('_')[2]
  };
  
    if (itemId) {       
     await service.updateItem(itemId, payload);
     if (!form.ApprovalID.split('_')[1] && !form.ApprovalID.split('_')[2]) {
          await handleSaveHistory(itemId, 'QANEIBT', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(itemId, 'QANEIBT',User.Title, 'Pending', 'Department Head', new Date(), 1);
        }
   else {
          await handleSaveHistory(itemId, 'QANEIBT', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(itemId, 'QANEIBT', User.Title, 'Pending', 'Department Head', new Date(), 1);
          await handleSaveHistory(itemId, 'QANEIBT', User1.Title ,'Upcoming', 'Management Approver', new Date(), 2);
          await handleSaveHistory(itemId, 'QANEIBT', User2.Title, 'Upcoming', 'Management Approver', new Date(), 3);
        }
     if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(itemId, form.files[i]);
      }
    }
    alert("Request Submitted Successfully.✅");    
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
    window.location.assign(url);  
    }
    else{
     const res= await service.createItem(payload);
      setItemId(res.Id);
     
     if (!form.ApprovalID.split('_')[1] && !form.ApprovalID.split('_')[2]) {
          await handleSaveHistory(res.Id, 'QANEIBT', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(res.Id, 'QANEIBT',User.Title, 'Pending', 'Department Head', new Date(), 1);
        }
   else {
          await handleSaveHistory(res.Id, 'QANEIBT', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(res.Id, 'QANEIBT', User.Title, 'Pending', 'Department Head', new Date(), 1);
          await handleSaveHistory(res.Id, 'QANEIBT', User1.Title ,'Upcoming', 'Management Approver', new Date(), 2);
          await handleSaveHistory(res.Id, 'QANEIBT', User2.Title, 'Upcoming', 'Management Approver', new Date(), 3);
        }
     if(res.Id>0)
     {
     if (res.Id > 0 && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(res.Id , form.files[i]);
      }
      alert("Request Submitted Successfully.✅");  
      await service.updateItem(res.Id, {
       RequestNo: `NEI-${res.Id}`
  });
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
    window.location.assign(url);  
     }
    }    
    }

  }
       
   catch (error) {
    console.error(error);
    alert("Error occurred");
  }
  finally
  {
    setLoading(false);
  }
};

const handleApprovalPathChange = (option?: IDropdownOption) => {
  if (!option) return;
setForm(prev => ({
  ...prev,
  ApprovalPath: option?.text||"",
  ApprovalID:(option?.key).toString()||""
}));
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
                 <h4>Quotation Request Approval Form - NEI BT Admin </h4>          
               </div>
               <div className={styles.row}>
                 <div className={styles["col-md-9"]}>
                   <div className={styles.leftPanel}>
                     <div className={styles.leftPanelHeader}>
                       <h4>Quotation Request Approval Form - NEI BT Admin </h4>              
                     </div>
        
          <label>Project Title <span className={styles.required}>*</span></label>
          <input name="ProjectTitle" value={form.ProjectTitle}  onChange={handleChange}  />

          <label>Project Reference No</label>
          <input name="ProjectReffNo" value={form.ProjectReffNo} onChange={handleChange}  />
        

          <label>Project Description & Advance Payment Details</label>
          {/* <input name="ProjectDescription" value={form.ProjectDescription} onChange={handleChange} /> */}
          <textarea name="ProjectDescription" value={form.ProjectDescription} onChange={handleChange}/>

          <label>Total Project Amount</label>
          <input name="TotalProjectAmount" value={form.TotalProjectAmount } type='number' onChange={handleChange}  />

          <label>Applicable Taxes</label>
          <input name="ApplicableTaxes" value={form.ApplicableTaxes} type='number' onChange={handleChange}/>
        <div className={styles.twoColumnRow}>
              <div className={styles.fieldBlock}>
                <label>Vendor 1 <span className={styles.required}>*</span></label>
                <input name="Vendor1" value={form.Vendor1} onChange={handleChange} />
              </div>
              <div className={styles.fieldBlock}>
                <label>Quote 1 <span className={styles.required}>*</span></label>
                <input  name="Quote1" value={form.Quote1} type='number' onChange={handleChange}  />
              </div>
            </div>

            <div className={styles.twoColumnRow}>
              <div className={styles.fieldBlock}>
                <label>Vendor 2</label>
                <input name="Vendor2" value={form.Vendor2} onChange={handleChange} />
              </div>
              <div className={styles.fieldBlock}>
                <label>Quote 2</label>
                <input   name="Quote2" value={form.Quote2 || ''} type='number' onChange={handleChange} />
              </div>
            </div>

            <div className={styles.twoColumnRow}>
              <div className={styles.fieldBlock}>
                <label>Vendor 3</label>
                <input name="Vendor3" value={form.Vendor3} onChange={handleChange} />
              </div>
              <div className={styles.fieldBlock}>
                <label>Quote 3</label>
                <input name="Quote3" value={form.Quote3 || ''} type='number' onChange={handleChange} />
              </div>
            </div>

         <label>Select Vendor <span className={styles.required}>*</span></label>
        <input name="Selectedvendor" value={form.Selectedvendor} onChange={handleChange} />

          <label>Selected Quote <span className={styles.required}>*</span></label>
          <input name="SelectedQuote" value={form.SelectedQuote} onChange={handleChange} type='number' />
          
    
        <label>Department</label>
        <Dropdown
          placeholder="Select Department"
          options={departmentOptions}
          selectedKey={form.Department}
  onChange={(e, option) =>
    setForm(prev => ({
      ...prev,
      Department: option?.key as string // safe default empty string
    }))
  }
/> 
          <ChoiceGroup
            label="Advance Payment"
            options={poOptions}
            selectedKey={form.AdvancepaymentStatus} // selectedKey ko key set karo based on text match
            onChange={(_, option) => {
              setForm(prev => ({
                ...prev,
                Advancepayment: option?.text || "" , // text store karo
                 AdvancepaymentStatus: option?.key || ""
              }));
            }}
          />
          
  <label>Approval Path</label>
 <Dropdown
      placeholder="Select Approver"
      options={ApproverOptions}
      selectedKey={form.ApprovalID}
      onChange={(e, option) => handleApprovalPathChange(option)} // ✅ Works now
    />
 <label>Attachments <span className={styles.required}>*</span></label>
       <input type="file" multiple onChange={handleFileChange}  />
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
          {/* Buttons */}
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
             <p>
     <a 
        href="https://ckbcsl.sharepoint.com/sites/DigiflowUAT/SampleDocuments/Quotation_Approval_Form_v1.0.xlsx"
      target="_blank"
      rel="noopener noreferrer"
      >
     Quotation_Approval_Form_v1.0.xlsx
      </a>
    </p>
    <p>
     <a 
        href="https://ckbcsl.sharepoint.com/sites/DigiflowUAT/SampleDocuments/SOP_Procurement_of_Goods_Services-CKBCSL-V1.1_wef_15.09.2016.pdf"
      target="_blank"
      rel="noopener noreferrer"
      >
     SOP_Procurement_of_Goods_Services-CKBCSL-V1.1_wef_15.09.2016.pdf
      </a>
    </p>
    <p>
     <a 
        href="https://ckbcsl.sharepoint.com/sites/DigiflowUAT/SampleDocuments/WSR5June.docx"
      target="_blank"
      rel="noopener noreferrer"
      >
        CKBirla WSR 5June.docx
      </a>
    </p>
     <p>
     <a 
        href="https://ckbcsl.sharepoint.com/sites/DigiflowUAT/SampleDocuments/SharePointtestpage.docx"
      target="_blank"
      rel="noopener noreferrer"
      >
        SharePoint test page.docx
      </a>
    </p>
            </ol>
          </div>
          {/* Guidelines */}
          <div className={styles.card}>
             <div>
              <h6>Importance Guidelines</h6>              
            </div>
            <ol>
              <li>Please select approval path suitably from the options which system proposes. In case of any doubt on approval path selection please refer the policy note on this page. 
                Please connect with Finance Deptt for any clarification.</li>
              <li>Please take note that if you wish to create a new quotation request with reference to an earlier project, then the same can be specified in 'Project Reference' field in this form.</li>
              <li>Attach all documents (excel form, pdf, emails, scan documents etc) before submitting the form. Once form is submitted it is non-editable. Total attachment size limit is 25 MB.</li>
              <li>It is recommended that the attachment name to not have spaces e.g. Email_VendorA_20-Jun.pdf.</li>
            </ol>
          </div>
        </div>
      </div>
      </div>
      </div>
    </section>
   );
};




export default QuotationRequestNeiBt;
