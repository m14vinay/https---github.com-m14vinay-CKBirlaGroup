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
  ID:0,  
  RRequestNo: '',
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
  DepartmentNameID:'',
  ExpenseName:'',
  ExpenseID:'',
  DocumentName:'',
  DocumentID:''
  });
   const [loading, setLoading] = React.useState(false);
   const [isOpen, setisOpen] = React.useState(false);
   const [DepartmentOption, setDepartmentOption] = React.useState<IDropdownOption[]>([]);
   const [ExpenseTypeOption, setExpenseTypeOption] = React.useState<IDropdownOption[]>([]);
   const [DocumentOption, setDocumentOption] = React.useState<IDropdownOption[]>([]);
   const [itemId, setItemId] = React.useState<number | null>(0);
   const [Approval1, setApproval1] = React.useState<number | null>(0);
   const [Approval2, setApproval2] = React.useState<number | null>(0);
   const [Approval3, setApproval3] = React.useState<number | null>(0);
   const [Approval4, setApproval4] = React.useState<number | null>(0);
   const [Approval5, setApproval5] = React.useState<number | null>(0);
   const [Departmenthead, setDepartmenthead] = React.useState<number | null>(0);
  const [BillAmount, setBillAmount] = React.useState<number | null>(0);
   const [Expenseform, setExpenseForm] = React.useState<{
  expenses: {Id:Number,Description: string; BillAmount: number; BillDate: Date,BillNmber:string,DocumentName:string,ClaimAmount:number,ExpenseType:string}[];
}>({
  expenses: []
});
   const [User, setUser] = React.useState<any>(null);
   const service = new SharePointService(props.context);

    //Get ID from query string ---
    const getIdFromQueryString = (): number | null => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('RequestId');
      return id ? parseInt(id, 10) : null;
    };
    // Get Data After Selection the Document
 const handleDocumentChange = async (option?: IDropdownOption) => {
  if (!option) return;
  const data = await service.getDocumentDetailsID(Number(option.key));
  console.log(data);
  setBillAmount(data[0].BillAmount);
  setForm({
    ...form,
    BillAmount:data[0].BillAmount,
    BillNo:data[0].BillNumber,
    BillDate:data[0].BillDate,
    DocumentName: option.text,
    DocumentID: option.key as string
  });
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleClaimAmountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if(Number(BillAmount)<Number(value))
    {
    setForm({ ...form, [name]: 0 });
    alert("Claim amount must be less then bill amount.");
    }
    else{
      setForm({ ...form, [name]: value });
    }    
  };
  React.useEffect(() => {
      setLoading(true);
      loadMaster();
      const id = getIdFromQueryString();
      if (id!=null) {
        getRequestDetails(id);
      }  
      setLoading(false);   
    }, []);
  // Load Master Data
    const loadMaster = async () => {
      const data = await service.getDepartments();
      const options = data.map((item: any) => ({
        key: item.Id,
        text: item.DepartmentName
      }));
      setDepartmentOption(options);

      const Expensedata = await service.getExpense();
      const Expenseoptions = Expensedata.map((item: any) => ({
        key: item.Id,
        text: item.Title
      }));
      setExpenseTypeOption(Expenseoptions);
      const userData=  await service.getUser();
      if(userData.Id>0)
      {
      setUser(userData.Id);
      const Documentdata = await service.getDocumentbyID(userData.Id);
      if(Documentdata.length>0)
      {
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
   if (data.CurrentStatus==='Draft') {
      setItemId(data.Id);
        setForm({
          ...form,          
        RRequestNo: data.value[0].RRequestNo,
        DepartmentName: data.value[0].Department,
        Remarks: data.value[0].Remarks,
        TotalAmount: data.value[0].TotalClaimAmount
        });
      const Expensedata = await service.getItemByExpenseData(requestNo);
      if(Expensedata.Id>0)
      {
        setExpenseForm({
    ...Expenseform,
    expenses: [...Expenseform.expenses, Expensedata]
  });
      }
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
        BillDate: new Date(),
        ClaimAmount: 0,
        Description: '',
        DepartmentNameID:'',
        ExpenseID:'',
        ExpenseName:'',
        DocumentName:'',
        DocumentID:'',
        ID:0,
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
    Id:0,
    Description: form.Description,
    BillAmount: form.BillAmount,
    BillDate: form.BillDate,
    BillNmber:form.BillNo,
    DocumentName:form.DocumentName,
    ClaimAmount:form.ClaimAmount,
    ExpenseType:form.ExpenseName
  };
  addExpense(newExpense);
  setForm(prev => ({
        ...prev,
        TotalAmount:Number(form.TotalAmount)+Number(newExpense.ClaimAmount)
      }));
  setisOpen(false);
  };
  const handleSubmit = async() => {
    const dataApprover = await service.GetApprover(form.DepartmentName);
       if(dataApprover?.Id)
      {
           setApproval1(dataApprover.Approval1?.Id || null);
           setApproval2(dataApprover.Approval2?.Id || null);
           setApproval3(dataApprover.Approval3?.Id || null);
           setApproval4(dataApprover.Approval4?.Id || null);
           setApproval5(dataApprover.Approval5?.Id || null);
           setDepartmenthead(dataApprover.Departmenthead?.Id || null);
      }
       // 🔹 Payload (common)
  const payload = {               
        TotalClaimAmount: form.TotalAmount,        
        Remarks: form.Remarks,
        DepartmentName: form.DepartmentName,
        CurrentStatus:'Pending',
        AssignedToEmailId:Number(Departmenthead) ,
        DepartmentHeadId: Number(Departmenthead),
        FIApporver:Number(Approval1),
        FIApporverEmailId:Number(Approval2),
        ComplianceHeadEmailId:Number(Approval3),
        CFOEmailId:Number(Approval4)
  };
  try {
    if (!itemId) {
      // 🔹 CREATE
      const res = await service.createItem(payload);
      if(res.Id>0)
      {
      setItemId(res.Id); // store ID for future updates  
      console.log(res.Id);
      await service.updateItem(res.Id, {
          RequestNo: `REM-${res.Id}`
        });
        if (res.Id > 0 && Expenseform.expenses.length > 0) {
        for (let i = 0; i < Expenseform.expenses.length; i++) {
          const Expensepayload = {               
        ExpanseType: Expenseform.expenses[i].ExpenseType,     
        BillNo: Expenseform.expenses[i].BillNmber,
        BillAmount:Expenseform.expenses[i].BillAmount,
        BillDate:new Date(Expenseform.expenses[i].BillDate).toISOString().split('T')[0],
        Description:Expenseform.expenses[i].Description,
        SupportedAttachment:'Y',      
        ReimursementLookupId:Number(itemId)
  };
          const res = await service.createExpenseItem(Expensepayload);
          if(res.Id>0)
          { alert("Data Submitted Successfully ✅");
            console.log("Successfully Transaction Saved:-" + itemId);
          }
      }
    }
  }
    } else {
      // 🔹 UPDATE
      await service.updateItem(itemId, payload);
      if (itemId > 0 && Expenseform.expenses.length > 0) {
        for (let i = 0; i < Expenseform.expenses.length; i++) {
        const Expensepayload = {               
        ExpanseType: Expenseform.expenses[i].ExpenseType,     
        BillNo: Expenseform.expenses[i].BillNmber,
        BillAmount:Expenseform.expenses[i].BillAmount,
        BillDate:new Date(Expenseform.expenses[i].BillDate).toISOString().split('T')[0],
        Description:Expenseform.expenses[i].Description,
        SupportedAttachment:'Y',      
        ReimursementLookupId:Number(itemId)
        };
          const res = await service.updateExpenseItem(Number(Expenseform.expenses[i].Id),Expensepayload);
      }
    }
      alert("Data Submitted Successfully ✅");
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
  const handleSave = async() => {
   // 🔹 Payload (common)
  const payload = {               
        TotalClaimAmount: form.TotalAmount,        
        Remarks: form.Remarks,
        DepartmentName: form.DepartmentName,
        CurrentStatus:'Draft'
  };
  try {
    setLoading(true);
    if (!itemId) {
      // 🔹 CREATE
      const res = await service.createItem(payload);
      if(res.Id>0)
      {
      setItemId(res.Id); // store ID for future updates   
     const Updateres  = await service.updateItem(res.Id, {
          RequestNo: `REM-${res.Id}`
        });
        if (res.Id > 0 && Expenseform.expenses.length > 0) {
        for (let i = 0; i < Expenseform.expenses.length; i++) {
          const Expensepayload = {               
        ExpanseType: Expenseform.expenses[i].ExpenseType,     
        BillNo: Expenseform.expenses[i].BillNmber,
        BillAmount:Expenseform.expenses[i].BillAmount,
        BillDate:new Date(Expenseform.expenses[i].BillDate).toISOString().split('T')[0],
        Description:Expenseform.expenses[i].Description,
        ClaimAmount:Expenseform.expenses[i].ClaimAmount,
        SupportedAttachment:'Y',      
        ReimursementLookupId:Number(res.Id)};
        const Expenseres = await service.createExpenseItem(Expensepayload);
        if(Expenseres.Id>0)
        {            
          const Expensedata = await service.getItemByExpenseData(Number(res.Id));
          if(Expensedata.value[0].Id>0)
              {
               setExpenseForm({
    ...Expenseform,
    expenses: Expensedata.value[0]
  });           
              }
            alert("Data Saved Successfully ✅");
            console.log("Successfully Transaction Saved:-" + Expenseres.ID);
        }
      }
    }
  }
    } else {
      // 🔹 UPDATE
      await service.updateItem(itemId, payload);
      if (itemId > 0 && Expenseform.expenses.length > 0) {
        for (let i = 0; i < Expenseform.expenses.length; i++) {
        const Expensepayload = {               
        ExpanseType: Expenseform.expenses[i].ExpenseType,     
        BillNo: Expenseform.expenses[i].BillNmber,
        BillAmount:Expenseform.expenses[i].BillAmount,
        BillDate:new Date(Expenseform.expenses[i].BillDate).toISOString().split('T')[0],
        Description:Expenseform.expenses[i].Description,
        ClaimAmount:Expenseform.expenses[i].ClaimAmount,
        SupportedAttachment:'Y',      
        ReimursementLookupId:itemId
        };
        if(Number(Expenseform.expenses[i].Id)>0)
        {
          const res = await service.updateExpenseItem(Number(Expenseform.expenses[i].Id),Expensepayload);
        }
        else{
            const res = await service.createExpenseItem(Expensepayload);           
        }
      }
      const Expensedata = await service.getItemByExpenseData(Number(itemId));
          if(Expensedata.value[0].Id>0)
              {
             setExpenseForm({
    ...Expenseform,
    expenses: Expensedata.value[0]
  });  
        }
      alert("Data Updated Successfully ✅");
    }      
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
  // Add New Expense
  const handleAddNew = () => {
    setLoading(true);
    setForm(
      prev => ({
        ...prev,       
        ExpenseType: '',
        SelectedDocument: '',
        BillNo: '',
        BillDate:new Date(),
        BillAmount: 0,
        ClaimAmount: 0,
        Description: '',
        ExpenseID:'',
        ExpenseName:'',
        DocumentName:'',
        DocumentID:''
      }));
      setisOpen(true);
    setLoading(false);
  };
  const removeExpense = async (index: number) => {
  const updatedExpenses = Expenseform.expenses.filter((_, i) => i !== index);  
  if(Number(Expenseform.expenses[index].Id)>0)
  {
  const datadelete=await service.deleteExpense(Number(Expenseform.expenses[index].Id))
  if(datadelete)
  {
   alert("Item deleted successfully.");
  }
}
else
{
setForm(prev => ({
        ...prev,
        TotalAmount:Number(form.TotalAmount)-Number(Expenseform.expenses[index].ClaimAmount)
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
                                        setForm({ ...form, DepartmentName: option?.text as string,DepartmentNameID: option?.key as string})
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
          <label>{exp.ExpenseType}</label>
        </p>
        <p>
          <label>Bill Number: </label>
          <label>{exp.BillNmber}</label>
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
                <input type='number' className="form-control" name="TotalAmount" value={form.TotalAmount} readOnly style={{backgroundColor:"lightgray"}} />
              </div>
              <div className={styles['form-group']}>
                <label>Remarks</label>
                <input type='text' className="form-control" name="Remarks" value={form.Remarks} onChange={handleChange} />
              </div>

              {/* Buttons */}
              <div className={styles['btn-group']}>
                <button className={styles.btnSubmit} onClick={handleSubmit}>Submit</button>
                <button className={styles.btnSave} onClick={handleSave}>Save</button>
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
              <Dropdown className="form-control" style={{width: '100%'}}
                                      options={ExpenseTypeOption}
                                      selectedKey={form.ExpenseID}
                                      onChange={(e, option) =>
                                        setForm({ ...form, ExpenseName: option?.text as string,ExpenseID: option?.key as string})
                                      }
                                    />
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Select Document</label>
              <Dropdown className="form-control" style={{width: '100%'}}
                                      options={DocumentOption}
                                      selectedKey={form.DocumentID}
                                      onChange={(e, option) => handleDocumentChange(option) }
                                    />
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Bill Number</label>
              <input className="form-control" style={{width: '100%',backgroundColor:"lightgray"}} name="BillNo" value={form.BillNo} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Bill Amount</label>
              <input className="form-control" style={{width: '100%',backgroundColor:"lightgray"}} name="BillAmount" value={form.BillAmount} readOnly>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Bill Date</label>
              <input className="form-control" style={{width: '100%',backgroundColor:"lightgray"}} name="BillDate" value={form.BillDate
                ? new Date(form.BillDate).toISOString().split('T')[0]
                : ''} readOnly>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Claim Amount</label>
              <input className="form-control" type='number' style={{width: '100%'}} name="ClaimAmount" value={form.ClaimAmount} onChange={handleClaimAmountChange}>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{width: '30%'}}>Description</label>
              <input className="form-control" style={{width: '100%'}} name="Description" value={form.Description} onChange={handleChange}>
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

