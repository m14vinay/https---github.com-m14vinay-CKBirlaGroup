import * as React from 'react';
import styles from './ReimbursementRequestForm.module.scss';
import type { IReimbursementRequestFormProps } from './IReimbursementRequestFormProps';
import { allowScrollOnElement, Checkbox, Modal, PrimaryButton, Button } from '@fluentui/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
import { files } from '@microsoft/teams-js';
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
    DocumentID: '',
    files: [],
    ApprovalPath: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setisOpen] = React.useState(false);
  const [DepartmentOption, setDepartmentOption] = React.useState<IDropdownOption[]>([]);
  const [ExpenseTypeOption, setExpenseTypeOption] = React.useState<IDropdownOption[]>([]);
  const [DocumentOption, setDocumentOption] = React.useState<IDropdownOption[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(0);
  const [BillAmount, setBillAmount] = React.useState<number | null>(0);
  const MAX_TOTAL_SIZE_MB = 25;
  const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/
  const [Expenseform, setExpenseForm] = React.useState<{
    expenses: { Id: Number, Description: string; BillAmount: number; BillDate: Date, BillNo: string, DocumentName: string, ClaimAmount: number, ExpanseType: string, files: [] }[];
  }>({
    expenses: []
  });
  const [User, setUser] = React.useState<any>(null);
  const service = new SharePointService(props.context);
  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
    window.location.assign(url);
  };
  const handleBillDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const selectedDate = new Date(value);
    const today = new Date();
    // remove time part
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      alert("Bill date cannot be greater than current date");
      return; // ❌ stop updating state
    }
    setForm({
      ...form,
      [name]: value
    });
  };
  const handleCheckbillNoExist = async () => {
    const checkdata = await service.getCheckBillNoExist(form.BillNo);
    const checkexpensebill=Expenseform.expenses.some(item => item.BillNo === form.BillNo);
    if (checkdata != null || checkexpensebill) {
      setForm(prev => ({
        ...prev,
        BillNo: ''
      }))
      alert("Bill No is duplicate , Please enter another bill no");
      return;
    }
  }
  //Get ID from query string ---
  const getIdFromQueryString = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('RequestId');
    return id ? parseInt(id, 10) : null;
  };
  const removeFile = (index: number) => {
    setForm((prev: any) => ({
      ...prev,
      files: prev.files.filter((_: File, i: number) => i !== index)
    }));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleClaimAmountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (Number(form.BillAmount) < Number(value)) {
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
  const handleFileChange = (event?: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target?.files;
    if (!files) return;

    const allowedExtensions = ['pdf', 'xlsx', 'docx'];
    const filesArray = Array.from(files);

    // 🔹 Check each file
    for (let file of filesArray) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || allowedExtensions.indexOf(fileExtension) === -1) {
        alert(`File Type Not Allowed: ${file.name}. Only PDF, XLSX, DOCX are Allowed.`);
        return; // stop execution
      }
    }

    // 🔹 Total size check
    const totalSizeMB = filesArray.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      alert(`Total File Sie Must Not Exceed ${MAX_TOTAL_SIZE_MB} MB`);
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
  const getRequestDetails = async (requestNo: number) => {
    const data = await service.getItemByRequestNo(requestNo);
    const currentUser = await service.getUser();
    if (data.AuthorId !== currentUser.Id) {
      alert("You Are Not Authorized ❌ ");
    }
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
        const formattedExpenses = Expensedata.value.map((item: any) => ({
          Id: item.Id,
          Description: item.Description || "",
          BillAmount: item.BillAmount || 0,
          BillDate: item.BillDate ? new Date(item.BillDate) : new Date(),
          BillNo: item.BillNo || "",
          DocumentName: item.DocumentName || "",
          ClaimAmount: item.ClaimAmount || 0,
          ExpanseType: item.ExpanseType || "",
          files: item.AttachmentFiles ? item.AttachmentFiles.map((file: any) => ({
            FileName: file.FileName,
            ServerRelativeUrl: file.ServerRelativeUrl
          }))
            : []
        }));
        setExpenseForm({
          expenses: formattedExpenses
        });
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
        files: [],
        ApprovalPath: ''
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
    if (form.files.length==0) { alert("Please upload file.");return; }
    if (!form.BillNo) { alert("Please enter bill no.");return; }
    if (!form.BillDate) { alert("Please enter bill date."); return; }
    if (!form.BillAmount) { alert("Please enter bill amount."); return; }
    if (!form.ClaimAmount) { alert("Please enter claim amount."); return; }
    const newExpense = {
      Id: 0,
      Description: form.Description,
      BillAmount: form.BillAmount,
      BillDate: form.BillDate,
      BillNo: form.BillNo,
      DocumentName: form.ExpenseName,
      ClaimAmount: form.ClaimAmount,
      ExpanseType: form.ExpenseName,
      files: form.files
    };
    addExpense(newExpense);
    setForm(prev => ({
      ...prev,
      TotalAmount: Number(form.TotalAmount) + Number(newExpense.ClaimAmount)
    }));
    setisOpen(false);
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
        UserAction: UserAction,
        Designation: Designation,
        Sequence: Sequence
      };
    }

    await service.createHistoryItem(payload);
  };
  const handleSubmit = async () => {
     if (!form.DepartmentName) {
      alert("Please select a Department");
      return false;
    }
    if (!form.TotalAmount || form.TotalAmount==0) {
      alert("Please add expenses.");
      return false;
    }
    if (!form.Remarks) {
      alert("Please enter remarks.");
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
        AssignedTo: dataApproverFI.ApproverName?.Title || "",
        DepartmentHead: dataApproverFI.ApproverName?.Title || "",
        ApprovalPath: dataApproverFI.ApproverName?.Title,
        ProjectTitle: 'Reimbursement',
        ProjectDescription: form.Remarks
      };
    }
    else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') && form.TotalAmount > 100000) {
      payload = {
        TotalClaimAmount: form.TotalAmount,
        Remarks: form.Remarks,
        DepartmentName: form.DepartmentName,
        CurrentStatus: 'Pending',
        AssignedToEmailId: Number(dataApprover.DepartmentHead?.Id || 0),
        DepartmentHead: dataApprover.DepartmentHead?.Title || "",
        FIApporver: dataApproverFI.ApproverName?.Title || "",
        FIApproverEmailId: Number(dataApproverFI.ApproverName?.Id || 0),
        ComplianceHeadEmailId: 0,
        CFOEmailId: Number(dataApproverCFO.ApproverName?.Id || 0),
        AssignedTo: dataApprover.DepartmentHead?.Title || "",
        ProjectTitle: 'Reimbursement',
        ProjectDescription: form.Remarks,
        ApprovalPath: dataApprover.DepartmentHead?.Title + ' > ' + dataApproverFI.ApproverName?.Title + ' > ' + dataApproverCFO.ApproverName?.Title + ' > ' + dataApproverFI.ApproverName?.Title
      }
    }
    else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') && form.TotalAmount < 100000) {
      payload = {
        TotalClaimAmount: form.TotalAmount,
        Remarks: form.Remarks,
        DepartmentName: form.DepartmentName,
        CurrentStatus: 'Pending',
        AssignedToEmailId: Number(dataApprover.DepartmentHead?.Id || 0),
        DepartmentHead: dataApprover.DepartmentHead?.Title || "",
        FIApporver: dataApproverFI.ApproverName?.Title || "",
        FIApproverEmailId: Number(dataApproverFI.ApproverName?.Id || 0),
        ComplianceHeadEmailId: Number(dataApproverCompliance.ApproverName?.Id || 0),
        CFOEmailId: 0,
        AssignedTo: dataApprover.DepartmentHead?.Title || "",
        ProjectTitle: 'Reimbursement',
        ProjectDescription: form.Remarks,
        ApprovalPath: dataApprover.DepartmentHead?.Title + ' > ' + dataApproverFI.ApproverName?.Title + ' > ' + dataApproverCompliance.ApproverName?.Title + ' > ' + dataApproverFI.ApproverName?.Title
      }
    }
    try {
      if (Expenseform.expenses.length > 0) {
        if (!itemId) {
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
                  if (resExpense.Id > 0 && Expenseform.expenses[i].files.length > 0) {
                    for (let k = 0; k < Expenseform.expenses[i].files.length; k++) {
                      await service.uploadFile(resExpense.Id, Expenseform.expenses[i].files[k]);
                    }
                  }                  
                }
              }
              if (form.DepartmentName == 'DH Branding' || form.DepartmentName == 'DH OGS' || form.DepartmentName == 'DH HR') {
                    await handleSaveHistory(res.Id, 'REM', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
                    await handleSaveHistory(res.Id, 'REM', dataApproverFI.ApproverName?.Title, 'Pending', 'Finance Approver', new Date(), 1);
                  }
                  else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') && form.TotalAmount > 100000) {
                    await handleSaveHistory(res.Id, 'REM', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
                    await handleSaveHistory(res.Id, 'REM', dataApprover.DepartmentHead?.Title, 'Pending', 'Department Head', new Date(), 1);
                    await handleSaveHistory(res.Id, 'REM', dataApproverFI.ApproverName?.Title, 'Upcoming', 'Finance Approver', new Date(), 2);
                    await handleSaveHistory(res.Id, 'REM', dataApproverCFO.ApproverName?.Title, 'Upcoming', 'CFO Approver', new Date(), 3);
                    await handleSaveHistory(res.Id, 'REM', dataApproverFI.ApproverName?.Title, 'Upcoming', 'Finance Approver', new Date(), 4);
                  }
                  else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') && form.TotalAmount < 100000) {
                    await handleSaveHistory(res.Id, 'REM', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
                    await handleSaveHistory(res.Id, 'REM', dataApprover.DepartmentHead?.Title, 'Pending', 'Department Head', new Date(), 1);
                    await handleSaveHistory(res.Id, 'REM', dataApproverFI.ApproverName?.Title, 'Upcoming', 'Finance Approver', new Date(), 2);
                    await handleSaveHistory(res.Id, 'REM', dataApproverCompliance.ApproverName?.Title, 'Upcoming', 'Compliance Head', new Date(), 3);
                    await handleSaveHistory(res.Id, 'REM', dataApproverFI.ApproverName?.Title, 'Upcoming', 'Finance Approver', new Date(), 4);
                  }
                  alert("Request Submitted Successfully ✅");
                  console.log("Successfully Transaction Saved:-" + res.Id);
                  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
                  window.location.assign(url);
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
                if (Number(Expenseform.expenses[i].Id) > 0) {
                  await service.updateExpenseItem(Number(Expenseform.expenses[i].Id), Expensepayload);
                }
                else {
                  const resExpense = await service.createExpenseItem(Expensepayload);
                  if (resExpense.Id > 0 && Expenseform.expenses[i].files.length > 0) {
                    for (let L = 0; L < Expenseform.expenses[i].files.length; L++) {
                      await service.uploadFile(resExpense.Id, Expenseform.expenses[i].files[L]);
                    }
                  }
                }
              }
              if (form.DepartmentName == 'DH Branding' || form.DepartmentName == 'DH OGS' || form.DepartmentName == 'DH HR') {
                await handleSaveHistory(itemId, 'REM', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
                await handleSaveHistory(itemId, 'REM', dataApproverFI.ApproverName?.Title, 'Pending', 'Finance Approver', new Date(), 1);
              }
              else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') && form.TotalAmount > 100000) {
                await handleSaveHistory(itemId, 'REM', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
                await handleSaveHistory(itemId, 'REM', dataApprover.DepartmentHead?.Title, 'Pending', 'Department Head', new Date(), 1);
                await handleSaveHistory(itemId, 'REM', dataApproverFI.ApproverName?.Title, 'Upcoming', 'Finance Approver', new Date(), 2);
                await handleSaveHistory(itemId, 'REM', dataApproverCFO.ApproverName?.Title, 'Upcoming', 'CFO Approver', new Date(), 3);
                await handleSaveHistory(itemId, 'REM', dataApproverFI.ApproverName?.Title, 'Upcoming', 'Finance Approver', new Date(), 4);
              }
              else if ((form.DepartmentName !== 'DH Branding' && form.DepartmentName !== 'DH OGS' && form.DepartmentName !== 'DH HR') && form.TotalAmount < 100000) {
                await handleSaveHistory(itemId, 'REM', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
                await handleSaveHistory(itemId, 'REM', dataApprover.DepartmentHead?.Title, 'Pending', 'Department Head', new Date(), 1);
                await handleSaveHistory(itemId, 'REM', dataApproverFI.ApproverName?.Title, 'Upcoming', 'Finance Approver', new Date(), 2);
                await handleSaveHistory(itemId, 'REM', dataApproverCompliance.ApproverName?.Title, 'Upcoming', 'Compliance Head', new Date(), 3);
                await handleSaveHistory(itemId, 'REM', dataApproverFI.ApproverName?.Title, 'Upcoming', 'Finance Approver', new Date(), 4);
              }
              alert("Request Submitted Successfully ✅");
              const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
              window.location.assign(url);
            }
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
    if (!form.TotalAmount || form.TotalAmount==0) {
      alert("Please add expenses.");
      return false;
    }
    if (!form.Remarks) {
      alert("Please enter remarks.");
      return false;
    }
    // 🔹 Payload (common)
    const payload = {
      TotalClaimAmount: form.TotalAmount,
      Remarks: form.Remarks,
      DepartmentName: form.DepartmentName,
      CurrentStatus: 'Draft',
      ProjectTitle: 'Reimbursement',
      ProjectDescription: form.Remarks
    };
    try {
      setLoading(true);
      if (Expenseform.expenses.length > 0) {
        if (!itemId) {
          const res = await service.createItem(payload);
          if (res.Id > 0) {
            setItemId(res.Id);
            await service.updateItem(res.Id, {
              RequestNo: `REM-${res.Id}`
            });
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
                if (Expenseform.expenses[i].files.length > 0) {
                  for (let k = 0; k < Expenseform.expenses[i].files.length; k++) {
                    await service.uploadFile(Expenseres.Id, Expenseform.expenses[i].files[k]);
                  }
                }
              }
            }
            setExpenseForm({
              ...Expenseform,
              expenses: []
            });
            const Expensedata = await service.getItemByExpenseData(Number(res.Id));
            if (Expensedata.value.length > 0) {
              const formattedExpenses = Expensedata.value.map((item: any) => ({
                Id: item.Id,
                Description: item.Description || "",
                BillAmount: item.BillAmount || 0,
                BillDate: item.BillDate ? new Date(item.BillDate) : new Date(),
                BillNo: item.BillNo || "",
                DocumentName: item.DocumentName || "",
                ClaimAmount: item.ClaimAmount || 0,
                ExpanseType: item.ExpanseType || "",
                files: item.AttachmentFiles ? item.AttachmentFiles.map((file: any) => ({
                  FileName: file.FileName,
                  ServerRelativeUrl: file.ServerRelativeUrl
                }))
                  : []
              }));
              setExpenseForm({
                expenses: formattedExpenses
              });

              alert("Request Saved Successfully ✅");
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
                await service.updateExpenseItem(Number(Expenseform.expenses[i].Id), Expensepayload);
              }
              else {
                const res = await service.createExpenseItem(Expensepayload);
                if (res.Id > 0) {
                  if (res.Id > 0 && Expenseform.expenses[i].files.length > 0) {
                    for (let L = 0; L < Expenseform.expenses[i].files.length; L++) {
                      await service.uploadFile(res.Id, Expenseform.expenses[i].files[L]);
                    }
                  }
                }
              }
            }
            const Expensedata = await service.getItemByExpenseData(Number(itemId));
            setExpenseForm({
              ...Expenseform,
              expenses: []
            });
            if (Expensedata.value.length > 0) {
              const formattedExpenses = Expensedata.value.map((item: any) => ({
                Id: item.Id,
                Description: item.Description || "",
                BillAmount: item.BillAmount || 0,
                BillDate: item.BillDate ? new Date(item.BillDate) : new Date(),
                BillNo: item.BillNo || "",
                DocumentName: item.DocumentName || "",
                ClaimAmount: item.ClaimAmount || 0,
                ExpanseType: item.ExpanseType || "",
                files: item.AttachmentFiles ? item.AttachmentFiles.map((file: any) => ({
                  FileName: file.FileName,
                  ServerRelativeUrl: file.ServerRelativeUrl
                }))
                  : []
              }));
              setExpenseForm({
                expenses: formattedExpenses
              });
            }
            alert("Request Updated Successfully ✅");
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
        DocumentID: '',
        files: []
      }));
    setisOpen(true);
    setLoading(false);
  };
  const removeExpense = async (index: number) => {
    const updatedExpenses = Expenseform.expenses.filter((_, i) => i !== index);
    if (Number(Expenseform.expenses[index].Id) > 0) {
      const datadelete = await service.deleteExpense(Number(Expenseform.expenses[index].Id))
      if (datadelete) {
        alert("Request Item deleted successfully.");
        const Expensedata = await service.getItemByExpenseData(Number(itemId));
        setExpenseForm({
          ...Expenseform,
          expenses: []
        });
        if (Expensedata !== null) {
          if (Expensedata.value.length > 0) {
            const formattedExpenses = Expensedata.value.map((item: any) => ({
              Id: item.Id,
              Description: item.Description || "",
              BillAmount: item.BillAmount || 0,
              BillDate: item.BillDate ? new Date(item.BillDate) : new Date(),
              BillNo: item.BillNo || "",
              DocumentName: item.DocumentName || "",
              ClaimAmount: item.ClaimAmount || 0,
              ExpanseType: item.ExpanseType || "",
              files: item.AttachmentFiles ? item.AttachmentFiles.map((file: any) => ({
                FileName: file.FileName,
                ServerRelativeUrl: file.ServerRelativeUrl
              }))
                : []
            }));
            setExpenseForm({
              expenses: formattedExpenses
            });
            setForm(prev => ({
              ...prev,
              TotalAmount: Number(form.TotalAmount) - Number(Expenseform.expenses[index].ClaimAmount)
            }));
          }
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
                    <p>
                      {exp.files?.length > 0 && (
                        <ul style={{ listStyle: "none", padding: 0 }}>
                          {exp.files?.length > 0 && (
                            <ul style={{ listStyle: "none", padding: 0 }}>
                              {exp.files.map((file: any, index: any) => (
                                <li
                                  key={index}
                                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                                >
                                  <a
                                    href={file.name ? file.name : file.ServerRelativeUrl}
                                    rel="noopener noreferrer"
                                  >
                                    <span>{file.name ? file.name : file.FileName}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </ul>
                      )}
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
              <label style={{ width: '45%' }}>Select Document<span className={styles.required}>*</span></label>
              <input type="file" style={{ width: '100%' }} multiple onChange={handleFileChange} />
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
            </div>
            <div className={styles.formGroup}>
              <label style={{ width: '30%' }}>Bill Number<span className={styles.required}>*</span></label>
              <input className="form-control" style={{ width: '100%' }} name="BillNo" value={form.BillNo} onChange={handleChange} onBlur={handleCheckbillNoExist} required />
            </div>
            <div className={styles.formGroup}>
              <label style={{ width: '30%' }}>Bill Amount<span className={styles.required}>*</span></label>
              <input className="form-control" style={{ width: '100%' }} type='number' name="BillAmount" value={form.BillAmount} onChange={handleChange} required>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{ width: '30%' }}>Bill Date<span className={styles.required}>*</span></label>
              <input className="form-control" style={{ width: '100%' }} type='Date' name="BillDate" value={form.BillDate
                ? new Date(form.BillDate).toISOString().split('T')[0]
                : ''} onChange={handleBillDateChange} required>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{ width: '30%' }}>Claim Amount<span className={styles.required}>*</span></label>
              <input className="form-control" type='number' style={{ width: '100%' }} name="ClaimAmount" value={form.ClaimAmount} onChange={handleClaimAmountChange} required>
              </input>
            </div>
            <div className={styles.formGroup}>
              <label style={{ width: '30%' }}>Description<span className={styles.required}>*</span></label>
              <input className="form-control" style={{ width: '100%' }} name="Description" value={form.Description} onChange={handleChange} required>
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

