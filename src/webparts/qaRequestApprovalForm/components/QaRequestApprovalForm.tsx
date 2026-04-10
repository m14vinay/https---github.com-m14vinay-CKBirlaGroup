import * as React from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IQaRequestApprovalFormProps } from './IQaRequestApprovalFormProps';
import styles from './QaRequestApprovalForm.module.scss';

type TApprovalStatus = 'Approved' | 'Rejected';
type TTimelineStatus = 'approved' | 'rejected' | 'pending';

interface IAttachmentFile {
  FileName: string;
  ServerRelativeUrl: string;
}

interface IApprovalItem {
  Status?: string;
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
  ApprovalPath?: string;
  ApproverComment1?: string;
  AttachmentFiles?: IAttachmentFile[];
  [key: string]: unknown;
}

interface IPurchaseOrderItem {
  Description?: string;
  Quantity?: string | number;
  Rate?: string | number;
  Amount?: string | number;
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

interface IHistoryItem {
  UserName?: string;
  UserAction?: string;
  UserComment?: string;
  ActionDate?: string;
  Designation?: string;
}

interface IListResponse<T> {
  value?: T[];
}

const STEP_DESIGNATION_MAP: Record<number, string> = {
  1: 'Request Initiator',
  2: 'Department Head',
  3: 'Approver 1',
  4: 'Approver 2',
  5: 'Approver 3',
  6: 'Approver 4'
};

const FINAL_STEP = 6;

export const QaRequestApprovalForm: React.FC<IQaRequestApprovalFormProps> = (props) => {
  const [poItems, setPoItems] = React.useState<IPurchaseOrderItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<IApprovalItem | null>(null);
  const [statusMsg, setStatusMsg] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [history, setHistory] = React.useState<IHistoryItem[]>([]);
  const [isActionDone, setIsActionDone] = React.useState(false);
  const [approverData, setApproverData] = React.useState<IDepartmentApproverData | null>(null);
  const [currentStep, setCurrentStep] = React.useState(1);

  const params = new URLSearchParams(window.location.search);
  const itemId = Number(params.get('id'));
  const requestLabel = `PRJ-${itemId}`;

  const isReadOnly =
    isActionDone ||
    data?.Status === 'Approved' ||
    data?.Status === 'Rejected';

  const fetchFromList = React.useCallback(async <T,>(url: string): Promise<T> => {
    const response = await props.spHttpClient.get(url, SPHttpClient.configurations.v1);
    return response.json() as Promise<T>;
  }, [props.spHttpClient]);

  const formatTimelineDate = (value?: string): string => {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-IN');
  };

  const getDesignationByStep = (step: number): string => STEP_DESIGNATION_MAP[step] || 'Approver';

  const getUser = React.useCallback(async (): Promise<IUserLookup> => {
    return fetchFromList<IUserLookup>(`${props.siteUrl}/_api/web/currentuser`);
  }, [fetchFromList, props.siteUrl]);

  const getUserFromStep = React.useCallback(async (step: number): Promise<string> => {
    if (step === 1) {
      const currentUser = await getUser();
      return currentUser.Title || '';
    }

    if (!approverData) {
      return '';
    }

    const approverMap: Record<number, string> = {
      2: approverData.Departmenthead?.Title || '',
      3: approverData.Approval1?.Title || '',
      4: approverData.Approval2?.Title || '',
      5: approverData.Approval3?.Title || '',
      6: approverData.Approval4?.Title || ''
    };

    return approverMap[step] || '';
  }, [approverData, getUser]);

  const fetchHistory = React.useCallback(async () => {
    if (!itemId) {
      return;
    }

    try {
      const response = await fetchFromList<IListResponse<IHistoryItem>>(
        `${props.siteUrl}/_api/web/lists/getbytitle('History')/items?$filter=FID eq ${itemId}&$orderby=Created asc`
      );

      setHistory(response.value || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, [fetchFromList, itemId, props.siteUrl]);

  const fetchData = React.useCallback(async () => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    try {
      const itemResponse = await fetchFromList<IApprovalItem>(
        `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})?$expand=AttachmentFiles`
      );

      const departmentName = String(itemResponse.Department || '').replace(/'/g, "''");
      const [purchaseOrderResponse, departmentResponse] = await Promise.all([
        fetchFromList<IListResponse<IPurchaseOrderItem>>(
          `${props.siteUrl}/_api/web/lists/getbytitle('PurchaseOrderDetails')/items?$filter=QuotationIdId eq ${itemId}`
        ),
        departmentName
          ? fetchFromList<IListResponse<IDepartmentApproverData>>(
              `${props.siteUrl}/_api/web/lists/getbytitle('DepartmentMaster')/items?$filter=DepartmentName eq '${departmentName}'&$expand=Departmenthead,Approval1,Approval2,Approval3,Approval4`
            )
          : Promise.resolve({ value: [] })
      ]);

      setData(itemResponse);
      setComment(itemResponse.ApproverComment1 || '');
      setPoItems(purchaseOrderResponse.value || []);
      setApproverData(departmentResponse.value?.[0] || null);
    } catch (error) {
      console.error('Failed to load approval request:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchFromList, itemId, props.listName, props.siteUrl]);

  const createHistoryItem = React.useCallback(async (payload: Record<string, unknown>): Promise<void> => {
    await props.spHttpClient.post(
      `${props.siteUrl}/_api/web/lists/getbytitle('History')/items`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );
  }, [props.siteUrl, props.spHttpClient]);

  // Keep the history timeline in sync with each approval action.
  const handleSaveHistory = React.useCallback(async (id: number, userAction: TApprovalStatus) => {
    try {
      const userName = await getUserFromStep(currentStep);

      await createHistoryItem({
        Title: 'QA',
        FID: id,
        UserName: userName,
        UserAction: userAction,
        UserComment: comment,
        ActionDate: new Date().toISOString(),
        Designation: getDesignationByStep(currentStep)
      });
    } catch (error) {
      console.error('History save failed:', error);
    }
  }, [comment, createHistoryItem, currentStep, getUserFromStep]);

  const updateStatus = React.useCallback(async (status: TApprovalStatus) => {
    if (!comment.trim()) {
      setStatusMsg('Enter comment before taking action.');
      return;
    }

    try {
      await props.spHttpClient.post(
        `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            Accept: 'application/json',
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

      await handleSaveHistory(itemId, status);

      if (status === 'Approved') {
        setCurrentStep((previousStep) => previousStep + 1);
      }

      if (status === 'Approved' && currentStep >= FINAL_STEP) {
        await props.spHttpClient.post(
          `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'IF-MATCH': '*',
              'X-HTTP-Method': 'MERGE'
            },
            body: JSON.stringify({
              Status: 'Approved'
            })
          }
        );
      }

      setData((previous) => previous ? { ...previous, Status: status, ApproverComment1: comment } : previous);
      setStatusMsg(`${status} successfully.`);
      setIsActionDone(true);
      await fetchHistory();
    } catch (error: any) {
      console.error('Status update failed:', error);
      setStatusMsg(error?.message || 'Unable to update the request.');
    }
  }, [comment, currentStep, fetchHistory, handleSaveHistory, itemId, props.listName, props.siteUrl, props.spHttpClient]);

  React.useEffect(() => {
    fetchData().catch(() => undefined);
    fetchHistory().catch(() => undefined);
  }, [fetchData, fetchHistory]);

  const statusTextClassMap: Record<TTimelineStatus, string> = {
    approved: styles.statusTextApproved,
    rejected: styles.statusTextRejected,
    pending: styles.statusTextPending
  };

  const getTimelineStatus = (actionValue?: string): TTimelineStatus => {
    const action = (actionValue || '').toLowerCase();

    if (action.includes('approved') || action.includes('submit') || action.includes('initiator')) {
      return 'approved';
    }

    if (action.includes('rejected')) {
      return 'rejected';
    }

    return 'pending';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data found.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainLayout}>
        <div className={styles.leftPanel}>
          <h4 className={styles.heading}>Quotation Request Approval Form</h4>

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

          {[1, 2, 3].map((vendorIndex) => (
            <div key={vendorIndex} className={styles.formRow}>
              <label>Vendor {vendorIndex} {vendorIndex === 1 && '*'}</label>
              <div className={styles.twoCol}>
                <input value={String(data[`Vendor${vendorIndex}`] || '')} disabled />
                <span>Quote {vendorIndex}</span>
                <input value={String(data[`Quote${vendorIndex}`] || '')} disabled />
              </div>
            </div>
          ))}

          <div className={styles.formRow}>
            <label>Selected Vendor *</label>
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
              data.AttachmentFiles.map((file) => (
                <div key={file.FileName}>
                  <a href={file.ServerRelativeUrl} target="_blank" rel="noopener noreferrer">
                    {file.FileName}
                  </a>
                </div>
              ))
            ) : (
              <div>No files</div>
            )}
          </div>

          <div className={styles.poSection}>
            <h5>Purchase Order Details</h5>

            <div className={styles.poTable}>
              <div className={styles.poRowHeader}>
                <div>Description</div>
                <div>Qty</div>
                <div>Rate</div>
                <div>Amount</div>
              </div>

              {poItems.length > 0 ? (
                poItems.map((item, index) => (
                  <div key={`${item.Description || 'po'}-${index}`} className={styles.poRow}>
                    <input value={item.Description || ''} disabled />
                    <input value={item.Quantity || ''} disabled />
                    <input value={item.Rate || ''} disabled />
                    <input value={item.Amount || ''} disabled />
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No purchase order details found.</div>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <label>Approver Comments *</label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={isReadOnly}
            />
          </div>

          <div className={styles.buttonContainer}>
            <button
              className={styles.ApproveBtn}
              onClick={() => updateStatus('Approved').catch(() => undefined)}
              disabled={isReadOnly}
            >
              Approve
            </button>

            <button
              className={styles.RejectBtn}
              onClick={() => updateStatus('Rejected').catch(() => undefined)}
              disabled={isReadOnly}
            >
              Reject
            </button>

            <button
              className={styles.cancelBtn}
              onClick={() => window.history.back()}
            >
              Back
            </button>
          </div>

          {statusMsg && <div className={styles.statusMessage}>{statusMsg}</div>}
        </div>

        <div className={styles.rightTimeline}>
          <h4 className={styles.timelineHeader}>Timeline - {requestLabel}</h4>

          <div className={styles.timelineBody}>
            {history.length > 0 ? history.map((item, index) => {
              const status = getTimelineStatus(item.UserAction);

              return (
                <div
                  key={`${item.UserName || 'history'}-${index}`}
                  className={`${styles.timelineItem} ${styles[status]}`}
                >
                  <div className={styles.timelineMarker}></div>

                  <div className={styles.timelineContent}>
                    <div className={styles.timelineStepTitle}>
                      {item.Designation || item.UserName}
                    </div>

                    <div className={styles.timelineText}>
                      <b>Approver Name:</b> {item.UserName || '-'}
                    </div>

                    {item.UserAction && (
                      <div className={`${styles.timelineText} ${statusTextClassMap[status]}`}>
                        <b>Action Taken:</b> {item.UserAction}
                      </div>
                    )}

                    {item.ActionDate && (
                      <div className={styles.timelineText}>
                        <b>Action Date:</b> {formatTimelineDate(item.ActionDate)}
                      </div>
                    )}

                    {item.UserComment && (
                      <div className={styles.timelineText}>
                        <b>Comments:</b> {item.UserComment}
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div>No history found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
