import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './OuotationApprovalForm.module.scss';
import { IOuotationApprovalFormProps } from './IOuotationApprovalFormProps';
import { SPHttpClient } from '@microsoft/sp-http';

export const OuotationApprovalForm: React.FC<IOuotationApprovalFormProps> = (props) => {
  const initialFormData = {
    ProjectTitle: '',
    ProjectReffNo: '',
    ProjectDescription: '',
    TotalProjectAmount: '',
    ApplicableTaxes: '',
    Vendor1: '',
    Quote1: '',
    Vendor2: '',
    Quote2: '',
    Vendor3: '',
    Quote3: '',
    Selectedvendor: '',
    SelectedQuote: '',
    Department: '',
    Advancepayment: '',
    ApprovalPath: '',
    selectedFile: null as File | null
  };

  const [itemId, setItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NNN add 
  const [poItems, setPoItems] = useState<any[]>([
    { description: '', quantity: '', rate: '', amount: '' }
  ]);

  const [departments, setDepartments] = useState<
    Array<{ Id: number; DepartmentName: string }>
  >([]);
  const [errors, setErrors] = useState<{
    ProjectTitle?: string;
    ProjectDescription?: string;
    Vendor1?: string;
    Quote1?: string;
    Selectedvendor?: string;
    SelectedQuote?: string;
    Advancepayment?: string;
    ApprovalPath?: string;
    Department?: string;   //  ADD THIS
  }>({});


  // 🔹 Handle change
  const onFieldChange = (e: any) => {
    const { name, value } = e.target;

    const updatedData = { ...formData, [name]: value };

    setFormData(updatedData);

    // Save in browser (refresh ke baad bhi data rahega)
    const { selectedFile, ...persistData } = updatedData;
    localStorage.setItem('draftFormData', JSON.stringify(persistData));
  };


  // -NNN PURCHASE ORDER FUNCTIONS

  const addRow = () => {
    setPoItems([
      ...poItems,
      { description: '', quantity: '', rate: '', amount: '' }
    ]);
  };

  const deleteRow = (index: number) => {
    const updated = [...poItems];
    updated.splice(index, 1);
    setPoItems(updated);
  };

  const handlePOChange = (index: number, field: string, value: any) => {
    const updated = [...poItems];
    updated[index][field] = value;

    if (field === "quantity" || field === "rate") {
      const qty = Number(updated[index].quantity) || 0;
      const rate = Number(updated[index].rate) || 0;
      updated[index].amount = qty * rate;
    }

    setPoItems(updated);
  };

  // 🔹 File
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {

      const file = event.target.files[0];

      // 25 MB limit (25 * 1024 * 1024 bytes)
      const maxSize = 25 * 1024 * 1024;

      if (file.size > maxSize) {
        alert("File size should not exceed 25 MB");

        // ❌ clear file input
        event.target.value = '';
        return;
      }

      //valid file
      setFormData(prev => ({
        ...prev,
        selectedFile: file
      }));
    }
  };

  // 🔹 Parse number
  const parseNumber = (value: string): number => {
    return value ? Number(value) : 0;
  };

  const savePurchaseOrderDetails = async (parentId: number) => {
    for (let index = 0; index < poItems.length; index++) {
      const item = poItems[index];

      // 🔥 Skip empty rows
      if (!item.description || !item.description.trim()) continue;

      const poBody = {
        Title: item.description.trim(),
        Description: item.description.trim(),
        Quantity: parseNumber(item.quantity),
        Rate: parseNumber(item.rate),
        Amount: parseNumber(item.amount),

        // 🔥 Lookup field (VERY IMPORTANT)
        QuotationIdId: parentId
      };

      try {
        await props.spHttpClient.post(
          `${props.siteUrl}/_api/web/lists/getbytitle('PurchaseOrderDetails')/items`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(poBody)
          }
        );
      } catch (error) {
        console.error("PO item save failed:", item);
      }
    }
  };

  // 🔹 Load departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await props.spHttpClient.get(
          `${props.siteUrl}/_api/web/lists/getbytitle('DepartmentMaster')/items?$select=Id,DepartmentName&$top=5000`,
          SPHttpClient.configurations.v1,
          {
            headers: { 'Accept': 'application/json;odata.metadata=none' }
          }
        );

        const data = await res.json();
        setDepartments(data.value || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadDepartments();
  }, []);

  useEffect(() => {

    const savedData = localStorage.getItem('draftFormData');
    const savedItemId = localStorage.getItem('draftItemId');

    if (savedData) {
      const parsed = JSON.parse(savedData);
      const { Status, isSubmitting: savedSubmitting, selectedFile, ...parsedData } = parsed;

      setFormData(prev => ({
        ...prev,
        ...parsedData
      }));
    }

    if (savedItemId) {
      setItemId(Number(savedItemId));
    }

  }, []);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.ProjectTitle) newErrors.ProjectTitle = 'Required';
    if (!formData.ProjectDescription) newErrors.ProjectDescription = 'Required';
    if (!formData.Vendor1) newErrors.Vendor1 = 'Required';
    if (!formData.Quote1) newErrors.Quote1 = 'Required';
    if (!formData.Selectedvendor) newErrors.Selectedvendor = 'Required';
    if (!formData.SelectedQuote) newErrors.SelectedQuote = 'Required';
    if (!formData.Advancepayment) newErrors.Advancepayment = 'Required';
    if (!formData.ApprovalPath) newErrors.ApprovalPath = 'Required';
    if (!formData.Department) newErrors.Department = 'Required';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  // 🔹 Submit
  const submitToList = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setStatusMessage('Submitting...');

    try {
      let currentId = itemId;

      // 🔥 CREATE ITEM IF NOT EXISTS
      if (!currentId) {
        const draftResponse = await props.spHttpClient.post(
          `${props.siteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Title: formData.ProjectTitle })
          }
        );

        const draftData = await draftResponse.json();
        currentId = draftData.Id;
        setItemId(currentId);
      }

      if (!currentId) {
        throw new Error('Unable to determine QuotationApproval item ID.');
      }

      // 🔥 UPDATE MAIN ITEM
      const body: any = {
        ProjectTitle: formData.ProjectTitle,
        ProjectReffNo: formData.ProjectReffNo,
        ProjectDescription: formData.ProjectDescription,
        TotalProjectAmount: parseNumber(formData.TotalProjectAmount),
        ApplicableTaxes: parseNumber(formData.ApplicableTaxes),
        Vendor1: formData.Vendor1,
        Quote1: formData.Quote1,
        Vendor2: formData.Vendor2,
        Quote2: formData.Quote2,
        Vendor3: formData.Vendor3,
        Quote3: formData.Quote3,
        SelectedQuote: formData.SelectedQuote,
        Selectedvendor: formData.Selectedvendor,
        Department: formData.Department,
        Advancepayment: formData.Advancepayment,
        ApprovalPath: formData.ApprovalPath,
        Status: "Submitted"
      };

      await props.spHttpClient.post(
        `${props.siteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items(${currentId})`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'IF-MATCH': '*',
            'X-HTTP-Method': 'MERGE',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      // 🔥 SAVE PO ITEMS
      await savePurchaseOrderDetails(currentId);

      // 🔥 ATTACHMENT
      if (formData.selectedFile) {
        const buffer = await formData.selectedFile.arrayBuffer();

        await props.spHttpClient.post(
          `${props.siteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items(${currentId})/AttachmentFiles/add(FileName='${formData.selectedFile.name}')`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/octet-stream'
            },
            body: buffer
          }
        );
      }

      // 🔥 RESET
      localStorage.removeItem('draftFormData');
      localStorage.removeItem('draftItemId');

      setFormData(initialFormData);
      setStatusMessage('✅ Submitted successfully!');
      setIsSubmitting(false);

      setItemId(null);
      setPoItems([{ description: '', quantity: '', rate: '', amount: '' }]);

    } catch (error: any) {
      console.error(error);
      setStatusMessage(`❌ Error: ${error.message}`);
      setIsSubmitting(false);
    }
  };


  // 🔹 Save Draft
  const saveDraft = async () => {

    const body: any = {
      Title: formData.ProjectTitle,
      ProjectTitle: formData.ProjectTitle,
      ProjectReffNo: formData.ProjectReffNo,
      ProjectDescription: formData.ProjectDescription,
      TotalProjectAmount: parseNumber(formData.TotalProjectAmount),
      ApplicableTaxes: parseNumber(formData.ApplicableTaxes),
      Vendor1: formData.Vendor1,
      Quote1: formData.Quote1,
      Selectedvendor: formData.Selectedvendor,
      SelectedQuote: formData.SelectedQuote,
      Department: formData.Department,
      Advancepayment: formData.Advancepayment,
      ApprovalPath: formData.ApprovalPath,
      Status: "Draft"
    };

    try {

      if (itemId) {
        //  UPDATE EXISTING
        await props.spHttpClient.post(
          `${props.siteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items(${itemId})`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'IF-MATCH': '*',
              'X-HTTP-Method': 'MERGE',
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          }
        );

        localStorage.setItem('draftItemId', String(itemId));
        await savePurchaseOrderDetails(itemId);
        alert("Draft Updated ✅");

      } else {
        //  CREATE NEW DRAFT
        const response = await props.spHttpClient.post(
          `${props.siteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          }
        );

        const data = await response.json();

        setItemId(data.Id);   //  SAVE ID
        localStorage.setItem('draftItemId', String(data.Id));
        await savePurchaseOrderDetails(data.Id);

        alert("Draft Saved ✅");
      }

    } catch (error) {
      console.error(error);
    }
  };
  // 🔹 Cancel
  const handleCancel = () => {
    setFormData({
      ProjectTitle: '',
      ProjectReffNo: '',
      ProjectDescription: '',
      TotalProjectAmount: '',
      ApplicableTaxes: '',
      Vendor1: '',
      Quote1: '',
      Vendor2: '',
      Quote2: '',
      Vendor3: '',
      Quote3: '',
      Selectedvendor: '',
      SelectedQuote: '',
      Department: '',
      Advancepayment: '',
      ApprovalPath: '',
      selectedFile: null
    });
    setStatusMessage('');
    setIsSubmitting(false);
    setItemId(null);
    setPoItems([{ description: '', quantity: '', rate: '', amount: '' }]);
    localStorage.removeItem('draftFormData');
    localStorage.removeItem('draftItemId');
  };

  return (
    <section className={styles.quotationApprovalForm}>

      <h2>Quotation Approval Form</h2>
      {statusMessage && (
        <div
          className={`${styles.statusMessage} ${statusMessage.startsWith('❌') ? styles.errorStatus : styles.successStatus}`}
        >
          {statusMessage}
        </div>
      )}

      <form onSubmit={submitToList}>

        {/* Project Title */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Project Title <span className="required">*</span>
          </label>
          <div className={styles.field}>
            <input
              name="ProjectTitle"
              value={formData.ProjectTitle}
              onChange={onFieldChange}
            />
          </div>
        </div>

        {/* Project Ref */}
        <div className={styles.formRow}>
          <label className={styles.label}>Project Reference Number</label>
          <div className={styles.field}>
            <input
              name="ProjectReffNo"
              value={formData.ProjectReffNo}
              onChange={onFieldChange}
            />
          </div>
        </div>

        {/* Description */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Project Description <span className="required">*</span>
          </label>
          <div className={styles.field}>
            <input
              type="text"
              name="ProjectDescription"
              value={formData.ProjectDescription}
              onChange={onFieldChange}
            />
          </div>
        </div>

        {/* Amount + Taxes */}
        <div className={styles.formRow}>
          <label className={styles.label}>Total Project Amount</label>

          <div className={styles.field}>
            <div className={styles.twoCol}>

              <input
                type="number"
                name="TotalProjectAmount"
                value={formData.TotalProjectAmount}
                onChange={onFieldChange}
              />

              <span className={styles.inlineLabel}>Applicable Tax</span>

              <input
                type="number"
                name="ApplicableTaxes"
                value={formData.ApplicableTaxes}
                onChange={onFieldChange}
              />

            </div>
          </div>
        </div>

        {/* Vendor 1 */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Vendor 1 <span className="required">*</span>
          </label>
          <div className={styles.field}>
            <div className={styles.twoCol}>

              <input
                name="Vendor1"
                value={formData.Vendor1}
                onChange={onFieldChange}
              />

              <span className={styles.inlineLabel}>
                Quote 1 <span className={styles.required}>*</span>
              </span>

              <input
                name="Quote1"
                value={formData.Quote1}
                onChange={onFieldChange}
              />

            </div>
          </div>
        </div>

        {/* Vendor 2 */}
        <div className={styles.formRow}>
          <label className={styles.label}>Vendor 2</label>
          <div className={styles.field}>
            <div className={styles.twoCol}>
              <input name="Vendor2" value={formData.Vendor2} onChange={onFieldChange} />

              <span className={styles.inlineLabel}>Quote 2</span>

              <input name="Quote2" value={formData.Quote2} onChange={onFieldChange} />
            </div>
          </div>
        </div>

        {/* Vendor 3 */}
        <div className={styles.formRow}>
          <label className={styles.label}>Vendor 3</label>
          <div className={styles.field}>
            <div className={styles.twoCol}>
              <input name="Vendor3" value={formData.Vendor3} onChange={onFieldChange} />

              <span className={styles.inlineLabel}>Quote 3</span>

              <input name="Quote3" value={formData.Quote3} onChange={onFieldChange} />
            </div>
          </div>
        </div>

        {/* Selected Vendor */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Selected Vendor <span className="required">*</span>
          </label>
          <div className={styles.field}>
            <input
              name="Selectedvendor"
              value={formData.Selectedvendor}
              onChange={onFieldChange}
            />
          </div>
        </div>

        {/* Selected Quote */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Selected Quote <span className="required">*</span>
          </label>
          <div className={styles.field}>
            <input
              name="SelectedQuote"
              value={formData.SelectedQuote}
              onChange={onFieldChange}
            />
          </div>
        </div>

        {/* Department */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Department <span className="required">*</span>
          </label>
          <div className={styles.field}>
            <select
              name="Department"
              value={formData.Department}
              onChange={onFieldChange}
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.Id} value={dept.DepartmentName}>
                  {dept.DepartmentName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advance Payment */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Advance Payment <span className="required">*</span>
          </label>
          <div className={styles.field}>
            <label>
              <input
                type="radio"
                name="Advancepayment"
                value="Yes"
                checked={formData.Advancepayment === 'Yes'}
                onChange={onFieldChange}
              /> Yes
            </label>

            <label style={{ marginLeft: '20px' }}>
              <input
                type="radio"
                name="Advancepayment"
                value="No"
                checked={formData.Advancepayment === 'No'}
                onChange={onFieldChange}
              /> No
            </label>
          </div>
        </div>

        {/* Approval Path */}

        <div className={`${styles.formRow} ${styles.fullWidth}`}>
          <div className={styles.label}>
            Approval Path <span className={styles.required}>*</span>
          </div>
          <div className={styles.field}>
            <input
              className={styles.input}   /* 🔥 change here */
              name="ApprovalPath"
              value={formData.ApprovalPath}
              onChange={onFieldChange}
              
            />
          </div>
        </div>

        {/* File Upload */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Attach Documents <span className="required">*</span>
          </label>
          <div className={styles.field}>
            <input type="file" onChange={onFileChange} />
          </div>
        </div>

        {/* - PURCHASE ORDER SECTION */}
        <div className={styles.poSection}>

          <div className={styles.poHeader}>
            <span>Purchase Order Details <span className={styles.required}>*</span> :</span>

            <button
              type="button"
              className={styles.addBtn}
              onClick={addRow}
            >
              Add New
            </button>
          </div>

          <div className={styles.poTable}>

            {/* Header */}
            <div className={styles.poRowHeader}>
              <div>Description</div>
              <div>Qty</div>
              <div>Rate</div>
              <div>Amount</div>
              <div>Action</div>
            </div>

            {/* Rows */}
            {poItems.map((row, index) => (
              <div key={index} className={styles.poRow}>

                <input
                  value={row.description}
                  onChange={(e) =>
                    handlePOChange(index, "description", e.target.value)
                  }
                />

                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) =>
                    handlePOChange(index, "quantity", e.target.value)
                  }
                />

                <input
                  type="number"
                  value={row.rate}
                  onChange={(e) =>
                    handlePOChange(index, "rate", e.target.value)
                  }
                />

                <input value={row.amount} readOnly />

                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => deleteRow(index)}
                >
                  ✕
                </button>

              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.buttonRow}>
          <button type="submit" className={styles.submitBtn}>Submit</button>
          <button type="button" className={styles.saveBtn} onClick={saveDraft}>Save</button>
          <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </section>
  );
};