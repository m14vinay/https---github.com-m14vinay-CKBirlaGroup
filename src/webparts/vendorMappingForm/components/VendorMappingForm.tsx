import * as React from 'react';
import { useState } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './VendorMappingForm.module.scss';
import { IVendorMappingFormProps } from './IVendorMappingFormProps';


// interface IVendorMappingFormProps {
//   context: any; 
//   // SPFx context
// }

interface IFormState {
  requestNo: string;
  requestNoError: string;
  projectTitle: string;
  projectDescription: string;
  vendorName: string;
  vendorDescription: string;
  

}

const VendorMappingForm: React.FC<IVendorMappingFormProps> = ({ context }) => {

  const [state, setState] = useState<IFormState>({
    requestNo: '',
    requestNoError: '',
    projectTitle: '',
    projectDescription: '',
    vendorName: '',
    vendorDescription: '',
    
    //isSubmitted: false
  });

  // --- VALIDATIONS ---
  const validateProjectCode = (value: string): string => {
    if (!value) return 'Project Code is required';
    if (!/^[a-zA-Z0-9-]+$/.test(value)) return 'Project Code must be alphanumeric';
    if (value.length > 10) return 'Project Code must be at most 10 characters';
    return '';
  }

  const validateVendorName = (value: string): string => {
    if (!value) return 'Vendor selection is required';
    return '';
  }

  const validateFiles = (files: FileList | null): string => {
    if (!files || files.length === 0) return 'At least one file is required';
    return '';
  }

  // --- HANDLE FIELD CHANGES ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  }

  const handleRequestNoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const errorMsg = validateProjectCode(value);
    setState(prev => ({ ...prev, requestNo: value, requestNoError: errorMsg }));

    if (!errorMsg) {
      await getRequestDetails(value);
    } else {
      setState(prev => ({ ...prev, projectTitle: '', projectDescription: '' }));
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const errorMsg = validateFiles(files);
    setState(prev => ({ ...prev, files: files, filesError: errorMsg }));
  }
  
  const handleSubmit = () => {
    console.log("Form Data:", state);
    alert("Form Submitted");
};

const handleSave = () => {
    console.log("Saved Data:", state);
    alert("Saved");
};
  // --- GET REQUEST DETAILS ---
  const getRequestDetails = async (requestNo: string) => {
    const url = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items?$filter=RequestNo eq '${requestNo}'`;
    const response: SPHttpClientResponse = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const data = await response.json();

    if (data.value.length > 0) {
      setState(prev => ({
        ...prev,
        projectTitle: data.value[0].ProjectTitle,
        projectDescription: data.value[0].ProjectDescription
      }));
    } else {
      setState(prev => ({ ...prev, projectTitle: '', projectDescription: '' }));
    }
  }

  // --- UPLOAD SINGLE FILE ---
  const uploadFile = async (itemId: number, file: File) => {
    try {
      const url = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VendorMapping')/items(${itemId})/AttachmentFiles/add(FileName='${file.name}')`;

      const response = await context.spHttpClient.post(
        url,
        SPHttpClient.configurations.v1,
        { headers: { "Accept": "application/json;odata=nometadata" }, body: file }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to upload ${file.name}:`, error);
      } else {
        console.log(`File uploaded successfully: ${file.name}`);
      }

    } catch (err) {
      console.error(`Error uploading ${file.name}:`, err);
    }
  }

  // --- UPLOAD ALL FILES ---
  // const uploadAllFiles = async (itemId: number) => {
  //   if (!state.files || state.files.length === 0) return;

  //   const filesArray = Array.from(state.files);
  //   for (const file of filesArray) {
  //     await uploadFile(itemId, file);
  //   }

  //   alert("All attachments uploaded ✅");
  // }

  
 



  // --- SAVE DATA ---
  const saveData = async () => {
    // Validations
    if (!state.requestNo) return alert("Project Code required");
    if (!state.vendorName) return alert("Select Vendor");
    //if (!state.files || state.files.length === 0) return alert("Attach files");

    const url = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VendorMapping')/items`;
    const body = {
      ProjectCode: state.requestNo,
      ProjectTitle: state.projectTitle,
      ProjectDescription: state.projectDescription,
      VendorName: state.vendorName,
      VendorDescription: state.vendorDescription
    
    };
    const response = await context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
  headers: {
    "Accept": "application/json;odata=nometadata",
    "Content-Type": "application/json;odata=nometadata",
    "odata-version": ""
  },
  body: JSON.stringify(body)
});
if (response.ok) {
    let result = null;
    try {
      result = await response.json();
    } catch {
      console.warn("No JSON returned. Possibly empty body from SharePoint.");
    }

    // const itemId = result?.Id; // optional chaining
    // if (!itemId) {
    //   alert("Item created, but cannot retrieve Id for attachments.");
    //   return;
    // }

    // await uploadAllFiles(itemId);

    //setState(prev => ({ ...prev, isSubmitted: true }));
    alert("Data Submitted & Files Uploaded ✅");
  } 
  else {
    const error = await response.text();
    console.error(error);
    alert("Error saving data ❌");
  }
};







  const isFormInvalid = !!state.requestNoError  || !state.requestNo || !state.vendorName ;

  // --- RENDER ---
  return (
    <div className={styles.container}>

      <div className={styles.leftPanel}>
        <h2>Vendor Mapping Form</h2>
        <h4>Vendor Mapping / New Vendor Registration Form</h4>

        <label>Project Code <span className={styles.required}>*</span></label>
        <input name="requestNo" value={state.requestNo} onChange={handleRequestNoChange} />
        {state.requestNoError && <span className={styles.error}>{state.requestNoError}</span>}

        <label>Project Title</label>
        <input name="projectTitle" value={state.projectTitle} readOnly />

        <label>Project Description</label>
        <input name="projectDescription" value={state.projectDescription} readOnly />

        <label>Select Vendor <span className={styles.required}>*</span></label>
        <select name="vendorName" value={state.vendorName} onChange={handleChange}>
          <option value="">Select Vendor</option>
          <option value="Vendor1">Vendor 1</option>
          <option value="Vendor2">Vendor 2</option>
        </select>

        <label>Additional Information & Remarks</label>
        <textarea name="vendorDescription" value={state.vendorDescription} onChange={handleChange} />

        {/* <label>Attach Documents <span className={styles.required}>*</span></label>
        <input type="file" multiple onChange={handleFileChange} />
        {state.filesError && <span className={styles.error}>{state.filesError}</span>} */}

       {/* Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.submitBtn} onClick={handleSubmit}>Submit</button>
            <button className={styles.saveBtn} onClick={saveData}>Save</button>
            <button className={styles.cancelBtn}>Cancel</button>
          </div>
        </div>

      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <h4>Templates</h4>
          <ul>
            <li>Vendor_Registration_Form_v1.0.xlsx</li>
            <li>SOP_Procurement_of_Goods_Services.pdf</li>
            <li>DigiFlow_Training_Manual.pdf</li>
          </ul>
        </div>

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
}

export default VendorMappingForm;