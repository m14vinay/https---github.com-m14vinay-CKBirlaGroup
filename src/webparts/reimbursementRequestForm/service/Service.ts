import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname = "ReimburseExpenseMaster";
  private Departmentmaster = "ReimburseDepartmentMaster";
  private ExpenseMaster = "ReimburseExpenseType";
  private VendorList = "AllVendor";
  private Document = "AllDocuments";
  private ReimburseExpenseTransaction = "ReimburseExpenseTransaction";
  private HistoryList = "History";
  private ReimbursementApproverMaster="ReimbursementApproverMaster";
  constructor(context: any) {
    this.context = context;
  }

  //GetApprover
  public async GetApproverReimbursement(ApproverType: string): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.ReimbursementApproverMaster}')/items
?$select=Id,Title,ApproverType,
ApproverName/Id,ApproverName/Title
&$expand=ApproverName
&$filter=ApproverType eq '${ApproverType}'`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data.value[0] : null;
  }
  //GetApprover
  public async GetApprover(DepartmentName: string): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Departmentmaster}')/items
?$select=Id,Title,
DepartmentHead/Id,DepartmentHead/Title
&$expand=DepartmentHead
&$filter=DepartmentName eq '${encodeURIComponent(DepartmentName)}'`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data.value[0] : null;
  }
  // Get DocumentbyID
  public async getDocumentbyID(UserID: number): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Document}')/items?$top=5000&$select=*&$filter=AuthorId eq ${UserID}`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }
  public async getDocumentDetailsID(Id: number): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Document}')/items?$top=5000&$select=*&$filter=Id eq ${Id}`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }
  //Get Department Data
  public async getDepartments(): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Departmentmaster}')/items`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }
  // Expense Master
  public async getExpense(): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.ExpenseMaster}')/items`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }

  //Get Vendor Data
  public async getVendor(): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.VendorList}')/items`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }

  // Save the Record
  public async createItem(data: any): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items`;
    const response = await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
    return response.json();
  }

  public async createExpenseItem(data: any): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.ReimburseExpenseTransaction}')/items`;
    const response = await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
    return response.json();
  }

  // Update the Record (Submit)
  public async updateItem(id: number, data: any): Promise<void> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${id})`;

    const response = await this.context.spHttpClient.post(
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
    const updateText = await response.text();
    return updateText ? JSON.parse(updateText) : JSON.parse('{"success": true}');
  }
  public async updateExpenseItem(id: number, data: any): Promise<void> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.ReimburseExpenseTransaction}')/items(${id})`;

   const response = await this.context.spHttpClient.post(
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
    const updateText = await response.text();
    return updateText ? JSON.parse(updateText) : JSON.parse('{"success": true}');
    
  }
  // Get Current User
  public async getUser(): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data;
  }
  // Fetch the Record
  public async getItemByRequestNo(ID: number): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?$filter=ID eq ${ID}`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data.value[0] : null;
  }
  public async getItemByRequestNoNotRejected(ID: number): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?$filter=ID eq ${ID} and CurrentStatus ne 'Rejected'`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data.value[0] : null;
  }
  public async getItemByExpenseData(ID: number): Promise<any> {

   const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.ReimburseExpenseTransaction}')/items?$select=*,AttachmentFiles&$expand=AttachmentFiles
&$filter=ReimursementLookup eq ${ID}`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data : null;
  }
  public async getCheckBillNoExist(BillNo: string): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}` +
    `/_api/web/lists/getbytitle('${this.ReimburseExpenseTransaction}')/items` +
    `?$filter=BillNo eq '${BillNo}'`;
    const res = await this.context.spHttpClient.get(      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value.length > 0 ? data : null;
  }
  // Upload Files
  public async uploadFile(itemId: number, file: File): Promise<void> {
    try
    {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.ReimburseExpenseTransaction}')/items(${itemId})/AttachmentFiles/add(FileName='${file.name}')`;

    const buffer = await file.arrayBuffer();
    await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
           "Accept": "application/json;odata=nometadata"
        },
        body: buffer
      }
    );
  }catch(error)
  {

  }
  }
  // Delete by ID
  public async deleteExpense(ID: number): Promise<boolean> {
    try {
      const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.ReimburseExpenseTransaction}')/items(${ID})`;
      const res = await this.context.spHttpClient.post(
        url,
        SPHttpClient.configurations.v1,
        {
          headers: {
            "IF-MATCH": "*",              // required
            "X-HTTP-Method": "DELETE"     // delete method
          }
        }
      );
      return res.ok; // true if deleted
    } catch (error) {
      console.error("Delete failed:", error);
      return false;
    }
  }
  // Save the Hitory Record
  public async createHistoryItem(data: any): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items`;
    const response = await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
    return response.json();
  }
}
