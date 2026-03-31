import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="PoApproval";
  private Departmentmaster ="DepartmentMaster";
  private FetchList ="QuotationApproval";
  private VendorList="";

  constructor(context: any) {
    this.context = context;
  }
  
  //Get Department Data
  public async getDepartments(): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Departmentmaster}')/items`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }

  //Get Vendor Data
  public async getVendor(): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.VendorList}')/items`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }
  // GetList Item
private async getListItemType(): Promise<string> {
  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')?$select=ListItemEntityTypeFullName`;

  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );

  const data = await res.json();
  return data.ListItemEntityTypeFullName;
}
  // Save the Record
  public async createItem(data: any): Promise<any> {
    const itemType = await this.getListItemType();
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

  // Update the Record (Submit)
  public async updateItem(id: number, data: any): Promise<void> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${id})`;

    await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
            'IF-MATCH': '*',
            'X-HTTP-Method': 'MERGE',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(data)
      }
    );
  }

  // Fetch the Record
  public async getItemByRequestNo(requestNo: string): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?$filter=POrequestNo eq '${requestNo}'`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data.value[0] : null;
  }

 public async getRequestDetails (requestNo: string) :Promise<any> {
 
  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.FetchList}')/items?$filter=RequestNo eq '${requestNo}'`;

    console.log("URL:",url)  
  const response = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );

 const data = await response.json();

 return data.value;
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
  public async GetApprover(DepartmentName: string): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Departmentmaster}')/items
?$select=Id,Title,
Approval1/Id,Approval1/Title,
Approval2/Id,Approval2/Title,
Approval3/Id,Approval3/Title,
Approval4/Id,Approval4/Title,
Approval5/Id,Approval5/Title,
Departmenthead/Id,Departmenthead/Title
&$expand=Approval1,Approval2,Approval3,Approval4,Approval5,Departmenthead
&$filter=DepartmentName eq '${DepartmentName}'`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data.value[0] : null;
  }

}
