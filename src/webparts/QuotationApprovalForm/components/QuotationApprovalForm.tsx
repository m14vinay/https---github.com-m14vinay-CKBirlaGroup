import * as React from 'react';
import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react';
import styles from './QuotationApprovalForm.module.scss';
import type { IQuotationApprovalFormProps } from './IQuotationApprovalFormProps';
import SharePointService from './Services/Service';

type TFormState = {
  ID: number;
  ProjectTitle: string;
  ProjectReffNo: string;
  ProjectDescription: string;
  TotalProjectAmount: string;
  ApplicableTaxes: string;
  Vendor1: string;
  Vendor2: string;
  Vendor3: string;
  Quote1: string;
  Quote2: string;
  Quote3: string;
  Selectedvendor: string;
  SelectedQuote: string;
  Department: string;
  DepartmentHead: string;
  Advancepayment: string;
  ApprovalPath: string;
  ApprovalID: string;
  RequestNo: string;
  files: File[];
};

type TPurchaseOrderRow = {
  description: string;
  quantity: string;
  rate: string;
  amount: string;
};

type TDepartmentOption = {
  key: string;
  text: string;
};


const INITIAL_FORM: TFormState = {
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
  DepartmentHead: '',
  Advancepayment: '',
  ApprovalPath: '',
  ApprovalID: '',
  RequestNo: '',
  files: []
};

const MAX_TOTAL_SIZE_MB = 25;
const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/;
const INITIAL_PO_ROW: TPurchaseOrderRow = {
  description: '',
  quantity: '',
  rate: '',
  amount: ''
};

const normalizeDepartmentValue = (value: string): string => value.trim();

const QuotationApprovalForm: React.FC<IQuotationApprovalFormProps> = (props) => {
  // SharePoint service for item, attachment, PO detail, and history operations.
  const service = React.useMemo(() => new SharePointService(props.context), [props.context]);
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [form, setForm] = React.useState<TFormState>(INITIAL_FORM);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [departmentOptions, setDepartmentOptions] = React.useState<TDepartmentOption[]>([]);
  const [poItems, setPoItems] = React.useState<TPurchaseOrderRow[]>([INITIAL_PO_ROW]);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [approverOptions, setApproverOptions] = React.useState<string[]>([]);
  // Track the selected approver for amounts > 200,000
  const [selectedApprover, setSelectedApprover] = React.useState<string>('');
  const poOptions: IChoiceGroupOption[] = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' }
  ];

  // Query-string helper used to reload a draft by item ID.
  const getIdFromQueryString = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('ID') || params.get('id');
    return id ? parseInt(id, 10) : null;
  };

  const setField = (name: keyof TFormState, value: string | File[]): void => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Load attachments already stored against the current item.
  const loadAttachments = React.useCallback(async (id: number) => {
    try {
      const files = await service.getAttachments(id);
      setAttachments(files || []);
    } catch (error) {
      console.error('Attachment load failed:', error);
    }
  }, [service]);

  // Load purchase order detail rows already stored against the current item.
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

  // Load a saved draft when the form opens with an item ID.
  const loadDraftById = React.useCallback(async (id: number) => {
    try {
      const result = await service.getItemByRequestNo(id);
      if (!result) {
        return;
      }

      setItemId(result.Id);
      setCurrentStep(result.CurrentStep || 1);
      setForm((prev) => ({
        ...prev,
        ID: result.Id || 0,
        ProjectTitle: result.ProjectTitle || '',
        ProjectReffNo: result.ProjectReffNo || '',
        ProjectDescription: result.ProjectDescription || '',
        TotalProjectAmount: String(result.TotalProjectAmount || ''),
        ApplicableTaxes: String(result.ApplicableTaxes || ''),
        Vendor1: result.Vendor1 || '',
        Vendor2: result.Vendor2 || '',
        Vendor3: result.Vendor3 || '',
        Quote1: String(result.Quote1 || ''),
        Quote2: String(result.Quote2 || ''),
        Quote3: String(result.Quote3 || ''),
        Selectedvendor: result.Selectedvendor || '',
        SelectedQuote: String(result.SelectedQuote || ''),
        Department: result.Department || '',
        //DepartmentHead: result.DepartmentHead || '',
        Advancepayment: result.Advancepayment || '',
        ApprovalPath: result.ApprovalPath || '',
        ApprovalID: result.ApprovalID || '',
        RequestNo: result.RequestNo || '',
        files: []
      }));

      await loadAttachments(result.Id);
      await loadPurchaseOrderDetails(result.Id);
    } catch (error) {
      console.error('Draft load failed:', error);
      setStatusMessage('Unable to load the saved request.');
    }
  }, [loadAttachments, loadPurchaseOrderDetails, service]);

  // Initialize the screen when a draft ID is present in the URL.
  React.useEffect(() => {
    const id = getIdFromQueryString();
    if (id) {
      loadDraftById(id).catch(() => undefined);
    }
  }, [loadDraftById]);

  React.useEffect(() => {
    const loadDepartments = async () => {
      const res = await service.getAllDepartments();

      setDepartmentOptions(
        res.map((item: any) => ({
          key: item.DepartmentName,
          text: item.DepartmentName
        }))
      );
    };

    loadDepartments();
  }, [service]);

  // Load department options for the dropdown on initial render.
