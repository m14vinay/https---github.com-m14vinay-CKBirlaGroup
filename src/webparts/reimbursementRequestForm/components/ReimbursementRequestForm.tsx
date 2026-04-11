import * as React from 'react';
import styles from './ReimbursementRequestForm.module.scss';
import type { IReimbursementRequestFormProps } from './IReimbursementRequestFormProps';
import { allowScrollOnElement, Checkbox, Modal, PrimaryButton } from '@fluentui/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
const ReimbursementRequestForm: React.FC<IReimbursementRequestFormProps> = (props) => {

  const [form, setForm] = React.useState({
    ID: 0,
    RequestNo: '',
    ProjectTitle: '',
    DepartmentName: '',
    Remarks: '',
    TotalAmount: 0,
    ExpenseType: '',
    SelectedDocument: '',
    BillNo: '',
    BillAmount: 0,
    BillDate: new Date(),
    ClaimAmount: 0,
    Description: '',
    DepartmentNameID: '',
    ExpenseName: '',
    ExpenseID: '',
    DocumentName: '',
    DocumentID: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setisOpen] = React.useState(false);
  const [DepartmentOption, setDepartmentOption] = React.useState<IDropdownOption[]>([]);
  const [ExpenseTypeOption, setExpenseTypeOption] = React.useState<IDropdownOption[]>([]);
  const [DocumentOption, setDocumentOption] = React.useState<IDropdownOption[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(0);
  const [BillAmount, setBillAmount] = React.useState<number | null>(0);
  const [Expenseform, setExpenseForm] = React.useState<{
    expenses: { Id: Number, Description: string; BillAmount: number; BillDate: Date, BillNo: string, DocumentName: string, ClaimAmount: number, ExpanseType: string }[];
  }>({
    expenses: []
  });
  const [User, setUser] = React.useState<any>(null);
  const service = new SharePointService(props.context);
  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
    window.location.assign(url);
  };
  //Get ID from query string ---
  const getIdFromQueryString = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('RequestID');
    return id ? parseInt(id, 10) : null;
  };
  // Get Data After Selection the Document
  const handleDocumentChange = async (option?: IDropdownOption) => {
    setLoading(true);
    if (!option) return;
    const data = await service.getDocumentDetailsID(Number(option.key));
    console.log(data);
    setBillAmount(data[0].BillAmount);
    setForm({
      ...form,
      BillAmount: data[0].BillAmount,
      BillNo: data[0].BillNumber,
      BillDate: data[0].BillDate,
      DocumentName: option.text,
      DocumentID: option.key as string
    });
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleClaimAmountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (Number(BillAmount) < Number(value)) {
      setForm({ ...form, [name]: 0 });
      alert("Claim amount must be less then bill amount.");
    }
    else {
      setForm({ ...form, [name]: value });
    }
  };
  React.useEffect(() => {
    setLoading(true);
    loadMaster();
    const id = getIdFromQueryString();
    if (id != null) {
      getRequestDetails(id);
    }
    setLoading(false);
  }, []);
  // Load Master Data
  const loadMaster = async () => {
    const data = await service.getDepartments();
    const options = data.map((item: any) => ({
      key: item.DepartmentName,
      text: item.DepartmentName
    }));
    setDepartmentOption(options);

    const Expensedata = await service.getExpense();
    const Expenseoptions = Expensedata.map((item: any) => ({
      key: item.Id,
      text: item.Title
    }));
    setExpenseTypeOption(Expenseoptions);
    const userData = await service.getUser();
    if (userData.Id > 0) {
      setUser(userData.Id);
      const Documentdata = await service.getDocumentbyID(userData.Id);
      if (Documentdata.length > 0) {
        const Documentoptions = Documentdata.map((item: any) => ({
          key: item.Id,
          text: item.Title
        }));
        setDocumentOption(Documentoptions);
      }
    }
  };

  const getRequestDetails = async (requestNo: number) => {
    const data = await service.getItemByRequestNo(requestNo);
    if (data.CurrentStatus === 'Draft') {
      setItemId(data.Id);
      setForm({
        ...form,
        RequestNo: data.RequestNo,
        DepartmentName: data.DepartmentName,
        DepartmentNameID: data.DepartmentName,
        Remarks: data.Remarks,
        TotalAmount: data.TotalClaimAmount
      });
      const Expensedata = await service.getItemByExpenseData(requestNo);
      if (Expensedata.value.length > 0) {
        for (let i = 0; i < Expensedata.value.length; i++) {
          {
            setExpenseForm({
              ...Expenseform,
              expenses: [...Expenseform.expenses, Expensedata.value[i]]
            });
          }
        }
      }
    } else {

      setForm({
        RequestNo: '',
        ProjectTitle: '',
        DepartmentName: '',
        Remarks: '',
        TotalAmount: 0,
        ExpenseType: '',
        SelectedDocument: '',
        BillNo: '',
        BillAmount: 0,
        BillDate: new Date(),
        ClaimAmount: 0,
        Description: '',
        DepartmentNameID: '',
        ExpenseID: '',
        ExpenseName: '',
        DocumentName: '',
        DocumentID: '',
        ID: 0,
      });
    }
  };
  // AddExpensewithID
  const addExpense = (newExpense: any) => {
    setExpenseForm(prev => {
      return {
        ...prev,
        expenses: [...prev.expenses, newExpense]
      };
    });
  };
  const handleExpenseSubmit = () => {
    const newExpense = {
      Id: 0,
      Description: form.Description,
      BillAmount: form.BillAmount,
      BillDate: form.BillDate,
      BillNo: form.BillNo,
      DocumentName: form.DocumentName,
      ClaimAmount: form.ClaimAmount,
      ExpanseType: form.ExpenseName
    };
    addExpense(newExpense);
    setForm(prev => ({
      ...prev,
      TotalAmount: Number(form.TotalAmount) + Number(newExpense.ClaimAmount)
    }));
    setisOpen(false);
  };
  const handleSubmit = async () => {
    if (!form.DepartmentName) {
      alert("Please select a Department");
      return false;
    }
    setLoading(true);
    const currentuser = await service.getUser();
    const dataApprover = await service.GetApprover(form.DepartmentName);
    const dataApproverFI = await service.GetApproverReimbursement("FI");
    const dataApproverCompliance = await service.GetApproverReimbursement("ComplianceHead");
    const dataApproverCFO = await service.GetApproverReimbursement("CFO");
    // 🔹 Payload (common)
    let payload = {};
    if (form.DepartmentName == 'DH Branding' || form.DepartmentName == 'DH OGS' || form.DepartmentName == 'DH HR') {
      payload = {
        TotalClaimAmount: form.TotalAmount,
        Remarks: form.Remarks,
        DepartmentName: form.DepartmentName,
        CurrentStatus: 'Pending',
        AssignedToEmailId: Number(dataApproverFI.ApproverName?.Id || 0),
        AssignedTo: dataApproverFI.ApproverName?.Title.toString() || "",
        DepartmentHead: dataApproverFI.ApproverName?.Title.toString() || "",
      };
    }
    else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') && form.TotalAmount > 100000) {
      payload = {
        TotalClaimAmount: form.TotalAmount,
        Remarks: form.Remarks,
        DepartmentName: form.DepartmentName,
        CurrentStatus: 'Pending',
        AssignedToEmailId: Number(dataApprover.Departmenthead?.Id || 0),
        DepartmentHead: dataApprover.Departmenthead?.Title.toString() || "",
        FIApporver: dataApproverFI.ApproverName?.Title.toString() || "",
        FIApproverEmailId: Number(dataApproverFI.ApproverName?.Id || 0),
        ComplianceHeadEmailId: 0,
        CFOEmailId: Number(dataApproverCFO.ApproverName?.Id || 0),
        AssignedTo: dataApprover.Departmenthead?.Title.toString() || ""
      }
    }
    else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') &&form.TotalAmount < 100000) {      
        payload = {
        TotalClaimAmount: form.TotalAmount,
        Remarks: form.Remarks,
        DepartmentName: form.DepartmentName,
        CurrentStatus: 'Pending',
        AssignedToEmailId: Number(dataApprover.Departmenthead?.Id || 0),
        DepartmentHead: dataApprover.Departmenthead?.Title.toString() || "",
        FIApporver: dataApproverFI.ApproverName?.Title.toString() || "",
        FIApproverEmailId: Number(dataApproverFI.ApproverName?.Id || 0),
        ComplianceHeadEmailId: Number(dataApproverCompliance.ApproverName?.Id || 0),
        CFOEmailId: 0,
        AssignedTo: dataApprover.Departmenthead?.Title.toString() || ""
      }
    }
    try {
      if (Expenseform.expenses.length > 0) {
        if (!itemId) {
          // 🔹 CREATE
          const res = await service.createItem(payload);
          if (res.Id > 0) {
            setItemId(res.Id); // store ID for future updates  
            console.log(res.Id);
            await service.updateItem(res.Id, {
              RequestNo: `REM-${res.Id}`
            });
            if (res.Id > 0 && Expenseform.expenses.length > 0) {
              for (let i = 0; i < Expenseform.expenses.length; i++) {
                const Expensepayload = {
                  ExpanseType: Expenseform.expenses[i].ExpanseType,
                  BillNo: Expenseform.expenses[i].BillNo,
                  BillAmount: Expenseform.expenses[i].BillAmount,
                  BillDate: new Date(Expenseform.expenses[i].BillDate).toISOString().split('T')[0],
                  Description: Expenseform.expenses[i].Description,
                  SupportedAttachment: 'Y',
                  ClaimAmount: Expenseform.expenses[i].ClaimAmount,
                  DocumentName: Expenseform.expenses[i].DocumentName,
                  ReimursementLookupId: Number(res.Id)
                };
                const resExpense = await service.createExpenseItem(Expensepayload);
                if (resExpense.Id > 0) {
                  const payload = {
                    Title: 'REM',
                    FID: Number(res.Id),
                    UserName: currentuser.Title,
                    UserAction: 'Request Initiator',
                    ActionDate: new Date().toISOString(),
                    Designation: 'Request Initiator',
                  };
                  await service.createHistoryItem(payload);
                  alert("Data Submitted Successfully ✅");
                  console.log("Successfully Transaction Saved:-" + resExpense.Id);
                  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
                  window.location.assign(url);
                }
              }
            }
          }
        } else {
          // 🔹 UPDATE
          const submitdata = await service.updateItem(itemId, payload);
          if (1) {
            if (itemId > 0 && Expenseform.expenses.length > 0) {
              for (let i = 0; i < Expenseform.expenses.length; i++) {
                const Expensepayload = {
                  ExpanseType: Expenseform.expenses[i].ExpanseType,
                  BillNo: Expenseform.expenses[i].BillNo,
                  BillAmount: Expenseform.expenses[i].BillAmount,
                  BillDate: new Date(Expenseform.expenses[i].BillDate).toISOString().split('T')[0],
                  Description: Expenseform.expenses[i].Description,
                  ClaimAmount: Expenseform.expenses[i].ClaimAmount,
                  SupportedAttachment: 'Y',
                  DocumentName: Expenseform.expenses[i].DocumentName,
                  ReimursementLookupId: Number(itemId)
                };
                const res = await service.updateExpenseItem(Number(Expenseform.expenses[i].Id), Expensepayload);
              }
            }
            const payload = {
              Title: 'REM',
              FID: itemId,
              UserName: currentuser.Title,
              UserAction: 'Request Initiator',
              ActionDate: new Date().toISOString(),
              Designation: 'Request Initiator',
            };
            await service.createHistoryItem(payload);
            alert("Data Submitted Successfully ✅");
            const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
            window.location.assign(url);
          }
        }
      }
      else {
        alert("Please select expenses before Submitting");
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred ❌");
    }
    finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    if (!form.DepartmentName) {
      alert("Please select a Department");
      return false;
    }
    // 🔹 Payload (common)
    const payload = {
      TotalClaimAmount: form.TotalAmount,
      Remarks: form.Remarks,
      DepartmentName: form.DepartmentName,
      CurrentStatus: 'Draft'
    };
    try {
      setLoading(true);
      if (Expenseform.expenses.length > 0) {
        if (!itemId) {
          // 🔹 CREATE
          const res = await service.createItem(payload);
          if (res.Id > 0) {
            setItemId(res.Id); // store ID for future updates   
            const Updateres = await service.updateItem(res.Id, {
              RequestNo: `REM-${res.Id}`
            });
            if (res.Id > 0 && Expenseform.expenses.length > 0) {
              for (let i = 0; i < Expenseform.expenses.length; i++) {
                const Expensepayload = {
                  ExpanseType: Expenseform.expenses[i].ExpanseType,
                  BillNo: Expenseform.expenses[i].BillNo,
                  BillAmount: Expenseform.expenses[i].BillAmount,
                  BillDate: new Date(Expenseform.expenses[i].BillDate).toISOString().split('T')[0],
                  Description: Expenseform.expenses[i].Description,
                  ClaimAmount: Expenseform.expenses[i].ClaimAmount,
                  SupportedAttachment: 'Y',
                  DocumentName: Expenseform.expenses[i].DocumentName,
                  ReimursementLookupId: Number(res.Id)
                };
                const Expenseres = await service.createExpenseItem(Expensepayload);
                if (Expenseres.Id > 0) {
                  console.log("Successfully Transaction Saved:-" + Expenseres.ID);
                }
              }
              setExpenseForm({
                ...Expenseform,
                expenses: []
              });
              const Expensedata = await service.getItemByExpenseData(Number(res.Id));
              if (Expensedata.value[0].Id > 0) {
                setExpenseForm({
                  ...Expenseform,
                  expenses: Expensedata.value
                });
                alert("Data Saved Successfully ✅");
              }
            }
          }
        } else {
          // 🔹 UPDATE
          await service.updateItem(itemId, payload);
          if (itemId > 0 && Expenseform.expenses.length > 0) {
            for (let i = 0; i < Expenseform.expenses.length; i++) {
              const Expensepayload = {
                ExpanseType: Expenseform.expenses[i].ExpanseType,
                BillNo: Expenseform.expenses[i].BillNo,
                BillAmount: Expenseform.expenses[i].BillAmount,
                BillDate: new Date(Expenseform.expenses[i].BillDate).toISOString().split('T')[0],
                Description: Expenseform.expenses[i].Description,
                ClaimAmount: Expenseform.expenses[i].ClaimAmount,
                SupportedAttachment: 'Y',
                DocumentName: Expenseform.expenses[i].DocumentName,
                ReimursementLookupId: itemId
              };
              if (Number(Expenseform.expenses[i].Id) > 0) {
                const res = await service.updateExpenseItem(Number(Expenseform.expenses[i].Id), Expensepayload);
              }
              else {
                const res = await service.createExpenseItem(Expensepayload);
              }
            }
            const Expensedata = await service.getItemByExpenseData(Number(itemId));
            setExpenseForm({
              ...Expenseform,
              expenses: []
            });
            if (Expensedata.value[0].Id > 0) {
              setExpenseForm({
                ...Expenseform,
                expenses: Expensedata.value
              });
            }
            alert("Data Updated Successfully ✅");
          }
        }

      }
      else {
        alert("Please select expense before save.");
      }
    }
    catch (error) {
      console.error(error);
      alert("Error occurred ❌");
    }
    finally {
      setLoading(false);
    }
  };
  // Add New Expense
  const handleAddNew = () => {
    setLoading(true);
    setForm(
      prev => ({
        ...prev,
        ExpenseType: '',
        SelectedDocument: '',
        BillNo: '',
        BillDate: new Date(),
        BillAmount: 0,
        ClaimAmount: 0,
        Description: '',
        ExpenseID: '',
        ExpenseName: '',
        DocumentName: '',
        DocumentID: ''
      }));
    setisOpen(true);
    setLoading(false);
  };
  const removeExpense = async (index: number) => {
    const updatedExpenses = Expenseform.expenses.filter((_, i) => i !== index);
    if (Number(Expenseform.expenses[index].Id) > 0) {
      const datadelete = await service.deleteExpense(Number(Expenseform.expenses[index].Id))
      if (datadelete) {
        alert("Item deleted successfully.");
        const Expensedata = await service.getItemByExpenseData(Number(itemId));
        setExpenseForm({
          ...Expenseform,
          expenses: []
        });
        if (Expensedata.value[0].Id > 0) {
          setExpenseForm({
            ...Expenseform,
            expenses: Expensedata.value
          });
          setForm(prev => ({
            ...prev,
            TotalAmount: Number(form.TotalAmount) - Number(Expenseform.expenses[index].ClaimAmount)
          }));
        }
      }
    }
    else {
      setForm(prev => ({
        ...prev,
        TotalAmount: Number(form.TotalAmount) - Number(Expenseform.expenses[index].ClaimAmount)
      }));
      setExpenseForm({
        ...Expenseform,
        expenses: updatedExpenses
      });
    }
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
          </h3>
          <div className={styles.content}>
            <div className={styles.selectDep}>
              <div className={styles.selectDepInner}>
                <label>Select Department</label>
                <Dropdown className="form-control"
                  options={DepartmentOption}
                  selectedKey={form.DepartmentNameID}
                  onChange={(e, option) =>
                    setForm({ ...form, DepartmentName: option?.text as string, DepartmentNameID: option?.key as string })
                  }
                />
              </div>
              <button className={styles.btnAdd} onClick={handleAddNew}>Add New</button>
            </div>
            <div className={styles.info}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#1026e6" className="bi bi-info-circle-fill" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2" />
              </svg>
              <p>Please upload the document at document page and generate the document number.You will select the document number while adding the reimbursement details.</p>
            </div>
            <div className='row'>
              {Expenseform.expenses.map((exp: any, index: number) => (
                <div className="col-md-4" key={index}>
                  <div className={styles.remBox}>
                    <h3>Reimbursement Details</h3>
                    <p>
                      <label>Expense Type: </label>
                      <label>{exp.ExpanseType}</label>
                    </p>
                    <p>
                      <label>Bill Number: </label>
                      <label>{exp.BillNo}</label>
                    </p>
                    <p>
                      <label>Bill Amount: </label>
                      <label>{exp.BillAmount}</label>
                    </p>
                    <p>
                      <label>Bill Date: </label>
                      <label>{exp.BillDate
                        ? new Date(exp.BillDate).toISOString().split('T')[0]
                        : ''}</label>
                    </p>
                    <p>
                      <label>Claim Amount: </label>
                      <label>{exp.ClaimAmount}</label>
                    </p>
                    <p>
                      <label>Description: </label>
                      <label>{exp.Description}</label>
                    </p>
                    <p>
                      <label>Document: </label>
                      <label>{exp.DocumentName}</label>
                    </p>
                    <p className={styles.btnPara}>
                      <button
                        className={styles.btnRemove}
                        onClick={() => removeExpense(index)}>
                        Remove
                      </button>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.form}>
              <div className={styles['form-group']}>
                <label>Total Amount</label>
                <input type='number' className="form-control" name="TotalAmount" value={form.TotalAmount} readOnly style={{ backgroundColor: "lightgray" }} />
              </div>
              <div className={styles['form-group']}>
                <label>Remarks</label>
                <input type='text' className="form-control" name="Remarks" value={form.Remarks} onChange={handleChange} />
              </div>

              {/* Buttons */}
              <div className={styles['btn-group']}>
                <button className={styles.btnSubmit} onClick={handleSubmit}>Submit</button>
                <button className={styles.btnSave} onClick={handleSave}>Save</button>
                <button className={styles.btnCancel} onClick={handleCancel}>Cancel</button>
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
              <label style={{ width: '30%' }}>Expense Type</label>
              <Dropdown className="form-control" style={{ width: '100%' }}
                options={ExpenseTypeOption}
                selectedKey={form.ExpenseID}
                onChange={(e, option) =>
                  setForm({ ...form, ExpenseName: option?.text as string, ExpenseID: option?.key as string })
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ width: '30%' }}>Select Document</label>
              <Dropdown className="form-control" style={{ width: '100%' }}
                options={DocumentOption}
                selectedKey={form.DocumentID}
                onChange={(e, option) => handleDocumentChange(option)}
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ width: '30%' }}>Bill Number</label>
              <input className="form-control" style={{ width: '100%', backgroundColor: "lightgray" }} name="BillNo" value={form.BillNo} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label style={{ width: '30%' }}>Bill Amount</label>
              <input className="form-control" style={{ width: '100%', backgroundColor: "lightgray" }} name="BillAmount" value={form.BillAmount} readOnly>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{ width: '30%' }}>Bill Date</label>
              <input className="form-control" style={{ width: '100%', backgroundColor: "lightgray" }} name="BillDate" value={form.BillDate
                ? new Date(form.BillDate).toISOString().split('T')[0]
                : ''} readOnly>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{ width: '30%' }}>Claim Amount</label>
              <input className="form-control" type='number' style={{ width: '100%' }} name="ClaimAmount" value={form.ClaimAmount} onChange={handleClaimAmountChange}>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{ width: '30%' }}>Description</label>
              <input className="form-control" style={{ width: '100%' }} name="Description" value={form.Description} onChange={handleChange}>
              </input>
            </div>
            <div className={styles.btnGroup}>
              <button className={styles.btnSubmit} onClick={handleExpenseSubmit}>Submit</button>
              <button className={styles.btnCancel} onClick={() => setisOpen(false)} >Close</button>
            </div>
          </div>
        </Modal>
      </div>
    </section>
  );
};
export default ReimbursementRequestForm;

