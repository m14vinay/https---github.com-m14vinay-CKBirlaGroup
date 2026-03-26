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
    projectTitle: '',
    VendorName: '',
    vendorNameID:'',
    RemainingAmount: '',
    TotalAmount:'',
    OccupiedAmount:'',
    Department: '',
    DepartmentID:'',
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

  // Save Data
  const handleSave = async () => {
  const payload = {
    Title:"Testing",
    ProjectCode: form.projectCode,
    ProjectTitle: form.projectTitle,
    VendorName: form.VendorName,
    //RemainingAmount: form.RemainingAmount,
    Department: form.Department,
    POAmount: form.POAmount,
    ApplicableTaxes: form.ApplicableTaxes,
    //POCategory: form.POCategory,
    ProjectDescription: form.Comments
  };
  try {    
      // CREATE
      const res = await service.createItem(payload);
      if(res.ok){
      setItemId(res.Id); 
      if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(res.Id, form.files[i]);
      }
    }
      alert("Data Saved Successfully ✅");  
  }  
  else{
    alert("Data Not Saved.");
  }
  } catch (error) {
    console.error(error);
    alert("Error occurred ❌");
  }
};

// Update
const handleUpdate = async () => {
  const payload = {
    projectCode: form.projectCode,
    projectTitle: form.projectTitle,
    vendorName: form.VendorName,
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

  // 🔹 UI
  return (
    <div className={styles.container}>

      <div className={styles.leftPanel}>
        <h2>PO Approval Request Form</h2>
        <h4>PO Approval / Request Form</h4>

        <label>Project Code</label>
        <input name="projectCode" value={form.projectCode} onChange={handleChange} />

        <label>Department</label>
        <Dropdown
          options={departmentOptions}
          selectedKey={form.DepartmentID}
          onChange={(e, option) =>
            setForm({ ...form, Department: option?.text as string,DepartmentID: option?.key as string, })
          }
        />

        <label>Project Title</label>
        <input name="projectTitle" value={form.projectTitle} onChange={handleChange} />

        <label>Select Vendor Name</label>
        <Dropdown
          options={vendorOptions}
          selectedKey={form.vendorNameID}     
          onChange={(e, option) =>
            setForm({ ...form, VendorName: option?.text as string,vendorNameID: option?.key as string, })
          }    
        />

        <label>Total Amount</label>
        <input name="TotalAmount" type='number' value={form.TotalAmount} onChange={handleChange} />

        <label>Occupied Amount</label>
        <input name="OccupiedAmount" type='number' value={form.OccupiedAmount} onChange={handleChange} />

        <label>Remaining Amount</label>
        <input name="RemainingAmount" type='number' value={form.RemainingAmount} onChange={handleChange} />

        <label>PO Amount</label>
        <input name="POAmount" type='number' value={form.POAmount} onChange={handleChange} />

        <label>Applicable Taxes</label>
        <input name="ApplicableTaxes"  type='number' value={form.ApplicableTaxes} onChange={handleChange} />

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