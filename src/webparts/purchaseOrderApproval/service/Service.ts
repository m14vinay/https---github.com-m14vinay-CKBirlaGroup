import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="PoApproval";
  private Departmentmaster ="DepartmentMaster";
  private VendorList="VendorMapping";
  private FinanceController="FinanceController";
 private HistoryList="History";

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

 // Update the Record (Submit)
  public async updateItemdata(id: number,status:string, comments: string,AssignedToEmail:number,Assigned:string,): Promise<void> {
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
         AssignedToEmailId: AssignedToEmail,
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

  // Fetch the Files from List
   // Fetch the Files from List
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
  // Save the Hitory Record
    public async createHistoryItem(data: any): Promise<any> {
      const itemType = await this.getListItemType();
      const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items`;   
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
    // Get the History Record
    public async GetHistoryItem(ID:Number,FormCode:string): Promise<any> {
      const itemType = await this.getListItemType();
       const url =`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items?$filter=FID eq ${ID} and Title eq '${encodeURIComponent(FormCode)}'`;  
      console.log("URL:",url)  
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
   const data = await response.json();
   return data.value;
    }
     public async UpdateHistoryItem(
    id: number,
    data: any,
    Title: string,
    Sequence: number
  ): Promise<any> {

    const getUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items?$filter=FID eq ${id} and Title eq '${Title}' and Sequence eq ${Sequence}`;

    const getResponse = await this.context.spHttpClient.get(
      getUrl,
      SPHttpClient.configurations.v1
    );

    const getText = await getResponse.text();
    const result = getText ? JSON.parse(getText) : null;

    if (!result || !result.value || result.value.length === 0) {
      throw new Error("Item not found");
    }

    const itemId = result.value[0].Id;

    const updateUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items(${itemId})`;

    const updateResponse = await this.context.spHttpClient.post(
      updateUrl,
      SPHttpClient.configurations.v1,
      {
        headers: {
          "Accept": "application/json;odata=nometadata",
          "Content-Type": "application/json;odata=nometadata",
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE"
        },
        body: JSON.stringify(data)
      }
    );

    // ✅ FIX HERE
    const updateText = await updateResponse.text();
    return updateText ? JSON.parse(updateText) : { success: true };
  }
  
  }
  
  

