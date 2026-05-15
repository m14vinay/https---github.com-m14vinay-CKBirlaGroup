import * as React from 'react';
import { useState } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './VendorMappingForm.module.scss';
import { IVendorMappingFormProps } from './IVendorMappingFormProps';
import SharePointService from '../service/Service';
import Service from '../service/Service';
import { Spinner, SpinnerSize, IDropdownOption, Dropdown } from '@fluentui/react';
//import { Dropdown } from 'react-bootstrap';


const VendorMappingForm: React.FC<IVendorMappingFormProps> = (props) => {

  const [form, setForm] = React.useState({
    projectCode: '',
    projectTitle: '',
    projectDescription: '',
    vendorId:0,
    vendorName: '',
    vendorDescription: '',
    files: [] as File[],
    Attachments: [],
    CurrentStatus: '',
    Title: '',
    FID: '',
    Designation: '',
    Department: '',
    UserName: '',
    UserAction: '',
    UserComment: '',
    ActionDate: ''
  });

  const [requestNo, setRequestNo] = React.useState('');
  //const [itemId, setItemId] = React.useState<number>(0);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [projectTitle, setProjectTitle] = React.useState('');
  const [projectDescription, setProjectDescription] = React.useState('');
  const [AssignedTo, setAssignedTo] = React.useState();
  const [AssignedToEmail, setAssignedToEmail] = React.useState();
  const [requestNoError, setRequestNoError] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState('');
  const MAX_TOTAL_SIZE_MB = 51;
  const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [vendorOptions, setVendorOptions] = React.useState<IDropdownOption[]>([]);



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
      loadVendors();
    }
  }, [itemId]);
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

        setForm(prev => ({
          ...prev,
          projectCode: result.ProjectCode || '',
          projectTitle: result.ProjectTitle || '',
          projectDescription: result.ProjectDescription || '',
          vendorName: result.VendorName || '',
          vendorDescription: result.VendorDescription || ''
          //attachments: result.Attachments || []


        }));
        const user = await service.getVendorApprover();
        if (user && user.length > 0 && user[0].Id > 0) {
          setAssignedTo(user[0].Title);
          setAssignedToEmail(user[0].Id);
        }

      } else {
        alert("No Data Found");
      }

    } catch (error) {
      console.error("Error Occurred,Please Contact To System Administrator.:", error);
    }
    finally {
      setLoading(false);
    }
  };



  const loadVendors = async () => {
    try {
      const data = await service.getVendor();
      const options = data.map((item: any) => ({
        key: item.ID,
       // text: 'CKBCSL/' + item.ID + '-' + item.Title,
       text: item.VendorCode + '-' + item.Title,
  
      }));
      setVendorOptions(options);
    } catch (error) {
      console.error("Error loading vendors:", error);
    }
  };

  React.useEffect(() => {
    loadVendors();
  }, []);
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
      //if (!fileExtension || allowedExtensions.indexOf(fileExtension) === -1) {
        //alert(`File Type Not Allowed: ${file.name}. Only PDF, XLSX, DOCX are allowed.`);
        //return; // stop execution
     // }
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

  const removeExistingFile = async (index: number) => {
    const file = attachments[index];
    await service.deleteAttachmentFromSP(file);
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

const handleprojectNoExist = async () => {
  const checkdata = await service.getRequestDetails(form.projectCode);
    if (checkdata != null) {
      setForm(prev => ({
        ...prev,
        projectCode: ''
      }))
      alert(" Please enter correct Project code");
      //return;
    }
  }

  const handleRequestNoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    const errorMsg = validateProjectCode(value);
    setRequestNoError(errorMsg);
    if (errorMsg || !value) {
      setForm(prev => ({
        ...prev,
        projectTitle: '',
        projectDescription: ''
      }));
      return;
    }
    try {
        const check = await service.getItemByProjectCode(value);
    // // 🔒 Safety check
   if (check && check.value && check.value.length > 0 && check.value[0].CurrentStatus === 'Approved') {
      alert("This Project Code is Already Approved.");
        setForm(prev => ({
            ...prev,
           projectCode:''
            }));
      return;
    }
       
      // 🔹 Service call to fetch request details
      const result = await service.getRequestDetails(value);
      if (result.length > 0) {
        if (result[0].CurrentStatus === 'Approved') {
          setForm(prev => ({
            ...prev,
            projectTitle: result[0].ProjectTitle || '',
            projectDescription: result[0].ProjectDescription || '',
            Department: result[0].Department || ''
          }));
        } else {
          alert("This Request is Not Approved.✅");
          setForm(prev => ({
            ...prev,
           projectCode:''
          }));
        }

      }
      else{
         alert("Enter correct project code");
          setForm(prev => ({
            ...prev,
            projectCode:'',
            projectTitle: '',
            projectDescription: '',
            Department: ''
          }));
      }
    }
    catch (error) {
      console.error("Error Fetching Data:", error);
      alert("Error fetching request details");
    }
  };

  // 🔹 Handle input change
  const handleChangeProjectCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();

  setForm(prev => ({
    ...prev,
    projectCode: value
  }));
};

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

const handleChangedescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();

  setForm(prev => ({
    ...prev,
    projectCode: value
  }));
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
        UserAction:UserAction,
        Designation: Designation,
        Sequence: Sequence
      };
    }

    await service.createHistoryItem(payload);
  };

  //SAVE DRAFT DATA

  const handleSaveOrUpdate = async () => {
    // 🔹 Validations
    try {
      setLoading(true);
      if (!form.projectCode) return alert("Enter Project Code");
      if (!form.vendorName) return alert("Please Select Vendor");
      // 🔹 Payload (common)
      const payload = {

        ProjectCode: form.projectCode,
        ProjectTitle: form.projectTitle,
        ProjectDescription: form.projectDescription,
        Department: form.Department,
        VendorName: form.vendorName,
        VendorDescription: form.vendorDescription,
        CurrentStatus: 'Draft',
        AssignedTo: AssignedTo,
        AssignedToEmailId: AssignedToEmail
      };


      if (!itemId) {
        // 🔹 CREATE
        const res = await service.createItem(payload);
        setItemId(res.Id);
        // store ID for future update
        if (res.Id > 0 && form.files.length > 0) {
          for (let i = 0; i < form.files.length; i++) {
            await service.uploadFile(res.Id, form.files[i]);
          }
        }        
        await service.updateItem(res.Id, {
          RequestNo: `VMR-${res.Id}`
        });
        alert("Request Saved Successfully.");
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
        alert("Request Updated Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
      }
    } catch (error) {
      console.error(error);
      alert("Error Occurred,Please Contact To System Administrator.❌");
    }
    finally {
      setLoading(false);
    }
  };

  // SUBMIT DATA
  const handleUpdate = async () => {
      try {
    setLoading(true);
  
      if (!form.projectCode) return alert("Enter Project Code");
      if (!form.vendorName) return alert("Please Select Vendor");

      const currentuser = await service.getUser();
      const users = await service.getVendorApprover();
      const item = users?.Approver?.Id;

      const useremail = await service.getUserById(item);

      const payload = {
        ProjectCode: form.projectCode,
        ProjectDescription: form.projectDescription,
        ProjectTitle: form.projectTitle,
        Department: form.Department,
        VendorName: form.vendorName,
        VendorDescription: form.vendorDescription,
        CurrentStatus: 'Pending',
        AssignedTo: useremail.Title,
        AssignedToEmailId: item
      };

      if (itemId) {
        await service.updateItem(itemId, payload);
        await handleSaveHistory(itemId, 'VMR', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
        await handleSaveHistory(itemId, 'VMR', useremail?.Title, 'Pending', 'Approver', new Date(), 1);
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
      await handleSaveHistory(res.Id, 'VMR', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
       await handleSaveHistory(res.Id, 'VMR', useremail?.Title, 'Pending', 'Approver', new Date(), 1);
        // store ID for future update
        if (res.Id > 0 && form.files.length > 0) {
          for (let i = 0; i < form.files.length; i++) {
            await service.uploadFile(res.Id, form.files[i]);
          }
        }        
        await service.updateItem(res.Id, {
          RequestNo: `VMR-${res.Id}`
        });
        alert("Request Submitted Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
      }
    }


    catch (error) {
      console.error(error);
      alert("Error Occurred,Please Contact To System Administrator.");
    }
    finally {
      setLoading(false);
    }
  };




  // --- RENDER ---
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
          <h4>Vendor Mapping Form </h4>
        </div>
        <div className={styles.row}>
          <div className={styles["col-md-9"]}>
            <div className={styles.leftPanel}>
              <div className={styles.leftPanelHeader}>
                <h4>Vendor Mapping</h4>
              </div>

              <label>Project Code <span className={styles.required}>*</span></label>
              <input name="projectCode" value={form.projectCode} onChange={handleChangeProjectCode} onBlur={handleRequestNoChange} type='uppercase' />
              {requestNoError && <span className={styles.error}>{requestNoError}</span>}

              <label>Project Title</label>
              <input name="projectTitle" value={form.projectTitle} readOnly style={{ backgroundColor: "lightgray" }} />

              <label>Project Description</label>
              <input name="projectDescription" value={form.projectDescription} readOnly style={{ backgroundColor: "lightgray" }} />


              <input name="Department" value={form.Department} readOnly style={{ backgroundColor: "lightgray" }} type="hidden" />

              <label>Select Vendor <span className={styles.required}>*</span></label>
              <Dropdown
                placeholder="Select Vendor"
                options={vendorOptions}
                selectedKey={form.vendorId}
                onChange={(e, option) =>
                  setForm(prev => ({
                    ...prev,
                    vendorId: option?.key as number,
                    vendorName: option?.text as string // safe default empty string
                  }))
                }
              />

              <p>If You Want To Add New Vendor.
                <a
                  href={`${props.context.pageContext.web.absoluteUrl}/SitePages/VendorRegistrationSearch.aspx`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Click Here
                </a>
              </p>
              <label>Additional Information & Remarks</label>
              <input name="vendorDescription" value={form.vendorDescription} onChange={handleChange} />

              <p>If you want to verfiy the document.
                <a
                  href={`${props.context.pageContext.web.absoluteUrl}/SitePages/VendorRegistrationDetails.aspx?RequestId=${form.vendorId}&PageName=VendorMappingForm`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Click Here
                </a>
              </p>
              <label>Attachments </label>
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

              {/* Buttons */}
              <div className={styles.buttonGroup}>
                <button className={styles.submitBtn} onClick={handleUpdate}>Submit</button>
                <button className={styles.saveBtn} onClick={handleSaveOrUpdate}>Save</button>
                <button className={styles.cancelBtn} onClick={handleCancel} >Cancel</button>
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
                      href={`${props.context.pageContext.web.absoluteUrl}/SampleDocuments/CKBCSL_VENDOR_LIST_11.06.18.xlsx`}
                      target="_blank"
                     rel="noopener noreferrer"   >
                 
                      CKBCSL_VENDOR_LIST_11.06.18.xlsx
                    </a>
                  </p>
                  <p>
                    <a
                      href={`${props.context.pageContext.web.absoluteUrl}/SampleDocuments/Vendor_Registration_Form_v1.0.xlsx`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Vendor_Registration_Form_v1.0.xlsx
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
                  <li>​To find your project code, please refer to the home page and
                    'my requests' section. Please take note that the system would not
                    allow to create a vendor mapping or new vendor registration request
                    unless the project code / quotation request is fully approved.</li>
                  <li>Please refer the vendor list excel on this page to choose the right vendor code and vendor name for an existing vendor.
                    In case of any doubt or clarification please connect with Finance Department.</li>
                  <li>In case of a new vendor specify the name of vendor; Finance Department will create the vendor code.</li>
                  <li>Please take note that the vendor list on this page is refreshed every 7 days and thus if you have recently registered a new vendor and its not appearing in the list then please contact Finance Department for the same.</li>
                  <li>Attach all documents (excel form, pdf, emails, scan documents etc) before submitting the form. Once form is submitted it is non-editable. Total attachment size limit is 25 MB.
                    It is recommended that the attachment name to not have spaces in it.</li>
                  <li>System allows only one vendor mapping request per project code. Thus if a vendor mapping request has been raised once with respect to project code then user cannot raise a new request against the same project code unless the vendor mapping request is rejected.
                    In all other scenarios a new project code / quotation request will have to be raised.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VendorMappingForm;