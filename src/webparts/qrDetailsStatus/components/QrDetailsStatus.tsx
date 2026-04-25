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
  Vendor1?: string;
  Vendor2?: string;
  Vendor3?: string;
  Quote1?: string | number;
  Quote2?: string | number;
  Quote3?: string | number;
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
  Created?: string;
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

interface ITimelineStep extends IWorkflowStep {
  historyItem?: IHistoryItem;
  timelineStatus: 'approved' | 'rejected' | 'pending';
  statusLabel: 'Approved' | 'Rejected' | 'Pending';
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
  const [currentUserName, setCurrentUserName] = useState<string>("");

  const params = new URLSearchParams(window.location.search);
  const getValidId = (value: string | null): number | null =>
    value && !isNaN(Number(value)) ? Number(value) : null;

  const itemId =
    getValidId(props.requestId || null) ||
    getValidId(params.get('RequestId')) ||
    getValidId(params.get('requestId')) ||
    getValidId(params.get('id')) ||
    getValidId(params.get('ID')) ||
    0;

  const normalizeValue = (value?: string): string =>
    String(value || '').toLowerCase().replace(/\s/g, '').trim();

  const fetchHistory = async (): Promise<void> => {
    const res = await props.spHttpClient.get(
      `${props.siteUrl}/_api/web/lists/getbytitle('History')/items?$filter=FID eq ${itemId} and Title eq 'QA'&$orderby=Created asc`,
      SPHttpClient.configurations.v1
    );
    const result = await res.json();
    setHistory(result.value || []);
  };

