import * as React from 'react';
import styles from './quotationRequestNeiBt.module.scss';
import type { IQuotationRequestNeiBtProps } from './IQuotationRequestNeiBtProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import SharePointService from '../service/Service';
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
      Quote2:0,
      Quote3:0,
      Selectedvendor:'',
      SelectedQuote:'',
      Department:'',
      Advancepayment:'',
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
  

// --- 1️⃣ Get ID from query string ---
    const getIdFromQueryString = (): number | null => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('ID');
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
      console.log("Calling API with ID:", id);
     const currentuser= await service.getUser();
      const result = await service.getItemByRequestNo(id);

      console.log("Result:", result);

         if (result.CurrentStatus==='Draft') {
      setItemId(result.Id);

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
      Quote1: result.Quote1 || 0,
      Quote2:result.Quote2 || 0,
      Quote3: result.Quote3 || 0,
      Selectedvendor: result.Selectedvendor || '',
      SelectedQuote: result.SelectedQuote || '',
      Department: result.Department || '',
      Advancepayment: result.Advancepayment || 0,
      ApprovalPath: result.ApprovalPath || '',
<<<<<<< HEAD
      RequestNo : result.RequestNo || ''
      }));
//   if (!result.ActionDate1 || !result.ActionDate2 || !result.ActionDate3) {
//   setIsDisabled(false);  // enable
// } else {
//   setIsDisabled(true);   // disable
// }
    // setAssignedID(currentuser.Title);
       
=======
      RequestNo : result.RequestNo || '',
      AssignedTo:result.AssignedTo ||'',
      ApprovalID:result.ApprovalPathID ||''
      }));       
>>>>>>> 2c54da930eaf67003a18ad4944f57fcc718a4ede
    } else {
      alert("No data found");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
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
        alert(`File type not allowed: ${file.name}. Only PDF, XLSX, DOCX are allowed.`);
        return; // stop execution
      }
    }
  
    // 🔹 Total size check
    const totalSizeMB = filesArray.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      alert(`Total file size must not exceed ${MAX_TOTAL_SIZE_MB} MB`);
      return;
    }
  
    // 🔹 Invalid filename check
    const invalidFiles = filesArray.filter(file => INVALID_FILENAME_REGEX.test(file.name));
    if (invalidFiles.length > 0) {
      alert(`File names cannot have special characters: ${invalidFiles.map(f => f.name).join(", ")}`);
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
  
      //setDepartmentOptions(options);
    };
  // 🔹 Load data
    React.useEffect(() => {
      loadDepartments();
      //loadVendor();
      //getApprover();
      
    }, []);
  
  React.useEffect(() => {
  if (form.Department && form.Advancepayment) {
    loadApprovers();
  }
}, [form.Department, form.Advancepayment]);

 const poOptions: IChoiceGroupOption[] = [
    { key: '1', text: 'Yes' },
    { key: '2', text: 'No' }
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
    Title: 'QANEIBT',
    FID: id,  
    UserName: currentuser.Title,
    UserAction: 'Request Initiator',
    ActionDate: new Date().toISOString(),
     Designation: 'Request Initiator',
  };

  await service.createHistoryItem(payload);
};

   const handleSaveOrUpdate = async () => {
  // 🔹 Validations
  
    if(!form.ProjectTitle) return alert("Project Title required");
    if(!form.Vendor1) return alert("Enter Vendor1 ");
    if(!form.Quote1) return alert("Enter Quote1");
    if(!form.Selectedvendor) return alert("Select Vendor");
    if(!form.Quote1) return alert("Selected Quote");
    if(!form.Department) return alert("Select Department Name");
    if(!form.Advancepayment) return alert("Select Advance Payemnt");
     if (!form.files || form.files.length === 0) return alert("Attach files");
<<<<<<< HEAD
const User=await service.getUserById(Number(form.Approval1Id));
  if(User?.Id)
  {
  setAssignedID(User.Title);
  }
=======
    const User=await service.getUserById(Number(form.ApprovalID.split('_')[0]));
      if(User?.Id)
      {
      setAssignedID(User.Title);
      }
>>>>>>> 2c54da930eaf67003a18ad4944f57fcc718a4ede
  // 🔹 Payload (common)
  const payload = {
    ProjectTitle: form.ProjectTitle,
    ProjectReffNo: form.ProjectReffNo,
     ProjectDescription: form.ProjectDescription,
     //TotalProjectAmount:form.TotalProjectAmount,
     //ApplicableTaxes: form.ApplicableTaxes,
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
<<<<<<< HEAD
      AssignedTo: AssignedID,  // ✅ must be numeric ID
  Approval1Id: Number(form.Approval1Id),
  Approval2Id: Number(form.Approval2Id ),
  Approval3Id: Number(form.Approval3Id ),
  CurrentStatus:'Draft'
   
=======
      ApprovalPathID:form.ApprovalID,
      AssignedTo: User.Title, 
      CurrentStatus:'Draft',
      Approval1Id:form.ApprovalID.split('_')[0],
      Approval2Id:form.ApprovalID.split('_')[1],
      Approval3Id:form.ApprovalID.split('_')[2]
>>>>>>> 2c54da930eaf67003a18ad4944f57fcc718a4ede
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
      alert("Data Saved Successfully ✅");
       await service.updateItem(res.Id, {
          RequestNo: `NEI-${res.Id}`
        });
    } else {
      // 🔹 UPDATE
      await service.updateItem(itemId, payload);

      if (form.files.length > 0) {
        for (let i = 0; i < form.files.length; i++) {
          await service.uploadFile(itemId, form.files[i]);
        }
      }
      alert("Data Updated Successfully ✅");
    }
  } catch (error) {
    console.error(error);
    alert("Error occurred ❌");
  }
};

  

