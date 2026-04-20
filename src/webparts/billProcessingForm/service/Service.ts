import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private PoApproval = "PoApproval";
  private Departmentmaster = "DepartmentMaster";
  private FinanceController = "FinanceController";
  private HistoryList = "History";
  private BillProcessing = "BillProcessing";
  constructor(context: any) {
    this.context = context;
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
  // Save the Record
  public async createItem(data: any): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.BillProcessing}')/items`;
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
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.BillProcessing}')/items(${id})`;

    await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'IF-MATCH': '*',
          'X-HTTP-Method': 'MERGE',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
  }
  public async getItemByRequestNo(ID: Number): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.BillProcessing}')/items(${ID})?$select=*,Author/Id,Author/Title&$expand=Author`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const item = await res.json();

    return item;

  }
  public async getCheckBillNoExist(BillNo: string): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.BillProcessing}')/items?$filter=BillNo eq '${BillNo}'`;
    const res = await this.context.spHttpClient.get(      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value.length > 0 ? data : null;
  }
  // PO Request NO;
  public async getTotalAmountFromBillProcessingByPO(PORequestNo: string): Promise<number> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.BillProcessing}')/items?$select=*&$PORequestNo eq '${PORequestNo}'`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    const total = data.value.reduce((sum: number, item: any) => {
      const amount = parseFloat(item.TotalAmount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    return total;
  }
  // Get Data using PO Request No
  public async getDocumentDetailsID(RequestNo: string): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.PoApproval}')/items?$top=5000&$select=*&$filter=RequestNo eq '${RequestNo}'`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }
  //Get ProjectCode Data
  public async getRequestDetails(requestNo: string): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.PoApproval}')/items?$filter=ProjectCode eq '${requestNo}' and CurrentStatus eq 'Approved'`;

    console.log("URL:", url)
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await response.json();

    return data.value;
  }
  //Get ProjectCode Data
  public async getRequestDetailsbyPORequestNo(requestNo: string, PORequestNo: string): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.PoApproval}')/items?$filter=ProjectCode eq '${requestNo}' and RequestNo eq '${PORequestNo}' and CurrentStatus eq 'Approved'`;

    console.log("URL:", url)
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await response.json();

    return data.value;
  }
  // Upload Files
  public async uploadFile(itemId: number, file: File): Promise<void> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.BillProcessing}')/items(${itemId})/AttachmentFiles/add(FileName='${file.name}')`;

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
  }
  //GET Approver Name
  public async GetApprover(DepartmentName: string): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Departmentmaster}')/items
?$select=Id,Title,
Approval1/Id,Approval1/Title,
Approval2/Id,Approval2/Title,
Approval3/Id,Approval3/Title,
Approval4/Id,Approval4/Title,
Approval5/Id,Approval5/Title,
Departmenthead/Id,Departmenthead/Title
&$expand=Approval1,Approval2,Approval3,Approval4,Approval5,Departmenthead
&$filter=DepartmentName eq '${DepartmentName}'`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data.value[0] : null;
  }
  // Fetch the Files from List
  public async getAttachments(itemId: number): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.BillProcessing}')/items(${itemId})/AttachmentFiles`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          "Accept": "application/json;"
        }
      }
    );

    const data = await res.json();

    return data.value; // array of attachments
  }
  //Atatchments Delete
  public async deleteAttachmentFromSP(file: any): Promise<void> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/getfilebyserverrelativeurl('${file.ServerRelativeUrl}')`;

    await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          "IF-MATCH": "*",
          "X-HTTP-Method": "DELETE"
        }
      }
    );

  };
  ///Get User Details by ID
  public async getUserById(userId: number): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/getuserbyid(${userId})`;
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const user = await response.json();
    return user;
  }
  ///Get Approver from Finance Controller List
  public async GetApproverFromFinance(Category: string): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.FinanceController}')/items
?$select=Id,Title,
FinanceController/Id,FinanceController/Title,Billing2ndApprover/Id,Billing2ndApprover/Title
&$expand=FinanceController,Billing2ndApprover&$filter=DepartmentName eq '${Category}'`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data.value[0] : null;
  }
  public async getUser(): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data;
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
  // Get the History Record
  public async GetHistoryItem(ID: Number, FormCode: string): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items$filter=FID eq ${ID} and Title eq '${FormCode}'`;
    console.log("URL:", url)
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await response.json();
    return data.value;
  }
};
