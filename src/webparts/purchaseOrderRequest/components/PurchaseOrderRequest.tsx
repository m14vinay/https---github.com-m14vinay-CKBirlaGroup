import * as React from 'react';
import styles from './PurchaseOrderRequest.module.scss';
import { IPurchaseOrderRequestProps } from './IPurchaseOrderRequestProps';
import { SPHttpClient } from '@microsoft/sp-http';
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
import { PageContext } from '@microsoft/sp-page-context';

const PurchaseOrderRequest: React.FC<IPurchaseOrderRequestProps> = (props) => {

  // State
  const [form, setForm] = React.useState({
    projectCode: '',
    department:'',
    projectTitle: '',
    vendorName: '',
    vendorNameID:'',
    RemainingAmount: '',
    TotalAmount:'',
    OccupiedAmount:'',
    Department: '',
    POAmount: 0,
    ApplicableTaxes: 0,
    PoMaster: '',
    Comments: '',
   files: [] as File[],
     Attachments: [],
    POrequestNo:'',
    CurrentStatus:'',
    approver1: '',
   approver2: '',
   approver3: '',
   approver4: '',
   approver5: '',
   DepartmentHead: ''
  });

  const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
  const [vendorOptions, setvendorOptions] = React.useState<IDropdownOption[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const [Approver1ID, setApprover1ID] = React.useState<number | null>(null);
  const [Approver2ID, setApprover2ID] = React.useState<number | null>(null);
  const [Approver3ID, setApprover3ID] = React.useState<number | null>(null);
  const [Approver4ID, setApprover4ID] = React.useState<number | null>(null);
  const [Approver5ID, setApprover5ID] = React.useState<number | null>(null);
  const [Departmenthead, setDepartmentHead] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
   const [POrequestNo, setPORequestNo] = React.useState('');
  const [POrequestNoError, setPORequestNoError] = React.useState('');
  const [department, setDepartment] = React.useState('');
    const [projectTitle, setProjectTitle] = React.useState('');
     const [attachments, setAttachments] = React.useState<any[]>([]);
    const MAX_TOTAL_SIZE_MB = 25;
  const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/
    


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
        getApprover();
       }
     }, [itemId]);

