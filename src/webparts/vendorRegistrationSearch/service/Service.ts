import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="AllVendor";

  constructor(context: any) {
    this.context = context;
  }
  //Get Master Document Type Data
  public async getMasterDocument(UserID:number): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?$top=5000&$select=*&$filter=AuthorId eq ${UserID}`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }
  // Fetch the Record
  public async getItemByTitle(
  parm_Title: string,
  parm_GST: string,
  parm_Pan: string,
  parm_VendorCode: string,
  parm_Tin: string
): Promise<any[]> {
  let filters: string[] = [];
  if (parm_Title) {
    filters.push(`Title eq '${parm_Title}'`);
  }
  if (parm_GST) {
    filters.push(`GST eq '${parm_GST}'`);
  }
  if (parm_VendorCode) {
    filters.push(`ID eq ${parm_VendorCode.split('_')[1]}`);
  }
  if (parm_Tin) {
    filters.push(`Tin eq '${parm_Tin}'`);
  }
  if (parm_Pan) {
    filters.push(`Pan eq '${parm_Pan}'`);
  }
  // Combine filters
  const filterQuery = filters.length > 0 ? `$filter=${filters.join(" or ")}` : "";
  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?${filterQuery}`;
  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );
  const data = await res.json();
  return data.value.length > 0 ? data.value[0]: []; // Return array of results or empty array if no matches
}
  // Get the Attachments from List
   public async getAttachments(itemId: number): Promise<any[]> {

  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${itemId})/AttachmentFiles`;

  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1,
  );

  const data = await res.json();

  return data; // array of attachments
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
