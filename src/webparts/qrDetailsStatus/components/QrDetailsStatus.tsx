import * as React from 'react';
import { useEffect, useState } from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IQrDetailsStatusProps } from './IQrDetailsStatusProps';
import styles from './QrDetailsStatus.module.scss';

const QrDetailsStatus: React.FC<IQrDetailsStatusProps> = (props) => {

  const [data, setData] = useState<any>(null);
  const [poItems, setPoItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const itemId = Number(params.get('id'));

  const fetchData = async () => {
    try {
      if (!itemId) return;

      const res = await props.spHttpClient.get(
        `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})?$expand=AttachmentFiles`,
        SPHttpClient.configurations.v1
      );

      const result = await res.json();
      setData(result);

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

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data found</div>;

  return (
    <div className={styles.container}>

      <div className={styles.heading}>Quotation Request Details & Status:</div>

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
        <input className={styles.input} value={data.AdvancePayment || ''} disabled />
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

      {/* PO TABLE */}
      <div className={styles.formRow}>
        <label className={styles.label}>Purchase Order Details <span className={styles.required}>*</span></label>

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
  );
};

export default QrDetailsStatus;