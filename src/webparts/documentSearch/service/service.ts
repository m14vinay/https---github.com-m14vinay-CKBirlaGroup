import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="AllDocuments";
  private VendorMaster ="Master_VendorDetails";

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
  VendorName: string,
  BillAmount: string,
  Title: string,
  BillDate: string,
  BillNumber: string
): Promise<any[]> {
  let filters: string[] = [];
  if (VendorName) {
    filters.push(`VendorName eq '${VendorName}'`);
  }
  if (BillAmount) {
    filters.push(`BillAmount eq ${BillAmount}`);
  }
  if (Title) {
    filters.push(`Title eq '${Title}'`);
  }
  if (BillNumber) {
    filters.push(`BillNumber eq '${BillNumber}'`);
  }
  if (BillDate) {
    const date = new Date(BillDate);
    // start of day
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    // end of day
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    filters.push(
      `BillDate ge datetime'${start.toISOString()}' and BillDate lt datetime'${end.toISOString()}'`
    );
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
