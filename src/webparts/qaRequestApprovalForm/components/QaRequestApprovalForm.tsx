import * as React from 'react';
import { useEffect, useState } from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IQaRequestApprovalFormProps } from './IQaRequestApprovalFormProps';
import styles from './QaRequestApprovalForm.module.scss';

export const QaRequestApprovalForm: React.FC<IQaRequestApprovalFormProps> = (props) => {

  const [poItems, setPoItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [comment, setComment] = useState("");

  const params = new URLSearchParams(window.location.search);
  const rawItemId = params.get("id");
  const itemId = rawItemId ? Number(rawItemId) : null;
  const isReadOnly = data?.Status === "Approved" || data?.Status === "Rejected";

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      if (!itemId) {
        setStatusMsg('❌ Invalid item ID');
        return;
      }

      const res = await props.spHttpClient.get(
        `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})?$expand=AttachmentFiles`,
        SPHttpClient.configurations.v1
      );

      const result = await res.json();
      setData(result);
      setComment(result.ApproverComment1 || "");

      const poRes = await props.spHttpClient.get(
        `${props.siteUrl}/_api/web/lists/getbytitle('PurchaseOrderDetails')/items?$filter=QuotationIdId eq ${itemId}`,
        SPHttpClient.configurations.v1
      );

      const poData = await poRes.json();
      setPoItems(poData.value || []);

    } catch (err: any) {
      console.error(err);
      setStatusMsg("❌ Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE STATUS =================
  const updateStatus = async (status: string) => {
    try {
      if (!itemId) {
        setStatusMsg('❌ Invalid item ID');
        return;
      }

      if (!comment.trim()) {
        setStatusMsg("❌ Please enter comment");
        return;
      }

      const res = await props.spHttpClient.post(
        `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'IF-MATCH': '*',
            'X-HTTP-Method': 'MERGE'
          },
          body: JSON.stringify({
            Status: String(status),   // - force string
            ApproverComment1: String(comment)
          })
        }
      );

      if (!res.ok) {
        const error = await res.text();
        console.log("SP ERROR FULL:", error);
        setStatusMsg(error); // temporarily show real error
        return;
      }

      setStatusMsg(`✅ ${status} successfully`);
      setData((prev: any) => prev ? { ...prev, Status: status, ApproverComment1: comment } : prev);

    } catch (err: any) {
      setStatusMsg("❌ " + err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  // ONLY UPDATED JSX PART (rest same rahega)

  return (
    <div className={styles.container}>

      <div className={styles.heading}>
        Quotation Request Approval Form
      </div>

      {/* Project Title */}
      <div className={styles.formRow}>
        <label className={styles.label}>
          Project Title <span className={styles.required}>*</span>
        </label>
        <input className={styles.input} value={data.ProjectTitle || ""} disabled />
      </div>

      {/* Project Reference Number */}
      <div className={styles.formRow}>
        <label className={styles.label}>Project Reference Number</label>
        <input className={styles.input} value={data.ProjectReffNo || ""} disabled />
      </div>

      {/* Description */}
      <div className={styles.formRow}>
        <label className={styles.label}>
          Project Description & Advance Payment Details <span className={styles.required}>*</span>
        </label>
        <input className={styles.input} value={data.ProjectDescription || ""} disabled />
      </div>

      {/* Amount */}
      <div className={styles.formRow}>
        <label className={styles.label}>Total Project Amount</label>
        <div className={styles.twoCol}>
          <input className={styles.input} value={data.TotalProjectAmount || ""} disabled />
          <span className={styles.inlineLabel}>Applicable Taxes</span>
          <input className={styles.input} value={data.ApplicableTaxes || ""} disabled />
        </div>
      </div>

      {/* Vendors */}
      {[1, 2, 3].map(i => (
        <div key={i} className={styles.formRow}>
          <label className={styles.label}>
            Vendor {i} <span className={styles.required}>*</span>
          </label>
          <div className={styles.twoCol}>
            <input className={styles.input} value={data[`Vendor${i}`] || ""} disabled />
            <span className={styles.inlineLabel}>
              Quote {i} <span className={styles.required}>*</span>
            </span>
            <input className={styles.input} value={data[`Quote${i}`] || ""} disabled />
          </div>
        </div>
      ))}

      {/* Selected Vendor */}
      <div className={styles.formRow}>
        <label className={styles.label}>
          Select Vendor <span className={styles.required}>*</span>
        </label>
        <input className={styles.input} value={data.Selectedvendor || ""} disabled />
      </div>

      {/* Selected Quote */}
      <div className={styles.formRow}>
        <label className={styles.label}>
          Selected Quote <span className={styles.required}>*</span>
        </label>
        <input className={styles.input} value={data.SelectedQuote || ""} disabled />
      </div>

      {/* Department */}
      <div className={styles.formRow}>
        <label className={styles.label}>
          Department <span className={styles.required}>*</span>
        </label>
        <input className={styles.input} value={data.Department || ""} disabled />
      </div>

      {/* Advance Payment */}
      <div className={styles.formRow}>
        <label className={styles.label}>
          Advance Payment <span className={styles.required}>*</span>
        </label>
        <input className={styles.input} value={data.AdvancePayment || ""} disabled />
      </div>

      {/* Approval Path */}
      <div className={styles.formRow}>
        <label className={styles.label}>
          Approval Path <span className={styles.required}>*</span>
        </label>
        <input className={styles.input} value={data.ApprovalPath || ""} disabled />
      </div>

      {/* Attach Documents */}
      <div className={styles.formRow}>
        <label className={styles.label}>
          Attach Documents <span className={styles.required}>*</span>
        </label>
        <div className={styles.field}>
          {data.AttachmentFiles?.length > 0 ? (
            data.AttachmentFiles.map((f: any) => (
              <div key={f.FileName}>
                <a href={f.ServerRelativeUrl} target="_blank" rel="noreferrer">
                  {f.FileName}
                </a>
              </div>
            ))
          ) : (
            <span>No documents attached</span>
          )}
        </div>
      </div>

      {/* PO Table */}
      <div className={styles.poSection}>
        <div className={styles.poHeader}>
          Purchase Order Details: <span className={styles.required}>*</span>
        </div>

        <div className={styles.poTable}>
          <div className={styles.poRowHeader}>
            <div>Description of Goods / Services</div>
            <div>Quantity</div>
            <div>Rate</div>
            <div>Amount</div>
          </div>

          {poItems.map((item, i) => (
            <div key={i} className={styles.poRow}>
              <input className={styles.input} value={item.Description || ""} disabled />
              <input className={styles.input} value={item.Quantity || ""} disabled />
              <input className={styles.input} value={item.Rate || ""} disabled />
              <input className={styles.input} value={item.Amount || ""} disabled />
            </div>
          ))}
        </div>
      </div>

      {/* COMMENT */}
      <div className={styles.formRow}>
        <label className={styles.label}>
          Approver Comments <span className={styles.required}>*</span>
        </label>
        <textarea
          className={`${styles.textarea} ${styles.commentBox}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isReadOnly}
        />
      </div>


      {/* BUTTONS */}
      <div className={styles.buttonContainer}>
        <button className={styles.approveBtn} onClick={() => updateStatus("Approved")} disabled={isReadOnly}>Approve</button>
        <button className={styles.rejectBtn} onClick={() => updateStatus("Rejected")} disabled={isReadOnly}>Reject</button>
        <button className={styles.backBtn} onClick={() => window.history.back()}>Back</button>
      </div>

      {/* STATUS MESSAGE */}
      {statusMsg && (
        <div style={{
          marginTop: "15px",
          fontWeight: "600",
          color: statusMsg.includes("❌") ? "red" : "green"
        }}>
          {statusMsg}
        </div>
      )}
    </div>
  );
};