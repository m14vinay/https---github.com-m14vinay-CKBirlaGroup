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
  const [history, setHistory] = useState<any[]>([]);
  const [isActionDone, setIsActionDone] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const rawItemId = params.get("id");
  const itemId = rawItemId ? Number(rawItemId) : null;
  const isReadOnly =
  isActionDone ||
  data?.Status === "Approved" ||
  data?.Status === "Rejected";

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      if (!itemId) return;

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

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH HISTORY =================
  const fetchHistory = async () => {
    try {
      if (!itemId) return;

      const res = await props.spHttpClient.get(
        `${props.siteUrl}/_api/web/lists/getbytitle('History')/items?$filter=FID eq ${itemId}&$orderby=Created asc`,
        SPHttpClient.configurations.v1
      );

      const result = await res.json();
      setHistory(result.value || []);

    } catch (err) {
      console.error(err);
    }
  };

  // ================= UPDATE =================
  const updateStatus = async (status: string) => {
    try {
      if (!comment.trim()) {
        setStatusMsg("❌ Enter comment");
        setIsActionDone(true);
        return;
      }

      await props.spHttpClient.post(
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
            Status: status,
            ApproverComment1: comment
          })
        }
      );

      setStatusMsg(`✅ ${status} done`);
      fetchHistory();

    } catch (err: any) {
      setStatusMsg(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    fetchHistory();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  // ================= UI =================

  return (
  <div className={styles.container}>

    <div className={styles.mainLayout}>

      {/* ================= LEFT ================= */}
      <div>

        <div className={styles.heading}>Quotation Request Approval Form</div>

        {/* Project Title */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Project Title <span className={styles.required}>*</span>
          </label>
          <input className={styles.input} value={data.ProjectTitle || ""} disabled />
        </div>

        {/* Project Ref (NO *) */}
        <div className={styles.formRow}>
          <label className={styles.label}>Project Reference Number</label>
          <input className={styles.input} value={data.ProjectReffNo || ""} disabled />
        </div>

        {/* Description */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Project Description <span className={styles.required}>*</span>
          </label>
          <input className={styles.input} value={data.ProjectDescription || ""} disabled />
        </div>

        {/* Total Amount (NO *) */}
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
              Vendor {i} {i === 1 && <span className={styles.required}>*</span>}
            </label>

            <div className={styles.twoCol}>
              <input className={styles.input} value={data[`Vendor${i}`] || ""} disabled />
              <span className={styles.inlineLabel}>Quote {i}</span>
              <input className={styles.input} value={data[`Quote${i}`] || ""} disabled />
            </div>
          </div>
        ))}

        {/* Select Vendor */}
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

        {/* Advance */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Advance Payment <span className={styles.required}>*</span>
          </label>
          <input className={styles.input} value={data.Advancepayment || ""} disabled />
        </div>

        {/* Approval Path */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Approval Path <span className={styles.required}>*</span>
          </label>
          <input className={styles.input} value={data.ApprovalPath || ""} disabled />
        </div>

        {/* Attachments */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Attach Documents <span className={styles.required}>*</span>
          </label>

          <div>
            {data.AttachmentFiles?.map((f: any) => (
              <div key={f.FileName}>
                <a href={f.ServerRelativeUrl} target="_blank">
                  {f.FileName}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ================= PO ================= */}
        <div className={styles.poSection}>
          <div className={styles.poHeader}>Purchase Order Details</div>

          <div className={styles.poTable}>
            <div className={styles.poRowHeader}>
              <div>Description of Goods / Services</div>
              <div>Quantity</div>
              <div>Rate</div>
              <div>Amount</div>
            </div>

            {poItems.map((item, i) => (
              <div key={i} className={styles.poRow}>
                <input className={styles.input} value={item.Description} disabled />
                <input className={styles.input} value={item.Quantity} disabled />
                <input className={styles.input} value={item.Rate} disabled />
                <input className={styles.input} value={item.Amount} disabled />
              </div>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className={styles.formRow}>
          <label className={styles.label}>
            Approver Comments <span className={styles.required}>*</span>
          </label>

         <textarea
  className={styles.textarea}
  value={comment}
  onChange={(e) => setComment(e.target.value)}
  disabled={isReadOnly}
  style={{
    backgroundColor: isReadOnly ? "#f3f2f1" : "white",
    cursor: isReadOnly ? "not-allowed" : "text"
  }}
/>
        </div>

        {/* Buttons */}
        <div className={styles.buttonContainer}>
          <button className={styles.approveBtn} onClick={() => updateStatus("Approved")}>
            Approve
          </button>
          <button className={styles.rejectBtn} onClick={() => updateStatus("Rejected")}>
            Reject
          </button>
          <button className={styles.backBtn} onClick={() => window.history.back()}>
            Back
          </button>
        </div>

      </div>

      {/* ================= RIGHT ================= */}
      <div className={styles.rightTimeline}>
        <h3>Timeline</h3>

        {history.map((item, index) => (
          <div key={index} style={{ marginBottom: 15 }}>
            <b>{item.Title}</b>
            <div>{item.Status}</div>
            <div>{item.ApproverName}</div>
            <div>{new Date(item.Created).toLocaleString()}</div>
          </div>
        ))}

      </div>

    </div>

  </div>
);
};