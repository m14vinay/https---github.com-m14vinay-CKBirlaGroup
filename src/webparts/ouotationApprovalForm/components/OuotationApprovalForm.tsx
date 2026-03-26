import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './OuotationApprovalForm.module.scss';
import { IOuotationApprovalFormProps } from './IOuotationApprovalFormProps';
import { SPHttpClient } from '@microsoft/sp-http';

export const OuotationApprovalForm: React.FC<IOuotationApprovalFormProps> = (props) => {

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
    Status: '',
    selectedFile: null as File | null,
    isSubmitting: false
  });

  const [departments, setDepartments] = useState<
    Array<{ Id: number; DepartmentName: string }>
  >([]);

  // 🔹 Handle change
  const onFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔹 File
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        selectedFile: event.target.files![0]
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

  // 🔹 Submit
  const submitToList = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormData(prev => ({
      ...prev,
      isSubmitting: true,
      Status: 'Submitting...'
    }));

    try {

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
        ApprovalPath: formData.ApprovalPath
      };

      const response = await props.spHttpClient.post(
        `${props.siteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata.metadata=none',
            'Content-Type': 'application/json;odata.metadata=none'
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const result = await response.json();

      // 🔹 Attachment
      if (formData.selectedFile) {
        const buffer = await formData.selectedFile.arrayBuffer();

        await props.spHttpClient.post(
          `${props.siteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items(${result.Id})/AttachmentFiles/add(FileName='${formData.selectedFile.name}')`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata.metadata=none',
              'Content-Type': 'application/octet-stream'
            },
            body: buffer
          }
        );
      }

      // 🔹 Reset
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
        Status: '✅ Submitted successfully!',
        selectedFile: null,
        isSubmitting: false
      });

    } catch (error: any) {
      console.error(error);
      setFormData(prev => ({
        ...prev,
        Status: `❌ Error: ${error.message}`,
        isSubmitting: false
      }));
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

        <div className={styles.formRow}>
          <label className={styles.label}>Project Title *</label>
          <div className={styles.field}>
            <input name="ProjectTitle" value={formData.ProjectTitle} onChange={onFieldChange} />
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Project Reference Number</label>
          <div className={styles.field}>
            <input name="ProjectReffNo" value={formData.ProjectReffNo} onChange={onFieldChange} />
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Project Description & Advance Payment Details *</label>
          <div className={styles.field}>
            <textarea name="ProjectDescription" value={formData.ProjectDescription} onChange={onFieldChange} />
          </div>
        </div>

       {/* Total Amount + Taxes */}
<div className={styles.formRow}>
  <label className={styles.label}>Total Project Amount</label>

  <div className={styles.twoCol}>
    <input
      type="number"
      name="TotalProjectAmount"
      placeholder="Exclusive of Taxes"
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
  <label className={styles.label}>Vendor 1 <span>*</span></label>

  <div className={styles.twoCol}>
    <input
      name="Vendor1"
      value={formData.Vendor1}
      onChange={onFieldChange}
    />

    <span className={styles.inlineLabel}>Quote 1 <span>*</span></span>

    <input
      name="Quote1"
      value={formData.Quote1}
      onChange={onFieldChange}
    />
  </div>
</div>

{/* Vendor 2 */}
<div className={styles.formRow}>
  <label className={styles.label}>Vendor 2</label>

  <div className={styles.twoCol}>
    <input
      name="Vendor2"
      value={formData.Vendor2}
      onChange={onFieldChange}
    />

    <span className={styles.inlineLabel}>Quote 2</span>

    <input
      name="Quote2"
      value={formData.Quote2}
      onChange={onFieldChange}
    />
  </div>
</div>

{/* Vendor 3 */}
<div className={styles.formRow}>
  <label className={styles.label}>Vendor 3</label>

  <div className={styles.twoCol}>
    <input
      name="Vendor3"
      value={formData.Vendor3}
      onChange={onFieldChange}
    />

    <span className={styles.inlineLabel}>Quote 3</span>

    <input
      name="Quote3"
      value={formData.Quote3}
      onChange={onFieldChange}
    />
  </div>
</div>

{/* Selected Vendor */}
<div className={styles.formRow}>
  <label className={styles.label}>Selected vendor <span>*</span></label>
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
  <label className={styles.label}>Selected Quote <span>*</span></label>
  <div className={styles.field}>
    <input
      name="SelectedQuote"
      value={formData.SelectedQuote}
      onChange={onFieldChange}
    />
  </div>
</div>

        <div className={styles.formRow}>
          <label className={styles.label}>Department</label>
          <div className={styles.field}>
            <select name="Department" value={formData.Department} onChange={onFieldChange}>
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.Id} value={dept.DepartmentName}>
                  {dept.DepartmentName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Advance Payment *</label>
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
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Approval Path *</label>
          <div className={styles.field}>
            <textarea
              name="ApprovalPath"
              value={formData.ApprovalPath}
              onChange={onFieldChange}
              className={styles.textarea}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Attach Documents *</label>
          <div className={styles.field}>
            <input type="file" onChange={onFileChange} />
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button type="submit" className={styles.submitBtn}>
            {formData.isSubmitting ? 'Submitting...' : 'Submit'}
          </button>

          <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
            Cancel
          </button>
        </div>

      </form>

      <div className={styles.statusMessage}>{formData.Status}</div>

    </section>
  );
};