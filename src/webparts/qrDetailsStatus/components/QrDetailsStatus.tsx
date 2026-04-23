import * as React from 'react';
import { useEffect, useState } from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IQrDetailsStatusProps } from './IQrDetailsStatusProps';
import styles from './QrDetailsStatus.module.scss';

interface IAttachmentFile {
  FileName: string;
  ServerRelativeUrl: string;
}

interface IFormData {
  RequestNo?: string;
  CurrentStatus?: string;
  ApprovalPath?: string;
  ProjectTitle?: string;
  ProjectReffNo?: string;
  ProjectDescription?: string;
  TotalProjectAmount?: string | number;
  ApplicableTaxes?: string | number;
  Selectedvendor?: string;
  SelectedQuote?: string | number;
  Department?: string;
  Advancepayment?: string;
  AttachmentFiles?: IAttachmentFile[];
  [key: string]: unknown;
}

interface IHistoryItem {
  Designation?: string;
  UserName?: string;
  UserAction?: string;
  UserComment?: string;
  ActionDate?: string;
}

interface IUserLookup {
  Title?: string;
}

interface IDepartmentApproverData {
  Departmenthead?: IUserLookup;
  Approval1?: IUserLookup;
  Approval2?: IUserLookup;
  Approval3?: IUserLookup;
  Approval4?: IUserLookup;
}

interface IWorkflowStep {
  designation: string;
  userName: string;
}

interface IPurchaseOrderItem {
  Description?: string;
  Quantity?: string | number;
  Rate?: string | number;
  Amount?: string | number;
}

