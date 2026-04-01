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
    POCategory: '',
    Comments: '',
   files: [] as File[],
    POrequestNo:'',
    CurrentStatus:''
  });

  const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
  const [vendorOptions, setvendorOptions] = React.useState<IDropdownOption[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const [Approver1ID, setApprover1ID] = React.useState<number | null>(null);
  const [Approver2ID, setApprover2ID] = React.useState<number | null>(null);
  const [Approver3ID, setApprover3ID] = React.useState<number | null>(null);
  const [Approver4ID, setApprover4ID] = React.useState<number | null>(null);
  const [Approver5ID, setApprover5ID] = React.useState<number | null>(null);
  const [Departmenthead, setDepartmenthead] = React.useState<number | null>(null);
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
    // React.useEffect(() => {
    //   const id = getIdFromQueryString();
    //   if (id) {
    //     handleFetchById(id);
    //   }
    // }, []);
  
  
//      const loadAttachments = async (id:number) => {
//       try{
//     const files = await service.getAttachments(id);
//     console.log("Attachments:", files);
//     setAttachments(files);
//       }catch(error)
//       {
//         console.error(error);
//       }
//      };
//      React.useEffect(() => {
//        if (itemId) {
//          loadAttachments(itemId);
        
//        }
//      }, [itemId]);

// //FETCH DATA-----
//   const handleFetchById = async (id: number) => {
//     try {
//       console.log("Calling API with ID:", id);

//       const result = await service.getItemByRequestNo(id);

//       console.log("Result:", result);

//       if (result.CurrentStatus==='Draft') {
//       setItemId(result.Id);

//         setForm(prev => ({
//           ...prev,
//           POrequestNo: result.POrequestNo || '',
//           projectCode: result.ProjectCode || '',
//           Department: result.Department || '',
//           projectTitle: result.ProjectTitle || '',
//           vendorName: result.VendorName || '',
//           POAmount: result.POAmount || 0,
//           ApplicableTaxes: result.ApplicableTaxes || 0,
//           ProjectDescription: result.ProjectDescription || '',
         
//         }));

       

//       } else {
//         alert("No data found");
//       }

//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };


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



const handleRequestNoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  setPORequestNo(value);

  if (!value) return;

  try {
    const result = await service.getRequestDetails(value);
    if (result.length > 0) {
      setDepartment(result[0].Department || '');
      setProjectTitle(result[0].ProjectTitle || '');
      const data=await service.GetApprover(result[0].Department);
      if(data.Id>0){
      setApprover1ID(data.Approval1 ? data.Approval1.Id : null);
      setApprover2ID(data.Approval2 ? data.Approval2.Id : null);  
      setApprover3ID(data.Approval3 ? data.Approval3.Id : null);
      setApprover4ID(data.Approval4 ? data.Approval4.Id : null);
      setApprover5ID(data.Approval5 ? data.Approval5.Id : null);
      setDepartmenthead(data.Departmenthead ? data.Departmenthead.Id : null);        
      }
    } else { 
      setDepartment('');
      setProjectTitle('');
      setApprover1ID(null);
      setApprover2ID(null);
      setApprover3ID(null);
      setApprover4ID(null);
      setApprover5ID(null);
      setDepartmenthead(null);
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

  // 🔹 Load data
  React.useEffect(() => {
    loadDepartments();
    loadVendor();
  }, []);

  const loadDepartments = async () => {
    const data = await service.getDepartments();
    const options = data.map((item: any) => ({
      key: item.Id,
      text: item.DepartmentName
    }));

    setDepartmentOptions(options);
  };

  const loadVendor = async () => {    
    const data = await service.getVendor();
    const options = data.map((item: any) => ({
      key: item.Id,
      text: item.VendorName
    }));

    setvendorOptions(options);
  };

  // 🔹 Handle input change
 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setForm({
    ...form,
    [name]: value
  });
};



//SAVE DRAFT DATA

  const handleSaveOrUpdate = async () => {
  // 🔹 Validations
  if(!POrequestNo) return alert("Project Code required");
    if(!form.POAmount) return alert("Enter POAmount");
    if(!form.ApplicableTaxes) return alert("Enter Applicable Taxes");
    if(!form.POCategory) return alert("Choose POCategory");
     if (!form.files || form.files.length === 0) return alert("Attach files");

  // 🔹 Payload (common)
  const payload = {
    ProjectCode: POrequestNo,
    Department: department,
    ProjectTitle: projectTitle,
    VendorName: 'vinay',
    //TotalAmount:form.TotalAmount,
    //OccupiedAmount: form.OccupiedAmount,
    //RemainingAmount: form.RemainingAmount,
    POAmount: form.POAmount,
    ApplicableTaxes: form.ApplicableTaxes,
    //POCategory: form.POCategory,
    ProjectDescription: form.Comments,
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
   if(!POrequestNo) return alert("Project Code required");
  if(!form.POAmount) return alert("Enter POAmount");
    if(!form.ApplicableTaxes) return alert("Enter Applicable Taxes");
    if(!form.POCategory) return alert("Choose POCategory");
     if (!form.files || form.files.length === 0) return alert("Attach files");
  const payload = {
    Title:"Testing",
    ProjectCode: POrequestNo,
    ProjectTitle: projectTitle,
    VendorName: 'Vinay',
    //RemainingAmount: form.RemainingAmount,
    Department: department,
    POAmount: form.POAmount,
    ApplicableTaxes: form.ApplicableTaxes,
    //POCategory: form.POCategory,
    ProjectDescription: form.Comments,
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
        <input name="projectCode" value={POrequestNo} onChange={handleRequestNoChange} />

        {/* <label>Department</label>
        <Dropdown
          options={departmentOptions}
          selectedKey={form.Department}
          onChange={(e, option) =>
            setForm({ ...form, Department: option?.text as string })
          }
        /> */}
         

         <label>Department</label>
          <input name="Department" value={department} readOnly />
        

        <label>Project Title</label>
        <input name="projectTitle" value={projectTitle} readOnly />

        <label>Select Vendor Name</label>
        <Dropdown
          options={vendorOptions}
          selectedKey={form.vendorNameID}     
          onChange={(e, option) =>
            setForm({ ...form, vendorName: option?.text as string,vendorNameID: option?.key as string, })
          }    
        />

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
  selectedKey={form.POCategory}   // ✅ form se bind karo
  onChange={(e, option) =>{
    if (!option) return;

    setForm(prev => ({
      ...prev,
      POCategory: option.key as string  // '1' or '2'
    }));
  }}
/>

        <label>Additional Information & Remarks</label>
        <input name="Comments" value={form.Comments} onChange={handleChange} />

       <label>Attachments <span className={styles.required}>*</span></label>
       <input type="file" multiple onChange={handleFileChange}  />
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