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
  const itemId = Number(params.get('id') || params.get('ID'));
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
  if (!data) return <div>No data found</div>;

  const requestLabel = data.RequestNo || `PRJ-${itemId}`;
  const currentStatus = data.CurrentStatus || 'Pending';
  const approvalPathNames = String(data.ApprovalPath || '')
    .split('>')
    .map((value: string) => value.replace(/^\d+\.\s*/, '').trim())
    .filter((value: string) => value);

  const approvedHistory = history.filter(h =>
    (h.UserAction || "").toLowerCase().includes("approved") ||
    (h.UserAction || "").toLowerCase().includes("submit")
  );

  // Keep only the latest history item for each designation so the UI does not repeat the same step.
  const getLatestHistoryByDesignation = (items: IHistoryItem[]): IHistoryItem[] => {
    const latestByDesignation = items.reduce((acc: Record<string, IHistoryItem>, curr: IHistoryItem) => {
      const designation = curr.Designation || curr.UserName || 'Unknown';
      acc[designation] = curr;
      return acc;
    }, {} as Record<string, IHistoryItem>);

    return Object.keys(latestByDesignation).map((key) => latestByDesignation[key]);
  };

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

  // The top strip shows the latest approved step on the left and only still-pending steps on the right.
  const latestApprovedTopItem = latestApprovedHistory.length > 0
    ? latestApprovedHistory[latestApprovedHistory.length - 1]
    : null;
  const approvedNames = latestApprovedHistory.map((item: IHistoryItem) => normalizeValue(item.UserName || item.Designation));
  const pendingTopSteps = workflowSteps.filter((step: IWorkflowStep, index: number, arr: IWorkflowStep[]) => {
    const normalizedUserName = normalizeValue(step.userName);
    if (!normalizedUserName) {
      return false;
    }

    const isApproved = approvedNames.indexOf(normalizedUserName) !== -1;
    const isDuplicate = arr.findIndex((candidate: IWorkflowStep) => normalizeValue(candidate.userName) === normalizedUserName) !== index;
    return !isApproved && !isDuplicate;
  });

  // Timeline colors are driven from the saved action text.
  const getTimelineStatus = (actionValue?: string): 'approved' | 'rejected' | 'pending' => {
    const action = (actionValue || '').toLowerCase();

    if (action.includes('approved') || action.includes('submit')) {
      return 'approved';
    }

    if (action.includes('reject')) {
      return 'rejected';
    }

    return 'pending';
  };

  const getTimelineMarker = (status: 'approved' | 'rejected' | 'pending'): string => {
    if (status === 'approved') {
      return '✓';
    }

    if (status === 'rejected') {
      return '×';
    }

    return '•';
  };

  const timelineStatusClassMap = {
    approved: styles.approved,
    rejected: styles.rejected,
    pending: styles.pending
  };

  return (
    <div className={styles.container}>

      <div className={styles.heading}>
        Quotation Request Details & Status
      </div>

      <div className={styles.mainLayout}>

        {/* ================= LEFT ================= */}
        <div className={styles.leftSection}>

          {/* TOP */}
          <div className={styles.topSummary}>
            <div className={styles.requestCode}>{requestLabel}</div>
            <div className={styles.currentStatus}>
              Current Status : <strong>{currentStatus}</strong>
            </div>
          </div>

          <div className={styles.approverFlow}>
            {latestApprovedTopItem && (
              <div className={styles.departmentStep}>
                <div className={styles.approverName}>{latestApprovedTopItem.UserName}</div>
                <div className={styles.approverRole}>{latestApprovedTopItem.Designation}</div>
                <div className={styles.approverStatus}>Approved</div>
              </div>
            )}

            <div className={styles.managementColumn}>
              {pendingTopSteps.map((item: IWorkflowStep, i: number) => (
                <div key={i} className={styles.managementStep}>
                  <div className={styles.approverName}>{item.userName}</div>
                  <div className={styles.approverRole}>{item.designation || 'Pending Approval'}</div>
                  <div className={styles.approverStatus}>Pending</div>
                </div>
              ))}
            </div>
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
              <input value={data.ApplicableTaxes || ''} disabled />
            </div>
          </div>

          {[1, 2, 3].map(i => (
            <div key={i} className={styles.formRow}>
              <label>Vendor {i}</label>
              <div className={styles.twoCol}>
                <input value={String(data[`Vendor${i}`] || '')} disabled />
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
            const timelineStatus = getTimelineStatus(item.UserAction);
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

                  <div>Approver Name: {item.UserName}</div>
                  <div>Action Taken: {status}</div>
                  <div>
                    Action Date: {item.ActionDate
                      ? new Date(item.ActionDate).toLocaleString()
                      : '-'}
                  </div>

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