  const fetchData = async (): Promise<void> => {
    
    const currentUserRes = await props.spHttpClient.get(
      `${props.siteUrl}/_api/web/currentuser`,
      SPHttpClient.configurations.v1
    );
    const currentUser = await currentUserRes.json();

    if (!itemId) {
      console.error('Invalid itemId:', itemId);
      return;
    }

    const res = await props.spHttpClient.get(
      `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})?$select=*,AttachmentFiles&$expand=AttachmentFiles`,
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

  const approvedKeywords = ['approved', 'submit', 'submitted'];
  const rejectedKeywords = ['reject', 'rejected', 'declined', 'decline'];

  const getTimelineStatus = (
    actionValue?: string,
    commentValue?: string
  ): 'approved' | 'rejected' | 'pending' => {
    const action = (actionValue || '').toLowerCase();
    const comment = (commentValue || '').toLowerCase();

    if (rejectedKeywords.some((keyword) => action.includes(keyword) || comment.includes(keyword))) {
      return 'rejected';
    }

    if (approvedKeywords.some((keyword) => action.includes(keyword) || comment.includes(keyword))) {
      return 'approved';
    }

    return 'pending';
  };

  const getLatestHistoryByStep = (items: IHistoryItem[]): Record<string, IHistoryItem> => {
    return items.reduce((acc: Record<string, IHistoryItem>, curr: IHistoryItem) => {
      const designationKey = normalizeValue(curr.Designation);
      const userNameKey = normalizeValue(curr.UserName);

      if (designationKey) {
        acc[designationKey] = curr;
      }

      if (userNameKey) {
        acc[userNameKey] = curr;
      }

      return acc;
    }, {} as Record<string, IHistoryItem>);
  };

  const latestHistoryByStep = getLatestHistoryByStep(history);

  const initiatedHistoryItem = history.find(
    (item: IHistoryItem) =>
      normalizeValue(item.Designation) === normalizeValue('Request Initiator') ||
      normalizeValue(item.UserAction) === normalizeValue('Request Initiator')
  );

  const departmentWorkflowSteps: IWorkflowStep[] = [
    { designation: 'Department Head', userName: approverData?.Departmenthead?.Title || '' },
    { designation: 'Management1', userName: approverData?.Approval1?.Title || '' },
    { designation: 'Management2', userName: approverData?.Approval2?.Title || '' },
    { designation: 'Management3', userName: approverData?.Approval3?.Title || '' },
    { designation: 'Management4', userName: approverData?.Approval4?.Title || '' }
  ].filter((step: IWorkflowStep) => step.userName);

  const fallbackWorkflowSteps: IWorkflowStep[] = approvalPathNames.map((name: string, index: number) => ({
    designation: index === 0 ? 'Department Head' : `Management ${index}`,
    userName: name
  }));

  const workflowSteps =
    departmentWorkflowSteps.length > 0
      ? departmentWorkflowSteps
      : fallbackWorkflowSteps.length > 0
        ? fallbackWorkflowSteps
        : [];

  const topWorkflowSteps = workflowSteps.map((step: IWorkflowStep) => {
    const normalizedUserName = normalizeValue(step.userName);
    const normalizedDesignation = normalizeValue(step.designation);
    const historyItem = latestHistoryByStep[normalizedDesignation] || latestHistoryByStep[normalizedUserName];
    const status = getTimelineStatus(historyItem?.UserAction, historyItem?.UserComment);

    return {
      ...step,
      isApproved: status === 'approved',
      isRejected: status === 'rejected',
      isPending: status === 'pending'
    };
  });
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

  const formatTimelineDate = (value?: string): string => {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleString('en-IN');
  };

// ✅ SAFE HISTORY
const safeHistory = Array.isArray(history) ? history : [];

// ✅ INITIATOR (FIXED 100%)
const initiatorName =
  safeHistory.find(x =>
    normalizeValue(x.Designation).includes('initiator')
  )?.UserName ||
  (data as any)?.Author?.Title ||
  '';

// ✅ FULL FIXED STEPS (NO FILTER ❌)
const steps = [
  { designation: 'Request Initiator', userName: initiatorName },
  { designation: 'Department Head', userName: approverData?.Departmenthead?.Title || '' },
  { designation: 'Management1', userName: approverData?.Approval1?.Title || '' },
  {
    designation: 'Management2',
    userName:
      approverData?.Approval2?.Title === approverData?.Approval1?.Title
        ? `${approverData?.Approval2?.Title} (Level 2)`
        : approverData?.Approval2?.Title || ''
  }
];

// ✅ NORMALIZE KEY STRONG (MAIN FIX)
const getKey = (val?: string) =>
  normalizeValue(val);

// ✅ BUILD LATEST MAP (ROBUST)
const latestMap: Record<string, any> = {};

safeHistory.forEach(item => {
  const key = getKey(item.Designation);

  if (!key) return;

  const existing = latestMap[key];

  const currentDate = new Date(
    item.ActionDate || (item as any).Created || 0
  ).getTime();

  const existingDate = existing
    ? new Date(existing.ActionDate || (existing as any).Created || 0).getTime()
    : 0;

  if (!existing || currentDate > existingDate) {
    latestMap[key] = item;
  }
});

// ✅ BUILD TIMELINE
let lastApprovedIndex = -1;

const timelineSteps = steps.map((step, index) => {
  const key = getKey(step.designation);

const historyItem = latestMap[key];

  const action = (historyItem?.UserAction || '').toLowerCase();

  let status: 'approved' | 'rejected' | 'pending' = 'pending';

  if (action.includes('reject')) {
    status = 'rejected';
  } else if (action.includes('approve') || action.includes('submit')) {
    status = 'approved';
    lastApprovedIndex = index;
  }

  return {
    ...step,
    historyItem,
    timelineStatus: status,
    statusLabel:
      status === 'approved'
        ? 'Approved'
        : status === 'rejected'
        ? 'Rejected'
        : 'Pending'
  };
});

// ✅ FIX PENDING / UPCOMING
timelineSteps.forEach((item, index) => {
  if (item.timelineStatus === 'pending') {
    if (index === lastApprovedIndex + 1) {
      item.statusLabel = 'Pending';
    } else if (index > lastApprovedIndex + 1) {
      item.statusLabel = 'Upcoming';
    }
  }
});
return (
    
    <div className={styles.container}>
      <div className={styles.header}>Quotation Request Details & Status</div>

      <div className={styles.mainLayout}>
        <div className={styles.leftSection}>
          <div className={styles.topSummary}>
            <div className={styles.requestCode}>{requestLabel}</div>
            <div className={styles.currentStatus}>
              Current Status : <strong className={currentStatusClass} style={{ color: currentStatusColor }}>{currentStatus}</strong>
            </div>
          </div>

          <div className={styles.approverFlow}>
            {topWorkflowSteps.length > 0 ? (
              topWorkflowSteps.map((item, i) => (
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
              ))
            ) : (
              <div style={{ fontSize: '12px', color: '#6b7280', padding: '8px 2px' }}>
                No approver flow configured for this request.
              </div>
            )}
          </div>

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

          {[1, 2, 3].map((i) => (
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

          <div className={styles.formRow}>
            <label>Attachments</label>
            {data.AttachmentFiles?.length ? (
              data.AttachmentFiles.map((f: IAttachmentFile) => (
                <a
                  key={f.FileName}
                  className={styles.attachmentLink}
                  href={f.ServerRelativeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {f.FileName}
                </a>
              ))
            ) : (
              <div>No files</div>
            )}
          </div>

          <div className={styles.poSection}>
            <div className={styles.poHeader}>Purchase Order Details</div>

            {poItems.map((item, i) => (
              <div key={i} className={styles.poRow}>
                <input value={item.Description || ''} disabled />
                <input value={item.Quantity || ''} disabled />
                <input value={item.Rate || ''} disabled />
                <input value={item.Amount || ''} disabled />
              </div>
            ))}
          </div>
        </div>


<div className={styles.rightTimeline}>
  <div className={styles.timelineTitle}>
    Timeline of the Request - {requestLabel}
  </div>

  {timelineSteps.length > 0 ? (
    timelineSteps.map((item, index) => (
      <div
        key={`${item.designation}-${item.userName}-${index}`}
        className={styles.timelineItem}
      >
        <div
          className={`${styles.timelineDot} ${
            item.timelineStatus === 'approved'
              ? styles.approved
              : item.timelineStatus === 'rejected'
              ? styles.rejected
              : styles.pending
          }`}
        >
          {item.timelineStatus === 'approved'
            ? '✓'
            : item.timelineStatus === 'rejected'
            ? '×'
            : '•'}
        </div>

        <div className={styles.timelineText}>
          <b>{item.designation}</b>

          {item.designation === 'Request Initiator' ? (
            <>
              <div>Initiator: {item.userName || '-'}</div>
              <div>
                Date & Time:{' '}
                {item.historyItem?.ActionDate
                  ? formatTimelineDate(item.historyItem.ActionDate)
                  : '-'}
              </div>
            </>
          ) : (
            <>
              <div>
  Approver Name: {item.historyItem?.UserName || item.userName || '-'}
</div>
              <div>Action Taken: {item.statusLabel}</div>
              <div>
                Action Date:{' '}
                {item.historyItem?.ActionDate
                  ? formatTimelineDate(item.historyItem.ActionDate)
                  : '-'}
              </div>
            </>
          )}

          {item.historyItem?.UserComment && (
            <div>Comments: {item.historyItem.UserComment}</div>
          )}
        </div>
      </div>
    ))
  ) : (
    <div style={{ fontSize: '12px', color: '#6b7280' }}>
      No timeline history found for this request yet.
    </div>
  )}
</div>


      </div>
    </div>
  );
};

export default QrDetailsStatus;