const handleDepartmentChange = React.useCallback(async (departmentValue: string) => {

  const dept = departmentValue.trim();

  setForm((prev) => ({
    ...prev,
    Department: dept,
    DepartmentHead: '',
    ApprovalPath: ''
  }));

  setApproverOptions([]);
  setSelectedApprover('');

  if (!dept) return;

  try {
    const data = await service.getApproversByDepartment(dept);

    if (!data) {
      setStatusMessage(`No approvers found in DepartmentMaster for ${dept}`);
      return;
    }

    const departmentHead = data.Departmenthead?.Title || '';
    const approval1 = data.Approval1?.Title || '';
    const approval2 = data.Approval2?.Title || '';

    const amount = Number(form.TotalProjectAmount || 0);

    // ================= CONDITION 1 =================
    if (amount <= 200000) {
      setForm((prev) => ({
        ...prev,
        DepartmentHead: departmentHead,
        ApprovalPath: departmentHead
      }));
      return;
    }

    // ================= CONDITION 2 =================
    if (amount > 200000 && dept.toLowerCase() === "branding") {

      const approvers = [approval1, approval2].filter(Boolean);

      setForm((prev) => ({
        ...prev,
        DepartmentHead: departmentHead,
        ApprovalPath: departmentHead
      }));

      setApproverOptions(approvers); // dropdown show
      return;
    }

    // ================= CONDITION 3 =================
    if (amount > 200000 && dept.toLowerCase() !== "branding") {

      const fullPath = [departmentHead, approval1, approval2]
        .filter(Boolean)
        .join(" > ");

      setForm((prev) => ({
        ...prev,
        DepartmentHead: departmentHead,
        ApprovalPath: fullPath
      }));

      return;
    }

  } catch (error) {
    console.error(error);
    setStatusMessage('Error fetching approvers');
  }

}, [service, form.TotalProjectAmount]);

