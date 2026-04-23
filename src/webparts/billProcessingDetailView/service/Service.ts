import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private HistoryList = "History";
  private BillProcessing = "BillProcessing";
    private Vendor="AllVendor";
  private EmailList="EmailToVendor";
  constructor(context: any) {
    this.context = context;
  }
  public async getItemByRequestNo(ID: Number): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.BillProcessing}')/items(${ID})?$select=*,Author/Id,Author/Title&$expand=Author`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const item = await res.json();
   
   return item;
   
  }
  // Fetch the Files from List
  public async getAttachments(itemId: number): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.BillProcessing}')/items(${itemId})/AttachmentFiles`;

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
  public async getUser(): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data;
  }
  // Get the History Record
  public async GetHistoryItem(ID: Number, FormCode: string): Promise<any> {
    const url =`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items?$filter=FID eq ${ID} and Title eq '${encodeURIComponent(FormCode)}'`; 
    console.log("URL:", url)
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await response.json();
    return data.value;
  }
  // GetVendorEmail
   public async getVendorEmailByVendorCode(VendorCode: string): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Vendor}')/items?$filter=VendorCode eq ${VendorCode}`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value.length > 0 ? data.value[0] : null;
  }
  //Create Send Email
   public async createEmailList(data: any): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.EmailList}')/items`;
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
};