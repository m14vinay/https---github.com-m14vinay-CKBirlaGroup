import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="BillProcessingRepository";

  constructor(context: any) {
    this.context = context;
  }
  // Fetch the Record
  public async getItemByTitle(
): Promise<any[]> {
  let filters: string[] = [];
  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?$select=ID,LinkFilename,FileRef,ProjectCode,BillProcessingNumber,CheckoutUserId&$filter=CheckoutUserId eq null`;
  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );
  const data = await res.json();
  return data.value.length > 0 ? data.value: []; // Return array of results or empty array if no matches
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

}
