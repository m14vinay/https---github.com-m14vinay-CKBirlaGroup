import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="AllDocuments";
  private VendorMaster ="Master_VendorDetails";

  constructor(context: any) {
    this.context = context;
  }
  //Get Master Document Type Data
  public async getMasterDocument(): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }
  // Fetch the Record
  public async getItemByTitle(ID: string): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?$filter=ID eq ${ID}`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value.length > 0 ? data.value[0]: null;
  }
  // Get the Attachments from List
   public async getAttachments(itemId: number): Promise<any[]> {

  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${itemId})/AttachmentFiles`;

  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1,
  );

  const data = await res.json();

  return data.value; // array of attachments
}
}
