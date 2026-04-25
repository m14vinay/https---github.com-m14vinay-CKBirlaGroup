import * as React from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IQaRequestApprovalFormProps } from './IQaRequestApprovalFormProps';
import styles from './QaRequestApprovalForm.module.scss';
<<<<<<< HEAD
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
=======
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
>>>>>>> origin/shubhamCkbirla

export const QaRequestApprovalForm: React.FC<IQaRequestApprovalFormProps> = (props) => {
const fixSequence = (designation: string) => {
  const key = (designation || "").toLowerCase().replace(/\s+/g, "");

<<<<<<< HEAD
  const map: any = {
    "requestinitiator": 0,
    "departmenthead": 1,
    "management1": 2,
    "approver1": 2,
    "management2": 3,
    "approver2": 3,
    "management3": 4,
    "approver3": 4,
    "management4": 5,
    "approver4": 5
  };

  return map[key] ?? 999;
};


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
=======
  const [form, setForm] = React.useState({
    ProjectTitle: '',
    ProjectReffNo: '',
    ProjectDescription: '',
    TotalProjectAmount: 0,
    ApplicableTaxes: 0,
    Vendor1: '',
    Vendor2: '',
    Vendor3: '',
    Quote1: '',
    Quote2: '',
    Quote3: '',
    Selectedvendor: '',
    SelectedQuote: '',
    Department: '',
    Advancepayment: 0,
    ApprovalPath: '',
    files: null,
    attachments: [],
    ApprovalComment: '',
    CurrentStatus: '',
    approver1: '',
    approver2: '',
    approver3: '',
    approver4: '',
    approver5: '',
    ActionDate1: '',
    ActionDate2: '',
    ActionDate3: '',
    Approval2: '',

    Approval3: '',
    DepartmentHead: '',
    RequestNo: '',
    Approver2EmailId: 0,
    Approver3EmailId: 0,
    ApproverTwoId: 0,
    AssignedTo: '',
    AssignedTo2: ''

  });
  const [poItems, setPoItems] = React.useState<any[]>([]);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const service = new SharePointService(props.context);
  const [approverComment, setApproverComment] = React.useState('');
  const [approverComment2, setApproverComment2] = React.useState('');
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [AssignedID2, setAssignedID2] = React.useState('');
  const [AssignedID3, setAssignedID3] = React.useState('');
  const [approver1, setApprover1] = React.useState('');
  const [approver2, setApprover2] = React.useState('');
  const [approver3, setApprover3] = React.useState('');
  const [approver4, setApprover4] = React.useState('');
  const [approver5, setApprover5] = React.useState('');
  const [departmentHead, setDepartmentHead] = React.useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [History, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [actionType, setActionType] = React.useState<'approve' | 'reject' | ''>('');

  // --- 1️⃣ Get ID from query string ---
  const getIdFromQueryString = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('RequestId');
    return id ? parseInt(id, 10) : null;
  };

  // --- 3️⃣ Load data on mount ---
  React.useEffect(() => {
    const id = getIdFromQueryString();
    if (id) {
      handleFetchById(id);
    }
  }, []);
>>>>>>> origin/shubhamCkbirla

  const loadAttachments = async (id: number) => {
    try {
<<<<<<< HEAD
      const response = await fetchFromList<IListResponse<IHistoryItem>>(
        `${props.siteUrl}/_api/web/lists/getbytitle('History')/items?$filter=FID eq ${itemId}&$select=UserName,UserAction,UserComment,ActionDate,Designation,Sequence,Created
&$orderby=Sequence asc`
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
  `${props.siteUrl}/_api/web/lists/getbytitle('${props.listName}')/items(${itemId})?
$select=*,Author/Title,Created/Title,Approval1/Title,Approval2/Title,Approval3/Title
&$expand=Author,Approval1,Approval2,Approval3`
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
=======
      const files = await service.getAttachments(id);
      console.log("Attachments:", files);
      setAttachments(files);
    } catch (error) {
      console.error(error);
    }
  };

  const getApprover = async () => {
    try {
      const data = await service.getApprover('');

      console.log("Approver Data:", data);

      if (data && data.length > 0) {
        setApprover1(data[0].approver1 || '');
        setApprover2(data[0].approver2 || '');
        setApprover3(data[0].approver3 || '');
        setApprover4(data[0].approver4 || '');
        setApprover5(data[0].approver5 || '');
        setDepartmentHead(data[0].DepartmentHead || '');
      }

    } catch (error) {
      console.error(error);
    }
  };
  const loadPOData = async (id: number) => {
    try {
      const response = await service.getPurchaseOrderDetails(id);

      console.log("PO Data:", response); // 👈 debug

      setPoItems(response || []); // 👈 yaha data set hoga
    } catch (error) {
      console.error("Error fetching PO data:", error);
    }
  };
  React.useEffect(() => {
    if (itemId) {
      loadAttachments(itemId);
      getApprover();// 👈 dynamic ID use karo
      loadPOData(itemId);
    }
  }, [itemId]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFetchById = async (id: number) => {
    try {
      setLoading(true);
      console.log("Calling API with ID:", id);
      const currentuser = await service.getUser();
      const result = await service.getItemByRequestNo(id);
      if (result.Approval2Id) {
        const user2 = await service.getUserById(result.Approval2Id);
        if (user2?.Title) {
          setAssignedID2(user2.Title);
        }
      }
      if (result.Approval3Id) {
        const user3 = await service.getUserById(result.Approval3Id);
        if (user3?.Title) {
          setAssignedID3(user3.Title);
        }
      }
      const User = await service.getUserById(result.Approval2Id);
      const historydata = await service.GetHistoryItem(id, "QA");
      setHistory(historydata);
      console.log("Result:", result);

      if (result.AssignedTo === currentuser.Title || result.AssignedTo2 === currentuser.Title) {
        if (result.CurrentStatus === 'Pending' || result.CurrentStatus === 'Approved') {
          setItemId(result.Id);

          setForm(prev => ({
            ...prev,
            ProjectTitle: result.ProjectTitle || '',
            ProjectReffNo: result.ProjectReffNo || '',
            ProjectDescription: result.ProjectDescription || '',
            TotalProjectAmount: result.TotalProjectAmount || 0,
            ApplicableTaxes: result.ApplicableTaxes || 0,
            Vendor1: result.Vendor1 || '',
            Vendor2: result.Vendor2 || '',
            Vendor3: result.Vendor3 || '',
            Quote1: result.Quote1 || '',
            Quote2: result.Quote2 || '',
            Quote3: result.Quote3 || '',
            Selectedvendor: result.Selectedvendor || '',
            SelectedQuote: result.SelectedQuote || '',
            Department: result.Department || '',
            Advancepayment: result.Advancepayment || 0,
            ApprovalPath: result.ApprovalPath || '',
            RequestNo: result.RequestNo || '',
            ActionDate1: result.ActionDate1 || '',
            ActionDate2: result.ActionDate2 || '',
            ActionDate3: result.ActionDate3 || '',
            Approver2EmailId: result.Approval2Id,
            Approver3EmailId: result.Approval3Id,
            ApproverTwoId: result.Approval2Id,
            AssignedTo: result.AssignedTo,
            AssignedTo2: result.AssignedTo2,

            files: null
          }));



          if (!result.ActionDate1 || !result.ActionDate2 || !result.ActionDate3) {
            setIsDisabled(false);  // enable
          } else {
            setIsDisabled(true);   // disable
          }

        } else {
          alert("No Data Found.");
        }
      } else {
        alert("❌ This Action Has Already Taken.Please Wait For Queue.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url)
      }
    } catch (error) {
      console.error("Error Occurred,Please Contact To System Administrator.:", error);
    }
    finally {
      setLoading(false);
    }
  };
  // ================= COMMON =================






  const handleApprove = async () => {
    try {
      setLoading(true);

      if (!form.ApprovalComment) return alert("Enter Approver Comment");
      let payload = {};
      let CurrentSequence = 0;
      let NextSequence = 0;
      let CurrentUserAction = '';
      let NextuserAction = '';
      if (!itemId) return;
      const currentuserApprove = await service.getUser();
      // 🔥 CASE 1: Only 1 approver
      if (Number(form.TotalProjectAmount) <= 200000) {
        if (form.ActionDate1 == '') {
          payload = {
            ApproverComment1: form.ApprovalComment,
            CurrentStatus: 'Approved',
            ActionDate1: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Approved',
            AssignedToEmailId: 0
          };
          CurrentSequence = 1;
          CurrentUserAction = 'Approved';
          NextSequence = 0;
          NextuserAction = '';
        }
      }
      else if (Number(form.TotalProjectAmount) > 200000 && form.Department === "Branding") {
        if (form.ActionDate1 == '') {
          const UserApproval2 = await service.getUserById(form.Approver2EmailId);
          payload = {
            ApproverComment1: form.ApprovalComment,
            CurrentStatus: 'Pending',
            ActionDate1: new Date().toLocaleDateString('en-GB'),
            AssignedTo: UserApproval2?.Title,
            AssignedToEmailId: Number(UserApproval2?.Id)
          };
          CurrentSequence = 1;
          CurrentUserAction = 'Approved';
          NextSequence = 2;
          NextuserAction = 'Pending';
        }

        // 🔥 CASE 3: Second Approver
        else if (form.ActionDate2 == '') {
          payload = {
            ApproverComment2: form.ApprovalComment,
            CurrentStatus: 'Approved',
            ActionDate2: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Approved',
            AssignedToEmailId: 0
          };
          CurrentSequence = 2;
          CurrentUserAction = 'Approved';
          NextSequence = 0;
          NextuserAction = '';
        }
      }
      else if (form.ActionDate1 == '') {
        const UserApproval2 = await service.getUserById(form.Approver2EmailId);
        const UserApproval3 = await service.getUserById(form.Approver3EmailId);
        payload = {
          ApproverComment1: form.ApprovalComment,
          CurrentStatus: 'Pending',
          ActionDate1: new Date().toLocaleDateString('en-GB'),
          AssignedTo: (UserApproval2?.Title),
          AssignedToEmailId: Number(UserApproval2?.Id),
          AssignedTo2: (UserApproval3?.Title),
          AssignedToEmail2Id: Number(UserApproval3?.Id),
        };
        CurrentSequence = 1;
        CurrentUserAction = 'Approved';
        NextSequence = 2;
        NextuserAction = 'Pending';
      }
      else if (form.ActionDate2 == '' && currentuserApprove.Title===form.AssignedTo) {
        payload = {
          ApproverComment2: form.ApprovalComment,
          CurrentStatus: (form.ActionDate3 != '' && form.AssignedTo2=='Approved') ? 'Approved' : (form.ActionDate3 != '' && form.AssignedTo2=='Rejected')? 'Rejected':'Pending',
          ActionDate2: new Date().toLocaleDateString('en-GB'),
          AssignedTo: 'Approved',
          AssignedToEmailId: 0,
        };
        CurrentSequence = 2;
        CurrentUserAction = 'Approved';
        NextSequence = 3;
        NextuserAction = 'Pending';
      }
      else if (form.ActionDate3 == '' && currentuserApprove.Title===form.AssignedTo2) {
        payload = {
          ApproverComment3: form.ApprovalComment,
          CurrentStatus: (form.ActionDate2 != '' && form.AssignedTo=='Approved') ? 'Approved' : (form.ActionDate2 != '' && form.AssignedTo=='Rejected')? 'Rejected':'Pending',
          ActionDate3: new Date().toLocaleDateString('en-GB'),
          AssignedTo2: 'Approved',
          AssignedToEmail2Id: 0
        };
        CurrentSequence = 3;
        CurrentUserAction = 'Approved';
        NextSequence = 0;
        NextuserAction = '';
      }
      if (payload != '') {
        const updatedData = await service.updateItem(itemId, payload);
        await handleSaveApproveHistory(itemId, CurrentUserAction, NextuserAction, CurrentSequence, NextSequence, form.ApprovalComment);
        alert("Request Approved Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
        return;
      }

    } catch (error) {
      console.error(error);
    }
    finally {
>>>>>>> origin/shubhamCkbirla
      setLoading(false);
    }
  }, [fetchFromList, itemId, props.listName, props.siteUrl]);

<<<<<<< HEAD
  const createHistoryItem = React.useCallback(async (payload: Record<string, unknown>): Promise<void> => {
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
=======
  const handleSaveApproveHistory = async (id: number, CurrentUserAction: string, NextUserAction: string, CurrentSequence: number, NextSequence: number, comment: string) => {

    if (CurrentUserAction != '') {
      const payload = {
        UserAction: CurrentUserAction,
        ActionDate: new Date().toISOString(),
        UserComment: comment
      };
      await service.UpdateHistoryItem(id, payload, 'QA', CurrentSequence);
    }
    if (NextUserAction != '') {
      const payload = {
        UserAction: NextUserAction,
      };
      await service.UpdateHistoryItem(id, payload, 'QA', NextSequence);
    }
  };


  const handleReject = async () => {
    try {
      //setActionType('approve');
      setLoading(true);
      if (!form.ApprovalComment) return alert("Enter Approver Comment");
      let payload = {};
      let CurrentSequence = 0;
      let NextSequence = 0;
      let CurrentUserAction = '';
      let NextuserAction = '';
      if (!itemId) return;
        const currentuserReject = await service.getUser();
      // 🔥 CASE 1: Only 1 approver
      if (Number(form.TotalProjectAmount) <= 200000) {
        if (form.ActionDate1 == '') {
          payload = {
            ApproverComment1: form.ApprovalComment,
            CurrentStatus: 'Rejected',
            ActionDate1: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };
          CurrentSequence = 1;
          CurrentUserAction = 'Rejected';
        }
      }
      else if (Number(form.TotalProjectAmount) > 200000 && form.Department === "Branding") {
        if (form.ActionDate1 == '') {
          const UserApproval2 = await service.getUserById(form.Approver2EmailId);
          payload = {
            ApproverComment1: form.ApprovalComment,
            CurrentStatus: 'Rejected',
            ActionDate1: new Date().toLocaleDateString('en-GB'),
            AssignedTo: UserApproval2?.Title,
            AssignedToEmailId: Number(UserApproval2?.Id)
          };
          CurrentSequence = 1;
          CurrentUserAction = 'Rejected';
        }

        // 🔥 CASE 3: Second Approver
        else if (form.ActionDate2 == '') {
          payload = {
            ApproverComment2: form.ApprovalComment,
            CurrentStatus: 'Rejected',
            ActionDate2: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };
          CurrentSequence = 2;
          CurrentUserAction = 'Rejected';
        }
      } else
        if (form.ActionDate1 == '') {
          const UserApproval2 = await service.getUserById(form.Approver2EmailId);
          payload = {
            ApproverComment1: form.ApprovalComment,
            CurrentStatus: 'Rejected',
            ActionDate1: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };
          CurrentSequence = 1;
          CurrentUserAction = 'Rejected';
        }
        else if (form.ActionDate2 == '' && currentuserReject.Title===form.AssignedTo) {         
          payload = {
            ApproverComment2: form.ApprovalComment,
            CurrentStatus: (form.ActionDate3 != '' && form.AssignedTo2=='Approved') ? 'Rejected' : (form.ActionDate3 != '' && form.AssignedTo2=='Rejected')? 'Rejected':'Pending',
            ActionDate2: new Date().toLocaleDateString('en-GB'),
            AssignedTo: 'Rejected',
            AssignedToEmailId: 0
          };
          CurrentSequence = 2;
          CurrentUserAction = 'Rejected';
        }
        else if (form.ActionDate3 == '' && currentuserReject.Title===form.AssignedTo2) {
          payload = {
            ApproverComment3: form.ApprovalComment,
           CurrentStatus: (form.ActionDate2 != '' && form.AssignedTo=='Approved') ? 'Rejected' : (form.ActionDate2 != '' && form.AssignedTo=='Rejected')? 'Rejected':'Pending',
            ActionDate3: new Date().toLocaleDateString('en-GB'),
            AssignedTo2: 'Rejected',
            AssignedToEmail2Id: 0
          };
          CurrentSequence = 3;
          CurrentUserAction = 'Rejected';
        }
      if (payload != '') {
        const updatedData = await service.updateItem(itemId, payload);
        await handleSaveApproveHistory(itemId, CurrentUserAction, NextuserAction, CurrentSequence, NextSequence, form.ApprovalComment);
        alert("Request Rejected Successfully.");
        const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
        window.location.assign(url);
        return;
      }


    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
>>>>>>> origin/shubhamCkbirla
    }
  }, [comment, createHistoryItem, currentStep, getUserFromStep]);

<<<<<<< HEAD

  const handleApproveReject = async (action: string) => {
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

      // STEP DETECTION BASED ON AssignedTo (BEST)

      if (action == "Rejected") {
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

      else if (action === "Approved") {
        // STEP 1
        if (data.AssignedToEmailId === data.Approval1Id && data.ActionDate1 === null) {

          userDesignation = "Department Head"
          if (data.TotalProjectAmount && Number(data.TotalProjectAmount) > 200000 && data.Approval2Id && data.Approval3Id) {
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
          else if (data.Approval2Id) {
            payload = {
              ApproverComment1: comment,
              ActionDate1: new Date().toISOString(),
              AssignedToEmailId: Number(data.Approval2Id) || null,
              AssignedTo: data.Approval2?.Title,
              Status: "Pending"
            };
          }
          else {
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
          if (data.AssignedToEmail2Id === null) {
            if (data.Approval3Id) {
              payload = {
                ApproverComment2: comment,
                ActionDate2: new Date().toISOString(),
                AssignedToEmailId: Number(data.Approval3Id) || null,
                AssignedTo: data.Approval3?.Title,
                Status: "Pending"
              };
            }
            else {
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
          else {
            if (data.ActionDate3) {
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
            else {
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
          if (data.ActionDate2) {
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
          else {
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
      await handleSaveHistory(itemId, action as TApprovalStatus, currentUser.Title, userDesignation);
      // 🔹 SUCCESS MESSAGE
      setStatusMsg(`${action} Successfully ✅`);
      setIsActionDone(true);

      window.location.href = `${props.siteUrl}/SitePages/Dashboard.aspx`;


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
      await handleSaveHistory(itemId, status, '', '');

      // IMPORTANT → REFRESH FROM SERVER (NO LOCAL FAKE UPDATE)
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

  {/* ================= RIGHT SIDE TIMELINE ================= */ }
  <div className={styles.rightTimeline}>

    <h4 className={styles.timelineHeader}>
      Timeline - {requestLabel}
    </h4>

    <div className={styles.timelineBody}>
    </div>
  </div>

  if (!data) {
    return <div>No data found.</div>;
  }


  function getTimelineStatus(UserAction?: string): "approved" | "rejected" | "pending" {

    const action = (UserAction || "").toLowerCase();

    if (action.includes("reject")) return "rejected";

    if (action.includes("approve")) return "approved";

    if (action.includes("pending")) return "pending";

    if (action.includes("upcoming")) return "pending";

    if (action.includes("initiator")) return "approved";

    return "pending";
  }

  return (
    <div className={styles.container}>
=======

  return (
    <section>
>>>>>>> origin/shubhamCkbirla
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
<<<<<<< HEAD
          </div>
        </div>
      )}
      <div className={styles.mainLayout}>
        <div className={styles.leftPanel}>
          <h4 className={styles.heading}>Quotation Request Approval Form<h2 className={styles.timelineHeader}>{requestLabel}</h2></h4>

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
                <div>No purchase order details found.</div>
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

          {statusMsg && <div>{statusMsg}</div>}
        </div>

        <div className={styles.rightTimeline}>
          <h4 className={styles.timelineHeader}>Timeline - {requestLabel}</h4>

          <div className={styles.timelineBody}>

           {(() => {

  const safeHistory = Array.isArray(history) ? history : [];

  // ✅ STEP 1: NORMALIZE HISTORY USING FIXSEQUENCE
  const latestBySeq: Record<number, any> = {};

  safeHistory.forEach((item: any) => {
    const seq = Number(item.Sequence ?? fixSequence(item.Designation));

    const currentTime = new Date(item.ActionDate || item.Created || 0).getTime();
    const existingTime = latestBySeq[seq]
      ? new Date(latestBySeq[seq].ActionDate || latestBySeq[seq].Created || 0).getTime()
      : 0;

    if (!latestBySeq[seq] || currentTime > existingTime) {
      latestBySeq[seq] = item;
    }
  });

  // ✅ STEP 2: INITIATOR (CORRECT)
const initiator =
  data?.Author?.Title ||
  data?.CreatedBy?.Title ||
  "-";

  // ✅ STEP 3: BUILD FLOW (STRICT FROM QUOTATION LIST)
const uniqueUsers = new Set<string>();

const steps = [
  { seq: 0, name: "Request Initiator", user: initiator },
  { seq: 1, name: "Department Head", user: data?.Approval1?.Title },
  { seq: 2, name: "Management 1", user: data?.Approval2?.Title },
  { seq: 3, name: "Management 2", user: data?.Approval3?.Title }
]
.filter(x => {
  if (!x.user) return false;
  if (uniqueUsers.has(x.user)) return false;
  uniqueUsers.add(x.user);
  return true;
});

  // ✅ STEP 4: BUILD FINAL ITEMS (NO DUPLICATE POSSIBLE)
  let finalItems = steps.map(step => {
    const historyItem = latestBySeq[step.seq];

    return {
      Sequence: step.seq,
      Designation: step.name,
      UserName: step.user,
      UserAction: historyItem?.UserAction || "",
      ActionDate: historyItem?.ActionDate || historyItem?.Created
    };
  });

  // ✅ STEP 5: STATUS LOGIC (CORRECT)
let lastApprovedSeq = -1;

// find last approved
finalItems.forEach(item => {
  const action = (item.UserAction || "").toLowerCase();
  if (action.includes("approve")) {
    lastApprovedSeq = Math.max(lastApprovedSeq, item.Sequence);
  }
});

// assign correct status
finalItems = finalItems.map(item => {
  const seq = item.Sequence;
  const action = (item.UserAction || "").toLowerCase();

  if (action.includes("approve")) return { ...item, UserAction: "Approved" };

  if (action.includes("reject")) return { ...item, UserAction: "Rejected" };

  if (seq === lastApprovedSeq + 1) {
    return { ...item, UserAction: "Pending" };
  }

  if (seq > lastApprovedSeq + 1) {
    return { ...item, UserAction: "Upcoming" };
  }

  return item;
});

  // ✅ STEP 6: RENDER
  return finalItems.map((item: any, index: number) => {

    const status = getTimelineStatus(item.UserAction);

    return (
      <div key={index} className={`${styles.timelineItem} ${(styles as any)[status]}`}>
        <div className={styles.timelineMarker}></div>

        <div className={styles.timelineContent}>
          <div className={styles.timelineStepTitle}>
            {item.Designation}
          </div>

          <div className={styles.timelineText}>
            <b>
              {item.Designation === "Request Initiator"
                ? "Initiator"
                : "Approver"}:
            </b>{" "}
            {item.UserName || "-"}
          </div>

          <div className={`${styles.timelineText} ${statusTextClassMap[status]}`}>
            <b>Status:</b> {item.UserAction}
          </div>

          {item.ActionDate && (
            <div className={styles.timelineText}>
              <b>Date:</b> {formatTimelineDate(item.ActionDate)}
            </div>
          )}
        </div>
      </div>
    );
  });

})()}

=======
          </div>
        </div>
      )}
      <div className={styles.container}>
        {/* LEFT FORM */}
        <div className={styles.header}>
          <h4>Quotation Request Approval Form</h4>
        </div>
        <div className={styles.row}>
          {/* LEFT FORM */}
          <div className={styles['col-md-9']}>
            <div className={styles.leftPanel}>
              <div className={styles.leftPanelHeader}>
                <label style={{ fontWeight: "bold" }}>Quotation Approval -{form.RequestNo} </label>
              </div>

              <label>Project Title</label>
              <input name="ProjectTitle" value={form.ProjectTitle} readOnly style={{ backgroundColor: "lightgray" }} />

              <label>Project Reference No</label>
              <input name="ProjectReffNo" value={form.ProjectReffNo} readOnly style={{ backgroundColor: "lightgray" }} >
              </input>

              <label>Project Description & Advance Payment Details</label>
              <input name="projectDescription" value={form.ProjectDescription} readOnly style={{ backgroundColor: "lightgray" }} >
              </input>

              <label>Total Project Amount</label>
              <input name="TotalProjectAmount" value={form.TotalProjectAmount} readOnly style={{ backgroundColor: "lightgray" }} />

              <label>Applicable Taxes</label>
              <input name="ApplicableTaxes" value={form.ApplicableTaxes} readOnly style={{ backgroundColor: "lightgray" }}  >
              </input>


              <div className={styles.twoColumnRow}>
                <div className={styles.fieldBlock}>
                  <label>Vendor 1 <span className={styles.required}>*</span></label>
                  <input name="Vendor1" value={form.Vendor1} readOnly style={{ backgroundColor: "lightgray" }} />
                </div>
                <div className={styles.fieldBlock}>
                  <label>Quote 1 <span className={styles.required}>*</span></label>
                  <input name="Quote1" value={form.Quote1} readOnly style={{ backgroundColor: "lightgray" }} />
                </div>
              </div>

              <div className={styles.twoColumnRow}>
                <div className={styles.fieldBlock}>
                  <label>Vendor 2</label>
                  <input name="Vendor2" value={form.Vendor2} readOnly style={{ backgroundColor: "lightgray" }} />

                </div>
                <div className={styles.fieldBlock}>
                  <label>Quote 2</label>
                  <input name="Quote2" value={form.Quote2} readOnly style={{ backgroundColor: "lightgray" }} />
                </div>
              </div>

              <div className={styles.twoColumnRow}>
                <div className={styles.fieldBlock}>
                  <label>Vendor 3</label>
                  <input name="Quote2" value={form.Quote3} readOnly style={{ backgroundColor: "lightgray" }} />
                </div>

                <div className={styles.fieldBlock}>
                  <label>Quote 3</label>
                  <input name="Quote3" value={form.Quote3} readOnly style={{ backgroundColor: "lightgray" }} />

                </div>
              </div>

              <label>Select Vendor</label>
              <input name="Selectedvendor" value={form.Selectedvendor} readOnly style={{ backgroundColor: "lightgray" }} />

              <label>Select Quote</label>
              <input name="SelectedQuote" value={form.SelectedQuote} readOnly style={{ backgroundColor: "lightgray" }} >
              </input>

              <label>Department</label>
              <input name="Department" value={form.Department} readOnly style={{ backgroundColor: "lightgray" }} >
              </input>

              <label>Advance Amount</label>
              <input name="AdvancePayment" value={form.Advancepayment} readOnly style={{ backgroundColor: "lightgray" }}>
              </input>

              <label>Approval Path</label>
              <input name="ApprovalPath" value={form.ApprovalPath} readOnly style={{ backgroundColor: "lightgray" }}>
              </input>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                <label>
                  Attachments <span className={styles.required}>*</span>
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", }}>
                  {attachments.map((file: any, index: number) => (
                    <a
                      key={index}
                      href={file.ServerRelativeUrl} target="_blank" rel="noopener noreferrer">
                      {file.FileName}
                    </a>
                  ))}
                </div>
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
                    <div>No purchase order details found.</div>
                  )}
                </div>
              </div>
              <label></label>
              <label></label>
              <div style={{ paddingBottom: "2%" }}>
                <label>Comments <span className={styles.required}>*</span></label>
                <input type='text' className="form-control" name="ApprovalComment" value={form.ApprovalComment} onChange={handleChange} />
              </div>
              {/* Buttons */}
              <div className={styles.buttonGroup}>
                <button className={styles.ApproveBtn} onClick={handleApprove} disabled={isDisabled}>Approve</button>
                <button className={styles.RejectBtn} onClick={handleReject} disabled={isDisabled}>Reject</button>
                <button className={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          </div>



          {/* RIGHT PANEL */}
          <div className={styles['col-md-3']}>
            <div className={styles.rightPanel}>
              <div className={styles.rightPanelHeader}>
                <h4>Timeline of the Request - {form.RequestNo}</h4>
              </div>
              <ul>
                {History.map((item, index) => {
                  const isApproved = item.UserAction === "Approved";
                  const isRejected = item.UserAction === "Rejected";
                  const isInitiated = item.UserAction === "Request Initiator";
                  const isUpcoming = item.UserAction === "Upcoming";
                  const isPending = item.UserAction === "Pending";
                  return (
                    <li
                      key={index}
                      className={
                        isApproved
                          ? styles.tickIcon
                          : isRejected
                            ? styles.crossIcon
                            : isInitiated ? styles.tickIcon : isUpcoming ? styles.upcomingIcon : isPending ? styles.pendingIcon : ""
                      }
                    >
                      <span className={styles.spanHeader} style={{ fontSize: "bold" }}>{item.Designation}</span>
                      <span><b>{isInitiated ? "Initiator" : "Approver Name:"} </b>{item.UserName}</span>
                      {item.UserAction && (
                        <span>
                          <b>Action Taken:{" "}</b>
                          <span
                            className={
                              isApproved
                                ? styles.apprStatus
                                : isRejected
                                  ? styles.rejStatus
                                  : isUpcoming ? styles.upcomingstatus : isPending ? styles.pendingstatus : ""
                            }
                          >
                            {item.UserAction}
                          </span>
                        </span>
                      )}
                      {item.ActionDate && (<span><b>Action Date: </b>
                        {new Date(item.ActionDate).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }).replace(',', ' AT')}
                      </span>
                      )}
                      {item.UserComment && <span><b>Comments:</b> {item.UserComment}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
>>>>>>> origin/shubhamCkbirla
          </div>
        </div>
      </div>
    </section>
  );
}


export default QaRequestApprovalForm;
