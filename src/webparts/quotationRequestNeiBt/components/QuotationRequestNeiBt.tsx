import * as React from 'react';
import styles from './QuotationRequestNeiBt.module.scss';
import type { IQuotationRequestNeiBtProps } from './IQuotationRequestNeiBtProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import SharePointService from '../service/Service';
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption } from '@fluentui/react';


//const QuotationRequestNeiBt: React.FC<IQuotationRequestNeiBtProps> = (props) => {

  const QuotationRequestNeiBt: React.FC<IQuotationRequestNeiBtProps> = (props) => {

  // State
  const [form, setForm] = React.useState({
      ProjectTitle:'',
      ProjectReffNo:'',
      ProjectDescription: '',
      TotalProjectAmount:0,
      ApplicableTaxes:0,
      Vendor1: '',
      Vendor2: '',
      Vendor3: '',
      Quote1:'',
      Quote2:'',
      Quote3:'',
      Selectedvendor:'',
      SelectedQuote:'',
      Department:'',
      Advancepayment:'',
      ApprovalPath: '',
      files: [] as File[],
      CurrentStatus:'',
    approver1: '',
    approver2: '',
    approver3: '',
    approver4: '',
    approver5: '',
    ActionDate1:'',
    ActionDate2:'',
    DepartmentHead: '',
    RequestNo:''
  });


 
    const [itemId, setItemId] = React.useState<number | null>(null);
    const service = new SharePointService(props.context);
     const [POrequestNo, setPORequestNo] = React.useState('');
    const [POrequestNoError, setPORequestNoError] = React.useState('');
    const [department, setDepartment] = React.useState('');
    const [projectTitle, setProjectTitle] = React.useState('');
      const [approver1, setApprover1] = React.useState('');
        const [approver2, setApprover2] = React.useState('');
        const [approver3, setApprover3] = React.useState('');
        const [approver4, setApprover4] = React.useState('');
        const [approver5, setApprover5] = React.useState('');
        const [departmentHead, setDepartmentHead] = React.useState('');
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
      Quote1: result.Quote1 || '',
      Quote2:result.Quote2 || '',
      Quote3: result.Quote3 || '',
      Selectedvendor: result.Selectedvendor || '',
      SelectedQuote: result.SelectedQuote || '',
      Department: result.Department || '',
      Advancepayment: result.Advancepayment || 0,
      ApprovalPath: result.ApprovalPath || '',
      RequestNo : result.RequestNo || ''
      }));
//   if (!result.ActionDate1 || !result.ActionDate2 || !result.ActionDate3) {
//   setIsDisabled(false);  // enable
// } else {
//   setIsDisabled(true);   // disable
// }
       
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
  
    
    const filesArray = Array.from(files);
  
    const totalSizeMB = filesArray.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      alert(`Total file size must not exceed ${MAX_TOTAL_SIZE_MB} MB`);
      return;
    }
     // Invalid filename check
    const invalidFiles = filesArray.filter(file => INVALID_FILENAME_REGEX.test(file.name));
    if (invalidFiles.length > 0) {
      alert(`File names cannot have special characters: ${invalidFiles.map(f => f.name).join(", ")}`);
      return;
    }
     if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
  
      setForm((prev: any) => ({
        ...prev,
        files: [...prev.files, ...selectedFiles]
      }));
    }
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

    const getApprover = async () => {
    try {
      const data = await service.getDepartmentsNeiBT();

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
  // 🔹 Load data
    React.useEffect(() => {
      loadDepartments();
      //loadVendor();
      getApprover();
    }, []);
  
 const poOptions: IChoiceGroupOption[] = [
    { key: '1', text: 'Yes' },
    { key: '2', text: 'No' }
  ];
    
 
 // 🔹 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { name, value } = e.target;
 
   setForm({
     ...form,
     [name]: value
   });
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
      Approval1:form.approver1,
       Approval2:form.approver2,
        Approval3:form.approver3,
      CurrentStatus:'Draft'
   
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
       CurrentStatus:'Pending'
  };
  try {
    if (itemId) {
      // 🔥 UPDATE
     await service.updateItem(itemId, payload);
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
    return (
      <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h4>Quotation Approval Form-NEI BT Admin</h4>
        
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
              <select name="vendorName" value={form.Vendor1} onChange={(e) =>setForm(prev => ({
              ...prev,Vendor1: e.target.value}))} >
               <option value="">Select Vendor</option>
          <option value="Vendor1">Vendor 1</option>
          <option value="Vendor2">Vendor 2</option>
        </select>

           <label>Vendor2 <span className={styles.required}>*</span></label>
              <select name="vendorName" value={form.Vendor2} onChange={(e) =>setForm(prev => ({
              ...prev,Vendor2: e.target.value}))} >
               <option value="">Select Vendor</option>
          <option value="Vendor1">Vendor 1</option>
          <option value="Vendor2">Vendor 2</option>
        </select>

        <label>Vendor3 <span className={styles.required}>*</span></label>
              <select name="vendorName" value={form.Vendor3} onChange={(e) =>setForm(prev => ({
              ...prev,Vendor3: e.target.value}))} >
               <option value="">Select Vendor</option>
          <option value="Vendor1">Vendor 1</option>
          <option value="Vendor2">Vendor 2</option>
        </select>

          <label>Quote 1 <span className={styles.required}>*</span></label>
          <input name="Quote1" value={form.Quote1} onChange={handleChange} />

          <label>Quote 2</label>
          <input name="Quote2" value={form.Quote2} onChange={handleChange} />

          <label>Quote 3</label>
          <input name="Quote3" value={form.Quote3} onChange={handleChange} />

         <label>Select Vendor <span className={styles.required}>*</span></label>
              <select name="vendorName" value={form.Selectedvendor} onChange={(e) =>setForm(prev => ({
              ...prev,vendorName: e.target.value}))} >
               <option value="">Select Vendor</option>
          <option value="Vendor1">Vendor 1</option>
          <option value="Vendor2">Vendor 2</option>
        </select>

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
          <label>Approval Path <span className={styles.required}>*</span></label>
          <input name="ApprovalPath" value={form.ApprovalPath} onChange={handleChange} readOnly   />
             
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

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          {/* Templates */}
          <div className={styles.card}>
            <h4>Templates</h4>
            <ul>
              <li>Quotation_Approval_Form_v1.0.xlsx</li>
              <li>SOP_Procurement_of_Goods_Services-CKBCS.pdf</li>
              <li>DigiFlow_Training_Manual.pdf</li>
            </ul>
          </div>

          {/* Guidelines */}
          <div className={styles.card}>
            <h4>Important Guidelines</h4>
            <ol>
              <li>Select approval path carefully.</li>
              <li>Use project reference if needed.</li>
              <li>Attach all documents (Max 25 MB).</li>
              <li>Avoid special characters in file names.</li>
            </ol>
          </div>
        </div>
      </div>
   );
};




export default QuotationRequestNeiBt;