// Update
const handleUpdate = async () => {
   if(!form.ProjectTitle) return alert("Project Title required");
    if(!form.Vendor1) return alert("Enter Vendor1 ");
    if(!form.Quote1) return alert("Enter Quote1");
    if(!form.Selectedvendor) return alert("Select Vendor");
    if(!form.SelectedQuote) return alert("Selected Quote");
    if(!form.Department) return alert("Select Department Name");
    if(!form.Advancepayment) return alert("Select Advance Payemnt");
     if (!form.files || form.files.length === 0) return alert("Attach files");
     const User=await service.getUserById(Number(form.ApprovalID.split('_')[0]));
      if(User?.Id)
      {
      setAssignedID(User.Title);
      }
  const payload = {
    ProjectTitle: form.ProjectTitle,
    ProjectReffNo: form.ProjectReffNo,
     ProjectDescription: form.ProjectDescription,
     //TotalProjectAmount:form.TotalProjectAmount,
     //ApplicableTaxes: form.ApplicableTaxes,
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
      Approval1Id:form.ApprovalID.split('_')[0],
      Approval2Id:form.ApprovalID.split('_')[1],
      Approval3Id:form.ApprovalID.split('_')[2]
  };
  try {
    if (itemId) {
      // 🔥 UPDATE
     await service.updateItem(itemId, payload);
        await handleSaveHistory(itemId);
     if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(itemId, form.files[i]);
      }
    }
      alert("Data Submitted Successfully ✅");    
      const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url);  
    }
  } catch (error) {
    console.error(error);
    alert("Error occurred");
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
     <div className={styles.container}>
               <div className={styles.header}>
                 <h4>Quotation Approval Form - NEI BT Admin </h4>          
               </div>
               <div className={styles.row}>
                 <div className={styles["col-md-9"]}>
                   <div className={styles.leftPanel}>
                     <div className={styles.leftPanelHeader}>
                       <h4>Quotation Approval Form - NEI BT Admin </h4>              
                     </div>
        
          <label>Project Title <span className={styles.required}>*</span></label>
          <input name="ProjectTitle" value={form.ProjectTitle}  onChange={handleChange}  />

          <label>Project Reference No</label>
          <input name="ProjectReffNo" value={form.ProjectReffNo} onChange={handleChange}  />
        

          <label>Project Description & Advance Payment Details</label>
          <input name="ProjectDescription" value={form.ProjectDescription} onChange={handleChange} />
          

          <label>Total Project Amount</label>
          <input name="TotalProjectAmount" value={form.TotalProjectAmount }onChange={handleChange}  />

          <label>Applicable Taxes</label>
          <input name="ApplicableTaxes" value={form.ApplicableTaxes} onChange={handleChange}/>
        
{/* 
          <label>Vendor 1 <span className={styles.required}>*</span></label>
          <input name="Vendor1" value={form.Vendor1} onChange={handleChange}  /> */}

        <label>Vendor1 <span className={styles.required}>*</span></label>
        <input name="Vendor1" value={form.Vendor1}  onChange={handleChange} />  

           <label>Vendor2 <span className={styles.required}>*</span></label>
            <input name="Vendor2" value={form.Vendor2}  onChange={handleChange} />    

        <label>Vendor3 <span className={styles.required}>*</span></label>
        <input name="Vendor3" value={form.Vendor3}  onChange={handleChange} />  
      

          <label>Quote 1 <span className={styles.required}>*</span></label>
          <input name="Quote1" value={form.Quote1} type='number' onChange={handleChange} />

          <label>Quote 2</label>
          <input name="Quote2" value={form.Quote2} type='number' onChange={handleChange} />

          <label>Quote 3</label>
          <input name="Quote3" value={form.Quote3} type='number' onChange={handleChange} />

         <label>Select Vendor <span className={styles.required}>*</span></label>
        <input name="Selectedvendor" value={form.Selectedvendor} onChange={handleChange} />

          <label>Selected Quote <span className={styles.required}>*</span></label>
          <input name="SelectedQuote" value={form.SelectedQuote} onChange={handleChange} />
          
    
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
          {/* <label>Department</label>
          <input name="Department" value={form.Department} onChange={handleChange}   /> */}
       
          {/* <label>Advance Amount <span className={styles.required}>*</span></label>
          <input name="Advancepayment" value={form.Advancepayment} onChange={handleChange}    /> */}
          
          <ChoiceGroup
            label="Advance Payment"
            options={poOptions}
            selectedKey={poOptions.find(opt => opt.text === form.Advancepayment)?.key} // selectedKey ko key set karo based on text match
            onChange={(_, option) => {
              setForm(prev => ({
                ...prev,
                Advancepayment: option?.text || ""  // text store karo
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
             <li>
      <a 
        href="Downloads/CKBCSL_VENDOR_LIST_11.06.18.xlsx" 
        target="_blank" 
        rel="noopener noreferrer"
      >
      
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
    
   );
};




export default QuotationRequestNeiBt;
