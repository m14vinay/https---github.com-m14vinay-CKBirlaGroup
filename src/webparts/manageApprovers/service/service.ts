import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
export default class Service {
  private context: any;
  constructor(context: any) {
    this.context = context;

  }

  // Fetch the Record
  public async getItemByTitle(listname: string, FormType: string): Promise<any[]> {
    let filters: string = "";
    if (listname == 'VendorMappingApproval' && FormType == 'Vendor Mapping') {
      filters = "$select=Id,Title,Approver/Id,Approver/Title,Approver/EMail&$expand=Approver";
    }
    else if (listname == 'DepartmentMaster' && FormType == 'Quotation Approval') {
      filters = "$select=Id,Title,DepartmentName,Approval1/Id,Approval1/Title,Approval1/EMail,Approval2/Id,Approval2/Title,Approval2/EMail,Approval3/Id,Approval3/Title,Approval3/EMail,Departmenthead/Id,Departmenthead/Title,Departmenthead/EMail&$expand=Approval1,Approval2,Approval3,Departmenthead";
    }
    else if (listname == 'FinanceController' && FormType == 'PO Approval') {
      filters = "$select=Id,Title,DepartmentName,FinanceController/Id,FinanceController/Title,FinanceController/EMail&$expand=FinanceController&$filter=FinananceControllerUser eq 'Internal Compliance' or FinananceControllerUser eq 'Issue To Vendor'";
    }
    else if (listname == 'FinanceController' && FormType == 'Bill Processing') {
      filters = "$select=Id,Title,DepartmentName,FinanceController/Id,FinanceController/Title,FinanceController/EMail,Billing2ndApprover/Id,Billing2ndApprover/Title,Billing2ndApprover/EMail&$expand=FinanceController,Billing2ndApprover&$filter=FinananceControllerUser ne 'Internal Compliance' and FinananceControllerUser ne 'Issue To Vendor'";
    }
    else if (listname == 'DepartmentMasterNEI' && FormType == 'Quotation Approval NEI BT') {
      filters = "$select=Id,Title,DepartmentName,Approval1/Id,Approval1/Title,Approval1/EMail,Approval2/Id,Approval2/Title,Approval2/EMail,Approval3/Id,Approval3/Title,Approval3/EMail,Departmenthead/Id,Departmenthead/Title,Departmenthead/EMail&$expand=Approval1,Approval2,Approval3,Departmenthead";
    }
    else if (listname == 'ReimburseDepartmentMaster' && FormType == 'Reimbursement Department Master') {
      filters = "$select=Id,Title,DepartmentName,DepartmentHead/Id,DepartmentHead/Title,DepartmentHead/EMail&$expand=DepartmentHead";
    }
    else if (listname == 'ReimbursementApproverMaster' && FormType == 'Reimbursement Finance Master') {
      filters = "$select=Id,Title,ApproverType,ApproverName/Id,ApproverName/Title,ApproverName/EMail&$expand=ApproverName";
    }
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listname}')/items?${filters}`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value.length > 0 ? data.value : []; // Return array of results or empty array if no matches
  }
  // Get User
  public async getUser(): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data;
  }

  // Update Record
  public async updateItem(id: number, data: any, listname: string): Promise<void> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listname}')/items(${id})`;

    await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          "Accept": "application/json;odata=nometadata",
          "Content-Type": "application/json;odata=nometadata",
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE"
        },
        body: JSON.stringify(data)
      }
    );
    return data;
  }
  //GetUserByID
  public async getUserByLogOnName(logonName: string): Promise<any> {
    const userResponse = await this.context.spHttpClient.post(
      `${this.context.pageContext.web.absoluteUrl}/_api/web/ensureuser`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logonName: logonName
        })
      }
    );
    const userData = await userResponse.json();
    return userData.Id;
  }
  public async getUserExists(): Promise<boolean> {
      var isMember = false;
      try {
        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser?$expand=groups`;
        const response: SPHttpClientResponse = await this.context.spHttpClient.get(
          url,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=nometadata'
            }
          }
        );
        const data = await response.json();
        isMember = data.Groups.some((g: any) => g.Title === "User Change Access");
        if (isMember) {
          isMember = true;
        }
        else {
          isMember = false;
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        return false;
      }
      return isMember;
    }
}
