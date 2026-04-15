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
  filters.push(`substringof('${parm_Title}', Title)`);
}

if (parm_GST) {
  filters.push(`substringof('${parm_GST}', GST)`);
}

if (parm_VendorCode) {
  const id = parm_VendorCode.includes('_')
    ? parm_VendorCode.split('_')[1]
    : parm_VendorCode;

  filters.push(`ID eq ${id}`); // ID should remain exact
}

if (parm_Tin) {
  filters.push(`substringof('${parm_Tin}', Tin)`);
}

if (parm_Pan) {
  filters.push(`substringof('${parm_Pan}', Pan)`);
}

// Combine filters
const filterQuery = filters.length > 0
  ? `$filter=${filters.join(" or ")}`
  : "";
  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?${filterQuery}`;
  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );
  const data = await res.json();
  return data ? data.value: []; // Return array of results or empty array if no matches
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
