import * as React from 'react';
import type { IVendorRegistrationManuallyProps } from './IVendorRegistrationManuallyProps';
import { escape } from '@microsoft/sp-lodash-subset';
import styles from './VendorRegistrationManually.module.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
import * as XLSX from 'xlsx';

const VendorRegistrationManually: React.FC<IVendorRegistrationManuallyProps> = (props) => {
  const [isActiveExcel, setIsActiveExcel] = React.useState(false);
  const [isActiveManual, setIsActiveManual] = React.useState(false);
  const [itemId, setItemId] = React.useState<number>(0);
  const service = new SharePointService(props.context);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const MAX_TOTAL_SIZE_MB = 25;
  const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  //  Define State
  const [form, setForm]=React.useState({
      Title: '',
      YearofEstablishment: '',
      CommencementDate: new Date(),
      GST:'',
      Pan: '',
      Tin:'',
      CentralSalesTaxNo:'',
      ServiceTaxRegNo:'',
      NatureofService:'',
      MSMERegistrationNo:'',
      ESICNo:'',
      ExciseRegisterNo:'',
      WorkContractTaxNo:'',
      FullAddress:'',
      TelephoneNo:'',
      FaxNo:'',
      EmailId:'',
      ContactPerson:'',
      RegFullAddress:'',
      RegTelephoneNo:'',
      RegFaxNo:'',
      RegEmailId:'',
      RegContactPerson:'',
      Manufacturer:'',
      AuthorizedAgent:'',
      Trader:'',
      ConsultingCompany:'',
      Other:'',
      ConstitutionofOrganization:'',
      Name:'',
      Address:'',
      ContactNo:'',
      Details:'',
      BankName:'',
      BankAddress:'',
      NameinBankAccount:'',
      BankAccountNo:'',
      BankIFSCMICRCode:'',
      CurrentStatus:'',
      files: [] as File[],
      UploadExcelFile:[]as File[]
    });
  // Get Value From Query String
  const getIdFromQueryString = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('RequestId');
    return id ? parseInt(id, 10) : null;
  };
  // Load on Mount
  React.useEffect(() => {
    const id = getIdFromQueryString();
    if (id!=null) {
      setItemId(id);
      handleFetchById(id);
      loadAttachments(id);
    }
    else{
      setItemId(0);
      setIsActiveExcel(true);
    }
  },[]);
  // Load Attachments
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
// Delete Attachment
const removeExistingFile = async (index: number) => {
  const file = attachments[index];
  await service.deleteAttachmentFromSP(file);
  setAttachments(prev => prev.filter((_, i) => i !== index));
};
  // Fetch Detail by ID
  const handleFetchById = async (id: number) => {
    try {
      console.log("Calling API with ID:", id);
      const result = await service.getItemByID(id);
      console.log("Result:", result);
      if (result) {
        setItemId(result.Id);
        setForm(prev => ({
        ...prev,
          Title:result.Title || '',
          YearofEstablishment: result.YearofEstablishment || '',
      GST: result.GST || '',
      CommencementDate: result.CommencementDate || '',
      Pan: result.Pan || '',
      Tin:result.Tin || '',
      CentralSalesTaxNo:result.CentralSalesTaxNo || '',
      ServiceTaxRegNo:result.ServiceTaxRegNo || '',
      NatureofService:result.NatureofService || '',
      MSMERegistrationNo:result.MSMERegistrationNo || '',
      ESICNo:result.ESICNo || '',
      ExciseRegisterNo:result.ExciseRegisterNo || '',
      WorkContractTaxNo:result.WorkContractTaxNo || '',
      FullAddress:result.FullAddress || '',
      TelephoneNo:result.TelephoneNo || '',
      FaxNo:result.FaxNo || '',
      EmailId:result.EmailId || '',
      ContactPerson:result.ContactPerson || '',
      RegFullAddress:result.RegFullAddress || '',
      RegTelephoneNo:result.RegTelephoneNo || '',
      RegFaxNo:result.RegFaxNo || '',
      RegEmailId:result.RegEmailId || '',
      RegContactPerson:result.RegContactPerson || '',
      Manufacturer:result.Manufacturer || '',
      AuthorizedAgent:result.AuthorizedAgent || '',
      Trader:result.Trader || '',
      ConsultingCompany:result.ConsultingCompany || '',
      Other:result.Other || '',
      ConstitutionofOrganization:result.ConstitutionofOrganization || '',
      Name:result.Name || '',
      Address:result.Address || '',
      ContactNo:result.ContactNo || '',
      Details:result.Details || '',
      BankName:result.BankName || '',
      BankAddress:result.BankAddress || '',
      NameinBankAccount:result.NameinBankAccount || '',
      BankAccountNo:result.BankAccountNo || '',
      BankIFSCMICRCode:result.BankIFSCMICRCode || '',
      CurrentStatus:result.CurrentStatus || '',
        }));
      } else {
        alert("No data found");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    finally
    {
      setLoading(false);
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  // Upload ExcelFile Check
  const handleExcelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target?.files;
  if (!files) return;
  const allowedExtensions = ['xlsx'];
  const filesArray = Array.from(files);
  // 🔹 Check each file
  for (let file of filesArray) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || allowedExtensions.indexOf(fileExtension) === -1) {
      alert(`File type not allowed: ${file.name}. Only XLSX is allowed.`);
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
    UploadExcelFile: [...prev.UploadExcelFile, ...filesArray]
  }));
  };
  // Handle input change
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };
  
  // Date Change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "CommencementDate" ? new Date(value) : value
    });
  };
  const handleUpload = async () => {  
    setIsActiveExcel(true);
    setIsActiveManual(false);
    setForm({...form});
  };
  const handleFill = async () => {
     setIsActiveExcel(false);
     setIsActiveManual(true);
     setForm({...form});
  };
  // Button click save
  const handleSaveManual = async () => {
  const dateOnly  = new Date(form.CommencementDate);
  const payload = {
      Title: form.Title,
      YearofEstablishment: form.YearofEstablishment,
      CommencementDate: dateOnly,
      GST:form.GST,
      Pan: form.Pan,
      Tin:form.Tin,
      CentralSalesTaxNo:form.CentralSalesTaxNo,
      ServiceTaxRegNo:form.ServiceTaxRegNo,
      NatureofService:form.NatureofService,
      MSMERegistrationNo:form.MSMERegistrationNo,
      ESICNo:form.ESICNo,
      ExciseRegisterNo:form.ExciseRegisterNo,
      WorkContractTaxNo:form.WorkContractTaxNo,
      FullAddress:form.FullAddress,
      TelephoneNo:form.TelephoneNo,
      FaxNo:form.FaxNo,
      EmailId:form.EmailId,
      ContactPerson:form.ContactPerson,
      RegFullAddress:form.RegFullAddress,
      RegTelephoneNo:form.RegTelephoneNo,
      RegFaxNo:form.RegFaxNo,
      RegEmailId:form.RegEmailId,
      RegContactPerson:form.RegContactPerson,
      Manufacturer:form.Manufacturer,
      AuthorizedAgent:form.AuthorizedAgent,
      Trader:form.Trader,
      ConsultingCompany:form.ConsultingCompany,
      Other:form.Other,
      ConstitutionofOrganization:form.ConstitutionofOrganization,
      Name:form.Name,
      Address:form.Address,
      ContactNo:form.ContactNo,
      Details:form.Details,
      BankName:form.BankName,
      BankAddress:form.BankAddress,
      NameinBankAccount:form.NameinBankAccount,
      BankAccountNo:form.BankAccountNo,
      BankIFSCMICRCode:form.BankIFSCMICRCode,
      CurrentStatus:'Draft'
  };
  try {    
      setLoading(true);      
      if(Number(itemId)==0)
      {
      const res = await service.createItem(payload);
      setItemId(res.Id); 
      if(res.Id>0){      
      if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(res.Id, form.files[i]);
      }
    }
      alert("Data Saved Successfully✅");
  }  
  else{
    alert("Data Not Saved.");
  }
      }
      else{
      const result=await service.updateItem(itemId, payload);
      if (form.files.length > 0) {
        for (let i = 0; i < form.files.length; i++) {
          await service.uploadFile(itemId, form.files[i]);
        }
      }
      alert("Data Updated Successfully ✅");
      }
  } catch (error) {
    console.error(error);
    alert("Error occurred");
  }
  finally{
    setLoading(false);
  }
  };
  // Button click submit Manual
    const handleSubmitManual = async () => {  
    try {
    const dateOnly  = new Date(form.CommencementDate);
    const payload = {
      Title: form.Title,
      YearofEstablishment: form.YearofEstablishment,
      CommencementDate: dateOnly,
      GST:form.GST,
      Pan: form.Pan,
      Tin:form.Tin,
      CentralSalesTaxNo:form.CentralSalesTaxNo,
      ServiceTaxRegNo:form.ServiceTaxRegNo,
      NatureofService:form.NatureofService,
      MSMERegistrationNo:form.MSMERegistrationNo,
      ESICNo:form.ESICNo,
      ExciseRegisterNo:form.ExciseRegisterNo,
      WorkContractTaxNo:form.WorkContractTaxNo,
      FullAddress:form.FullAddress,
      TelephoneNo:form.TelephoneNo,
      FaxNo:form.FaxNo,
      EmailId:form.EmailId,
      ContactPerson:form.ContactPerson,
      RegFullAddress:form.RegFullAddress,
      RegTelephoneNo:form.RegTelephoneNo,
      RegFaxNo:form.RegFaxNo,
      RegEmailId:form.RegEmailId,
      RegContactPerson:form.RegContactPerson,
      Manufacturer:form.Manufacturer,
      AuthorizedAgent:form.AuthorizedAgent,
      Trader:form.Trader,
      ConsultingCompany:form.ConsultingCompany,
      Other:form.Other,
      ConstitutionofOrganization:form.ConstitutionofOrganization,
      Name:form.Name,
      Address:form.Address,
      ContactNo:form.ContactNo,
      Details:form.Details,
      BankName:form.BankName,
      BankAddress:form.BankAddress,
      NameinBankAccount:form.NameinBankAccount,
      BankAccountNo:form.BankAccountNo,
      BankIFSCMICRCode:form.BankIFSCMICRCode,
      CurrentStatus:'Completed'
    };
    if (itemId) {       
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
    else{
     const res= await service.createItem(payload);
     if(res.Id>0)
     {
     if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(itemId, form.files[i]);
      }
      alert("Data Submitted Successfully ✅");    
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
    window.location.assign(url);  
     }
    }    
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
   // Button click submit Upload
  const handleSubmitUpload = async (event: any) => {  
  try{
  setLoading(true);
  const file = form.UploadExcelFile?.[0];
  
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  console.log(jsonData);
  const res =await service.saveToSharePoint(jsonData);
  if(res.Id>0)
  {   setItemId(res.Id);  
      if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        await service.uploadFile(res.Id, form.files[i]);
      }
    }  
    alert("Data Submitted Successfully ✅");    
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
    window.location.assign(url);  
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
  // Button click cancel
    const handleCancel = async () => {
      const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
      window.location.assign(url);
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
            <h2>New Vendor Registration
              <span>Digiflow / All Vendor List / New Vendor Registration</span>
            </h2>
          </div>
          <div className={styles.row}>
            <div className={styles['col-md-9']}>
              <div className={styles.searchBox}>
                <h3>New Vendor Registration</h3>
                <div className={styles.container}>
                  <div className={styles.row}>
                    <div className={styles['col-md-12']}>
                      <div className={styles.btnBox}>
                        <div className={styles.btnUpload} onClick={handleUpload} style={{backgroundColor:isActiveExcel?"lightblue":"grey"}}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" className="bi bi-file-earmark-excel-fill" viewBox="0 0 16 16">
                            <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64" />
                          </svg>
                          <span>Upload Vendor Registration Excel</span>
                        </div>
                        <div className={styles.btnFill} onClick={handleFill} style={{backgroundColor:isActiveManual?"lightblue":"grey"}}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" className="bi bi-person-lines-fill" viewBox="0 0 16 16">
                            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z" />
                          </svg>
                          <span>Manually Fill All Details</span>
                        </div>
                      </div>
                    </div>
                    <div id="Manual" style={{display:isActiveManual?'block':'none'}}>
                      <div className="accordion" id="accordionPanelsStayOpenExample">
                        <div className={styles["accordion-item"]}>
                          <h2 className="accordion-header">
                            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                              General Information
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show">
                            <div className={styles["accordion-body"]}>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Name of the Vendor</label>
                                  <input style={{width: '100%'}} name='Title' value={form.Title} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Year of Establishment</label>
                                  <input style={{width: '100%'}} name='YearofEstablishment' value={form.YearofEstablishment} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Date of Commencement of Business</label>
                                  <input style={{width: '100%'}} 
                                  name="CommencementDate"
            type="date"
            value={
              form.CommencementDate
                ? new Date(form.CommencementDate).toISOString().split('T')[0]
                : ''
            }
            onChange={handleDateChange} className='form-control' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>GST</label>
                                  <input style={{width: '100%'}} name='GST' value={form.GST} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>PAN</label>
                                  <input style={{width: '100%'}} name='Pan' value={form.Pan} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>TIN</label>
                                  <input style={{width: '100%'}} name='Tin' value={form.Tin} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Central Sales Tax No.</label>
                                  <input style={{width: '100%'}} name='CentralSalesTaxNo' value={form.CentralSalesTaxNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Service Tax Regd No.</label>
                                  <input style={{width: '100%'}} name='ServiceTaxRegNo' value={form.ServiceTaxRegNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Nature of Services/Goods</label>
                                  <input style={{width: '100%'}} name='NatureofService' value={form.NatureofService} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>MSME Registration No.</label>
                                  <input style={{width: '100%'}} name='MSMERegistrationNo' value={form.MSMERegistrationNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>ESIC No.</label>
                                  <input style={{width: '100%'}} name='ESICNo' value={form.ESICNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Excise Registration No.</label>
                                  <input style={{width: '100%'}} name='ExciseRegisterNo' value={form.ExciseRegisterNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Work Contract Tax No</label>
                                  <input style={{width: '100%'}} name='WorkContractTaxNo' value={form.WorkContractTaxNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles["accordion-item"]}>
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                              Address of the organization from where material will be supplied/services will be provided
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse">
                            <div className={styles["accordion-body"]}>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Full Address</label>
                                  <input style={{width: '100%'}} name='FullAddress' value={form.FullAddress} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Telephone No.</label>
                                  <input style={{width: '100%'}} name='TelephoneNo' value={form.TelephoneNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Fax No.</label>
                                  <input style={{width: '100%'}} name='FaxNo' value={form.FaxNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Email ID</label>
                                  <input style={{width: '100%'}} name='EmailId' value={form.EmailId} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Contacted Person</label>
                                  <input style={{width: '100%'}} name='ContactPerson' value={form.ContactPerson} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles["accordion-item"]}>
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
                              Address of the Registered Office
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseThree" className="accordion-collapse collapse">
                            <div className={styles["accordion-body"]}>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Registered Full Address</label>
                                  <input style={{width: '100%'}} name='RegFullAddress' value={form.RegFullAddress} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Registered Telephone No.</label>
                                  <input style={{width: '100%'}} name='RegTelephoneNo' value={form.RegTelephoneNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Registered Fax No.</label>
                                  <input style={{width: '100%'}} name='RegFaxNo' value={form.RegFaxNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Registered Email ID</label>
                                  <input style={{width: '100%'}} name='RegEmailId' value={form.RegEmailId} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Registered Contacted Person</label>
                                  <input style={{width: '100%'}} name='RegContactPerson' value={form.RegContactPerson} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles["accordion-item"]}>
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFour" aria-expanded="false" aria-controls="panelsStayOpen-collapseFour">
                              Constitution of Organization
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseFour" className="accordion-collapse collapse">
                            <div className={styles["accordion-body"]}>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Whether Proprietary or Partnership firm or Pvt. Ltd. Or Public Ltd.</label>
                                  <input style={{width: '100%'}} name='ConstitutionofOrganization' value={form.ConstitutionofOrganization} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles["accordion-item"]}>
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFive" aria-expanded="false" aria-controls="panelsStayOpen-collapseFive">
                              Nature of Business
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseFive" className="accordion-collapse collapse">
                            <div className={styles["accordion-body"]}>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Manufacturer</label>
                                  <input style={{width: '100%'}} name='Manufacturer' value={form.Manufacturer} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Authorized Agent</label>
                                  <input style={{width: '100%'}} name='AuthorizedAgent' value={form.AuthorizedAgent} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Trader</label>
                                  <input style={{width: '100%'}} name='Trader' value={form.Trader} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Consulting</label>
                                  <input style={{width: '100%'}} name='ConsultingCompany' value={form.ConsultingCompany} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Other(Specify)</label>
                                  <input style={{width: '100%'}} name='Other' value={form.Other} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles["accordion-item"]}>
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseSix" aria-expanded="false" aria-controls="panelsStayOpen-collapseSix">
                              Details of Proprietor / Partners / Directors
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseSix" className="accordion-collapse collapse">
                            <div className={styles["accordion-body"]}>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Name</label>
                                  <input style={{width: '100%'}} name='Name' value={form.Name} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Address</label>
                                  <input style={{width: '100%'}} name='Address' value={form.Address} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Contact No.</label>
                                  <input style={{width: '100%'}} name='ContactNo' value={form.ContactNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles["accordion-item"]}>
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseSeven" aria-expanded="false" aria-controls="panelsStayOpen-collapseSeven">
                              Conflict of interest
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseSeven" className="accordion-collapse collapse">
                            <div className={styles["accordion-body"]}>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Details (if any)</label>
                                  <input style={{width: '100%'}} name='Details' value={form.Details} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles["accordion-item"]}>
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseEight" aria-expanded="false" aria-controls="panelsStayOpen-collapseEight">
                              Details of Banks Accounts
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseEight" className="accordion-collapse collapse">
                            <div className={styles["accordion-body"]}>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Bank Name</label>
                                  <input style={{width: '100%'}} name='BankName' value={form.BankName} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Branch Address</label>
                                  <input style={{width: '100%'}} name='BankAddress' value={form.BankAddress} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}> 
                                  <label style={{width: '50%'}}>Name as appearing in account</label>
                                  <input style={{width: '100%'}} name='NameinBankAccount' value={form.NameinBankAccount} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Bank Account No.</label>
                                  <input style={{width: '100%'}} name='BankAccountNo' value={form.BankAccountNo} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Bank IFSC/MICR code</label>
                                  <input style={{width: '100%'}} name='BankIFSCMICRCode' value={form.BankIFSCMICRCode} onChange={handleChange} className='form-control' type='text' />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles["accordion-item"]}>
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTen" aria-expanded="false" aria-controls="panelsStayOpen-collapseTen">
                              Uploaded Documents
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseTen" className="accordion-collapse collapse">
                            <div className={styles["accordion-body"]}>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
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
                                </div>
                              </div>                              
                            </div>
                          </div>
                        </div>
                        <div className={styles["accordion-item"]}>
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseNine" aria-expanded="false" aria-controls="panelsStayOpen-collapseNine">
                              Upload Documents
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseNine" className="accordion-collapse collapse">
                            <div className={styles["accordion-body"]}>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Partnership Deed or Memorandum of Article of Association</label>
                                  <input style={{width: '100%'}} name="filesDeedManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>MSME Registration Certificate</label>
                                  <input style={{width: '100%'}} name="filesMSMEManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Factory License</label>
                                  <input style={{width: '100%'}} name="filesLicenseManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>ISO 9001 Certificates</label>
                                  <input style={{width: '100%'}} name="filesISOManual" type="file" multiple onChange={handleFileChange}  />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Bank IFSC/MICR code</label>
                                  <input style={{width: '100%'}} name="filesIFSCManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Copy of Pan</label>
                                  <input style={{width: '100%'}} name="filesPanManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Service Tax Registration</label>
                                  <input style={{width: '100%'}} name="filesServiceManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>VAT/CST Registration</label>
                                  <input style={{width: '100%'}} name="filesVATManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Telephone and Electricity Bill</label>
                                  <input style={{width: '100%'}} name="filesTelephonManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Name and Address of All Partners/ Directors</label>
                                  <input style={{width: '100%'}} name="filesNameManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Cancelled cheque</label>
                                  <input style={{width: '100%'}} name="filesCancelManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Registration Certificate with any other authority (if required)</label>
                                  <input style={{width: '100%'}} name="filesRegCertManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Any other document (as per the nature of the transaction/vendor)</label>
                                  <input style={{width: '100%'}} name="filesOtherManual" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles['btn-group']}>
                        <button className={styles.ApproveBtn} onClick={handleSubmitManual}>Submit</button>&nbsp;
                        <button className={styles.ApproveBtn} onClick={handleSaveManual}>Save</button>&nbsp;
                        <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                      </div>
                    </div>
                    <div id="Excel" style={{display:isActiveExcel?'block':'none'}}>
                         <div className={styles["accordion-item"]}>
                          <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Upload Vendor Registration Form</label>
                                  <input style={{width: '100%'}} name="UploadExcelFile" accept=".xlsx, .xls" type="file" multiple onChange={handleExcelFileChange} />
                                </div>
                          </div>
                          <div className={styles['col-md-12']}>
                            <h3>Upload Documents</h3>
                          </div>                         
                            <div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Partnership Deed or Memorandum of Article of Association</label>
                                  <input style={{width: '100%'}} name="filesDeedExcel" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>MSME Registration Certificate</label>
                                  <input style={{width: '100%'}} name="filesMSMEExcel" type="file" multiple onChange={handleFileChange}  />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Factory License</label>
                                  <input style={{width: '100%'}} name="filesLicenseExcel" type="file" multiple onChange={handleFileChange}  />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>ISO 9001 Certificates</label>
                                  <input style={{width: '100%'}} name="filesISOExcel" type="file" multiple onChange={handleFileChange}  />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Bank IFSC/MICR code</label>
                                  <input style={{width: '100%'}} name="filesIFSCExcel" type="file" multiple onChange={handleFileChange}  />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Copy of Pan</label>
                                  <input style={{width: '100%'}} name="filesPanExcel" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Service Tax Registration</label>
                                  <input style={{width: '100%'}} name="filesServiceExcel" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>VAT/CST Registration</label>
                                  <input style={{width: '100%'}} name="filesVATExcel" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Telephone and Electricity Bill</label>
                                  <input style={{width: '100%'}} name="filesTelephoneExcel" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Name and Address of All Partners/ Directors</label>
                                  <input style={{width: '100%'}} name="filesNameExcel" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Cancelled cheque</label>
                                  <input style={{width: '100%'}} name="filesCancelExcel" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Registration Certificate with any other authority (if required)</label>
                                  <input style={{width: '100%'}} name="filesRegCerExcel" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                              <div className={styles['col-md-12']}>
                                <div className={styles["formGroup"]}>
                                  <label style={{width: '50%'}}>Any other document (as per the nature of the transaction/vendor)</label>
                                  <input style={{width: '100%'}} name="filesOtherExcel" type="file" multiple onChange={handleFileChange} />
                                </div>
                              </div>
                            </div>                          
                        </div>
                        <div className={styles['btn-group']}>
                        <button className={styles.ApproveBtn} onClick={handleSubmitUpload}>Submit</button>&nbsp;
                        <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                      </div>
                    </div>
                  </div>                  
                </div>
              </div>
            </div>
            <div className={styles['col-md-3']}>
              {/* Templates */}
              <div className={styles.searchBox}>
                <h3>Templates</h3>
                <ol>
                  <li>Vendor Registration Form_v1.0.</li>
                </ol>
              </div>
              {/* Guidelines */}
              <div className={styles.searchBox}>
                <h3>Importance Guidelines</h3>
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
      </section>
    );
};
export default VendorRegistrationManually;