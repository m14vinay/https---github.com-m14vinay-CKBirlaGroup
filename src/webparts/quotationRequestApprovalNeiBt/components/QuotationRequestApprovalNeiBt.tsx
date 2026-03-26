import * as React from 'react';
import styles from './QuotationRequestApprovalNeiBt.module.scss';
import type { IQuotationRequestApprovalNeiBtProps,IState,IForm } from './IQuotationRequestApprovalNeiBtProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import { useEffect, useState } from 'react';
import { TextField, Dropdown, PrimaryButton, formProperties } from '@fluentui/react';

export default class QuotationRequestApprovalNeiBt extends React.Component<IQuotationRequestApprovalNeiBtProps, IState,IForm> {
  constructor(props: IQuotationRequestApprovalNeiBtProps) {
    super(props);

    const [form, setForm] = useState<IForm>({
    projectTitle: '',
    projectDescription: '',
    department: '',
    approvalPath: '',
    vendor1: '',
    vendor2: '',
    vendor3: '',
    selectedVendor: '',
    quote1: 0,
    quote2: 0,
    quote3: 0,
    selectedQuote: 0,
    projectRef: '',
    files: []
  });

  const [departments, setDepartments] = useState<any[]>([]);
  const [paths, setPaths] = useState<any[]>([]);
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    const res = await fetch(
      `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('DepartmentMasterNEI')/items`,
      { headers: { Accept: 'application/json;odata=verbose' } }
    );
    const data = await res.json();
    setDepartments(data.d.results);
  };

// 🔹 Bind approval path
  const bindPath = async (dept: string) => {
    const res = await fetch(
      `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('DepartmentMasterNEI')/items?$filter=DepartmentName eq '${dept}'`,
      { headers: { Accept: 'application/json;odata=verbose' } }
    );
    const data = await res.json();
    setPaths(data.d.results);
  };

  // 🔹 Handle change
  const handleChange = (field: keyof IForm, value: any) => {
    setForm({ ...form, [field]: value });
  };
 
 // 🔹 File upload
  const handleFile = (e: any) => {
    setForm({ ...form, files: Array.from(e.target.files) });
  };

  // 🔹 Validation + Save
  const handleSubmit = async () => {

    if (!form.projectTitle) return alert("Project Title required");
    if (!form.projectDescription) return alert("Description required");
    if (!form.department) return alert("Department required");
    if (!form.approvalPath) return alert("Approval Path required");
    if (!form.vendor1) return alert("Vendor1 required");
    if (!form.quote1) return alert("Quote1 required");
    if (!form.selectedVendor) return alert("Select Vendor");
    if (!form.selectedQuote) return alert("Select Quote");
    if (form.files.length === 0) return alert("Attach files");
  const body = {
      __metadata: { type: "SP.Data.QuotationApprovalNEIBTAdminListItem" },
      ProjectTitle: form.projectTitle,
      ProjectDescription: form.projectDescription,
      Vendor1: form.vendor1,
      Vendor2: form.vendor2,
      Vendor3: form.vendor3,
      Selectedvendor: form.selectedVendor,
      Quote1: form.quote1,
      Quote2: form.quote2,
      Quote3: form.quote3,
      SelectedQuote: form.selectedQuote,
      ProjectReffNo: form.projectRef,
      Department: form.department,
      ApprovalPath: form.approvalPath
    };

    const res = await fetch(
      `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('QuotationApprovalNEIBTAdmin')/items`,
      {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": (document.getElementById("__REQUESTDIGEST") as HTMLInputElement).value
        },
        body: JSON.stringify(body)
      }
    );
    const data = await res.json();
    const itemId = data.d.Id;
  if (data.value.length > 0) {
    this.setState({
      QARequestNo: data.value[0].QARequestNo,
      ProjectTitle: data.value[0].ProjectTitle,
      ProjectReferenceNo: data.value[0].ProjectReferenceNo,
      projectDescription: data.value[0].projectDescription,
      TotalProjectAmount: data.value[0].TotalProjectAmount,
      ApplicableTaxes: data.value[0].ApplicableTaxes,
      Vendor1: data.value[0].Vendor1,
      Vendor2: data.value[0].Vendor2,
      Vendor3: data.value[0].Vendor3,
      Quote1: data.value[0].Quote1,
      Quote2: data.value[0].Quote2,
      Quote3: data.value[0].Quote3,
      Vendor: data.value[0].Vendor,
      Quote: data.value[0].Quote,
      Department: data.value[0].Department,
      AdvancePayment: data.value[0].AdvancePayment,
      ApprovalPath: data.value[0].ApprovalPath
    });
  } else {
   
    this.setState({
       QARequestNo:'',
      ProjectTitle:'',
      ProjectReferenceNo:'',
      projectDescription: '',
      TotalProjectAmount:0,
      ApplicableTaxes:0,
      Vendor1: '',
      Vendor2: '',
      Vendor3: '',
      Quote1:'',
      Quote2:'',
      Quote3:'',
      Vendor:'',
      Quote:'',
      Department:'',
      AdvancePayment:0,
      ApprovalPath: ''
    });
  }
   // 🔥 Upload files
    for (let file of form.files) {
      await uploadFile(itemId, file);
    }

