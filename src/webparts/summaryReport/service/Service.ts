import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  constructor(context: any) {
    this.context = context;
  }

  // Fetch the Record
  public async getItemByTitle(listname:string): Promise<any[]> {
  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listname}')/items`;
  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );
  const data = await res.json();
  return data.value.length > 0 ? data.value: []; // Return array of results or empty array if no matches
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

}
