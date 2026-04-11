import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname = "ReimburseExpenseMaster";
  private Departmentmaster = "DepartmentMaster";
  private ExpenseMaster = "ReimburseExpenseType";
  private VendorList = "AllVendor";
  private Document = "AllDocuments";
  private ReimburseExpenseTransaction = "ReimburseExpenseTransaction";
  private HistoryList = "History";
  private ReimbursementApproverMaster="ReimbursementApproverMaster";
  constructor(context: any) {
    this.context = context;
  }
  // Get History Item
  public async GetHistoryItem(ID:Number,FormCode:string): Promise<any> {
      const url =`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items?$filter=FID eq ${ID} and Title eq '${encodeURIComponent(FormCode)}'`;   
      console.log("URL:",url)  
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
   const data = await response.json();
   return data.value;
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
  public async getItemByExpenseData(ID: number): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.ReimburseExpenseTransaction}')/items?$filter=ReimursementLookup eq ${ID}`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data : null;
  }
}