    alert("Submitted Successfully");
    clearForm();
  };
  // 🔹 Upload file
  const uploadFile = async (itemId: number, file: File) => {
    const buffer = await file.arrayBuffer();
    await fetch(
      `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('QuotationApprovalNEIBTAdmin')/items(${itemId})/AttachmentFiles/add(FileName='${file.name}')`,
      {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "X-RequestDigest": (document.getElementById("__REQUESTDIGEST") as HTMLInputElement).value
        },
        body: buffer
      }
    );
  };
// 🔹 Clear form
  const clearForm = () => {
    setForm({
      projectTitle: '',
      projectDescription: '',
      department: '',
      approvalPath: '',
      vendor1: '',
      vendor2: '',
      vendor3: '',
      selectedVendor: '',
      quote1: 0,
      quote2: 0,
      quote3: 0,
      selectedQuote: 0,
      projectRef: '',
      files: []
    });
  };
};

  public render(): React.ReactElement<IQuotationRequestApprovalNeiBtProps> {
    return (
      <div className={styles.container}>
        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h2>Quotation Approval Form-NEI BT Admin</h2>
          <h4>Quotation Approval Form-NEI BT Admin/Request Approval</h4>

          <label>Project Title</label>
          <input value={formProperties.ProjectTitle}  />

          <label>Project Reference No</label>
          <input name="projectReferenceNo" value={formProperties.ProjectReferenceNo}   >
          </input>

          <label>Project Description & Advance Payment Details</label>
          <input name="projectDescription" value={formProperties.projectDescription}   >
          </input>

          <label>Total Project Amount</label>
          <input name="totalProjectAmount" value={formProperties.TotalProjectAmount }  />

          <label>Applicable Taxes</label>
          <input name="applicableTaxes" value={formProperties.ApplicableTaxes}   >
          </input>

          <label>Vendor 1</label>
          <input name="vendor1" value={formProperties.Vendor1}  />

          <label>Vendor 2</label>
          <input name="vendor2" value={formProperties.Vendor2}  />

          <label>Vendor 3</label>
          <input name="vendor3" value={formProperties.Vendor3}  />

          <label>Quote 1</label>
          <input name="quote1" value={formProperties.Quote1}  />

          <label>Quote 2</label>
          <input name="quote2" value={formProperties.Quote2}  />

          <label>Quote 3</label>
          <input name="quote3" value={formProperties.Quote3}  />

          <label>Select Vendor</label>
          <input name="vendor" value={formProperties.Vendor}  />

          <label>Select Quote</label>
          <input name="quote" value={formProperties.Quote}   >
          </input>

          <label>Department</label>
          <input name="Department" value={formProperties.Department}   >
          </input>

          <label>Advance Amount</label>
          <input name="AdvanceAmount" value={formProperties.AdvancePayment}   >
          </input>

          <label>Approval Path</label>
          <input name="ApprovalPath" value={formProperties.ApprovalPath}   >
          </input>          

          <label>Attach Documents</label>
          <input type="file" multiple /> 

          {/* Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.ApproveBtn} >Approve</button>
            <button className={styles.RejectBtn} >Reject</button>
            <button className={styles.cancelBtn}>Cancel</button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          {/* Templates */}
          <div className={styles.card}>
            <h4>Templates</h4>
            <ul>
              <li>Quotation_Approval_Form_v1.0.xlsx</li>
              <li>SOP_Procurement_of_Goods_Services-CKBCS.pdf</li>
              <li>DigiFlow_Training_Manual.pdf</li>
            </ul>
          </div>

          {/* Guidelines */}
          <div className={styles.card}>
            <h4>Important Guidelines</h4>
            <ol>
              <li>Select approval path carefully.</li>
              <li>Use project reference if needed.</li>
              <li>Attach all documents (Max 25 MB).</li>
              <li>Avoid special characters in file names.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