const handleApproverSelect = (value: string) => {

  setSelectedApprover(value);

  setForm((prev) => ({
    ...prev,
    ApprovalPath: prev.DepartmentHead + ' > ' + value
  }));

};


  // Update simple text and number inputs.
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setForm((prev) => ({ ...prev, [name]: value }));
  // IMPORTANT: Amount change hone par logic dobara run hoga
  if (name === "TotalProjectAmount" && form.Department) {
setTimeout(() => {
  handleDepartmentChange(form.Department);
}, 0);  }
};

  // Validate selected files before staging them for upload.
  const handleFileChange = (event?: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target?.files;
    if (!files) {
      return;
    }

    const filesArray = Array.from(files);
    const allowedExtensions = ['pdf', 'xlsx', 'docx'];

    for (const file of filesArray) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || allowedExtensions.indexOf(fileExtension) === -1) {
        setStatusMessage(`File type not allowed: ${file.name}`);
        return;
      }
    }

    const totalSizeBytes = [...form.files, ...filesArray].reduce((acc, file) => acc + file.size, 0);
    if (totalSizeBytes / (1024 * 1024) > MAX_TOTAL_SIZE_MB) {
      setStatusMessage(`Total file size must not exceed ${MAX_TOTAL_SIZE_MB} MB`);
      return;
    }

    const invalidFiles = filesArray.filter((file) => INVALID_FILENAME_REGEX.test(file.name));
    if (invalidFiles.length > 0) {
      setStatusMessage(`Invalid file names: ${invalidFiles.map((file) => file.name).join(', ')}`);
      return;
    }

    setForm((prev) => ({
      ...prev,
      files: [...prev.files, ...filesArray]
    }));
    setStatusMessage('');
  };

  // Remove a staged local file.
  const removeFile = (index: number) => {
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Delete an attachment that already exists in SharePoint.
  const removeExistingFile = async (index: number) => {
    try {
      const file = attachments[index];
      await service.deleteAttachmentFromSP(file);
      setAttachments((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Attachment delete failed:', error);
      setStatusMessage('Unable to delete attachment.');
    }
  };

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

  // Write a history record for draft/save actions.
  const handleSaveHistory = async (id: number, userAction: string) => {
    const currentUser = await service.getUser();
    await service.createHistoryItem({
      Title: 'QA',
      FID: id,
      UserName: currentUser.Title,
      UserAction: userAction,
      ActionDate: new Date().toISOString(),
      Designation: 'Request Initiator'
    });
  };

  // Validate the minimum required data before save or submit.
  const validateDraft = (): string | null => {
    if (!form.ProjectTitle.trim()) return 'Project Title required';
    if (!form.Vendor1.trim()) return 'Vendor 1 required';
    if (!form.Quote1.trim()) return 'Quote 1 required';
    if (!form.Selectedvendor.trim()) return 'Selected Vendor required';
    if (!form.SelectedQuote.trim()) return 'Selected Quote required';
    if (!form.Department) return 'Select Department';
    if (!form.Advancepayment) return 'Select Advance Payment';
    if (Number(form.TotalProjectAmount) > 200000 && !selectedApprover) {
      return 'Select Approver';
    }
    if (!poItems.some((item) => item.description.trim())) return 'Enter at least one purchase order detail';
    return null;
  };

  // Build the payload for the main SharePoint item.
  const buildPayload = (currentStatus: 'Draft' | 'Pending') => {
    return {
      Title: form.ProjectTitle,
      ProjectTitle: form.ProjectTitle,
      ProjectReffNo: form.ProjectReffNo,
      ProjectDescription: form.ProjectDescription,
      TotalProjectAmount: form.TotalProjectAmount,
      ApplicableTaxes: form.ApplicableTaxes,
      Vendor1: form.Vendor1,
      Vendor2: form.Vendor2,
      Vendor3: form.Vendor3,
      Quote1: form.Quote1,
      Quote2: form.Quote2,
      Quote3: form.Quote3,
      Selectedvendor: form.Selectedvendor,
      SelectedQuote: form.SelectedQuote,
      Department: form.Department,
      Advancepayment: form.Advancepayment,
      ApprovalPath: form.ApprovalPath,
      CurrentStatus: currentStatus
    };
  };

  // Upload any files that were added during this edit session.
  const uploadPendingFiles = async (currentId: number) => {
    for (const file of form.files) {
      try {
        await service.uploadFile(currentId, file);
      } catch (error) {
        console.error(`File upload failed for ${file.name}:`, error);
      }
    }
  };

  // Replace stored PO rows with the current in-memory rows.
  const savePurchaseOrderDetails = async (quotationId: number): Promise<void> => {
    await service.deletePurchaseOrderDetailsByQuotationId(quotationId);

    for (const item of poItems) {
      if (!item.description.trim()) {
        continue;
      }

      await service.createPurchaseOrderDetail({
        Title: item.description.trim(),
        Description: item.description.trim(),
        Quantity: Number(item.quantity || 0),
        Rate: Number(item.rate || 0),
        Amount: Number(item.amount || 0),
        QuotationIdId: quotationId
      });
    }
  };
  // Create or update the main item, then refresh related data.
  const persistForm = async (currentStatus: 'Draft' | 'Pending'): Promise<number> => {

    const payload = buildPayload(currentStatus);
    const existingId = itemId;
    let finalId: number;

    // ✅ CREATE only once
    if (!existingId) {

      const res = await service.createItem(payload);

      if (!res?.Id) throw new Error('Item not created');

      // eslint-disable-next-line require-atomic-updates
      finalId = Number(res.Id);
      setItemId(finalId);

      await service.updateItem(finalId, {
        RequestNo: `PRJ-${finalId}`
      });

    }
    // ✅ UPDATE always
    else {

      finalId = existingId;
      await service.updateItem(finalId, payload);

    }

    // IMPORTANT: Only update PO in Draft
    if (currentStatus === 'Draft') {
      await savePurchaseOrderDetails(finalId);
    }

    // ❌ DO NOT touch PO during submit (avoid duplication)

    await uploadPendingFiles(finalId);
    await loadAttachments(finalId);
    await loadPurchaseOrderDetails(finalId);

    setForm((prev) => ({
      ...prev,
      ID: finalId,
      RequestNo: `PRJ-${finalId}`,
      files: []
    }));

    return finalId;
  };

  // Save the form as a draft.
  const handleSaveOrUpdate = async () => {
    const validationError = validateDraft();
    if (validationError) {
      setStatusMessage(validationError);
      return;
    }

    setIsSaving(true);
    setStatusMessage('Saving draft...');

    try {
      const currentId = await persistForm('Draft');
      const successMessage = `Save Successfully. Request No: PRJ-${currentId}`;
      setStatusMessage(successMessage);
      window.alert(successMessage);
    } catch (error: any) {
      console.error('SAVE ERROR:', error);
      setStatusMessage(error?.message || 'Error while saving draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit the form into the workflow.
  const handleSubmit = async () => {
    const validationError = validateDraft();
    if (validationError) {
      setStatusMessage(validationError);
      return;
    }

    setIsSaving(true);
    setStatusMessage('Submitting...');

    try {
      const currentId = await persistForm('Pending');
      try {
        await handleSaveHistory(currentId, 'Submitted');
      } catch (historyError) {
        console.error('History save failed:', historyError);
      }

      const successMessage = 'Submitted Successfully';
      setStatusMessage(successMessage);
      window.alert(successMessage);
      window.location.assign(`${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`);
    } catch (error: any) {
      console.error('SUBMIT ERROR:', error);
      setStatusMessage(error?.message || 'Error while submitting');
    } finally {
      setIsSaving(false);
    }
  };

  // Return to the dashboard without saving.
  const handleCancel = () => {
    window.location.assign(`${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`);
  };

  // Render the complete quotation approval form.
  return (
    <div className={styles.container}>
      {/* Header section */}
      <div className={styles.poHeader}>
        <h4>Quotation Approval Form</h4>
      </div>

      {statusMessage && (
        <div style={{ marginBottom: '12px', color: statusMessage.toLowerCase().indexOf('error') !== -1 ? '#a80000' : '#107c10' }}>
          {statusMessage}
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.colMd9}>
          <div className={styles.leftPanel}>
            {/* Project details section */}
            <label>Project Title <span className={styles.required}>*</span></label>
            <input name="ProjectTitle" value={form.ProjectTitle} onChange={handleChange} />

            <label>Project Reference Number</label>
            <input name="ProjectReffNo" value={form.ProjectReffNo} onChange={handleChange} />

            <label>Project Description & Advance Payment Details<span className={styles.required}>*</span></label>
            <input name="ProjectDescription" value={form.ProjectDescription} onChange={handleChange} />

            <div className={styles.twoColumnRow}>
              <div className={styles.fieldBlock}>
                <label>Total Project Amount</label>
                <input
                  type="number"
                  name="TotalProjectAmount"
                  value={form.TotalProjectAmount}
                  onChange={handleChange}
                />
              </div>


              <div className={styles.fieldBlock}>
                <label>Applicable Taxes</label>
                <input type="number" name="ApplicableTaxes" value={form.ApplicableTaxes} onChange={handleChange} />
              </div>
            </div>

            {/* Vendor and quotation section */}
            <div className={styles.twoColumnRow}>
              <div className={styles.fieldBlock}>
                <label>Vendor 1 <span className={styles.required}>*</span></label>
                <input name="Vendor1" value={form.Vendor1} onChange={handleChange} />
              </div>
              <div className={styles.fieldBlock}>
                <label>Quote 1 <span className={styles.required}>*</span></label>
                <input type="number" name="Quote1" value={form.Quote1} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.twoColumnRow}>
              <div className={styles.fieldBlock}>
                <label>Vendor 2</label>
                <input name="Vendor2" value={form.Vendor2} onChange={handleChange} />
              </div>
              <div className={styles.fieldBlock}>
                <label>Quote 2</label>
                <input type="number" name="Quote2" value={form.Quote2} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.twoColumnRow}>
              <div className={styles.fieldBlock}>
                <label>Vendor 3</label>
                <input name="Vendor3" value={form.Vendor3} onChange={handleChange} />
              </div>
              <div className={styles.fieldBlock}>
                <label>Quote 3</label>
                <input type="number" name="Quote3" value={form.Quote3} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.twoColumnRow}>
              <div className={styles.fieldBlock}>
                <label>Selected Vendor <span className={styles.required}>*</span></label>
                <input name="Selectedvendor" value={form.Selectedvendor} onChange={handleChange} />
              </div>
              <div className={styles.fieldBlock}>
                <label>Selected Quote <span className={styles.required}>*</span></label>
                <input type="number" name="SelectedQuote" value={form.SelectedQuote} onChange={handleChange} />
              </div>
            </div>

            {/* Department and approval section */}
            <label>Department <span className={styles.required}>*</span></label>
            <select
              value={form.Department || ''}
              onChange={(e) => { handleDepartmentChange(e.target.value).catch(() => undefined); }}
            >
              <option value="">Select Department</option>
              {departmentOptions.map((option) => (
                <option key={option.key} value={option.text}>
                  {option.text}
                </option>
              ))}
            </select>

            {Number(form.TotalProjectAmount || 0) > 200000 && approverOptions.length > 0 && (
  <>
    <label>Select Approver <span className={styles.required}>*</span></label>
    <select
      value={selectedApprover}
      onChange={(e) => handleApproverSelect(e.target.value)}
    >
      <option value="">Select Approver</option>
      {approverOptions.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </>
)}

            <ChoiceGroup
              label="Advance Payment"
              options={poOptions}
              selectedKey={form.Advancepayment || undefined}
              onChange={(_e, option) => setField('Advancepayment', option?.text || '')}
            />
            {form.RequestNo && (
              <>
                <label>Request No</label>
                <input value={form.RequestNo} readOnly />
              </>
            )}

            <label>Approval Path<span className={styles.required}>*</span></label>
            <input value={form.ApprovalPath} readOnly />

            {/* Attachments section */}
            <label>Attachments <span className={styles.required}>*</span></label>
            <input type="file" multiple onChange={handleFileChange} />

            {attachments.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {attachments.map((file, index) => (
                  <li key={index}>
                    <span onClick={() => removeExistingFile(index)}>x</span>
                    <a href={file.ServerRelativeUrl} target="_blank" rel="noopener noreferrer">
                      {file.FileName}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {form.files.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {form.files.map((file, index) => (
                  <li key={`${file.name}-${index}`}>
                    <span onClick={() => removeFile(index)}>x</span>
                    <span>{file.name}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Purchase order section */}
            <div className={styles.poSection}>
              <div className={styles.poSectionHeader}>
                <label>Purchase Order Details <span className={styles.required}>*</span> :</label>
                <button type="button" className={styles.poAddBtn} onClick={addPurchaseOrderRow} disabled={isSaving}>
                  Add New
                </button>
              </div>

              <div className={styles.poTable}>
                <div className={styles.poRowHeader}>
                  <div>Description of Goods / Services</div>
                  <div>Quantity</div>
                  <div>Rate</div>
                  <div>Amount</div>
                  <div />
                </div>

                {poItems.map((item, index) => (
                  <div key={index} className={styles.poRow}>
                    <input
                      value={item.description}
                      onChange={(e) => handlePurchaseOrderChange(index, 'description', e.target.value)}
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

            {/* Action buttons section */}
            <div className={styles.buttonRow}>
              <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={isSaving}>Submit</button>
              <button type="button" className={styles.saveBtn} onClick={handleSaveOrUpdate} disabled={isSaving}>Save</button>
              <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={isSaving}>Cancel</button>
            </div>
          </div>
        </div>

        {/* Reference information section */}
        <div>
          <div style={{ padding: '16px' }}>
            <div>
              <h6>Templates</h6>
              <ol>
                <li>Quotation request template</li>
              </ol>
            </div>
            <div>
              <h6>Important Guidelines</h6>
              <ol>
                <li>Select approval path carefully.</li>
                <li>Use project reference if needed.</li>
                <li>Attach all documents, max 25 MB total.</li>
                <li>Avoid special characters in file names.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default QuotationApprovalForm;