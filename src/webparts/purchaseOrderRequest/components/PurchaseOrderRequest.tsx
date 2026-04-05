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
    department:'',
    projectTitle: '',
    vendorName: '',
    vendorNameID:'',
    RemainingAmount: 0,
    TotalAmount:0,
    OccupiedAmount:0,
    Department: '',
    POAmount: 0,
    ApplicableTaxes: 0,
    AssignedTo: '',
    PoMaster: '',
    Comments: '',
   files: [] as File[],
     Attachments: [],
    POrequestNo:'',
    CurrentStatus:'',
    RequestNo:''
  });
 
  const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const [FinanceController, setApprover2ID] = React.useState<number | null>(null);
  const [AssignedID, setAssignedID] = React.useState<number | null>(null);
  const [Departmenthead, setDepartmentHead] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const[occupiedAmount,setoccupiedAmount]=React.useState(0);
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
        //getApprover();
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
          VendorName: result.VendorName || '',
          VendorNameID: result.VendorNameID || '',
          RemainingAmount: result.RemainingAmount || '',
          TotalAmount: result.TotalAmount || '',
          OccupiedAmount: result.OccupiedAmount || '',  
          POAmount: result.POAmount || 0,
          ApplicableTaxes: result.ApplicableTaxes || 0,
          Comments: result.ProjectDescription || '',
          PoMaster: result.PoMaster || ''         
        }));
      const data = await service.GetApprover(result.Department);
      if (data?.Id > 0) {                
        setDepartmentHead(data.Departmenthead?.Id || null);
        const User=await service.getUserById(data.Departmenthead.Id);
        if(User?.Id)
        {
          setAssignedID(User.Title);
        }
        const dataApprover = await service.GetApproverFromFinance(result.PoMaster);
        if(dataApprover?.Id)
        {
          setApprover2ID(dataApprover.FinanceController?.Id || null);
        }
      }      

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

  setApprover2ID(null);
  setDepartmentHead(null);
};

const handlecheckamount=async (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setForm({
    ...form,
    [name]: value
  });
  if(Number(value)>(form.RemainingAmount))
  {setForm(prev => ({
    ...prev,
    POAmount:0
  }));
    alert("Please Enter PO Amount less or equal to Remaining Amount.");
  }
}
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
        if (item.Status === 'Approved') {
      // 👉 Form fields update
      setForm(prev => ({
        ...prev,
        Department: item.Department || '',
        projectTitle: item.ProjectTitle || '',
        vendorName: item.Selectedvendor || '',
        TotalAmount:item.TotalProjectAmount || 0,
        OccupiedAmount:total||0,
        RemainingAmount:item.TotalProjectAmount-total
      }));
      
      // 👉 Approver API call
      const data = await service.GetApprover(item.Department);
      if (data?.Id > 0) {                
        setDepartmentHead(data.Departmenthead?.Id || null);
        const User=await service.getUserById(data.Departmenthead.Id);
        if(User?.Id)
        {
          setAssignedID(User.Title);
        }
        const dataApprover = await service.GetApproverFromFinance(item.PoMaster);
        if(dataApprover?.Id)
        {
          setApprover2ID(dataApprover.FinanceController?.Id || null);
        }
      }  
    }
    } else {
      alert("This request is not approved ✅");
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

       const dataApprover = await service.GetApproverFromFinance(form.PoMaster);
        if(dataApprover?.Id)
        {
          setApprover2ID(dataApprover.FinanceController?.Id || null);
        }
  // 🔹 Payload (common)
  const payload = {
    ProjectCode: form.projectCode,
    Department: form.Department,
    ProjectTitle: form.projectTitle,
    VendorName: form.vendorName,
    TotalAmount:Number(form.TotalAmount),
    OccupiedAmount: Number(form.OccupiedAmount),
    RemainingAmount: Number(form.RemainingAmount),
    POAmount: form.POAmount,
    ApplicableTaxes: form.ApplicableTaxes,
    PoMaster:form.PoMaster,
    ProjectDescription: form.Comments,
    AssignedTo: AssignedID,
    DepartmentHeadId: Number(Departmenthead),
    Approver2Id: Number(FinanceController) ,
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
      alert("Data Updated Successfully ✅");
    }
  } catch (error) {
    console.error(error);
    alert("Error occurred ❌");
  }
  finally
  {
    setLoading(false);
  }
};

  

// Update
const handleUpdate = async () => {
  setLoading(true);
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
        const dataApprover = await service.GetApproverFromFinance(form.PoMaster);
        if(dataApprover?.Id)
        {
          setApprover2ID(dataApprover.FinanceController?.Id || null);
        }
  const payload = {
    Title:"Testing",
    ProjectCode: form.projectCode,
    ProjectTitle: form.projectTitle,
    VendorName: form.vendorName,
   TotalAmount:Number(form.TotalAmount),
    OccupiedAmount: Number(form.OccupiedAmount),
    RemainingAmount: Number(form.RemainingAmount),
    Department: form.Department,
    POAmount: form.POAmount,

    ApplicableTaxes: form.ApplicableTaxes,
    PoMaster:form.PoMaster,
    ProjectDescription: form.Comments,
    CurrentStatus:'Pending',
    AssignedTo: AssignedID,
    DepartmentHeadId: Number(Departmenthead),
    Approver2Id: Number(FinanceController) ,
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
  finally
  {
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
    <div className={styles.container}>
          <div className={styles.header}>
            <h4>PO Approval Form </h4>          
          </div>
          <div className={styles.row}>
            <div className={styles["col-md-9"]}>
              <div className={styles.leftPanel}>
                <div className={styles.leftPanelHeader}>
                  <h4>PO Approval Form</h4>              
                </div>
       <button style={{backgroundColor:'purple',color:'white',fontSize:'bold',width:'100%'}} onClick={handleDownload}>Download Purchase Order</button>
       <div></div>
        <label>Project Code <span className={styles.required}>*</span> </label>
        <input name="projectCode" value={form.projectCode} onChange={handleRequestNoChange} />

         <label>Department</label>
          <input name="Department" value={form.Department} readOnly style={{backgroundColor:"lightgray"}}  />        

        <label>Project Title</label>
        <input name="projectTitle" value={form.projectTitle} readOnly style={{backgroundColor:"lightgray"}}  />

        <label>Vendor Name</label>
        <input name="VendorName" value={form.vendorName} readOnly style={{backgroundColor:"lightgray"}}  />

        <label>Total Amount</label>
        <input name="TotalAmount" value={form.TotalAmount} onChange={handleChange} readOnly style={{backgroundColor:"lightgray"}}  />

        <label>Occupied Amount</label>
        <input name="OccupiedAmount" value={form.OccupiedAmount} onChange={handleChange} readOnly style={{backgroundColor:"lightgray"}}  />

        <label>Remaining Amount</label>
        <input name="RemainingAmount" value={form.RemainingAmount} onChange={handleChange}readOnly style={{backgroundColor:"lightgray"}}  />

        <label>PO Amount <span className={styles.required}>*</span></label>
        <input name="POAmount" value={form.POAmount} onChange={handlecheckamount} type='number' />

        <label>Applicable Taxes <span className={styles.required}>*</span></label>
        <input name="ApplicableTaxes" value={form.ApplicableTaxes} onChange={handleChange} type='number' />

        <ChoiceGroup
  label="PO Category"
  options={poOptions}
  selectedKey={poOptions.find(opt => opt.text === form.PoMaster)?.key}
  onChange={(_, option) => {
    setForm(prev => ({
      ...prev,
      PoMaster: option?.text || ""  // text store karo
    }));
  }}
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
export default PurchaseOrderRequest;