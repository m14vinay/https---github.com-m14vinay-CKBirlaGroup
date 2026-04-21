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
  // Fetch the Record
  public async getItemByTitle(BillNumber: string,BillDate:string): Promise<any> {
    let filters: string[] = [];
    if (BillDate) {
    // start of day
    const start = new Date(BillDate);
    start.setHours(0, 0, 0, 0);
    // end of day
    const end = new Date(BillDate);
    end.setHours(23, 59, 59, 999);
    filters.push(
      `Created ge datetime'${start.toISOString()}' and Created lt datetime'${end.toISOString()}'`
    );
  }

  // Combine filters
    const filterQuery = filters.length > 0 ? `$filter= BillNumber eq '${BillNumber}' and ${filters.join(" or ")}` : "";
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?${filterQuery}`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value.length > 0 ? 1 : 0;
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