//FETCH DATA-----
  const handleFetchById = async (id: number) => {
    try {
      console.log("Calling API with ID:", id);

      const result = await service.getItemByRequestNo(id);

      console.log("Result:", result);

      if (result.CurrentStatus==='Draft') {
      setItemId(result.Id);

        setForm(prev => ({
          ...prev,
          
          projectCode: result.ProjectCode || '',
          Department: result.Department || '',
          projectTitle: result.ProjectTitle || '',
          vendorName: result.VendorName || '',
          POAmount: result.POAmount || 0,
          ApplicableTaxes: result.ApplicableTaxes || 0,
          Comments: result.ProjectDescription || ''
          
         
        }));

       

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
const handleDownload = () => {
  const url = `${props.context.pageContext.web.absoluteUrl}/sites/DigiflowUAT/Shared%20Documents/PO_Format%20(1).xlsx?d=w7b16074a3861495c96494464b6b1818d&csf=1&web=1&e=rkBQLk`;
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

const removeExistingFile = async (index: number) => {
 const file = attachments[index];


  await service.deleteAttachmentFromSP(file);
  setAttachments(prev => prev.filter((_, i) => i !== index));
};




const resetFields = () => {
  setForm(prev => ({
    ...prev,
    Department: '',
    ProjectTitle: ''
  }));

  setApprover1ID(null);
  setApprover2ID(null);
  setApprover3ID(null);
  setApprover4ID(null);
  setApprover5ID(null);
  setDepartmentHead(null);
};


const getApprover = async () => {
    try {
      const data = await service.GetApprover('');

      console.log("Approver Data:", data);

      if (data && data.length > 0) {
        setApprover1ID(data[0].approver1 || '');
        setApprover3ID(data[0].approver2 || '');
        setApprover3ID(data[0].approver3 || '');
        setApprover4ID(data[0].approver4 || '');
        setApprover5ID(data[0].approver5 || '');
        setDepartmentHead(data[0].DepartmentHead || '');
      }

    } catch (error) {
      console.error(error);
    }
  };
const handleRequestNoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

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

    if (result.length > 0) {
      const item = result[0];

      // 👉 Form fields update
      setForm(prev => ({
        ...prev,
        Department: item.Department || '',
        projectTitle: item.ProjectTitle || ''
      }));

      // 👉 Approver API call
      const data = await service.GetApprover(item.Department);

      if (data?.Id > 0) {
        setApprover1ID(data.Approval1?.Id || null);
        setApprover2ID(data.Approval2?.Id || null);
        setApprover3ID(data.Approval3?.Id || null);
        setApprover4ID(data.Approval4?.Id || null);
        setApprover5ID(data.Approval5?.Id || null);
        setDepartmentHead(data.Departmenthead?.Id || null);
      }

    } else {
      resetFields();
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

const getPOCategoryText = () => {
  if (form.PoMaster === "1") return "Issue To Vendor";
  if (form.PoMaster === "2") return "Internal Compliance";
  return "";
};

//SAVE DRAFT DATA

  const handleSaveOrUpdate = async () => {
  // 🔹 Validations
  if(!form.projectCode) return alert("Project Code required");
    if(!form.POAmount) return alert("Enter POAmount");
    if(!form.ApplicableTaxes) return alert("Enter Applicable Taxes");
    if(!form.POAmount) return alert("Choose POCategory");
    if (
  (!form.files || form.files.length === 0) &&
  (!attachments || attachments.length === 0)
) {
  return alert("Attach files");
}
  // 🔹 Payload (common)
  const payload = {
    ProjectCode: form.projectCode,
    Department: form.Department,
    ProjectTitle: form.projectTitle,
    VendorName: form.vendorName,
    TotalAmount:form.TotalAmount,
    OccupiedAmount: form.OccupiedAmount,
    RemainingAmount: form.RemainingAmount,
    POAmount: form.POAmount,
    ApplicableTaxes: form.ApplicableTaxes,
   PoMaster:form.PoMaster,
    ProjectDescription: form.Comments,
    Departmenthead: setDepartmentHead,
    Approver2: setApprover2ID,
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
   if(!form.projectCode) return alert("Project Code required");
  if(!form.POAmount) return alert("Enter POAmount");
    if(!form.ApplicableTaxes) return alert("Enter Applicable Taxes");
    if(!form.PoMaster) return alert("Choose POCategory");
     if (
  (!form.files || form.files.length === 0) &&
  (!attachments || attachments.length === 0)
) {
  return alert("Attach files");
}
  const payload = {
    Title:"Testing",
    ProjectCode: form.projectCode,
    ProjectTitle: form.projectTitle,
    VendorName: form.vendorName,
    RemainingAmount: form.RemainingAmount,
    Department: form.Department,
    POAmount: form.POAmount,
    ApplicableTaxes: form.ApplicableTaxes,
    PoMaster:form.PoMaster,
    ProjectDescription: form.Comments,
    CurrentStatus:'Pending',
    Departmenthead: setDepartmentHead,
    Approver2: setApprover2ID
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




const validatePO = (value: string) => {
    if (!value) return "Project Code is required";
    if (!/^[a-zA-Z0-9-]+$/.test(value)) return "Only alphanumeric allowed";
    return "";
  };

   
  // 🔹 UI
  return (
    <div className={styles.container}>

      <div className={styles.leftPanel}>
        <h2>PO Approval Request Form</h2>
        <h4>PO Approval / Request Form</h4>
       <button style={{backgroundColor:'purple',color:'white',fontSize:'bold',width:'100%'}} onClick={handleDownload}>Download Purchase Order</button>
       <div></div>
        <label>Project Code <span className={styles.required}>*</span> </label>
        <input name="projectCode" value={form.projectCode} onChange={handleRequestNoChange} />

         <label>Department</label>
          <input name="Department" value={form.Department} readOnly />        

        <label>Project Title</label>
        <input name="projectTitle" value={form.projectTitle} readOnly />

        <label>Select Vendor Name</label>
        <input name="vendorName" value={form.vendorName} readOnly />

        <label>Total Amount</label>
        <input name="TotalAmount" value={form.TotalAmount} onChange={handleChange} />

        <label>Occupied Amount</label>
        <input name="OccupiedAmount" value={form.OccupiedAmount} onChange={handleChange} />

        <label>Remaining Amount</label>
        <input name="RemainingAmount" value={form.RemainingAmount} onChange={handleChange} />

        <label>PO Amount <span className={styles.required}>*</span></label>
        <input name="POAmount" value={form.POAmount} onChange={handleChange} />

        <label>Applicable Taxes <span className={styles.required}>*</span></label>
        <input name="ApplicableTaxes" value={form.ApplicableTaxes} onChange={handleChange} />

        <ChoiceGroup
  label="PO Category"
  options={poOptions}
  selectedKey={form.PoMaster}   // ✅ form se bind karo
  onChange={(e, option) =>{
    setForm(prev => ({
      ...prev,
      PoMaster: option?.text as string
    }));
  }
}
/>


        <label>Additional Information & Remarks</label>
        <input name="Comments" value={form.Comments} onChange={handleChange} />

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
        <div className={styles.buttonGroup}>          
          <button className={styles.submitBtn} onClick={handleUpdate}>Submit</button>
          <button className={styles.saveBtn} onClick={handleSaveOrUpdate}>Save</button>
          <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
        </div>
      </div>
       <div className={styles.rightPanel}>
          {/* Templates */}
          <div className={styles.card}>
            <h4>Templates</h4>
            <ul>
              <li>PO_v1.0.xlsx</li>
              <li>SOP_Procurement_of_Goods_Services.pdf</li>
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

export default PurchaseOrderRequest;