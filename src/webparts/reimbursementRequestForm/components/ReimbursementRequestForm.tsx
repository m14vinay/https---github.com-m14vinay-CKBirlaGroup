import * as React from 'react';
import styles from './ReimbursementRequestForm.module.scss';
import type { IReimbursementRequestFormProps } from './IReimbursementRequestFormProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import { Checkbox, Modal, PrimaryButton } from '@fluentui/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
const ReimbursementRequestForm: React.FC<IReimbursementRequestFormProps> = (props) => {
  
  const [form, setForm] = React.useState({
  RRequestNo: '',
  ProjectTitle: '',
  DepartmentName: '',
  Remarks: '',
  TotalAmount: 0,
  ExpenseType: '',
  SelectedDocument: '',
  BillNo: '',
  BillAmount: 0,
  BillDate: '',
  ClaimAmount: 0,
  Description: '',
  SupportingAvailable: false,
  DepartmentNameID:''
  });
   const [loading, setLoading] = React.useState(false);
   const [isOpen, setisOpen] = React.useState(false);
   const [DepartmentOption, setDepartmentOption] = React.useState<IDropdownOption[]>([]);
   const service = new SharePointService(props.context);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  React.useEffect(() => {
      loadMaster();
    }, []);
  
    const loadMaster = async () => {
      const data = await service.getDepartments();
      const options = data.map((item: any) => ({
        key: item.Id,
        text: item.DepartmentName
      }));
      setDepartmentOption(options);
    };
  
  const getRequestDetails = async (requestNo: string) => {

    const url = `${props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items?$filter=RequestNo eq '${requestNo}'`;

    console.log("URL:", url)
    const response = await props.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await response.json();
    if (data.value.length > 0) {
      setForm({
        RRequestNo: data.value[0].RRequestNo,
        ProjectTitle: data.value[0].ProjectTitle,
        DepartmentName: data.value[0].Department,
        Remarks: data.value[0].Remarks,
        TotalAmount: data.value[0].TotalAmount,
        ExpenseType: data.value[0].ExpenseType,
        SelectedDocument: data.value[0].SelectedDocument,
        BillNo: data.value[0].BillNo,
        BillAmount: data.value[0].BillAmount,
        BillDate: data.value[0].BillDate,
        ClaimAmount: data.value[0].ClaimAmount,
        Description: data.value[0].Description,
        SupportingAvailable: data.value[0].SupportingAvailable,
        DepartmentNameID:data.value[0].Department
      });
    } else {

      setForm({
        RRequestNo: '',
        ProjectTitle: '',
        DepartmentName: '',
        Remarks: '',
        TotalAmount: 0,
        ExpenseType: '',
        SelectedDocument: '',
        BillNo: '',
        BillAmount: 0,
        BillDate: '',
        ClaimAmount: 0,
        Description: '',
        SupportingAvailable: false,
        DepartmentNameID:''
      });
    }
  };
  const handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({ ...form, RRequestNo:value});
    // optional
    getRequestDetails(value);
  };
  const saveData = async () => {

    const url = `${props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VendorMapping')/items?$format=json`;

    const body = {
      RRequestNo: form.RRequestNo,
    };

    const response = await props.context.spHttpClient.post(
      url, SPHttpClient.configurations.v1,
      {
        headers: {
          "Accept": "application/json;odata=nometadata",
          "Content-Type": "application/json;odata=nometadata"
        },
        body: JSON.stringify(body)
      }
    );
    const result = await response.json();
    console.log("Response:", result);

    if (response.ok) {
      alert("Data Saved Successfully ✅");
    } else {
      alert("Error saving data ❌");
    }
  };
  const handleSubmit = () => {
    alert("Form Submitted");
  };
  const handleAddNew = () => {
    alert("Form Submitted");
  };
  const handleSave = () => {
    alert("Saved");
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
          <h2>Reimbursement Request Form
            <span>Digiflow / Reimbursement Request Form</span>
          </h2>
        </div>
        <div className={styles.searchBox}>
          <h3>Reimbursement Request Form
            {/* <button className={styles.btnAdd} onClick={handleAddNewDocument}>Add New Document</button> */}
          </h3>
          <div className={styles.content}>
            <div className={styles.selectDep}>
              <div className={styles.selectDepInner}>
                <label>Select Department</label>
                <Dropdown className="form-control"
                                      options={DepartmentOption}
                                      selectedKey={form.DepartmentNameID}
                                      onChange={(e, option) =>
                                        setForm({ ...form, DepartmentName: option?.text as string,DepartmentNameID: option?.key as string})
                                      }
                                    />
              </div>
              <button className={styles.btnAdd} onClick={() => setisOpen(true)}>Add New</button>
            </div>
            <div className={styles.info}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#1026e6" className="bi bi-info-circle-fill" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2" />
              </svg>
              <p>Please upload the document at document page and generate the document number.You will select the document number while adding the reimbursement details.</p>
            </div>
            <div className='row'>
              <div className='col-md-4'>
                <div className={styles.remBox}>
                  <h3>Reimbursement Details</h3>
                  <p><label>Expense Type: </label><label>Flight</label></p>
                  <p className={styles.btnPara}><button className={styles.btnRemove}>Remove</button></p>
                </div>
              </div>
              <div className='col-md-4'>
                <div className={styles.remBox}>
                  <h3>Reimbursement Details</h3>
                  <p><label>Expense Type: </label><label>Flight</label></p>
                  <p className={styles.btnPara}><button className={styles.btnRemove}>Remove</button></p>
                </div>
              </div>
              <div className='col-md-4'>
                <div className={styles.remBox}>
                  <h3>Reimbursement Details</h3>
                  <p><label>Expense Type: </label><label>Flight</label></p>
                  <p className={styles.btnPara}><button className={styles.btnRemove}>Remove</button></p>
                </div>
              </div>
            </div>
            <div className={styles.form}>
              <div className={styles['form-group']}>
                <label>Total Amount</label>
                <input type='number' className="form-control" name="TotalAmount" value={form.TotalAmount} onChange={handleChange} readOnly style={{backgroundColor:"lightgray"}} />
              </div>
              <div className={styles['form-group']}>
                <label>Remarks</label>
                <input type='text' className="form-control" name="Remarks" value={form.Remarks} onChange={handleChange} />
              </div>

              {/* Buttons */}
              <div className={styles['btn-group']}>
                <button className={styles.btnSubmit} onClick={handleSubmit}>Submit</button>
                <button className={styles.btnSave} onClick={saveData}>Save</button>
                <button className={styles.btnCancel}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
        <Modal 
          isOpen={isOpen}
          onDismiss={() => setisOpen(false)}
          isBlocking={false} className={styles.modal}>          
          <div className={styles.searchBox}>
            <h3>Add New Reimbursement Detail</h3>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Expense Type</label>
              <input style={{width: '100%'}} name="expenseType" value={form.ExpenseType} />
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Select Document</label>
              <input style={{width: '100%'}} name="selectedDocument" value={form.SelectedDocument} />
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Bill Number</label>
              <input style={{width: '100%'}} name="billNo" value={form.BillNo} />
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Bill Amount</label>
              <input style={{width: '100%'}} name="billAmount" value={form.BillAmount}>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Bill Date</label>
              <input style={{width: '100%'}} name="remarks" value={form.BillDate}>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Claim Amount</label>
              <input style={{width: '100%'}} name="claimAmount" value={form.ClaimAmount}>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Description</label>
              <input style={{width: '100%'}} name="description" value={form.Description}>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Supporting Available</label>
              <Checkbox  name="supportingAvailable" checked={form.SupportingAvailable}>
              </Checkbox>
            </div>
            <div className={styles.btnGroup}>
              <button className={styles.btnSubmit} onClick={handleSubmit}>Submit</button>
              <button className={styles.btnCancel} onClick={() => setisOpen(false)} >Close</button>              
            </div>
            </div>
        </Modal>
      </div>
    </section>
    );
  };
export default ReimbursementRequestForm;

