import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './OuotationApprovalForm.module.scss';
import { IOuotationApprovalFormProps } from './IOuotationApprovalFormProps';
import { SPHttpClient } from '@microsoft/sp-http';

export const OuotationApprovalForm: React.FC<IOuotationApprovalFormProps> = (props) => {
const [itemId, setItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
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
    Status: 'Submitted',
    selectedFile: null as File | null,
    isSubmitting: false
  });

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
    localStorage.setItem('draftFormData', JSON.stringify(updatedData));
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

    if (savedData) {
      const parsed = JSON.parse(savedData);

      setFormData(prev => ({
        ...prev,
        ...parsed,
        Status: '💾 Draft restored from browser'
      }));
    }

  }, []);

  // 🔹 Submit
const submitToList = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (!validateForm()) return;

  setFormData(prev => ({
    ...prev,
    isSubmitting: true,
    Status: 'Submitting...'
  }));

  try {

    let currentId = itemId;

    // create draft if not exists
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

    //UPDATE SAME ITEM
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

    localStorage.removeItem('draftFormData');

    setFormData(prev => ({
      ...prev,
      Status: '✅ Submitted successfully!',
      isSubmitting: false
    }));

  } catch (error: any) {
    console.error(error);
    setFormData(prev => ({
      ...prev,
      Status: `❌ Error: ${error.message}`,
      isSubmitting: false
    }));
  }
};

    // ATTACHMENT (USE SAME itemId)
    // if (formData.selectedFile) {
    //   const buffer = await formData.selectedFile.arrayBuffer();

    //   await props.spHttpClient.post(
    //     `${props.siteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items(${itemId})/AttachmentFiles/add(FileName='${formData.selectedFile.name}')`,
    //     SPHttpClient.configurations.v1,
    //     {
    //       headers: {
    //         'Accept': 'application/json;odata.metadata=none',
    //         'Content-Type': 'application/octet-stream'
    //       },
    //       body: buffer
    //     }
    //   );
    // }

    //  CLEAR DRAFT
    // localStorage.removeItem('draftFormData');

    // setFormData(prev => ({
    //   ...prev,
    //   Status: '✅ Submitted successfully!',
    //   isSubmitting: false
    // }));
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
  // 🔹 Save Draft
const saveDraft = async () => {

  const body: any = {
    Title: formData.ProjectTitle,
    ProjectDescription: formData.ProjectDescription,
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
      Status: '',
      selectedFile: null,
      isSubmitting: false
    });
  };

  return (
    <section className={styles.quotationApprovalForm}>

      <h2>Quotation Approval Form</h2>
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
        className={errors.ProjectTitle ? "errorInput" : ''}
      />
      {errors.ProjectTitle && <div className="errorText">Required</div>}
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
      <textarea
        name="ProjectDescription"
        value={formData.ProjectDescription}
        onChange={onFieldChange}
        className={errors.ProjectDescription ? "errorInput" : ''}
      />
      {errors.ProjectDescription && <div className="errorText">Required</div>}
    </div>
  </div>

  {/* Amount */}
  <div className={styles.formRow}>
    <label className={styles.label}>Total Project Amount</label>
    <div className={styles.twoCol}>
      <input
        type="number"
        name="TotalProjectAmount"
        value={formData.TotalProjectAmount}
        onChange={onFieldChange}
      />
      <span className={styles.inlineLabel}>Applicable Taxes</span>
      <input
        type="number"
        name="ApplicableTaxes"
        value={formData.ApplicableTaxes}
        onChange={onFieldChange}
      />
    </div>
  </div>

  {/* Vendor 1 */}
  <div className={styles.formRow}>
    <label className={styles.label}>
      Vendor 1 <span className="required">*</span>
    </label>

    <div className={styles.twoCol}>
      <div>
        <input
          name="Vendor1"
          value={formData.Vendor1}
          onChange={onFieldChange}
          className={errors.Vendor1 ? "errorInput" : ''}
        />
        {errors.Vendor1 && <div className="errorText">Required</div>}
      </div>

      <span className={styles.inlineLabel}>
        Quote 1 <span className="required">*</span>
      </span>

      <div>
        <input
          name="Quote1"
          value={formData.Quote1}
          onChange={onFieldChange}
          className={errors.Quote1 ? "errorInput" : ''}
        />
        {errors.Quote1 && <div className="errorText">Required</div>}
      </div>
    </div>
  </div>

  {/* Vendor 2 */}
  <div className={styles.formRow}>
    <label className={styles.label}>Vendor 2</label>
    <div className={styles.twoCol}>
      <input name="Vendor2" value={formData.Vendor2} onChange={onFieldChange} />
      <span className={styles.inlineLabel}>Quote 2</span>
      <input name="Quote2" value={formData.Quote2} onChange={onFieldChange} />
    </div>
  </div>

  {/* Vendor 3 */}
  <div className={styles.formRow}>
    <label className={styles.label}>Vendor 3</label>
    <div className={styles.twoCol}>
      <input name="Vendor3" value={formData.Vendor3} onChange={onFieldChange} />
      <span className={styles.inlineLabel}>Quote 3</span>
      <input name="Quote3" value={formData.Quote3} onChange={onFieldChange} />
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
        className={errors.Selectedvendor ? "errorInput" : ''}
      />
      {errors.Selectedvendor && <div className="errorText">Required</div>}
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
        className={errors.SelectedQuote ? "errorInput" : ''}
      />
      {errors.SelectedQuote && <div className="errorText">Required</div>}
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
        className={errors.Department ? "errorInput" : ''}
      >
        <option value="">Select department</option>
        {departments.map((dept) => (
          <option key={dept.Id} value={dept.DepartmentName}>
            {dept.DepartmentName}
          </option>
        ))}
      </select>
      {errors.Department && <div className="errorText">Required</div>}
    </div>
  </div>

  {/* Advance Payment */}
  <div className={styles.formRow}>
    <label className={styles.label}>
      Advance Payment <span className="required">*</span>
    </label>
    <div className={styles.field}>
      <label>
        <input type="radio" name="Advancepayment" value="Yes"
          checked={formData.Advancepayment === 'Yes'}
          onChange={onFieldChange} /> Yes
      </label>

      <label style={{ marginLeft: '20px' }}>
        <input type="radio" name="Advancepayment" value="No"
          checked={formData.Advancepayment === 'No'}
          onChange={onFieldChange} /> No
      </label>

      {errors.Advancepayment && <div className="errorText">Required</div>}
    </div>
  </div>

  {/* Approval Path */}
  <div className={styles.formRow}>
    <label className={styles.label}>
      Approval Path <span className="required">*</span>
    </label>
    <div className={styles.field}>
      <textarea
        name="ApprovalPath"
        value={formData.ApprovalPath}
        onChange={onFieldChange}
        className={errors.ApprovalPath ? "errorInput" : ''}
      />
      {errors.ApprovalPath && <div className="errorText">Required</div>}
    </div>
  </div>

  {/* File */}
  <div className={styles.formRow}>
    <label className={styles.label}>
      Attach Documents <span className="required">*</span>
    </label>
    <div className={styles.field}>
      <input type="file" onChange={onFileChange} />
    </div>
  </div>

  {/* Buttons */}
  <div className={styles.buttonRow}>
    <button type="submit" className={styles.submitBtn}>Submit</button>
    <button type="button" className={styles.saveBtn} onClick={saveDraft}>Save</button>
    <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
  </div>

</form>

      <div className={styles.statusMessage}>{formData.Status}</div>

    </section>
  );
};

function setItemId(Id: any) {
  throw new Error('Function not implemented.');
}
