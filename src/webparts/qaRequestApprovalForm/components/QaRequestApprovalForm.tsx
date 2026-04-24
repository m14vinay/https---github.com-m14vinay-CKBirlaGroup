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
  const [approverData, setApproverData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // ================= COMMON =================
  const params = new URLSearchParams(window.location.search);
  const itemId =
    Number(params.get("requestId")) ||
    Number(params.get("RequestId")) ||
    Number(params.get("id"));

  const isReadOnly =
    isActionDone ||
    data?.Status === "Approved" ||
    data?.Status === "Rejected";

  const requestLabel = data?.ProjectTitle
    ? `PRJ-${itemId}`
    : `PRJ-${itemId}`;

  const fetchFromList = async (url: string) => {
    const res = await props.spHttpClient.get(url, SPHttpClient.configurations.v1);
    return res.json();
  };

  const formatTimelineDate = (value: string) => {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN");
  };

  const normalizeTimelineValue = (value?: string): string =>
    String(value || "").toLowerCase().replace(/\s+/g, "").trim();

  // ================= FETCH =================
  const fetchData = async () => {
    if (!itemId) return;

    try {
      const [itemRes, poRes] = await Promise.all([
        fetchFromList(`${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})?$expand=AttachmentFiles`),
        fetchFromList(`${props.siteUrl}/_api/web/lists/getbytitle('PurchaseOrderDetails')/items?$filter=QuotationIdId eq ${itemId}`)
      ]);

      setData(itemRes);
      const deptRes = await fetchFromList(
        `${props.siteUrl}/_api/web/lists/getbytitle('DepartmentMaster')/items?$filter=DepartmentName eq '${itemRes.Department}'&$expand=Departmenthead,Approval1,Approval2,Approval3,Approval4`
      );

      setApproverData(deptRes.value[0]);
      setComment(itemRes.ApproverComment1 || "");
      setPoItems(poRes.value || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!itemId) return;

    try {
      const res = await fetchFromList(
        `${props.siteUrl}/_api/web/lists/getbytitle('History')/items?$filter=FID eq ${itemId} and Title eq 'QA'&$orderby=Created asc`
      );
      setHistory(res.value || []);
    } catch (err) {
      console.error(err);
    }
  };
  // ================= HISTORY FUNCTIONS =================

  const getUser = async (): Promise<any> => {
    const res = await props.spHttpClient.get(
      `${props.siteUrl}/_api/web/currentuser`,
      SPHttpClient.configurations.v1
    );
    return res.json();
  };

  const getUserFromListByStep = async (step: number): Promise<string> => {
    if (step === 1) {
      const currentUser = await getUser();
      return currentUser.Title;
    }

    if (!approverData) return "";

    switch (step) {
      case 2: return approverData.Departmenthead?.Title || "";
      case 3: return approverData.Approval1?.Title || "";
      case 4: return approverData.Approval2?.Title || "";
      case 5: return approverData.Approval3?.Title || "";
      case 6: return approverData.Approval4?.Title || "";
      default: return "";
    }
  };

  const createHistoryItem = async (payload: any): Promise<void> => {
    await props.spHttpClient.post(
      `${props.siteUrl}/_api/web/lists/getbytitle('History')/items`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );
  };

  const handleSaveHistory = async (id: number, userAction: string) => {
    try {

      const userName = await getUserFromListByStep(currentStep);
      const designation = getDesignationByStep(currentStep);

      await createHistoryItem({
        Title: 'QA',
        FID: id,
        UserName: userName,
        UserAction: userAction,
        UserComment: comment,
        ActionDate: new Date().toISOString(),
        Designation: designation   // ✅ FIXED
      });

    } catch (error) {
      console.error("History error:", error);
    }
  };

  // ================= UPDATE =================
  const updateStatus = async (status: string) => {
    if (!comment.trim()) {
      setStatusMsg("❌ Enter comment");
      return;
    }

    try {
      // ================= UPDATE MAIN ITEM =================
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
      ).then(r => r.json())
      .then(r => 
        console.log(r)
      )
      .catch(err => 
        console.log(err)
      );

      // ================= SAVE HISTORY =================
      await handleSaveHistory(itemId, status);

      // ================= STEP LOGIC =================
      let nextStep = currentStep;

      if (status === "Approved") {
        nextStep = currentStep + 1;
        setCurrentStep(nextStep);
      }

      // If last approver reached → mark final approved
      const maxSteps = 6; // change based on your columns

      if (status === "Approved" && nextStep > maxSteps) {
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
              Status: "Approved"
            })
          }
        );
      }

      // ================= UI UPDATE =================
      setStatusMsg(`✅ ${status} done`);
      setIsActionDone(true);

      // Refresh timeline
      await fetchHistory();

    } catch (err: any) {
      console.error("Update Error:", err);
      setStatusMsg(err.message || "❌ Error occurred");
    }
  };


  useEffect(() => {
    fetchData();
    fetchHistory();
  }, []);

  const statusTextClassMap: any = {
    approved: styles.statusTextApproved,
    rejected: styles.statusTextRejected,
    pending: styles.statusTextPending
  };

  const statusClassMap = {
    approved: styles.approved,
    rejected: styles.rejected,
    pending: styles.pending
  };

  const timelineItems = React.useMemo(() => {
    const latestByStep = new Map<string, any>();

    history.forEach((item) => {
      const designationKey = normalizeTimelineValue(item.Designation);
      const userNameKey = normalizeTimelineValue(item.UserName);
      const key = designationKey || userNameKey || normalizeTimelineValue(item.UserAction);

      if (key) {
        latestByStep.set(key, item);
      }
    });

    return Array.from(latestByStep.values());
  }, [history]);

  // const statusTextClassMap = {
  //   approved: styles.statusTextApproved,
  //   rejected: styles.statusTextRejected,
  //   pending: styles.statusTextPending
  // };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  // ================= REUSABLE FIELD =================
  const renderField = (label: string, value: any, required = false) => (
    <div className={styles.formRow}>
      <label>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <input value={value || ""} disabled />
    </div>
  );

  // ================= UI =================
  const getDesignationByStep = (step: number): string => {
    switch (step) {
      case 1: return "Request Initiator";
      case 2: return "Department Head";
      case 3: return "Approver 1";
      case 4: return "Approver 2";
      case 5: return "Approver 3";
      case 6: return "Approver 4";
      default: return "Approver";
    }
  };

  return (

    <div className={styles.container}>
      <div className={styles.mainLayout}  >



        {/* ================= LEFT SIDE ================= */}
        <div className={styles.leftPanel}>

          <h4 className={styles.heading}>Quotation Request Approval Form</h4>

          {/* ===== BASIC DETAILS ===== */}
          <div className={styles.formRow}>
            <label>Project Title *</label>
            <input value={data.ProjectTitle || ""} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Project Reference Number</label>
            <input value={data.ProjectReffNo || ""} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Project Description *</label>
            <input value={data.ProjectDescription || ""} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Total Project Amount</label>
            <div className={styles.twoCol}>
              <input value={data.TotalProjectAmount || ""} disabled />
              <span>Applicable Taxes</span>
              <input value={data.ApplicableTaxes || ""} disabled />
            </div>
          </div>

          {/* ===== VENDORS ===== */}
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.formRow}>
              <label>Vendor {i} {i === 1 && "*"}</label>
              <div className={styles.twoCol}>
                <input value={data[`Vendor${i}`] || ""} disabled />
                <span>Quote {i}</span>
                <input value={data[`Quote${i}`] || ""} disabled />
              </div>
            </div>
          ))}

          <div className={styles.formRow}>
            <label>Selected Vendor *</label>
            <input value={data.Selectedvendor || ""} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Selected Quote *</label>
            <input value={data.SelectedQuote || ""} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Department *</label>
            <input value={data.Department || ""} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Advance Payment *</label>
            <input value={data.Advancepayment || ""} disabled />
          </div>

          <div className={styles.formRow}>
            <label>Approval Path *</label>
            <input value={data.ApprovalPath || ""} disabled />
          </div>

          {/* ===== ATTACHMENTS ===== */}
          <div className={styles.formRow}>
            <label>Attachments</label>
            {data.AttachmentFiles?.length ? data.AttachmentFiles.map((f: any) => (
              <div key={f.FileName}>
                <a href={f.ServerRelativeUrl} target="_blank">
                  {f.FileName}
                </a>
              </div>
            )) : <div>No files</div>}
          </div>

          {/* ===== PO ===== */}
          <div className={styles.poSection}>
            <h5>Purchase Order Details</h5>

            <div className={styles.poTable}>
              <div className={styles.poRowHeader}>
                <div>Description</div>
                <div>Qty</div>
                <div>Rate</div>
                <div>Amount</div>
              </div>

              {poItems.map((item, i) => (
                <div key={i} className={styles.poRow}>
                  <input value={item.Description || ""} disabled />
                  <input value={item.Quantity || ""} disabled />
                  <input value={item.Rate || ""} disabled />
                  <input value={item.Amount || ""} disabled />
                </div>
              ))}
            </div>
          </div>

          {/* ===== COMMENT ===== */}
          <div className={styles.formRow}>
            <label>Approver Comments *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isReadOnly}
            />
          </div>

          {/* ===== BUTTONS ===== */}
          <div className={styles.buttonContainer}>
            <button
              className={styles.ApproveBtn}
              onClick={() => updateStatus("Approved")}
              disabled={isReadOnly}
            >
              Approve
            </button>

            <button
              className={styles.RejectBtn}
              onClick={() => updateStatus("Rejected")}
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

          {statusMsg && <div>{statusMsg}</div>}

        </div>

        {/* ================= RIGHT SIDE TIMELINE ================= */}
        <div className={styles.rightTimeline}>

          <h4 className={styles.timelineHeader}>
            Timeline - {requestLabel}
          </h4>

          <div className={styles.timelineBody}>

            {(() => {
              const safeHistory = Array.isArray(timelineItems) ? timelineItems : [];

              // ✅ STEP 1: Remove duplicate (latest per designation/user)
              const latestMap: Record<string, any> = {};

              safeHistory.forEach((item: any) => {
                const key = (item.Designation ||"")
                  .toString()
                  .toLowerCase()
                  .replace(/\s+/g, "")   // extra safety
                  .trim();

                const currentDate = new Date(item.ActionDate || item.Created || 0).getTime();
                const existingDate = latestMap[key]
                  ? new Date(latestMap[key].ActionDate || latestMap[key].Created || 0).getTime()
                  : 0;

                if (!latestMap[key] || currentDate > existingDate) {
                  latestMap[key] = item;
                }
              });

              // ✅ SAFE conversion (no Object.values error)
              const uniqueItems = Object.keys(latestMap).map((key) => latestMap[key]);

              // ✅ STEP 2: FIXED WORKFLOW ORDER (IMPORTANT)
const stepOrder = [
  "requestinitiator",
  "departmenthead",
  "approver1",
  "approver2",
  "approver3",
  "approver4"
];

uniqueItems.sort((a: any, b: any) => {
  const aKey = (a.Designation || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();

  const bKey = (b.Designation || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();

  return stepOrder.indexOf(aKey) - stepOrder.indexOf(bKey);
});

              // // ✅ STEP 2: Sort by date (safe)
              // uniqueItems.sort(
              //   (a: any, b: any) =>
              //     new Date(a.ActionDate || a.Created || 0).getTime() -
              //     new Date(b.ActionDate || b.Created || 0).getTime()
              // );

              // ✅ STEP 3: Render
              return uniqueItems.length > 0 ? (
                uniqueItems.map((item: any, index: number) => {

                  const action = (item.UserAction || "").toLowerCase();

                  // ✅ FIXED STATUS LOGIC (IMPORTANT)
                  let status: "approved" | "rejected" | "pending" = "pending";

                  if (action.includes("reject")) {
                    status = "rejected";
                  } else if (
                    action.includes("approve") ||
                    action.includes("submit") ||
                    action.includes("initiator")
                  ) {
                    status = "approved";
                  }

                  return (
                    <div
                      key={`${item.Designation}-${index}`}
                      className={`${styles.timelineItem} ${styles[status]}`}
                    >
                      <div className={styles.timelineMarker}></div>

                      <div className={styles.timelineContent}>

                        <div className={styles.timelineStepTitle}>
                          {item.Designation || item.UserName}
                        </div>

                        {/* ✅ Initiator fix */}
                        {item.Designation === "Request Initiator" ? (
                          <div className={styles.timelineText}>
                            <b>Initiator:</b> {item.UserName || "-"}
                          </div>
                        ) : (
                          <div className={styles.timelineText}>
                            <b>Approver Name:</b> {item.UserName || "-"}
                          </div>
                        )}

                        {/* ✅ Action */}
                        {item.UserAction && item.Designation !== "Request Initiator" && (
                          <div className={`${styles.timelineText} ${statusTextClassMap[status] || ""}`}>
                            <b>Action Taken:</b> {item.UserAction}
                          </div>
                        )}

                        {/* ✅ Date */}
                        {(item.ActionDate || item.Created) && (
                          <div className={styles.timelineText}>
                            <b>Action Date:</b>{" "}
                            {formatTimelineDate(item.ActionDate || item.Created)}
                          </div>
                        )}

                        {/* ✅ Comments */}
                        {item.UserComment && (
                          <div className={styles.timelineText}>
                            <b>Comments:</b> {item.UserComment}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })
              ) : (
                <div>No history found</div>
              );
            })()}

          </div>
        </div>

      </div>
    </div>
  );
};
