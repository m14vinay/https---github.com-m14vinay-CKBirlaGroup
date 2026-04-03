import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="QuotationApprovalNEIBTAdmin";
  private Departmentmaster ="DepartmentMaster";
  private VendorList="";
private FinanceController="FinanceController";

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

  // // Update the Record (Submit)
  //  public async updateItemdata(id: number,status:string, comments: string): Promise<void> {
  //   const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${id})`;

  //   await this.context.spHttpClient.post(
  //     url,
  //     SPHttpClient.configurations.v1,
  //     {
  //       headers: {
  //         "Accept": "application/json;",
  //         "Content-Type": "application/json;",
  //         "IF-MATCH": "*",
  //         "X-HTTP-Method": "MERGE"
  //       },
  //       body: JSON.stringify({
  //       CurrentStatus: status,
  //        ApproverComment1: comments
  //    })
  //     }
  //   );
  // }

 //Update the Record (Submit)
  public async updateItemdata(id: number,status:string, comments: string,Assigned:string): Promise<void> {
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
         ApproverComment1: comments,
         ActionDate1: new Date().toISOString(),
         AssignedTo: Assigned
         //Approver2:approver2Name
         
         //Actiondate2: new Date().toISOString()
     })
      }
    );
  }




  public async updateItemdata2(id: number,status:string, comments: string,Assigned:string): Promise<void> {
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
         ApproverComment2: comments,
         ActionDate2: new Date().toISOString(),
         AssignedTo: Assigned
         
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
  
  return item;
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

// Get Approver from Department List
public async getApprover(DepartmentName: string): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Departmentmaster}')/items?$filter=DepartmentName eq '${DepartmentName}'`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data.value[0] : null;
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
  ///Get User Details by ID
public async getUserById(userId: number): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/getuserbyid(${userId})`;
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

  const user = await response.json();
  return user;
  }
  ///Get Approver from Finance Controller List
  public async GetApproverFromFinance(Category: string): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.FinanceController}')/items
?$select=Id,Title,
FinanceController/Id,FinanceController/Title
&$expand=FinanceController&$filter=FinananceControllerUser eq '${Category}'`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await res.json();
    return data.value.length > 0 ? data.value[0] : null;
  }
  };
  


