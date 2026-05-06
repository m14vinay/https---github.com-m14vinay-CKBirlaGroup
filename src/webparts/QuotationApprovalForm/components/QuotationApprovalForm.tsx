import * as React from 'react';
import styles from './QuotationApprovalForm.module.scss';
import type { IQuotationApprovalFormProps } from './IQuotationApprovalFormProps';
import SharePointService from './Services/Service';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption } from '@fluentui/react';

import { IQuotationRequestNeiBtProps } from '../../quotationRequestNeiBt/components/IQuotationRequestNeiBtProps';

const QuotationApprovalForm = (props: IQuotationApprovalFormProps) => {

  // State
  type IForm = {
    ID: number;
    ProjectTitle: string;
    ProjectReffNo: string;
    ProjectDescription: string;

    TotalProjectAmount: number | '';
    ApplicableTaxes: number | '';

    Vendor1: string;
    Vendor2: string;
    Vendor3: string;

    Quote1: number | '';
    Quote2: number | '';
    Quote3: number | '';

    Selectedvendor: string;
    SelectedQuote: number | '';

    Department: string;
    Advancepayment: string;
    ApprovalPath: string;

    files: File[];

    CurrentStatus: string;
    ApprovalID: string;

    approver1: string;
    approver2: string;
    approver3: string;
    approver4: string;
    approver5: string;

    Approval1Id: number | null;
    Approval2Id: number | null;
    Approval3Id: number | null;

    Approval1: string;
    ApprovalPathID: string;
    Approval2: string;
    Approval3: string;

    AssignedTo: string | number;

    ActionDate1: string;
    ActionDate2: string;
    ActionDate3: string;

    DepartmentHead: string;
    RequestNo: string;
AdvancepaymentStatus: string;
    description: string;

    quantity: number | '';
    rate: number | '';
    amount: number | '';

    Comments: string;
  };

  const [form, setForm] = React.useState<IForm>({
    ID: 0,
    ProjectTitle: '',
    ProjectReffNo: '',
    ProjectDescription: '',

    TotalProjectAmount: '',
    ApplicableTaxes: '',

    Vendor1: '',
    Vendor2: '',
    Vendor3: '',

    Quote1: '',
    Quote2: '',
    Quote3: '',

    Selectedvendor: '',
    SelectedQuote: '',

    Department: '',
    Advancepayment: '',
    ApprovalPath: '',

    files: [],

    CurrentStatus: '',
    ApprovalID: '',

    approver1: '',
    approver2: '',
    approver3: '',
    approver4: '',
    approver5: '',

    Approval1Id: null,
    Approval2Id: null,
    Approval3Id: null,

    Approval1: '',
    ApprovalPathID: '',
    Approval2: '',
    Approval3: '',

    AssignedTo: '',

    ActionDate1: '',
    ActionDate2: '',
    ActionDate3: '',

    DepartmentHead: '',
    RequestNo: '',

    description: '',

    quantity: '',
    rate: '',
    amount: '',
AdvancepaymentStatus: '',
    Comments: ''
  });

  type TPurchaseOrderRow = {
    description: string;
    quantity: string;
    rate: string;
    amount: string;
  };

  const INITIAL_PO_ROW: TPurchaseOrderRow = {
    description: '',
    quantity: '',
    rate: '',
    amount: ''
  };

  const [AssignedID, setAssignedID] = React.useState<string | null>(null);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const [poItems, setPoItems] = React.useState<TPurchaseOrderRow[]>([INITIAL_PO_ROW]);
  const service = React.useMemo(() => new SharePointService(props.context), [props.context]);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const MAX_TOTAL_SIZE_MB = 51;
  const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/
  const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
  const [approvalChain, setApprovalChain] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [actionType, setActionType] = React.useState<'approve' | 'reject' | ''>('');
  const [approverOptions, setApproverOptions] = React.useState<any[]>([]);
  const [selectedApprover, setSelectedApprover] = React.useState<number | null>(null);
  //Get ID from query string ---
  const getIdFromQueryString = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('RequestId');
    return id ? parseInt(id, 10) : null;
  };
  React.useEffect(() => {
    const id = getIdFromQueryString();
    if (id) {
      handleFetchById(id);
      loadPurchaseOrderDetails(id);
      loadAttachments(id);
    }
    loadDepartments();
  }, []);

  const removeExistingFile = async (index: number) => {
    const file = attachments[index];

    await service.deleteAttachmentFromSP(file);
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const poOptions: IChoiceGroupOption[] = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' }
  ];

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
        const selected = poOptions.find(
    opt =>
      opt.text.trim().toLowerCase() ===
      result.Advancepayment?.trim().toLowerCase()
  );
        setForm(prev => ({
          ...prev,
          ProjectTitle: result.ProjectTitle || '',
          ProjectReffNo: result.ProjectReffNo || '',
          ProjectDescription: result.ProjectDescription || '',
          TotalProjectAmount: result.TotalProjectAmount || '0',
          ApplicableTaxes: result.ApplicableTaxes || '0',
          Vendor1: result.Vendor1 || '',
          Vendor2: result.Vendor2 || '',
          Vendor3: result.Vendor3 || '',
          Quote1: result.Quote1 || '0',
          Quote2: result.Quote2 || '0',
          Quote3: result.Quote3 || '0',
          Selectedvendor: result.Selectedvendor || '',
          SelectedQuote: result.SelectedQuote || '',
          Department: result.Department || '',
          Approval1Id: result.Approval1Id || 0,
          Approval2Id: result.Approval2Id || 0,
          Approval3Id: result.Approval3Id || 0,
          AssignedTo: result.AssignedTo || 0,
          ActionDate1: result.ActionDate1 ?? null,
          ActionDate2: result.ActionDate2 ?? null,
          ActionDate3: result.ActionDate3 ?? null,
          Advancepayment: result.Advancepayment || '',
          ApprovalPath: result.ApprovalPath || '',
          CurrentStatus: result.CurrentStatus || '',
          RequestNo: result.RequestNo || '',
           AdvancepaymentStatus: selected?.key || "" 
        }));
        if (result.Department) {
          // handleDepartmentChange(result.Department);
        }
      } else {
        alert("No Data Found");
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };
  //Load purchase order detail rows already stored against the current item.
  const loadPurchaseOrderDetails = React.useCallback(async (id: number) => {
    try {
      const items = await service.getPurchaseOrderDetails(id);
      if (!items || items.length === 0) {
        setPoItems([INITIAL_PO_ROW]);
        return;
      }

      setPoItems(items.map((item: any) => ({
        description: item.Description || item.Title || '',
        quantity: String(item.Quantity || ''),
        rate: String(item.Rate || ''),
        amount: String(item.Amount || '')
      })));
    } catch (error) {
      console.error('Purchase order details load failed:', error);
    }
  }, [service]);

  const addPurchaseOrderRow = () => {
    setPoItems((prev) => [...prev, { ...INITIAL_PO_ROW }]);
  };

  const handlecheckamount = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
    const selectedQuote = Number(value || 0);
    const totalAmount = Number(form.TotalProjectAmount || 0);

    if (selectedQuote > totalAmount) {
      setForm(prev => ({
        ...prev,
        SelectedQuote: 0
      }));

      alert("Selected Quote cannot be greater than Total Project Amount.");
      return;
    }
  }
  // Remove one purchase order row while keeping at least one visible.
  const removePurchaseOrderRow = (index: number) => {
    setPoItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [{ ...INITIAL_PO_ROW }];
    });
  };

  // Update PO row values and recalculate amount from quantity x rate.
  const handlePurchaseOrderChange = (index: number, field: keyof TPurchaseOrderRow, value: string) => {
    setPoItems((prev) => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'rate') {
        const quantity = Number(field === 'quantity' ? value : row.quantity) || 0;
        const rate = Number(field === 'rate' ? value : row.rate) || 0;
        row.amount = quantity && rate ? String(quantity * rate) : '';
      }

      updated[index] = row;
      return updated;
    });
  };

  const loadAttachments = async (id: number) => {
    try {
      const files = await service.getAttachments(id);
      console.log("Attachments:", files);
      setAttachments(files);
    } catch (error) {
      console.error(error);
    }
  };
  const loadDepartments = async () => {
    try {
      const res = await service.getAllDepartments();
      setDepartmentOptions(
        (res || []).map((item: any) => ({
          key: item.DepartmentName,
          text: item.DepartmentName
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };
  const handleDepartmentChange = async (departmentValue: string) => {
    const dept = departmentValue.trim();
    setApproverOptions([]);
    setSelectedApprover(null);
    setForm(prev => ({
      ...prev,
      Department: dept,
      ApprovalPath: ''
    }));
    if (!dept) return;
    try {
      const data = await service.getDepartmentApprovers(dept);
      if (!data || data.length === 0) {
        alert("No approvers found in DepartmentMaster list");
        return;
      }
      const amount = Number(form.TotalProjectAmount) || 0;
      // ✅ CASE 1 → <= 200000
      if (amount <= 200000) {
        const approvers = [
          { name: data[0]?.Approval1?.Title, id: data[0]?.Approval1?.Id }
        ].filter(a => a.name && a.id);
        if (!approvers.length) {
          alert("No approvers found in DepartmentMaster list");
          return;
        }
        setApprovalChain(approvers);
        setForm(prev => ({
          ...prev,
          Department: dept,
          DepartmentHead: approvers[0]?.name || '',
          ApprovalPath: approvers.map(a => a.name).join(" > "),
          Approval1Id: approvers[0]?.id || 0
        }));
        setSelectedApprover(approvers[0]?.id || null);
        return;
      }

      // ✅ CASE 2 → Branding → dropdown
      else if (amount > 200000 && dept.toLowerCase() === "branding") {
        const approvers = [
          { name: data[0]?.Approval1?.Title, id: data[0]?.Approval1?.Id },
          { name: data[0]?.Approval2?.Title, id: data[0]?.Approval2?.Id },
          { name: data[0]?.Approval3?.Title, id: data[0]?.Approval3?.Id },
          { name: data[0]?.Approval4?.Title, id: data[0]?.Approval4?.Id }
        ].filter(a => a.name && a.id);
        if (!approvers.length) {
          alert("No approvers found in DepartmentMaster list");
          return;
        }
        setApprovalChain(approvers);
        const dropdownApprovers = approvers.slice(1, 3);
        setApproverOptions(
          dropdownApprovers.map(a => ({
            key: a.id,
            text: a.name
          }))
        );
        setForm(prev => ({
          ...prev,
          Department: dept,
          DepartmentHead: approvers[0]?.name || '',
          ApprovalPath: approvers[0]?.name || ''
        }));

        return;
      }

      else {
        const approvers = [
          { name: data[0]?.Approval1?.Title, id: data[0]?.Approval1?.Id },
          { name: data[0]?.Approval2?.Title, id: data[0]?.Approval2?.Id },
          { name: data[0]?.Approval3?.Title, id: data[0]?.Approval3?.Id },
          { name: data[0]?.Approval4?.Title, id: data[0]?.Approval4?.Id }
        ].filter(a => a.name && a.id);
        if (!approvers.length) {
          alert("No approvers found in DepartmentMaster list");
          return;
        }
        setApprovalChain(approvers);
        const path = approvers.map(a => a.name).join(" > ");
        setForm(prev => ({
          ...prev,
          Department: dept,
          DepartmentHead: approvers[0]?.name || '',
          ApprovalPath: path,
          Approval1Id: approvers[0]?.id || null
        }));

        console.log("FINAL PATH:", path);

        setTimeout(() => {
          console.log("Updated ApprovalPath:", approvers.map(a => a.name).join(" > "));
        }, 0);

        // optional
        setSelectedApprover(approvers[0]?.name || null);

      }
    } catch (error) {
      console.error("Approver fetch error:", error);
    }
  };
  const handleApproverSelect = (id: number) => {
    console.log("Selected Approver ID:", id);
    setSelectedApprover(id);
    const selected = approverOptions.find(a => a.key === id);
    setForm(prev => ({
      ...prev,
      ApprovalPath: prev.DepartmentHead + ' > ' + (selected?.text || '')
    }));
  };
  const handleCancel = () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
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
      if (!fileExtension || allowedExtensions.indexOf(fileExtension) === -1) {
        alert(`File Type Not Allowed: ${file.name}. Only PDF, XLSX, DOCX are allowed.`);
        return; // stop execution
      }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value

    });
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

  const handleSaveOrUpdate = async () => {
    try {
      setLoading(true);
      if (!form.ProjectTitle) return alert("Enter Project Title ");
       if(!form.ProjectDescription) return alert("Enter ProjectDescription");
      if (!form.Vendor1) return alert("Enter Vendor1 ");
      if (!form.Quote1) return alert("Enter Quote1");
      if (!form.Selectedvendor) return alert("Please Select Vendor");
      if (!form.SelectedQuote) return alert("Please Selected Quote");
      if (!form.Department) return alert("Please Select Department Name");
      if (!form.AdvancepaymentStatus) return alert("Please Select Advance Payment");
      if (!form.ApprovalPath) return alert("Please select Approval.");
      let payload = {};
      if (Number(form.TotalProjectAmount) <= 200000)
        payload = {
          ProjectTitle: form.ProjectTitle || "",
          ProjectReffNo: form.ProjectReffNo || "",
          ProjectDescription: form.ProjectDescription || "",
          TotalProjectAmount: String(form.TotalProjectAmount || '') as string,
          ApplicableTaxes: String(form.ApplicableTaxes || '') as string,
          Vendor1: form.Vendor1 || "",
          Vendor2: form.Vendor2 || "",
          Vendor3: form.Vendor3 || "",
          Quote1: String(form.Quote1?.toString() || '') as string,
          Quote2: String(form.Quote2?.toString() || '') as string,
          Quote3: String(form.Quote3?.toString() || '') as string,
          Selectedvendor: form.Selectedvendor || "",
          SelectedQuote: String(form.SelectedQuote?.toString() || '') as string  ,
          Department: form.Department || "",
          Advancepayment: form.Advancepayment || "",
          ApprovalPath: form.ApprovalPath || "",
          CurrentStatus: "Draft"
        };

      else if (Number(form.TotalProjectAmount) > 200000 && form.Department === "Branding") {
        payload = {
          ProjectTitle: form.ProjectTitle || "",
          ProjectReffNo: form.ProjectReffNo || "",
          ProjectDescription: form.ProjectDescription || "",
          TotalProjectAmount: String(form.TotalProjectAmount || '') as string,
          ApplicableTaxes: String(form.ApplicableTaxes || '') as string,
          Vendor1: form.Vendor1 || "",
          Vendor2: form.Vendor2 || "",
          Vendor3: form.Vendor3 || "",
          Quote1: String(form.Quote1?.toString() || '') as string,
          Quote2: String(form.Quote2?.toString() || '') as string,
          Quote3: String(form.Quote3?.toString() || '') as string,
          SelectedQuote: String(form.SelectedQuote?.toString() || '') as string,
          Selectedvendor: form.Selectedvendor || "",
          Department: form.Department || "",
          Advancepayment: form.Advancepayment || "",
          ApprovalPath: form.ApprovalPath || "",
          CurrentStatus: "Draft"
        };
      }
      else {
        payload = {
          ProjectTitle: form.ProjectTitle || "",
          ProjectReffNo: form.ProjectReffNo || "",
          ProjectDescription: form.ProjectDescription || "",
          TotalProjectAmount: String(form.TotalProjectAmount || '') as string,
          ApplicableTaxes: String(form.ApplicableTaxes || '') as string,
          Vendor1: form.Vendor1 || "",
          Vendor2: form.Vendor2 || "",
          Vendor3: form.Vendor3 || "",
          Quote1: String(form.Quote1 || '') as string,
          Quote2: String(form.Quote2 || '') as string,
          Quote3: String(form.Quote3 || '') as string,
          SelectedQuote: String(form.SelectedQuote || '') as string  ,
          Selectedvendor: form.Selectedvendor || "",
          Department: form.Department || "",
          Advancepayment: form.Advancepayment || "",
          ApprovalPath: form.ApprovalPath || "",
          CurrentStatus: "Draft"
        };
      }
      if (!itemId) {
        if (!form.files || form.files.length === 0)
          return alert("Attach files");
        const res = await service.createItem(payload);
        setItemId(res.Id);
        // SAVE PO DETAILS
        await service.deletePurchaseOrderDetailsByQuotationId(res.Id);
        for (let i = 0; i < poItems.length; i++) {
          const row = poItems[i];
          if (!row.description) continue;
          await service.createPurchaseOrderDetail({
            Title: row.description,
            Description: row.description,
            Quantity: Number(row.quantity) || 0,
            Rate: Number(row.rate) || 0,
            Amount: Number(row.amount) || 0,
            QuotationIdId: res.Id
          });
        }
        // 🔹 Attachments
        if (form.files.length > 0) {
          for (let i = 0; i < form.files.length; i++) {
            await service.uploadFile(res.Id, form.files[i]);
          }
        }
        await service.updateItem(res.Id, {
          RequestNo: `PRJ-${res.Id}`
        });
        alert("Request Saved Successfully ✅");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
      }
      else {
        if ((!attachments || attachments.length === 0) && (!form.files || form.files.length === 0))
          return alert("Attach files");
        await service.updateItem(itemId, payload);
        await service.deletePurchaseOrderDetailsByQuotationId(itemId);
        for (let i = 0; i < poItems.length; i++) {
          const row = poItems[i];
          if (!row.description) continue;

          await service.createPurchaseOrderDetail({
            Title: row.description,
            Description: row.description,
            Quantity: Number(row.quantity) || 0,
            Rate: Number(row.rate) || 0,
            Amount: Number(row.amount) || 0,
            QuotationIdId: itemId
          });
        }
        for (let i = 0; i < form.files.length; i++) {
          await service.uploadFile(itemId, form.files[i]);
        }
        alert("Request Updated Successfully ✅");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      if (!form.ProjectTitle) return alert("Enter Project Title ");
       if(!form.ProjectDescription) return alert("Enter ProjectDescription");
      if (!form.Vendor1) return alert("Enter Vendor1 ");
      if (!form.Quote1) return alert("Enter Quote1");
      if (!form.Selectedvendor) return alert("Please Select Vendor");
      if (!form.SelectedQuote) return alert("Please Selected Quote");
      if (!form.Department) return alert("Please Select Department Name");
      if (!form.AdvancepaymentStatus) return alert("Please Select Advance Payment");
      if (!form.ApprovalPath) return alert("Please select Approval.");
      if ((!form.files || form.files.length === 0) && (!attachments || attachments.length === 0)) return alert("Attach files");
      const dataApprover = await service.getDepartmentApprovers(form.Department);
      const currentuser = await service.getUser();
      const approver = dataApprover[0];
      let payload = {};
      if (Number(form.TotalProjectAmount) <= 200000)
        payload = {
          ProjectTitle: form.ProjectTitle || "",
          ProjectReffNo: form.ProjectReffNo || "",
          ProjectDescription: form.ProjectDescription || "",
          TotalProjectAmount: String(form.TotalProjectAmount?.toString() || '') as string,
          ApplicableTaxes: String(form.ApplicableTaxes?.toString() || '0') as string,
          Vendor1: form.Vendor1 || "",
          Vendor2: form.Vendor2 || "",
          Vendor3: form.Vendor3 || "",
          Quote1: String(form.Quote1?.toString() || '0') as string,
          Quote2: String(form.Quote2?.toString() || '0') as string,
          Quote3: String(form.Quote3?.toString() || '0') as string,
          SelectedQuote: String(form.SelectedQuote?.toString() || '0') as string  ,
          Selectedvendor: form.Selectedvendor || "",
          Department: form.Department || "",
          Advancepayment: form.Advancepayment || "",
          ApprovalPath: form.ApprovalPath || "",
          AssignedTo: approver?.Approval1?.Title,
          AssignedToEmailId: approver?.Approval1?.Id || 0,
          Approval1Id: Number(dataApprover[0]?.Approval1?.Id || null),
          CurrentStatus: "Pending"
        };

      else if (Number(form.TotalProjectAmount) > 200000 && form.Department === "Branding") {
        {
          const Users = form.ApprovalPath.split(">");
          const User1 = Users[0].trim();
          const User2 = Users[1].trim();
          const UserAprrover1=await service.getUserIdByName(User1.trim());
          const UserAprrover2=await service.getUserIdByName(User2.trim());
          payload = {
            ProjectTitle: form.ProjectTitle || "",
            ProjectReffNo: form.ProjectReffNo || "",
            ProjectDescription: form.ProjectDescription || "",
            TotalProjectAmount: String(form.TotalProjectAmount || '0') as string,
            ApplicableTaxes: String(form.ApplicableTaxes || '0') as string,
            Vendor1: form.Vendor1 || "",
            Vendor2: form.Vendor2 || "",
            Vendor3: form.Vendor3 || "",
            Quote1: String(form.Quote1 || '0') as string,
            Quote2: String(form.Quote2 || '0') as string,
            Quote3: String(form.Quote3 || '0') as string,
            SelectedQuote: String(form.SelectedQuote || '0') as string  ,
            Selectedvendor: form.Selectedvendor || "",
            Department: form.Department || "",
            Advancepayment: form.Advancepayment || "",
            ApprovalPath: form.ApprovalPath || "",
            AssignedTo: approver?.Approval1?.Title || "",
            AssignedToEmailId: approver?.Approval1?.Id || null,
            Approval1Id: Number(UserAprrover1),
            Approval2Id: Number(UserAprrover2),
            CurrentStatus: "Pending"
          };
        }
      }
      else {
        payload = {
          ProjectTitle: form.ProjectTitle || "",
          ProjectReffNo: form.ProjectReffNo || "",
          ProjectDescription: form.ProjectDescription || "",
          TotalProjectAmount: String(form.TotalProjectAmount || '') as string,
          ApplicableTaxes: String(form.ApplicableTaxes || '') as string,
          Vendor1: form.Vendor1 || "",
          Vendor2: form.Vendor2 || "",
          Vendor3: form.Vendor3 || "",
          Quote1: String(form.Quote1 || '') as string,
          Quote2: String(form.Quote2 || '') as string,
          Quote3: String(form.Quote3 || '') as string,
          SelectedQuote: String(form.SelectedQuote || '') as string  ,
          Selectedvendor: form.Selectedvendor || "",
          Department: form.Department || "",
          Advancepayment: form.Advancepayment || "",
          ApprovalPath: form.ApprovalPath || "",
          AssignedTo: approver?.Approval1?.Title || "",
          AssignedToEmailId: approver?.Approval1?.Id || null,
          Approval1Id: Number(dataApprover[0].Approval1.Id || null),
          Approval2Id: Number(dataApprover[0].Approval2.Id || null),
          Approval3Id: Number(dataApprover[0].Approval3.Id || null),
          CurrentStatus: "Pending"
        };
      }

      if (!itemId) {
        // ✅ CREATE
        const res = await service.createItem(payload);
        setItemId(res.Id);
        await service.deletePurchaseOrderDetailsByQuotationId(res.Id);
        for (let i = 0; i < poItems.length; i++) {
          const row = poItems[i];
          if (!row.description) continue;
          await service.createPurchaseOrderDetail({
            Title: row.description,
            Description: row.description,
            Quantity: Number(row.quantity) || 0,
            Rate: Number(row.rate) || 0,
            Amount: Number(row.amount) || 0,
            QuotationIdId: res.Id
          });
        }
        // 🔹 Attachments
        if (form.files.length > 0) {
          for (let i = 0; i < form.files.length; i++) {
            await service.uploadFile(res.Id, form.files[i]);
          }
        }
        await service.updateItem(res.Id, {
          RequestNo: `PRJ-${res.Id}`
        });
        if (Number(form.TotalProjectAmount) <= 200000) {
          await handleSaveHistory(res.Id, 'QA', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(res.Id, 'QA', dataApprover[0]?.Approval1?.Title, 'Pending', 'Department Head', new Date(), 1);
        }
        else if (Number(form.TotalProjectAmount) > 200000 && form.Department === "Branding") {
          const Users = form.ApprovalPath.split(">");
          const User1 = Users[0].trim();
          const User2 = Users[1].trim();
          const UserAprrover1=await service.getUserIdByName(User1.trim());
          const UserAprrover2=await service.getUserIdByName(User2.trim());
          const UserApprover1Name=await service.getUserById(Number(UserAprrover1));
          const UserApprover2Name=await service.getUserById(Number(UserAprrover2));
          await handleSaveHistory(res.Id, 'QA', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(res.Id, 'QA', UserApprover1Name?.Title, 'Pending', 'Department Head', new Date(), 1);
          await handleSaveHistory(res.Id, 'QA', UserApprover2Name?.Title, 'Upcoming', 'Management1', new Date(), 2);
        }
        else {
          await handleSaveHistory(res.Id, 'QA', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(res.Id, 'QA', dataApprover[0]?.Approval1?.Title, 'Pending', 'Department Head', new Date(), 1);
          await handleSaveHistory(res.Id, 'QA', dataApprover[0]?.Approval2?.Title, 'Upcoming', 'Management1', new Date(), 2);
          await handleSaveHistory(res.Id, 'QA', dataApprover[0]?.Approval3?.Title, 'Upcoming', 'Management2', new Date(), 3);
        }
        alert("Request Submitted Successfully");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
      } else {
        await service.updateItem(itemId, payload);
        await service.deletePurchaseOrderDetailsByQuotationId(itemId);
        for (let i = 0; i < poItems.length; i++) {
          const row = poItems[i];
          if (!row.description) continue;

          await service.createPurchaseOrderDetail({
            Title: row.description,
            Description: row.description,
            Quantity: Number(row.quantity) || 0,
            Rate: Number(row.rate) || 0,
            Amount: Number(row.amount) || 0,
            QuotationIdId: itemId
          });
        }
        for (let i = 0; i < form.files.length; i++) {
          await service.uploadFile(itemId, form.files[i]);
        }
        if (Number(form.TotalProjectAmount) <= 200000) {
          await handleSaveHistory(itemId, 'QA', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(itemId, 'QA', dataApprover[0]?.Approval1?.Title, 'Pending', 'Department Head', new Date(), 1);
        }
        else if (Number(form.TotalProjectAmount) > 200000 && form.Department === "Branding") {
          const Users = form.ApprovalPath.split(">");
          const User1 = Users[0].trim();
          const User2 = Users[1].trim();
          const UserAprrover1=await service.getUserIdByName(User1.trim());
          const UserAprrover2=await service.getUserIdByName(User2.trim());
          const UserApprover1Name=await service.getUserById(Number(UserAprrover1));
          const UserApprover2Name=await service.getUserById(Number(UserAprrover2));
          await handleSaveHistory(itemId, 'QA', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(itemId, 'QA', UserApprover1Name?.Title, 'Pending', 'Department Head', new Date(), 1);
          await handleSaveHistory(itemId, 'QA', UserApprover2Name?.Title, 'Upcoming', 'Management1', new Date(), 2);
        }
        else {
          await handleSaveHistory(itemId, 'QA', currentuser?.Title, 'Request Initiator', 'Request Initiator', new Date(), 0);
          await handleSaveHistory(itemId, 'QA', dataApprover[0]?.Approval1?.Title, 'Pending', 'Department Head', new Date(), 1);
          await handleSaveHistory(itemId, 'QA', dataApprover[0]?.Approval2?.Title, 'Upcoming', 'Management1', new Date(), 2);
          await handleSaveHistory(itemId, 'QA', dataApprover[0]?.Approval3?.Title, 'Upcoming', 'Management2', new Date(), 3);
        }
        alert("Request Submitted Successfully");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Error occurred");
    }
    finally {
      setLoading(false);
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

        <div className={styles.row}>
          <div className={styles["col-md-9"]}>
            <div className={styles.leftPanel}>
              <div className={styles.leftPanelHeader}>
                <h4>Quotation Approval </h4>
              </div>

              <label>Project Title <span className={styles.required}>*</span></label>
              <input name="ProjectTitle" value={form.ProjectTitle} onChange={handleChange} />

              <label>Project Reference No</label>
              <input name="ProjectReffNo" value={form.ProjectReffNo} onChange={handleChange} />


              <label>Project Description & Advance Payment Details <span className={styles.required}>*</span></label>
              <input name="ProjectDescription" value={form.ProjectDescription} onChange={handleChange} />


              <label>Total Project Amount</label>
              <input name="TotalProjectAmount" value={form.TotalProjectAmount} type='number' onChange={handleChange} />

              <label>Applicable Taxes</label>
              <input name="ApplicableTaxes" value={form.ApplicableTaxes} type='number' onChange={handleChange} />
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldBlock}>
                  <label>Vendor 1 <span className={styles.required}>*</span></label>
                  <input name="Vendor1" value={form.Vendor1} onChange={handleChange} />
                </div>
                <div className={styles.fieldBlock}>
                  <label>Quote 1 <span className={styles.required}>*</span></label>
                  <input name="Quote1" value={form.Quote1} type='number' onChange={handleChange} />
                </div>
              </div>

              <div className={styles.twoColumnRow}>
                <div className={styles.fieldBlock}>
                  <label>Vendor 2</label>
                  <input name="Vendor2" value={form.Vendor2} onChange={handleChange} />
                </div>
                <div className={styles.fieldBlock}>
                  <label>Quote 2</label>
                  <input name="Quote2" value={form.Quote2} type='number' onChange={handleChange} />
                </div>
              </div>

              <div className={styles.twoColumnRow}>
                <div className={styles.fieldBlock}>
                  <label>Vendor 3</label>
                  <input name="Vendor3" value={form.Vendor3} onChange={handleChange} />
                </div>
                <div className={styles.fieldBlock}>
                  <label>Quote 3</label>
                  <input name="Quote3" value={form.Quote3} type='number' onChange={handleChange} />
                </div>
              </div>

              <label>Select Vendor <span className={styles.required}>*</span></label>
              <input name="Selectedvendor" value={form.Selectedvendor} onChange={handleChange} />

              <label>Selected Quote <span className={styles.required}>*</span></label>
              <input name="SelectedQuote" value={form.SelectedQuote} onChange={handlecheckamount} type='number' />

              <label>Department <span className={styles.required}>*</span></label>
              <select
                value={form.Department}
                onChange={(e) => {
                  const value = e.target.value;

                  setForm(prev => ({
                    ...prev,
                    Department: value
                  }));

                  handleDepartmentChange(value);
                }}
              >
                <option value="">Select Department</option>

                {departmentOptions.map((opt: any, i: number) => (
                  <option key={i} value={opt.key}>
                    {opt.text}
                  </option>
                ))}
              </select>
              <ChoiceGroup
                label="Advance Payment"
                options={poOptions}
                selectedKey={form.AdvancepaymentStatus} // selectedKey ko key set karo based on text match
                onChange={(_, option) => {
                  setForm(prev => ({
                    ...prev,
                    Advancepayment: option?.text || "",  // text store karo
                    AdvancepaymentStatus: option?.key || ""
                  }));
                }}
              />

              <label>Approval Path<span className={styles.required}>*</span></label>
              <input value={form.ApprovalPath || ""} readOnly style={{ backgroundColor: "lightgray" }} />
              {Number(form.TotalProjectAmount || 0) > 200000 && approverOptions.length > 0 && (
                <>
                  <label>Select Approver <span className={styles.required}>*</span></label>
                  <select
                    value={selectedApprover ?? ''}
                    onChange={(e) => handleApproverSelect(Number(e.target.value))}
                  >
                    <option value="">Select Approver</option>
                    {approverOptions.map((opt, i) => (
                      <option key={i} value={opt.key}>
                        {opt.text}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <label>Attachments <span className={styles.required}>*</span></label>
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
                        href={`${window.location.origin}${file.ServerRelativeUrl}`}
                        target="_blank"
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

              {/* Purchase order section */}
              <div className={styles.poSection}>
                <div className={styles.poSectionHeader}>
                  <label>Purchase Order Details <span className={styles.required}>*</span> :</label>
                  <button type="button" className={styles.poAddBtn} onClick={addPurchaseOrderRow} >
                    Add New
                  </button>
                </div>

                <div className={styles.poTable}>
                  <div className={styles.poRowHeader}>
                    <div>Description of Goods/Services</div>
                    <div>Quantity</div>
                    <div>Rate</div>
                    <div>Amount</div>
                    <div />
                  </div>

                  {poItems.map((item, index) => (
                    <div key={index} className={styles.poRow}>
                      <input
                        className={styles.poDescriptionInput}
                        value={item.description || ""}
                        onChange={(e) => handlePurchaseOrderChange(index, 'description', e.target.value)}
                        placeholder="Enter description"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handlePurchaseOrderChange(index, 'quantity', e.target.value)}
                      />
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handlePurchaseOrderChange(index, 'rate', e.target.value)}
                      />
                      <input value={item.amount} readOnly />
                      <button type="button" className={styles.poDeleteBtn} onClick={() => removePurchaseOrderRow(index)}>
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Buttons */}
              <div className={styles['btn-group']}>
                <button className={styles.submitBtn} onClick={handleUpdate}>Submit</button>&nbsp;
                <button className={styles.saveBtn} onClick={handleSaveOrUpdate}>Save</button>&nbsp;
                <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
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
                      href={`${props.context.pageContext.web.absoluteUrl}/SampleDocuments/Quotation_Approval_Form_v1.0.xlsx`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Quotation_Approval_Form_v1.0.xlsx
                    </a>
                  </p>
                  <p>
                    <a
                      href={`${props.context.pageContext.web.absoluteUrl}/SampleDocuments/SOP_Procurement_of_Goods_Services-CKBCSL-V1.1_wef_15.09.2016.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      SOP_Procurement_of_Goods_Services-CKBCSL-V1.1_wef_15.09.2016.pdf
                    </a>
                  </p>
                  <p>
                    <a
                      href={`${props.context.pageContext.web.absoluteUrl}/SampleDocuments/WSR5June.docx`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      CKBirla WSR 5June.docx
                    </a>
                  </p>
                  <p>
                    <a
                      href={`${props.context.pageContext.web.absoluteUrl}/SampleDocuments/SharePointtestpage.docx`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      SharePoint test page.docx
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
                  <li>Please select approval path suitably from the options which system proposes. In case of any doubt on approval path selection please refer the policy note on this page.
                    Please connect with Finance Deptt for any clarification.</li>
                  <li>Please take note that if you wish to create a new quotation request with reference to an earlier project, then the same can be specified in 'Project Reference' field in this form.</li>
                  <li>Attach all documents (excel form, pdf, emails, scan documents etc) before submitting the form. Once form is submitted it is non-editable. Total attachment size limit is 25 MB.</li>
                  <li>It is recommended that the attachment name to not have spaces e.g. Email_VendorA_20-Jun.pdf.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default QuotationApprovalForm;