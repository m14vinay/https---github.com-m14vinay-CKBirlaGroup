import * as React from 'react';
import { useEffect, useState } from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IQaRequestApprovalFormProps } from './IQaRequestApprovalFormProps';
import styles from './QaRequestApprovalForm.module.scss';

export const QaRequestApprovalForm: React.FC<IQaRequestApprovalFormProps> = (props) => {

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [comment, setComment] = useState(""); // ✅ FIXED

  const params = new URLSearchParams(window.location.search);
  const rawId = params.get("id");
  const itemId = rawId ? Number(rawId) : null;

  // 🔹 Fetch Data
  const fetchData = async () => {
    try {
      if (!itemId) {
        setLoading(false);
        return;
      }

      const res = await props.spHttpClient.get(
        `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})`,
        SPHttpClient.configurations.v1
      );

      if (!res.ok) throw new Error("Item not found");

      const result = await res.json();
      setData(result);

      // ✅ Prefill comment
      setComment(result.ApproverComments || "");

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Update Status
  const updateStatus = async (status: string) => {
    try {

      // ✅ Validation
      if (!comment.trim()) {
        setStatusMsg("❌ Please enter comment");
        return;
      }

      setStatusMsg("⏳ Processing...");

      const res = await props.spHttpClient.post(
        `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata.metadata=none',
            'Content-Type': 'application/json;odata.metadata=none',
            'IF-MATCH': '*',
            'X-HTTP-Method': 'MERGE'
          },
          body: JSON.stringify({
            Status: status,
            ApproverComments: comment // ✅ ADDED
          })
        }
      );

      if (!res.ok) throw new Error("Update failed");

      setStatusMsg(`✅ ${status} successfully`);

      // ✅ Update UI instantly
      setData({ ...data, Status: status });

      // Optional: clear comment after submit
      // setComment("");

    } catch (err: any) {
      setStatusMsg("❌ " + err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 UI STATES
  if (loading) return <div>⏳ Loading...</div>;
  if (!itemId) return <div>❌ Invalid ID in URL</div>;
  if (!data) return <div>❌ No data found</div>;

  return (
    <div className={styles.container}>
      <div className={styles.heading}>Approval Form</div>

      {/* 🔹 READ ONLY FIELDS */}
      <label className={styles.label}>Project Title</label>
      <input className={styles.input} value={data.ProjectTitle || ""} readOnly />

      <label className={styles.label}>Reference No</label>
      <input className={styles.input} value={data.ProjectReffNo || ""} readOnly />

      <label className={styles.label}>Description</label>
      <textarea className={styles.textarea} value={data.ProjectDescription || ""} readOnly />

      <label className={styles.label}>Total Amount</label>
      <input className={styles.input} value={data.TotalProjectAmount || ""} readOnly />

      <label className={styles.label}>Taxes</label>
      <input className={styles.input} value={data.ApplicableTaxes || ""} readOnly />

      <label className={styles.label}>Vendor 1</label>
      <input className={styles.input} value={`${data.Vendor1 || ""} - ${data.Quote1 || ""}`} readOnly />

      <label className={styles.label}>Vendor 2</label>
      <input className={styles.input} value={`${data.Vendor2 || ""} - ${data.Quote2 || ""}`} readOnly />

      <label className={styles.label}>Vendor 3</label>
      <input className={styles.input} value={`${data.Vendor3 || ""} - ${data.Quote3 || ""}`} readOnly />

      <label className={styles.label}>Selected Vendor</label>
      <input className={styles.input} value={data.Selectedvendor || ""} readOnly />

      <label className={styles.label}>Selected Quote</label>
      <input className={styles.input} value={data.SelectedQuote || ""} readOnly />

      <label className={styles.label}>Department</label>
      <input className={styles.input} value={data.Department || ""} readOnly />

      <label className={styles.label}>Advance Payment</label>
      <input className={styles.input} value={data.Advancepayment || ""} readOnly />

      <label className={styles.label}>Approval Path</label>
      <input className={styles.input} value={data.ApprovalPath || ""} readOnly />

      <label className={styles.label}>Status</label>
      <input className={styles.input} value={data.Status || ""} readOnly />

      <hr />

      {/* ✅ COMMENT BOX */}
      <label className={styles.label}>Approver Comments</label>
      <textarea
        className={styles.textarea}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment here..."
      />

      <hr />

      {/* ✅ BUTTONS */}
      {data.Status !== "Approved" && data.Status !== "Rejected" && (
        <div className={styles.buttonContainer}>
          <button className={styles.approveBtn} onClick={() => updateStatus("Approved")}>
            Approve
          </button>

          <button className={styles.rejectBtn} onClick={() => updateStatus("Rejected")}>
            Reject
          </button>
        </div>
      )}

      {/* ✅ MESSAGE */}
      <div className={styles.statusMsg}>{statusMsg}</div>
    </div>
  );
};