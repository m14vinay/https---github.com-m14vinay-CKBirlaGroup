import * as React from 'react';
import { useEffect, useState } from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IQrDetailsStatusProps } from './IQrDetailsStatusProps';
import styles from './QrDetailsStatus.module.scss';

const QrDetailsStatus: React.FC<IQrDetailsStatusProps> = (props) => {

  const [data, setData] = useState<any>(null);
  const [poItems, setPoItems] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const itemId = Number(params.get('id'));

  // Fetch history data for timeline
  const fetchHistory = async () => {
    try {
      const res = await props.spHttpClient.get(
        `${props.siteUrl}/_api/web/lists/getbytitle('History')/items?$filter=FID eq ${itemId}&$orderby=Created asc`,
        SPHttpClient.configurations.v1
      );

      const data = await res.json();
      console.log("History:", data);

      setHistory(data.value || []);
    } catch (err) {
      console.error("History error:", err);
      setHistory([]);
    }
  };

  const fetchData = async () => {
    try {
      if (!itemId) return;

      // MAIN DATA
      const res = await props.spHttpClient.get(
        `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})?$expand=AttachmentFiles`,
        SPHttpClient.configurations.v1
      );

      const result = await res.json();
      setData(result);

      // PO DATA
      const poRes = await props.spHttpClient.get(
        `${props.siteUrl}/_api/web/lists/getbytitle('PurchaseOrderDetails')/items?$filter=QuotationIdId eq ${itemId}`,
        SPHttpClient.configurations.v1
      );

      const poData = await poRes.json();
      setPoItems(poData.value || []);

    } catch (err) {
      console.error(err);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadAll = async () => {
      await fetchData();
      await fetchHistory();
      setLoading(false);
    };
    loadAll();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data found</div>;

  const requestLabel = data.RequestNo || `PRJ-${itemId}`;
  const currentStatus = data.CurrentStatus || 'Pending';
  const approvalNames = String(data.ApprovalPath || '')
    .split('>')
    .map((item: string) => item.replace(/^\s*\d+\.\s*/, '').trim())
    .filter((item: string) => item);


  return (
    <div className={styles.container}>

      <div className={styles.heading}>
        Quotation Request Details & Status:
      </div>

      <div className={styles.mainLayout}>

        {/* ================= LEFT SECTION ================= */}
        <div className={styles.leftSection}>

          <div className={styles.topSummary}>
            <div className={styles.requestCode}>{requestLabel}</div>
            <div className={styles.currentStatus}>
              <span>Current Status :</span>
              <strong>{currentStatus}</strong>
            </div>
          </div>

<div className={styles.approverFlow}>

  {/* GREEN (Approved) */}
  {(history || [])
    .filter(item => {
      const a = (item.UserAction || "").toLowerCase();
      return a.includes("approved") || a.includes("submit");
    })
    .slice(0, 1) // only first approved
    .map((item, i) => (
      <div key={i} className={styles.departmentStep}>
        <div className={styles.approverName}>{item.UserName}</div>
        <div className={styles.approverRole}>{item.Designation}</div>
        <div className={styles.approverStatus}>Approved</div>
      </div>
    ))}

  {/* YELLOW (Pending stacked) */}
  <div className={styles.managementColumn}>
    {(history || [])
      .filter(item => {
        const a = (item.UserAction || "").toLowerCase();
        return !a.includes("approved") && !a.includes("submit");
      })
      .map((item, i) => (
        <div key={i} className={styles.managementStep}>
          <div className={styles.approverName}>{item.UserName}</div>
          <div className={styles.approverRole}>{item.Designation}</div>
          <div className={styles.approverStatus}>Pending</div>
        </div>
      ))}
  </div>

</div>
          {/* Project Title */}
          <div className={styles.formRow}>
            <label className={styles.label}>Project Title <span className={styles.required}>*</span></label>
            <input className={styles.input} value={data.ProjectTitle || ''} disabled />
          </div>

          {/* Reference */}
          <div className={styles.formRow}>
            <label className={styles.label}>Project Reference Number</label>
            <input className={styles.input} value={data.ProjectReffNo || ''} disabled />
          </div>

          {/* Description */}
          <div className={styles.formRow}>
            <label className={styles.label}>Project Description & Advance Payment Details <span className={styles.required}>*</span></label>
            <input className={styles.input} value={data.ProjectDescription || ''} disabled />
          </div>

          {/* Amount */}
          <div className={styles.formRow}>
            <label className={styles.label}>Total Project Amount</label>
            <div className={styles.twoCol}>
              <input className={styles.input} value={data.TotalProjectAmount || ''} disabled />
              <span className={styles.inlineLabel}>Applicable Taxes</span>
              <input className={styles.input} value={data.ApplicableTaxes || ''} disabled />
            </div>
          </div>

          {/* Vendors */}
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.formRow}>
              <label className={styles.label}>
                Vendor {i} {i === 1 && <span className={styles.required}>*</span>}
              </label>

              <div className={styles.twoCol}>
                <input className={styles.input} value={data[`Vendor${i}`] || ''} disabled />
                <span className={styles.inlineLabel}>
                  Quote {i} {i === 1 && <span className={styles.required}>*</span>}
                </span>
                <input className={styles.input} value={data[`Quote${i}`] || ''} disabled />
              </div>
            </div>
          ))}

          {/* Selected Vendor */}
          <div className={styles.formRow}>
            <label className={styles.label}>Select Vendor <span className={styles.required}>*</span></label>
            <input className={styles.input} value={data.Selectedvendor || ''} disabled />
          </div>

          {/* Selected Quote */}
          <div className={styles.formRow}>
            <label className={styles.label}>Selected Quote <span className={styles.required}>*</span></label>
            <input className={styles.input} value={data.SelectedQuote || ''} disabled />
          </div>

          {/* Department */}
          <div className={styles.formRow}>
            <label className={styles.label}>Department <span className={styles.required}>*</span></label>
            <input className={styles.input} value={data.Department || ''} disabled />
          </div>

          {/* Advance Payment */}
          <div className={styles.formRow}>
            <label className={styles.label}>Advance Payment <span className={styles.required}>*</span></label>
            <input className={styles.input} value={data.Advancepayment || ''} disabled />
          </div>

          {/* Approval Path */}
          <div className={styles.formRow}>
            <label className={styles.label}>Approval Path <span className={styles.required}>*</span></label>
            <input className={styles.input} value={data.ApprovalPath || ''} disabled />
          </div>

          {/* Attachments */}
          <div className={styles.formRow}>
            <label className={styles.label}>Attach Documents <span className={styles.required}>*</span></label>
            <div>
              {data.AttachmentFiles?.length > 0 ? (
                data.AttachmentFiles.map((f: any) => (
                  <a
                    key={f.FileName}
                    className={styles.attachmentLink}
                    href={f.ServerRelativeUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {f.FileName}
                  </a>
                ))
              ) : (
                <span>No documents attached</span>
              )}
            </div>
          </div>

          {/* PO SECTION */}
          <div className={styles.formRow}>
            <label className={styles.label}>Purchase Order Details <span className={styles.required}>*</span></label>

            <div className={styles.poSection}>
              <div className={styles.poHeader}>Purchase Order Details</div>

              <div className={styles.poTable}>
                <div className={styles.poRowHeader}>
                  <div>Description</div>
                  <div>Qty</div>
                  <div>Rate</div>
                  <div>Amount</div>
                </div>

                {poItems.map((item, i) => (
                  <div key={i} className={styles.poRow}>
                    <input className={styles.input} value={item.Description || ''} disabled />
                    <input className={styles.input} value={item.Quantity || ''} disabled />
                    <input className={styles.input} value={item.Rate || ''} disabled />
                    <input className={styles.input} value={item.Amount || ''} disabled />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT TIMELINE ================= */}
        <div className={styles.rightTimeline}>

          <div className={styles.timelineTitle}>Timeline</div>

          {(history || []).map((item, i) => {

            const action = (item.UserAction || "").toLowerCase();

            const status =
              action.includes("approved") || action.includes("submit")
                ? "Approved"
                : action.includes("reject")
                  ? "Rejected"
                  : "Pending";

            return (
              <div
                key={i}
                className={`${styles.timelineItem} ${status === "Rejected" ? styles.rejected : ""
                  }`}
              >
                <strong>{item.Designation}</strong>
                <div>Status: {status}</div>
              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
};

export default QrDetailsStatus;