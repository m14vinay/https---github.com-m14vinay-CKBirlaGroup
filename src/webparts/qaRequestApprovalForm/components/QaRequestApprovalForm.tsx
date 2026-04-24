import * as React from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IQaRequestApprovalFormProps } from './IQaRequestApprovalFormProps';
import styles from './QaRequestApprovalForm.module.scss';
import { Spinner, SpinnerSize } from '@fluentui/react';

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
  [key: string]: any;
  ActionDate1?: string;
  ActionDate2?: string;
  ActionDate3?: string;
}

interface IPurchaseOrderItem {
  Description?: string;
  Quantity?: string | number;
  Rate?: string | number;
  Amount?: string | number;
}

interface IUserLookup {
  Id?: number;
  Title?: string;
}
interface IApprovalItem {
  CurrentStatus?: string; 
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
const itemId =
  Number(params.get('RequestId')) ||
  Number(params.get('requestId')) ||
  Number(params.get('id')) ||
  Number(params.get('ID'));
  const requestLabel = itemId ? `PRJ-${itemId}` : '';

  const isReadOnly =
    isActionDone ||
    data?.CurrentStatus === 'Approved' ||
    data?.CurrentStatus === 'Rejected' ||
    statusMsg.includes("successfully");

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

  // const getDesignationByStep = (step: number): string => STEP_DESIGNATION_MAP[step] || 'Approver';

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
        `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})?$expand=AttachmentFiles,Approval1,Approval2,Approval3&$select=*,Approval1/Title,Approval2/Title,Approval3/Title`
      );

      const departmentName = String(itemResponse.Department || '').replace(/'/g, "''");
      const [purchaseOrderResponse, departmentResponse] = await Promise.all([
        fetchFromList<IListResponse<IPurchaseOrderItem>>(
          `${props.siteUrl}/_api/web/lists/getbytitle('PurchaseOrderDetails')/items?$filter=QuotationIdId eq ${itemId}`
        ),
        departmentName
          ? fetchFromList<IListResponse<IDepartmentApproverData>>(
            `${props.siteUrl}/_api/web/lists/getbytitle('DepartmentMaster')/items?
$filter=DepartmentName eq '${departmentName}'
&$select=Departmenthead/Id,Departmenthead/Title,
Approval1/Id,Approval1/Title,
Approval2/Id,Approval2/Title,
Approval3/Id,Approval3/Title,
Approval4/Id,Approval4/Title
&$expand=Departmenthead,Approval1,Approval2,Approval3,Approval4`
          )
          : Promise.resolve({ value: [] })
      ]);

      setData(itemResponse);
      // setComment(itemResponse.ApproverComment1 || '');
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
  const handleSaveHistory = React.useCallback(async (id: number, userAction: TApprovalStatus, userName: string, userDesignation: string) => {
    try {
      // const userName = await getUserFromStep(currentStep);

      await createHistoryItem({
        Title: 'QA',
        FID: id,
        UserName: userName,
        UserAction: userAction,
        UserComment: comment,
        ActionDate: new Date().toISOString(),
        Designation: userDesignation
      });
    } catch (error) {
      console.error('History save failed:', error);
    }
  }, [comment, createHistoryItem, currentStep, getUserFromStep]);


  const handleApproveReject = async (action:string) => {
    try {
      setLoading(true);

      if (!comment) return alert("Comment is required.");
      if (!itemId || !data) return;

      // 🔹 CURRENT USER
      const currentUser = await props.spHttpClient.get(
        `${props.siteUrl}/_api/web/currentuser`,
        SPHttpClient.configurations.v1
      ).then(res => res.json());

      // 🔐 SECURITY CHECK (IMPORTANT)
      if (Number(data.AssignedToEmailId) !== currentUser.Id && Number(data.AssignedToEmail2Id) !== currentUser.Id) {
        alert("You are not authorized ❌");
        return;
      }

      let payload: any = {};

      let userDesignation = "";

      // 🔥 STEP DETECTION BASED ON AssignedTo (BEST)

      if(action == "Rejected"){
        // STEP 1
      if (data.AssignedToEmailId === data.Approval1Id && data.ActionDate1 === null) {

        userDesignation = "Department Head"
          payload = {
            ApproverComment1: comment,
            ActionDate1: new Date().toISOString(),
            AssignedToEmailId: null,
            AssignedTo: "Rejected",
            AssignedToEmail2Id: null,
            AsisgnedTo2: "Rejected",
            Status: "Rejected",
            CurrentStatus: "Rejected"
          };
      }

      // STEP 2
      else if (data.AssignedToEmailId === data.Approval2Id && data.ActionDate2 === null) {
        userDesignation = "Management 1"
        
          payload = {
            ApproverComment2: comment,
            ActionDate2: new Date().toISOString(),
            AssignedToEmailId: null,
            AssignedTo: "Rejected",
            AssignedToEmail2Id: null,
            AsisgnedTo2: "Rejected",
            Status: "Rejected",
            CurrentStatus: "Rejected"
          };
      }

      // FINAL STEP
      else if (data.AssignedToEmailId === data.Approval3Id) {
        userDesignation = "Management 2"
        payload = {
          ApproverComment3: comment,
          ActionDate3: new Date().toISOString(),
          AssignedToEmailId: null,
          AssignedTo: "Rejected",
          AssignedToEmail2Id: null,
          AsisgnedTo2: "Rejected",
          Status: "Rejected",
          CurrentStatus: "Rejected"
        };
      }
      }
      
      else if(action === "Approved"){
        // STEP 1
        if (data.AssignedToEmailId === data.Approval1Id && data.ActionDate1 === null) {

          userDesignation = "Department Head"
          if(data.TotalProjectAmount && Number(data.TotalProjectAmount) > 200000 && data.Approval2Id && data.Approval3Id){
            payload = {
              ApproverComment1: comment,
              ActionDate1: new Date().toISOString(),
              AssignedToEmailId: Number(data.Approval2Id) || null,
              AssignedTo: data.Approval2?.Title,
              AssignedToEmail2Id: Number(data.Approval3Id) || null,
              AsisgnedTo2: data.Approval3?.Title,
              Status: "Pending"
            };
          }
          else if(data.Approval2Id){ 
            payload = {
              ApproverComment1: comment,
              ActionDate1: new Date().toISOString(),
              AssignedToEmailId: Number(data.Approval2Id) || null,
              AssignedTo: data.Approval2?.Title,
              Status: "Pending"
            };
          }
          else{
            payload = {
              ApproverComment1: comment,
              ActionDate1: new Date().toISOString(),
              AssignedToEmailId: null,
              AssignedTo: "Approved",
              Status: "Approved",
              CurrentStatus: "Approved"
            };
          }
        }

        // STEP 2
        else if (data.AssignedToEmailId === data.Approval2Id && data.ActionDate2 === null && currentUser.Id === data.AssignedToEmailId) {
          userDesignation = "Management 1"
          if(data.AssignedToEmail2Id === null){
            if(data.Approval3Id){
              payload = {
                ApproverComment2: comment,
                ActionDate2: new Date().toISOString(),
                AssignedToEmailId: Number(data.Approval3Id) || null,
                AssignedTo: data.Approval3?.Title,
                Status: "Pending"
              };
            }
            else{
              payload = {
                ApproverComment2: comment,
                ActionDate2: new Date().toISOString(),
                AssignedToEmailId: null,
                AssignedTo: "Approved",
                Status: "Approved",
                CurrentStatus: "Approved"
              };
            }
          }
          else{
            if(data.ActionDate3){
              payload = {
                ApproverComment2: comment,
                ActionDate2: new Date().toISOString(),
                AssignedToEmailId: null,
                AssignedTo: "Approved",
                AssignedToEmail2Id: null,
                AsisgnedTo2: "Approved",
                Status: "Approved",
                CurrentStatus: "Approved"
              };
            }
            else{
              payload = {
                ApproverComment2: comment,
                ActionDate2: new Date().toISOString()
              };
            }
          }
        }

        // FINAL STEP
        else if (data.AssignedToEmailId === data.Approval3Id) {
          userDesignation = "Management 2"
          payload = {
            ApproverComment3: comment,
            ActionDate3: new Date().toISOString(),
            AssignedToEmailId: null,
            AssignedTo: "Approved",
            AssignedToEmail2Id: null,
            AsisgnedTo2: "Approved",
            Status: "Approved",
            CurrentStatus: "Approved"
          };
        }
        // FINAL STEP
        else if (data.AssignedToEmail2Id === data.Approval3Id) {
          userDesignation = "Management 2"
          if(data.ActionDate2){
              payload = {
                ApproverComment3: comment,
                ActionDate3: new Date().toISOString(),
                AssignedToEmailId: null,
                AssignedTo: "Approved",
                AssignedToEmail2Id: null,
                AsisgnedTo2: "Approved",
                Status: "Approved",
                CurrentStatus: "Approved"
              };
            }
            else{
              payload = {
                ApproverComment3: comment,
                ActionDate3: new Date().toISOString()
              };
            }
        }
      }

      if (Object.keys(payload).length === 0) {
        alert("No approval action available ❌");
        return;
      }

      console.log("FINAL PAYLOAD:", payload);

      // 🔹 UPDATE ITEM
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
          body: JSON.stringify(payload)
        }
      ).then(r => r.json())
      .then(r => 
        console.log(r)
      )
      .catch(err => 
        console.log(err)
      );

      // 🔹 HISTORY SAVE
      await handleSaveHistory(itemId, "Approved", currentUser.Title, userDesignation);

      alert( action + " Successfully ✅");

      // 🔹 UI UPDATE (IMPORTANT)
      setData(prev => prev ? { ...prev, ...payload } : prev);
      setIsActionDone(true);

      // 🔹 REDIRECT
  //window.location.assign(`${props.siteUrl}/SitePages/Dashboard.aspx`);

    } catch (error) {
      console.error("APPROVE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };
const updateStatus = React.useCallback(async (status: TApprovalStatus) => {

  if (!comment.trim()) {
    setStatusMsg('Enter comment before taking action.');
    return;
  }

  try {

    // 🔴 SAFETY CHECK
    if (!approverData) {
      setStatusMsg("Approver configuration missing ❌");
      return;
    }

    // ✅ STEP CALCULATION (FIXED)
    const step =
      !data?.ActionDate1 ? 1 :
      !data?.ActionDate2 ? 2 :
      !data?.ActionDate3 ? 3 :
      4;

    let payload: any = {};

    // 🔴 REJECT (highest priority)
    if (status === "Rejected") {
      payload = {
        CurrentStatus: "Rejected",
        AssignedTo: "",
        AssignedToEmailId: null
      };
    }

    // ✅ STEP 1 → move to Approval2
    else if (step === 1) {
      payload = {
        ApproverComment1: comment,
        ActionDate1: new Date().toISOString(),

        AssignedTo: approverData?.Approval2?.Title || "",
        AssignedToEmailId: approverData?.Approval2?.Id || null,

        CurrentStatus: "Pending"
      };
    }

    // ✅ STEP 2 → move to Approval3
    else if (step === 2) {
      payload = {
        ApproverComment2: comment,
        ActionDate2: new Date().toISOString(),

        AssignedTo: approverData?.Approval3?.Title || "",
        AssignedToEmailId: approverData?.Approval3?.Id || null,

        CurrentStatus: "Pending"
      };
    }

    // ✅ FINAL STEP
    else if (step === 3) {
      payload = {
        ApproverComment3: comment,
        ActionDate3: new Date().toISOString(),

        AssignedTo: "",
        AssignedToEmailId: null,

        CurrentStatus: "Approved"
      };
    }

    // ❌ SAFETY CHECK
    if (Object.keys(payload).length === 0) {
      setStatusMsg("No action available ❌");
      return;
    }

    console.log("FINAL PAYLOAD:", payload);

    // 🔹 UPDATE SHAREPOINT ITEM
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
        body: JSON.stringify(payload)
      }
    );

    // 🔹 SAVE HISTORY
    await handleSaveHistory(itemId, status,'','');

    // 🔥 IMPORTANT → REFRESH FROM SERVER (NO LOCAL FAKE UPDATE)
    await fetchData();
    await fetchHistory();

    setStatusMsg(`${status} successfully.`);
    setIsActionDone(true);

  } catch (error: any) {
    console.error('Status update failed:', error);
    setStatusMsg(error?.message || 'Unable to update the request.');
  }

}, [
  comment,
  data,
  approverData,
  fetchData,
  fetchHistory,
  handleSaveHistory,
  itemId,
  props.listName,
  props.siteUrl,
  props.spHttpClient
]);

[comment, currentStep, fetchHistory, handleSaveHistory, itemId, props.listName, props.siteUrl, props.spHttpClient];

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

  if (!data) {
    return <div>No data found.</div>;
  }
  return (
    <div className={styles.container}>
      {loading && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(255,255,255,0.6)',
                zIndex: 9999
              }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
                  <Spinner label="Processing..." size={SpinnerSize.large} />
                </div>
              </div>
            )}
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
              onClick={() => handleApproveReject("Approved").catch(() => undefined)}
              disabled={isReadOnly}
            >
              Approve
            </button>

            <button
              className={styles.RejectBtn}
              onClick={() => handleApproveReject('Rejected').catch(() => undefined)}
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

                    {item.Designation !== "Request Initiator" ? (
                      <div className={styles.timelineText}>
                        <b>Approver Name:</b> {item.UserName || '-'}
                      </div>
                    ) : (
                      <div className={styles.timelineText}>
                        <b>Initiator:</b> {item.UserName || '-'}
                      </div>
                    )}

                    {item.UserAction && item.Designation !== "Request Initiator" && (
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