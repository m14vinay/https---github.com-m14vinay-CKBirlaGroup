import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="QuotationApprovalNEIBTAdmin";
  private Departmentmaster ="DepartmentMaster";
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

  // Update the Record (Submit)
   public async updateItemdata(id: number,status:string, comments: string): Promise<void> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${id})`;

    await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          "Accept": "application/json;",
          "Content-Type": "application/json;",
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE"
        },
        body: JSON.stringify({
        CurrentStatus: status,
         ApproverComment1: comments
     })
      }
    );
  }



   // Fetch the Record
  public async getItemByRequestNo(ID: Number): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${ID})?$expand=AttachmentFiles`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const item = await res.json();
   
   if (item && item.Id) {
    return {
      Id: item.Id,
      ProjectTitle: item.ProjectTitle ,
        ProjectReffNo: item.ProjectReffNo ,
        ProjectDescription: item.ProjectDescription ,
        TotalProjectAmount: item.TotalProjectAmount ,
         ApplicableTaxes: item.ApplicableTaxes ,
          Vendor1: item.Vendor1 ,
      Vendor2: item.Vendor2 ,
      Vendor3: item.Vendor3 ,
      Quote1: item.Quote1 ,
      Quote2:item.Quote2 ,
      Quote3: item.Quote3 ,
      Selectedvendor: item.Selectedvendor ,
      SelectedQuote: item.SelectedQuote ,
      Department: item.Department ,
      Advancepayment: item.Advancepayment,
      ApprovalPath: item.ApprovalPath,
      Attachments: item.AttachmentFiles || [] // 👈 important
    };
  }

  return null;
};
  
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
 public async getAttachments(itemId: number): Promise<any[]> {

  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${itemId})/AttachmentFiles`;

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
}

