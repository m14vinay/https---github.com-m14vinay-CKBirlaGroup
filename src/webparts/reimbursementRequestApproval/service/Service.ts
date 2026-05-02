import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname = "ReimburseExpenseMaster";
  private ReimburseExpenseTransaction = "ReimburseExpenseTransaction";
  private HistoryList = "History";
  constructor(context: any) {
    this.context = context;
  }
  // Get History Item
  public async GetHistoryItem(ID: Number, FormCode: string): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items?$filter=FID eq ${ID} and Title eq '${encodeURIComponent(FormCode)}'`;
    console.log("URL:", url)
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
  // GetUserByID
  public async getUserById(userId: number): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/getuserbyid(${userId})`;
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const user = await response.json();
    return user;
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

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.ReimburseExpenseTransaction}')/items?$select=*,AttachmentFiles&$expand=AttachmentFiles
&$filter=ReimursementLookup eq ${ID}`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data : null;
  }
  // Update Approved and Reject
  public async updateItem(id: number, data: any): Promise<any[]> {
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
    return response.json();
  }
  // Create History
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
  // Update History Item
  public async UpdateHistoryItem(
    id: number,
    data: any,
    Title: string,
    Sequence: number
  ): Promise<any> {

    const getUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items?$filter=FID eq ${id} and Title eq '${Title}' and Sequence eq ${Sequence}`;

    const getResponse = await this.context.spHttpClient.get(
      getUrl,
      SPHttpClient.configurations.v1
    );

    const getText = await getResponse.text();
    const result = getText ? JSON.parse(getText) : null;

    if (!result || !result.value || result.value.length === 0) {
      throw new Error("Item not found");
    }

    const itemId = result.value[0].Id;

    const updateUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items(${itemId})`;

    const updateResponse = await this.context.spHttpClient.post(
      updateUrl,
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

    // ✅ FIX HERE
    const updateText = await updateResponse.text();
    return updateText ? JSON.parse(updateText) : { success: true };
  }
}
