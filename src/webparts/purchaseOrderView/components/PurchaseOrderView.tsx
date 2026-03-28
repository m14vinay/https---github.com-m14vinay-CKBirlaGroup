import * as React from 'react';
import { useState } from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './PurchaseOrderView.module.scss';
import { IPurchaseOrderViewProps } from './IPurchaseOrderViewProps';
import SharePointService from '../Service/Service';



const PurchaseOrderView: React.FC<IPurchaseOrderViewProps> = (props) => {

  const [form, setForm]=React.useState({
    POrequestNo:'',
      projectCode: '',
      projectTitle: '',
      vendorName: '',
      RemainingAmount: 0,
      Department:'',
      POAmount: 0,
     ApplicableTaxes:0,
     POCategory:'',
     ProjectDescription: '',
     ApproverComment1:'',
     ApproverCommentsError:'',
     files:  null,
     attachments: [],
    approver1: '',
   approver2: '',
   approver3: '',
   approver4: '',
   approver5: '',
   DepartmentHead: ''
    
  });

  
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [approverComment, setApproverComment] = React.useState('');
  const [attachments, setAttachments] = React.useState<any[]>([]);
 const [approver1, setApprover1] = React.useState('');
const [approver2, setApprover2] = React.useState('');
const [approver3, setApprover3] = React.useState('');
const [approver4, setApprover4] = React.useState('');
const [approver5, setApprover5] = React.useState('');
const [departmentHead, setDepartmentHead] = React.useState('');
  
  // --- 1️⃣ Get ID from query string ---
  const getIdFromQueryString = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('ID');
    return id ? parseInt(id, 10) : null;
  };

  // --- 3️⃣ Load data on mount ---
  React.useEffect(() => {
    const id = getIdFromQueryString();
    if (id) {
      handleFetchById(id);
    }
  }, []);


  const loadAttachments = async (id:number) => {
    try{
  const files = await service.getAttachments(id);
  console.log("Attachments:", files);
  setAttachments(files);
    }catch(error)
    {
      console.error(error);
    }
   };


const getApprover = async () => {
  try {
    const data = await service.getApprover('');

    console.log("Approver Data:", data);

    if (data && data.length > 0) {
      setApprover1(data[0].approver1 || '');
      setApprover2(data[0].approver2 || '');
      setApprover3(data[0].approver3 || '');
      setApprover4(data[0].approver4 || '');
      setApprover5(data[0].approver5 || '');
      setDepartmentHead(data[0].DepartmentHead || '');
    }

  } catch (error) {
    console.error(error);
  }
};


React.useEffect(() => {
  if (itemId) {
    loadAttachments(itemId);
    getApprover(); // 👈 dynamic ID use karo
  }
}, [itemId]);

// componentDidMount(): void {
//   this.loadAttachments();
//   this.GetApprover();
// }
  
//FETCH DATA-----
const handleFetchById = async (id: number) => {
    try {
      console.log("Calling API with ID:", id);

      const result = await service.getItemByRequestNo(id);

      console.log("Result:", result);

      if (result) {
      setItemId(result.Id);

      setForm(prev => ({
        ...prev,
        POrequestNo: result.POrequestNo || '',
        projectCode: result.ProjectCode || '',
        Department: result.Department || '',
        projectTitle: result.ProjectTitle || '',
        vendorName: result.VendorName || '',
        POAmount: result.POAmount || 0,
        ApplicableTaxes: result.ApplicableTaxes || 0,
        ProjectDescription: result.ProjectDescription || '',
        files: null
      }));

      setApproverComment(result.ApproverComment1 || '');

    } else {
      alert("No data found");
    }

  } catch (error) {
    console.error("Error:", error);
  }
};


  const handleApprove = async () => {
  try {
       if (!approverComment) return alert("Approver Comment required");
    if (!itemId) return;

    await service.updateItemdata(itemId, "Approved", approverComment);

    alert("✅ Approved successfully");
    setApproverComment('');
  } catch (error) {
    console.error(error);
  }
};

const handleReject = async () => {
  try {
    if (!approverComment) return alert("Approver Comment required");
    if (!itemId) return;

    if (!approverComment) {
      alert("Comment is required for rejection ❗");
      return;
    }

    await service.updateItemdata(itemId, "Rejected", approverComment);

    alert("❌ Rejected successfully");
    setApproverComment('');
  } catch (error) {
    console.error(error);
  }
};

    
 


  // --- RENDER ---
  return (
     <div className={styles.container}>

        {/* LEFT FORM */}
        <div className={styles.leftPanel}>
          <h2>PO Approval Form</h2>
          <h4>PO Approval / Request Approval</h4>

          <label>Project Code</label>
          <input value={form.projectCode}   readOnly />

          <label>Department</label>
          <input name="department" value={form.Department} readOnly />

          <label>Project Title</label>
          <input name="projectTitle" value={form.projectTitle} readOnly />

          <label>Select Vendor Name</label>
          <input name="vendorName" value={form.vendorName} readOnly   >
          </input>

          <label>Remaining Amount</label>
          <input name="RemainingAmount" value={form.RemainingAmount} readOnly  />

          <label>PO Amount</label>
          <input name="POAmount" value={form.POAmount} readOnly  />

          <label>Applicable Taxes</label>
          <input name="ApplicableTaxes" value={form.ApplicableTaxes} readOnly   >
          </input>

           <label>PO Category</label>
          <input name="POCategory" value={form.POCategory} readOnly   >
          </input>

          <label>Additional Information & Remarks</label>
          <input name="comments" value={form.ProjectDescription}  readOnly >
          </input>

          <label>Attachments <span className={styles.required}>*</span></label>
       <input type="file" multiple />
        </div>
    </div>
   );
};

export default PurchaseOrderView;