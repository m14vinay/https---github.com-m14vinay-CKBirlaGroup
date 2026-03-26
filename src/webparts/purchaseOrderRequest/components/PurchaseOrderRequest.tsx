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
    POrequestNo: '',
    projectCode: '',
    department:'',
    projectTitle: '',
    vendorName: '',
    RemainingAmount: '',
    TotalAmount:'',
    OccupiedAmount:'',
    Department: '',
    POAmount: '',
    ApplicableTaxes: '',
    POCategory: '',
    Comments: '',
    files: null as FileList | null
  });

  const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
  const [vendorOptions, setvendorOptions] = React.useState<IDropdownOption[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
   const [POrequestNo, setPORequestNo] = React.useState('');
  const [POrequestNoError, setPORequestNoError] = React.useState('');
  const [department, setDepartment] = React.useState('');
    const [projectTitle, setProjectTitle] = React.useState('');
const handleCancel = () => {
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
  window.location.assign(url);
};
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({
    ...form,
    files: e.target.files
  });
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
    } else {
      setDepartment('');
      setProjectTitle('');
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
      text: item.Title
    }));

    setDepartmentOptions(options);
  };

  const loadVendor = async () => {    
    const data = await service.getVendor();
    const options = data.map((item: any) => ({
      key: item.Id,
      text: item.Title
    }));

    setvendorOptions(options);
  };

  // 🔹 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setForm({
    ...form,
    [name]: value === '' ? 0 : isNaN(Number(value)) ? value : Number(value)
  });
};

  // Save Data
  const handleSave = async () => {
  const payload = {
    projectCode: form.projectCode,
    projectTitle: form.projectTitle,
    vendorName: form.vendorName,
    RemainingAmount: form.RemainingAmount,
    Department: form.Department,
    POAmount: form.POAmount,
    ApplicableTaxes: form.ApplicableTaxes,
    POCategory: form.POCategory,
    Comments: form.Comments
  };
  try {    
      // 🔥 CREATE
      const res = await service.createItem(payload);
      setItemId(res.Id); 
      if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(res.Id, form.files[i]);
      }
    }
      alert("Data Saved Successfully ✅");    
  } catch (error) {
    console.error(error);
    alert("Error occurred ❌");
  }
};

// Update
const handleUpdate = async () => {
  const payload = {
    POrequestNo: form.POrequestNo,
    projectCode: form.projectCode,
    projectTitle: form.projectTitle,
    vendorName: form.vendorName,
    RemainingAmount: form.RemainingAmount,
    Department: form.Department,
    POAmount: form.POAmount,
    ApplicableTaxes: form.ApplicableTaxes,
    POCategory: form.POCategory,
    Comments: form.Comments
  };
  try {
    if (itemId) {
      // 🔥 UPDATE
    const result=  await service.updateItem(itemId, payload);
    if (form.files && form.files.length > 0) {
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




const validatePO = (value: string) => {
    if (!value) return "Project Code is required";
    if (!/^[a-zA-Z0-9-]+$/.test(value)) return "Only alphanumeric allowed";
    return "";
  };

   // 🔹 Handle change
  // const handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;

  //   setPORequestNo(value);

  //   const error = validatePO(value);
  //   setPORequestNoError(error);

  //   // Example: auto fill department
  //   if (!error) {
  //     setDepartment("IT Department"); // dummy
  //   } else {
  //     setDepartment("");
  //   }
  // };

  // 🔹 UI
  return (
    <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h2>PO Approval Mapping Form</h2>
          <label>Project Code <span className={styles.required}>*</span></label>
           <input
          name="PorequestNo"
          value={POrequestNo}
          onChange={handleRequestNoChange}
          className={POrequestNoError ? styles.inputError : ""}
        />

        {POrequestNoError && (
          <span className={styles.error}>{POrequestNoError}</span>
        )}
         
        
          <label>Department</label>
          <input name="Department" value={department} readOnly  />

        <label>Project Title</label>
        <input name="projectTitle" value={projectTitle} readOnly />

        <label>Select Vendor Name</label>
        <Dropdown
          options={vendorOptions}
          selectedKey={form.vendorName}
          onChange={(e, option) =>
            setForm({ ...form, vendorName: option?.text as string })
          }
        />

        <label>Total Amount</label>       
        <input
  name="TotalAmount"/>

        <label>Occupied Amount</label>
        <input name="OccupiedAmount"  />

        <label>Remaining Amount</label>
        <input name="RemainingAmount"  />

        <label>PO Amount</label>
        <input name="POAmount"   />

        <label>Applicable Taxes</label>
        <input name="ApplicableTaxes" />

        <ChoiceGroup
          label="PO Category"
          options={poOptions}
          selectedKey={form.POCategory}
          onChange={(e, option) =>
            setForm({ ...form, POCategory: option?.key as string })
          }
        />

        <label>Additional Information & Remarks</label>
        <input name="Comments" value={form.Comments} onChange={handleChange} />

        <label>Attachments</label>
       <input type="file" multiple onChange={handleFileChange} />

        <div className={styles.buttonGroup}>          
          <button className={styles.submitBtn} onClick={handleSave}>Submit</button>
          <button className={styles.saveBtn} onClick={handleSave}>Save</button>
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