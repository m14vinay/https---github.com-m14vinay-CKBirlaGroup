import * as React from 'react';
import styles from './QuotationApprovalForm.module.scss';
import type { IQuotationApprovalFormProps } from './IQuotationApprovalFormProps';
import SharePointService from './Services/Service';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption } from '@fluentui/react';

import { IQuotationRequestNeiBtProps } from '../../quotationRequestNeiBt/components/IQuotationRequestNeiBtProps';

const QuotationApprovalForm = (props: IQuotationApprovalFormProps) => {

  // State
  const [form, setForm] = React.useState({
    ID: 0,
    ProjectTitle: '',
    ProjectReffNo: '',
    ProjectDescription: '',
    TotalProjectAmount: 0,
    ApplicableTaxes: 0,
    Vendor1: '',
    Vendor2: '',
    Vendor3: '',
    Quote1: 0,
    Quote2: 0,
    Quote3: 0,
    Selectedvendor: '',
    SelectedQuote: '',
    Department: '',
    Advancepayment: '',
    ApprovalPath: '',
    files: [] as File[],
    CurrentStatus: '',
    ApprovalID: '',
    approver1: '',
    approver2: '',
    approver3: '',
    approver4: '',
    approver5: '',
    Approval1Id: 0, //Change in num
    Approval2Id: 0,
    Approval3Id: 0,
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
    quantity: 0,
    rate: 0,
    amount: 0,
    Comments: ''
    //selectedApprover: 0
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
  const MAX_TOTAL_SIZE_MB = 25;
  const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/
  const [departmentOptions, setDepartmentOptions] = React.useState<IDropdownOption[]>([]);
  const [approvalChain, setApprovalChain] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [actionType, setActionType] = React.useState<'approve' | 'reject' | ''>('');
  //const [approverOptions, setApproverOptions] = React.useState<string[]>([]);
  const [approverOptions, setApproverOptions] = React.useState<any[]>([]);

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
      if (
        result.AuthorId !== currentUser.Id &&
        result.AssignedToEmailId !== currentUser.Id
      ) {
        alert("You Are Not Authorized ❌");
        return;
      }
      if (result) {
        setItemId(result.Id);

        setForm(prev => ({
          ...prev,
          ProjectTitle: result.ProjectTitle || '',
          ProjectReffNo: result.ProjectReffNo || '',
          ProjectDescription: result.ProjectDescription || '',
          TotalProjectAmount: result.TotalProjectAmount || 0,
          ApplicableTaxes: result.ApplicableTaxes || 0,
          Vendor1: result.Vendor1 || '',
          Vendor2: result.Vendor2 || '',
          Vendor3: result.Vendor3 || '',
          Quote1: result.Quote1 || '',
          Quote2: result.Quote2 || '',
          Quote3: result.Quote3 || '',
          Selectedvendor: result.Selectedvendor || '',
          SelectedQuote: result.SelectedQuote || '',
          Department: result.Department || '',
          Approval1Id: result.Approval1Id || 0,
          Approval2Id: result.Approval2Id || 0,
          Approval3Id: result.Approval3Id || 0,
          AssignedToId: result.AssignedToId || 0,
          ActionDate1: result.ActionDate1 ?? null,
          ActionDate2: result.ActionDate2 ?? null,
          ActionDate3: result.ActionDate3 ?? null,
          Advancepayment: result.Advancepayment || '',
          ApprovalPath: result.ApprovalPath || '',
          CurrentStatus: result.CurrentStatus || '',
          RequestNo: result.RequestNo || '',


        }));

        if(result.Department){
          handleDepartmentChange(result.Department);
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


  // Add a blank purchase order row.
  const addPurchaseOrderRow = () => {
    setPoItems((prev) => [...prev, { ...INITIAL_PO_ROW }]);
  };

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
  React.useEffect(() => {
    if (itemId) {
      loadAttachments(itemId);
      //getApprover();
    }
  }, [itemId]);
  // Track the selected approver for amounts > 200,000
  const [selectedApprover, setSelectedApprover] = React.useState<number | null>(null);
  React.useEffect(() => {
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
    loadDepartments();
  }, []);

  const handleDepartmentChange = async (departmentValue: string) => {

    const dept = departmentValue.trim();

    // reset
    setApproverOptions([]);
    setSelectedApprover(null);
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
          //Approval1Id: approvers[0]?.id?.toString() || null
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
        setSelectedApprover(approvers[0]?.id || null);

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



  // 🔹 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: name.includes("Amount") || name.includes("Quote")
        ? Number(value)
        : value
    }));
  };

  const handleSaveHistory = async (id: number) => {

    const currentuser = await service.getUser();

    const payload = {
      Title: 'QA',
      FID: id,
      UserName: currentuser.Title,
      UserAction: 'Request Initiator',
      ActionDate: new Date().toISOString(),
      Designation: 'Request Initiator',
    };

    await service.createHistoryItem(payload);
  };

  const handleSaveOrUpdate = async () => {
    try {
      setLoading(true);

      const currentuser = await service.getUser();

      // 🔹 Validations
      if (!form.ProjectTitle) return alert("Enter Project Title ");
      if (!form.Vendor1) return alert("Enter Vendor1 ");
      if (!form.Quote1) return alert("Enter Quote1");
      if (!form.Selectedvendor) return alert("Please Select Vendor");
      if (!form.SelectedQuote) return alert("Please Selected Quote");
      if (!form.Department) return alert("Please Select Department Name");
      if (!form.Advancepayment) return alert("Please Select Advance Payment");
      if (!form.files || form.files.length === 0) return alert("Attach files");

      const dataApprover = await service.getDepartmentApprovers(form.Department);

      const approver = dataApprover[0];
      const user = await service.getUserById(approver?.Approval1?.Id);
      if (!approver?.Approval1?.Id) {
        alert("Approval1 not configured ❌");
        return;
      }

      // 🔹 MAIN PAYLOAD (NO PODetails)
      let payload = {};

      if (form.TotalProjectAmount <= 200000)
        payload = {
          ProjectTitle: form.ProjectTitle || "",
          ProjectReffNo: form.ProjectReffNo || "",
          ProjectDescription: form.ProjectDescription || "",
          TotalProjectAmount: Number(form.TotalProjectAmount) || null,
          ApplicableTaxes: Number(form.ApplicableTaxes) || 0,
          Vendor1: form.Vendor1 || "",
          Vendor2: form.Vendor2 || "",
          Vendor3: form.Vendor3 || "",
          Quote1: form.Quote1?.toString() || "",
          Quote2: form.Quote2?.toString() || "",
          Quote3: form.Quote3?.toString() || "",
          Selectedvendor: form.Selectedvendor || "",
          SelectedQuote: form.SelectedQuote?.toString() || "",
          Department: form.Department || "",
          Advancepayment: form.Advancepayment || "",
          ApprovalPath: form.ApprovalPath || "",
          // AssignedTo: approver?.Approval1?.Title || 0,
          // AssignedToEmailId: approver?.Approval1?.Id || 0,
          // //AssignedTo: User.Title,
          // //Approval1Id: Number(dataApprover[0].Approval1.Id || 0),
          // Approval1Id: (approvalChain.length > 0 ? approvalChain[0].id : null),
          // Approval2Id: (approvalChain.length > 1 ? approvalChain[1].id : null),
          // Approval3Id: (approvalChain.length > 2 ? approvalChain[2].id : null),
          CurrentStatus: "Draft"
        };

      else if (form.TotalProjectAmount > 200000 && form.Department === "Branding") {
        payload = {
          ProjectTitle: form.ProjectTitle || "",
          ProjectReffNo: form.ProjectReffNo || "",
          ProjectDescription: form.ProjectDescription || "",
          TotalProjectAmount: Number(form.TotalProjectAmount) || null,
          ApplicableTaxes: Number(form.ApplicableTaxes) || 0,
          Vendor1: form.Vendor1 || "",
          Vendor2: form.Vendor2 || "",
          Vendor3: form.Vendor3 || "",
          Quote1: form.Quote1?.toString() || "",
          Quote2: form.Quote2?.toString() || "",
          Quote3: form.Quote3?.toString() || "",
          SelectedQuote: form.SelectedQuote?.toString() || "",
          Selectedvendor: form.Selectedvendor || "",
          //SelectedQuote: Number(form.SelectedQuote) || 0,
          Department: form.Department || "",
          Advancepayment: form.Advancepayment || "",
          ApprovalPath: form.ApprovalPath || "",
          // AssignedTo: approver?.Approval1.Title || 0,
          // AssignedToEmailId: approver?.Approval1?.Id || 0,
          // //AssignedTo: User.Title,
          // Approval1Id: (approvalChain.length > 0 ? approvalChain[0].id : null),
          // Approval2Id: (approvalChain.length > 1 ? approvalChain[1].id : null),
          // Approval3Id: (approvalChain.length > 2 ? approvalChain[2].id : null),
          CurrentStatus: "Pending"
        };
      }
      else {
        payload = {
          ProjectTitle: form.ProjectTitle || "",
          ProjectReffNo: form.ProjectReffNo || "",
          ProjectDescription: form.ProjectDescription || "",
          TotalProjectAmount: Number(form.TotalProjectAmount) || null,
          ApplicableTaxes: Number(form.ApplicableTaxes) || 0,
          Vendor1: form.Vendor1 || "",
          Vendor2: form.Vendor2 || "",
          Vendor3: form.Vendor3 || "",
          Quote1: form.Quote1?.toString() || "",
          Quote2: form.Quote2?.toString() || "",
          Quote3: form.Quote3?.toString() || "",
          SelectedQuote: form.SelectedQuote?.toString() || "",
          Selectedvendor: form.Selectedvendor || "",
          //SelectedQuote: Number(form.SelectedQuote) || 0,
          Department: form.Department || "",
          Advancepayment: form.Advancepayment || "",
          ApprovalPath: form.ApprovalPath || "",
          // AssignedTo: approver?.Approval1?.Title || 0,
          // AssignedToEmailId: approver?.Approval1?.Id || 0,
          // //AssignedTo: User.Title,
          // Approval1Id: (approvalChain.length > 0 ? approvalChain[0].id : null),
          // Approval2Id: (approvalChain.length > 1 ? approvalChain[1].id : null),
          // Approval3Id: (approvalChain.length > 2 ? approvalChain[2].id : null),
          CurrentStatus: "Draft"
        };

      }

      if (!itemId) {
        // ✅ CREATE
        const res = await service.createItem(payload);
        setItemId(res.Id);
        await handleSaveHistory(res.Id);

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

        alert("Saved Successfully ✅");

        await service.updateItem(res.Id, {
          RequestNo: `PRJ-${res.Id}`
        });

      }

      else {
        // ✅ UPDATE
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
        alert("Updated Successfully ✅");
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };


  //const data = await service.getApproversByDepartment(form.Department);


  const handleUpdate = async () => {

    try {
      setLoading(true);


      // 🔹 Validations
      if (!form.ProjectTitle) return alert("Enter Project Title ");
      if (!form.Vendor1) return alert("Enter Vendor1 ");
      if (!form.Quote1) return alert("Enter Quote1");
      if (!form.Selectedvendor) return alert("Please Select Vendor");
      if (!form.SelectedQuote) return alert("Please Selected Quote");
      if (!form.Department) return alert("Please Select Department Name");
      if (!form.Advancepayment) return alert("Please Select Advance Payment");
      if ((!form.files || form.files.length === 0) && (!attachments || attachments.length === 0)) return alert("Attach files");
      const dataApprover = await service.getDepartmentApprovers(form.Department);

      const approver = dataApprover[0];
      const user = await service.getUserById(approver?.Approval1?.Id);


      // 🔹 MAIN PAYLOAD (NO PODetails)
      let payload = {};

      if (form.TotalProjectAmount <= 200000)
        payload = {
          ProjectTitle: form.ProjectTitle || "",
          ProjectReffNo: form.ProjectReffNo || "",
          ProjectDescription: form.ProjectDescription || "",
          TotalProjectAmount: Number(form.TotalProjectAmount) || null,
          ApplicableTaxes: Number(form.ApplicableTaxes) || 0,
          Vendor1: form.Vendor1 || "",
          Vendor2: form.Vendor2 || "",
          Vendor3: form.Vendor3 || "",
          Quote1: form.Quote1?.toString() || "",
          Quote2: form.Quote2?.toString() || "",
          Quote3: form.Quote3?.toString() || "",
          SelectedQuote: form.SelectedQuote?.toString() || "",
          Selectedvendor: form.Selectedvendor || "",
          //SelectedQuote: Number(form.SelectedQuote) || 0,
          Department: form.Department || "",
          Advancepayment: form.Advancepayment || "",
          ApprovalPath: form.ApprovalPath || "",
          AssignedTo: approver?.Approval1?.Title,
          AssignedToEmailId: approver?.Approval1?.Id || 0,
          //AssignedTo: User.Title,
          Approval1Id: (approvalChain.length > 0 ? approvalChain[0].id : null),
          Approval2Id: (approvalChain.length > 1 ? approvalChain[1].id : null),
          Approval3Id: (approvalChain.length > 2 ? approvalChain[2].id : null),
          //Approval3Id: approver3Id? Number(approver3Id)  : null,
          CurrentStatus: "Pending"
        };

      else if (form.TotalProjectAmount > 200000 && form.Department === "Branding") {
        {
          payload = {
            ProjectTitle: form.ProjectTitle || "",
            ProjectReffNo: form.ProjectReffNo || "",
            ProjectDescription: form.ProjectDescription || "",
            TotalProjectAmount: Number(form.TotalProjectAmount) || null,
            ApplicableTaxes: Number(form.ApplicableTaxes) || 0,
            Vendor1: form.Vendor1 || "",
            Vendor2: form.Vendor2 || "",
            Vendor3: form.Vendor3 || "",
            Quote1: form.Quote1?.toString() || "",
            Quote2: form.Quote2?.toString() || "",
            Quote3: form.Quote3?.toString() || "",
            SelectedQuote: form.SelectedQuote?.toString() || "",
            Selectedvendor: form.Selectedvendor || "",
            //SelectedQuote: Number(form.SelectedQuote) || 0,
            Department: form.Department || "",
            Advancepayment: form.Advancepayment || "",
            ApprovalPath: form.ApprovalPath || "",
            AssignedTo: approver?.Approval1?.Title,
            AssignedToEmailId: approver?.Approval1?.Id || 0,
            Approval1Id: (approvalChain.length > 0 ? approvalChain[0].id : null),
            Approval2Id: (approvalChain.length > 1 ? approvalChain[1].id : null),
            Approval3Id: (approvalChain.length > 2 ? approvalChain[2].id : null),
            CurrentStatus: "Pending"
          };

        }
      }
      else {
        payload = {
          ProjectTitle: form.ProjectTitle || "",
          ProjectReffNo: form.ProjectReffNo || "",
          ProjectDescription: form.ProjectDescription || "",
          TotalProjectAmount: Number(form.TotalProjectAmount) || null,
          ApplicableTaxes: Number(form.ApplicableTaxes) || 0,
          Vendor1: form.Vendor1 || "",
          Vendor2: form.Vendor2 || "",
          Vendor3: form.Vendor3 || "",
          Quote1: form.Quote1?.toString() || "",
          Quote2: form.Quote2?.toString() || "",
          Quote3: form.Quote3?.toString() || "",
          SelectedQuote: form.SelectedQuote?.toString() || "",
          Selectedvendor: form.Selectedvendor || "",
          //SelectedQuote: Number(form.SelectedQuote) || 0,
          Department: form.Department || "",
          Advancepayment: form.Advancepayment || "",
          ApprovalPath: form.ApprovalPath || "",
          AssignedTo: approver?.Approval1?.Title,
          AssignedToEmailId: approver?.Approval1?.Id || 0,
          //AssignedTo: User.Title,
          Approval1Id: (approvalChain.length > 0 ? approvalChain[0].id : null),
          Approval2Id: (approvalChain.length > 1 ? approvalChain[1].id : null),
          Approval3Id: (approvalChain.length > 2 ? approvalChain[2].id : null),
          CurrentStatus: "Pending"
        };

      }

      if (!itemId) {
        // ✅ CREATE
        const res = await service.createItem(payload);
        setItemId(res.Id);
        await handleSaveHistory(res.Id);

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

        alert("Submitted Successfully ✅");

        await service.updateItem(res.Id, {
          RequestNo: `PRJ-${res.Id}`
        });

      } else {
        // ✅ UPDATE
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
        alert("Submitted Successfully ✅");
      }
      const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
      window.location.assign(url); 
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
                <h4>Quotation Request Approval Form</h4>
              </div>

              <label>Project Title <span className={styles.required}>*</span></label>
              <input name="ProjectTitle" value={form.ProjectTitle} onChange={handleChange} />

              <label>Project Reference No</label>
              <input name="ProjectReffNo" value={form.ProjectReffNo} onChange={handleChange} />


              <label>Project Description & Advance Payment Details</label>
              <input name="ProjectDescription" value={form.ProjectDescription} onChange={handleChange} />


              <label>Total Project Amount</label>
              <input name="TotalProjectAmount" value={form.TotalProjectAmount} type='number' onChange={handleChange} />

              <label>Applicable Taxes</label>
              <input name="ApplicableTaxes" value={form.ApplicableTaxes} type='number' onChange={handleChange} />

              {/* 
          <label>Vendor 1 <span className={styles.required}>*</span></label>
          <input name="Vendor1" value={form.Vendor1} onChange={handleChange}  /> */}

              <label>Vendor1 <span className={styles.required}>*</span></label>
              <input name="Vendor1" value={form.Vendor1} onChange={handleChange} />

              <label>Vendor2 <span className={styles.required}>*</span></label>
              <input name="Vendor2" value={form.Vendor2} onChange={handleChange} />

              <label>Vendor3 <span className={styles.required}>*</span></label>
              <input name="Vendor3" value={form.Vendor3} onChange={handleChange} />


              <label>Quote 1 <span className={styles.required}>*</span></label>
              <input name="Quote1" value={form.Quote1} type='number' onChange={handleChange} />

              <label>Quote 2</label>
              <input name="Quote2" value={form.Quote2} type='number' onChange={handleChange} />

              <label>Quote 3</label>
              <input name="Quote3" value={form.Quote3} type='number' onChange={handleChange} />

              <label>Select Vendor <span className={styles.required}>*</span></label>
              <input name="Selectedvendor" value={form.Selectedvendor} onChange={handleChange} />

              <label>Selected Quote <span className={styles.required}>*</span></label>
              <input name="SelectedQuote" value={form.SelectedQuote} onChange={handleChange} type='number' />


              {/* Department and approval section */}
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
                selectedKey={poOptions.find(opt => opt.text === form.Advancepayment)?.text} // selectedKey ko key set karo based on text match
                onChange={(_, option) => {
                  setForm(prev => ({
                    ...prev,
                    Advancepayment: option?.text || ""  // text store karo
                  }));
                }}
              />

              <label>Approval Path<span className={styles.required}>*</span></label>
              <input value={form.ApprovalPath || ""} readOnly />


              {Number(form.TotalProjectAmount || 0) > 200000 && approverOptions.length > 0 && (
                <>
                  <label>Select Approver <span className={styles.required}>*</span></label>
                  <select
                    value={selectedApprover ?? ''}
                    onChange={(e) => handleApproverSelect(Number(e.target.value))}
                  >
                    <option value="">Select Approver</option>   {/* * ADD THIS */}

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
              <div className={styles.btn}>
                <button className={styles.submitBtn} onClick={handleUpdate}>Submit</button>
                <button className={styles.saveBtn} onClick={handleSaveOrUpdate}>Save</button>
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
                      href="https://ckbcsl.sharepoint.com/sites/DigiflowUAT/SampleDocuments/Quotation_Approval_Form_v1.0.xlsx"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Quotation_Approval_Form_v1.0.xlsx
                    </a>
                  </p>
                  <p>
                    <a
                      href="https://ckbcsl.sharepoint.com/sites/DigiflowUAT/SampleDocuments/SOP_Procurement_of_Goods_Services-CKBCSL-V1.1_wef_15.09.2016.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      SOP_Procurement_of_Goods_Services-CKBCSL-V1.1_wef_15.09.2016.pdf
                    </a>
                  </p>
                  <p>
                    <a
                      href="https://ckbcsl.sharepoint.com/sites/DigiflowUAT/SampleDocuments/WSR5June.docx"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      CKBirla WSR 5June.docx
                    </a>
                  </p>
                  <p>
                    <a
                      href="https://ckbcsl.sharepoint.com/sites/DigiflowUAT/SampleDocuments/SharePointtestpage.docx"
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