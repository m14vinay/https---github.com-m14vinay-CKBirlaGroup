import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="AllDocuments";
  private DocumentMaster ="Master_TypeofDocument";

  constructor(context: any) {
    this.context = context;
  }
  
  //Get Master Document Type Data
  public async getMasterDocument(): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.DocumentMaster}')/items`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }

  // Save the Record
  public async createItem(data: any): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items`;
    const body = {
      __metadata: { type: "SP.Data.VendorMappingListItem" },
      ...data
    };
    const response = await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          "Accept": "application/json;odata=nometadata",
          "Content-Type": "application/json;odata=nometadata"
        },
        body: JSON.stringify(body)
      }
    );
    return response.json();
  }

  
  // Upload Files

  public async uploadFile(itemId: number, file: File): Promise<void> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${itemId})/AttachmentFiles/add(FileName='${file.name}')`;

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
}
