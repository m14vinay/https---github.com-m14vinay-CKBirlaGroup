import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname = "BillProcessing";
  private HistoryList = "History";
  constructor(context: any) {
    this.context = context;
  }

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
  // Get Attachments
  public async getAttachments(itemId: number): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${itemId})/AttachmentFiles`;

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
  // Update History
  public async UpdateHistoryItem(id: number, data: any, Title: string, Sequence: number): Promise<any[]> {
    const getUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items?$filter=FID eq ${id} and Title eq '${Title}' and Sequence eq ${Sequence}`;

    const getResponse = await this.context.spHttpClient.get(
      getUrl,
      SPHttpClient.configurations.v1
    );
    const result = await getResponse.json();
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
    return updateResponse.json();
  }
}