const QrDetailsStatus: React.FC<IQrDetailsStatusProps> = (props) => {
  const [data, setData] = useState<IFormData | null>(null);
  const [poItems, setPoItems] = useState<IPurchaseOrderItem[]>([]);
  const [history, setHistory] = useState<IHistoryItem[]>([]);
  const [approverData, setApproverData] = useState<IDepartmentApproverData | null>(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const getValidId = (value: string | null) =>
    value && !isNaN(Number(value)) ? Number(value) : null;

  const itemId =
    getValidId(props.requestId || null) ||
    getValidId(params.get('requestId')) ||
    getValidId(params.get('id')) ||
    getValidId(params.get('ID')) ||
    0;
  const normalizeValue = (value?: string): string => String(value || '').toLowerCase().replace(/\s/g, '').trim();

  // Load action history for the right-side timeline and top approval strip.
  const fetchHistory = async (): Promise<void> => {
    const res = await props.spHttpClient.get(
      `${props.siteUrl}/_api/web/lists/getbytitle('History')/items?$filter=FID eq ${itemId}&$orderby=Created asc`,
      SPHttpClient.configurations.v1
    );
    const result = await res.json();
    setHistory(result.value || []);
  };

  // Load the main request, department approvers, and PO rows used by the page.
  const fetchData = async (): Promise<void> => {
    if (!itemId) {
      console.error("Invalid itemId:", itemId);
      return;
    }

    const res = await props.spHttpClient.get(
      `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})?$expand=AttachmentFiles`,
      SPHttpClient.configurations.v1
    );
    const result: IFormData = await res.json();
    setData(result);

    if (result.Department) {
      const safeDepartmentName = String(result.Department).replace(/'/g, "''");
      const deptRes = await props.spHttpClient.get(
        `${props.siteUrl}/_api/web/lists/getbytitle('DepartmentMaster')/items?$filter=DepartmentName eq '${safeDepartmentName}'&$expand=Departmenthead,Approval1,Approval2,Approval3,Approval4`,
        SPHttpClient.configurations.v1
      );
      const deptData = await deptRes.json();
      setApproverData((deptData.value && deptData.value[0]) || null);
    }

    const poRes = await props.spHttpClient.get(
      `${props.siteUrl}/_api/web/lists/getbytitle('PurchaseOrderDetails')/items?$filter=QuotationIdId eq ${itemId}`,
      SPHttpClient.configurations.v1
    );
    const poData = await poRes.json();
    setPoItems(poData.value || []);
  };

  useEffect(() => {
    const load = async (): Promise<void> => {
      await fetchData();
      await fetchHistory();
      setLoading(false);
    };

    load().catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!itemId) {
    return (
      <div style={{ padding: '16px' }}>
        Please provide a Request ID in the web part settings or open this page with <code>?RequestId=123</code>.
      </div>
    );
  }

  if (!data) return <div>No data found for Request ID {itemId}.</div>;

  const requestLabel = data.RequestNo || `PRJ-${itemId}`;
  const currentStatus = data.CurrentStatus || 'Pending';
  const currentStatusKey = normalizeValue(currentStatus);
  const approvalPathNames = String(data.ApprovalPath || '')
    .split('>')
    .map((value: string) => value.replace(/^\d+\.\s*/, '').trim())
    .filter((value: string) => value);

  const approvedHistory = history.filter(h =>
    (h.UserAction || "").toLowerCase().includes("approved") ||
    (h.UserAction || "").toLowerCase().includes("submit")
  );

  const rejectedKeywords = ['reject', 'rejected', 'declined', 'decline'];
  const approvedKeywords = ['approved', 'submit', 'submitted'];

  // Keep only the latest history item for each designation so the UI does not repeat the same step.
  const getLatestHistoryByDesignation = (items: IHistoryItem[]): IHistoryItem[] => {
    const latestByDesignation = items.reduce((acc: Record<string, IHistoryItem>, curr: IHistoryItem) => {
      const designation = curr.Designation || curr.UserName || 'Unknown';
      acc[designation] = curr;
      return acc;
    }, {} as Record<string, IHistoryItem>);

    return Object.keys(latestByDesignation).map((key) => latestByDesignation[key]);
  };

  const latestHistoryByDesignation = history.reduce((acc: Record<string, IHistoryItem>, curr: IHistoryItem) => {
    const designationKey = normalizeValue(curr.Designation || curr.UserName);
    if (designationKey) {
      acc[designationKey] = curr;
    }
    return acc;
  }, {} as Record<string, IHistoryItem>);

  const latestApprovedHistory = getLatestHistoryByDesignation(approvedHistory);
  const latestTimelineHistory = getLatestHistoryByDesignation(history);

  // DepartmentMaster is the preferred source for showing the pending approver flow.
  const departmentWorkflowSteps: IWorkflowStep[] = [
    { designation: 'Department Head', userName: approverData?.Departmenthead?.Title || '' },
    { designation: 'Management 1', userName: approverData?.Approval1?.Title || '' },
    { designation: 'Management 2', userName: approverData?.Approval2?.Title || '' },
    { designation: 'Management 3', userName: approverData?.Approval3?.Title || '' },
    { designation: 'Management 4', userName: approverData?.Approval4?.Title || '' }
  ].filter((step: IWorkflowStep) => step.userName);

  const fallbackWorkflowSteps: IWorkflowStep[] = approvalPathNames.map((name: string, index: number) => ({
    designation: index === 0 ? 'Department Head' : `Management ${index}`,
    userName: name
  }));

  const workflowSteps = departmentWorkflowSteps.length > 0 ? departmentWorkflowSteps : fallbackWorkflowSteps;

  const approvedNames = latestApprovedHistory.map((item: IHistoryItem) => normalizeValue(item.UserName || item.Designation));
  const topWorkflowSteps = workflowSteps
    .filter((step: IWorkflowStep, index: number, arr: IWorkflowStep[]) => {
      const normalizedUserName = normalizeValue(step.userName);
      return !!normalizedUserName
        && arr.findIndex((candidate: IWorkflowStep) => normalizeValue(candidate.userName) === normalizedUserName) === index;
    })
    .map((step: IWorkflowStep) => {
      const normalizedUserName = normalizeValue(step.userName);
      const normalizedDesignation = normalizeValue(step.designation);
      const historyItem = latestHistoryByDesignation[normalizedDesignation] || latestHistoryByDesignation[normalizedUserName];
      const status = getTimelineStatus(historyItem?.UserAction, historyItem?.UserComment);
      return {
        ...step,
        isApproved: status === 'approved',
        isRejected: status === 'rejected'
      };
    });

  // Timeline colors are driven from the saved action text.
  function getTimelineStatus(actionValue?: string, commentValue?: string): 'approved' | 'rejected' | 'pending' {
    const action = (actionValue || '').toLowerCase();
    const comment = (commentValue || '').toLowerCase();

    if (rejectedKeywords.some((keyword) => action.indexOf(keyword) !== -1 || comment.indexOf(keyword) !== -1)) {
      return 'rejected';
    }

    if (approvedKeywords.some((keyword) => action.indexOf(keyword) !== -1 || comment.indexOf(keyword) !== -1)) {
      return 'approved';
    }

    return 'pending';
  };

  const getTimelineMarker = (status: 'approved' | 'rejected' | 'pending'): string => {
    if (status === 'approved') {
      return '\u2713';
    }

    if (status === 'rejected') {
      return '\u00d7';
    }

    return '\u2022';
  };

  const timelineStatusClassMap = {
    approved: styles.approved,
    rejected: styles.rejected,
    pending: styles.pending
  };

  const currentStatusClass =
    currentStatusKey.indexOf('reject') !== -1
      ? styles.rejectedText
      : currentStatusKey.indexOf('approved') !== -1 || currentStatusKey.indexOf('submit') !== -1
        ? styles.approvedText
        : styles.pendingText;

  const currentStatusColor =
    currentStatusKey.indexOf('reject') !== -1
      ? '#e53935'
      : currentStatusKey.indexOf('approved') !== -1 || currentStatusKey.indexOf('submit') !== -1
        ? '#10b981'
        : '#f7b500';

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        Quotation Request Details & Status
      </div>

      <div className={styles.mainLayout}>

        {/* ================= LEFT ================= */}
        <div className={styles.leftSection}>

          {/* TOP */}
          <div className={styles.topSummary}>
            <div className={styles.requestCode}>{requestLabel}</div>
            <div className={styles.currentStatus}>
              Current Status : <strong style={{ color: currentStatusColor }}>{currentStatus}</strong>
            </div>
          </div>

          <div className={styles.approverFlow}>
            {topWorkflowSteps.map((item, i) => (
              <div
                key={`${item.designation}-${item.userName}-${i}`}
                className={`${styles.managementStep} ${item.isRejected ? styles.rejectedArrow : item.isApproved ? styles.approvedArrow : styles.pendingArrow}`}
              >
                <div className={styles.approverName}>{item.userName}</div>
                <div className={styles.approverRole}>{item.designation || 'Pending Approval'}</div>
                <div
                  className={`${styles.approverStatus} ${item.isRejected ? styles.rejectedStatusText : item.isApproved ? styles.approvedStatusText : styles.pendingStatusText}`}
                >
                  {item.isRejected ? 'Rejected' : item.isApproved ? 'Approved' : 'Pending'}
                </div>
              </div>
            ))}
          </div>

          {/* ================= FORM ================= */}

          <div className={styles.formRow}>
            <label>Project Title *</label>
            <input value={data.ProjectTitle || ''} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Project Reference Number</label>
            <input value={data.ProjectReffNo || ''} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Project Description *</label>
            <input value={data.ProjectDescription || ''} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Total Project Amount</label>
            <div className={styles.twoCol}>
              <input value={data.TotalProjectAmount || ''} disabled />
              <span>Applicable Taxes</span>
              <input value={data.ApplicableTaxes || ''} disabled />
            </div>
          </div>

          {[1, 2, 3].map(i => (
            <div key={i} className={styles.formRow}>
              <label>Vendor {i}</label>
              <div className={styles.twoCol}>
                <input value={String(data[`Vendor${i}`] || '')} disabled />
                <span>Quote {i}</span>
                <input value={String(data[`Quote${i}`] || '')} disabled />
              </div>
            </div>
          ))}

          <div className={styles.formRow}>
            <label>Select Vendor *</label>
            <input value={data.Selectedvendor || ''} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Selected Quote *</label>
            <input value={data.SelectedQuote || ''} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Department *</label>
            <input value={data.Department || ''} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Advance Payment *</label>
            <input value={data.Advancepayment || ''} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Approval Path *</label>
            <input value={data.ApprovalPath || ''} disabled />
          </div>

          {/* ATTACHMENTS */}
          <div className={styles.formRow}>
            <label>Attachments</label>
            {data.AttachmentFiles?.map((f: IAttachmentFile) => (
              <a
                key={f.FileName}
                className={styles.attachmentLink}
                href={f.ServerRelativeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {f.FileName}
              </a>
            ))}
          </div>

          {/* PO TABLE */}
          <div className={styles.poSection}>
            <div className={styles.poHeader}>Purchase Order Details</div>

            {poItems.map((item: IPurchaseOrderItem, i: number) => (
              <div key={i} className={styles.poRow}>
                <input value={item.Description || ''} disabled />
                <input value={item.Quantity || ''} disabled />
                <input value={item.Rate || ''} disabled />
                <input value={item.Amount || ''} disabled />
              </div>
            ))}
          </div>

        </div>

        {/* ================= RIGHT TIMELINE ================= */}
        <div className={styles.rightTimeline}>

          <div className={styles.timelineTitle}>Timeline of the Request - {requestLabel}</div>

          {latestTimelineHistory.map((item: IHistoryItem, i: number) => {
            const timelineStatus =
              item.Designation === "Request Initiator"
                ? "approved"
                : getTimelineStatus(item.UserAction, item.UserComment);
            const status =
              timelineStatus === 'approved'
                ? 'Approved'
                : timelineStatus === 'rejected'
                  ? 'Rejected'
                  : 'Pending';

            return (
              <div key={i} className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${timelineStatusClassMap[timelineStatus]}`}>
                  {getTimelineMarker(timelineStatus)}
                </div>

                <div className={styles.timelineText}>
                  <b>{item.Designation}</b>

                  {/* ? Initiator case */}
                  {item.Designation === "Request Initiator" ? (
                    <>
                      <div>Initiator: {item.UserName}</div>
                      <div>
                        Date & Time: {item.ActionDate
                          ? new Date(item.ActionDate).toLocaleString()
                          : '-'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>Approver Name: {item.UserName}</div>
                      <div>Action Taken: {status}</div>
                      <div>
                        Action Date: {item.ActionDate
                          ? new Date(item.ActionDate).toLocaleString()
                          : '-'}
                      </div>
                    </>
                  )}

                  {item.UserComment && (
                    <div>Comments: {item.UserComment}</div>
                  )}
                </div>
              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
};

export default QrDetailsStatus;


