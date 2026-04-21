import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
   private listname="VendorMapping";
  private Departmentmaster ="DepartmentMaster";
  private VendorList="";
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
  public async updateItem(ID: number, comments: any): Promise<void> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${ID})`;


    await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          "Accept": "application/json;odata=nometadata",
          "Content-Type": "application/json;odata=nometadata",
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE"
        },
        
        body: JSON.stringify({
        ApproverComment: comments  // 👈 column name same hona chahiye
      })
      }
    );
  }

  // Update the Record (Submit)
  public async updateItemdata(id: number,status:string, comments: string,AssignedStatus: string ): Promise<void> {
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
         ApproverComment: comments,
         AssignedTo:AssignedStatus,
         Actiondate1: new Date().toISOString()
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
      RequestNo: item.RequestNo,
      ProjectCode: item.ProjectCode,
      ProjectTitle: item.ProjectTitle,
      ProjectDescription: item.ProjectDescription,
      VendorName: item.VendorName,
      VendorDescription: item.VendorDescription,
      ApproverComments: item.ApproverComments, // 👈 check column name
      Attachments: item.AttachmentFiles || [],
      CurrentStatus:item.CurrentStatus ,// 👈 important
      Actiondate1 : item.Actiondate1,
      AssignedTo : item.AssignedTo
    };
  }

  return null;
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
  // Save the Hitory Record
    // Update History Item
    public async UpdateHistoryItem(id: number, data: any, Title: string, Sequence: number): Promise<any[]> {
    const getUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items?$filter=FID eq ${id} and Title eq '${Title}' and Sequence eq ${Sequence}`;

    const getResponse = await this.context.spHttpClient.get(
      getUrl,
      SPHttpClient.configurations.v1
    );
    const result = await getResponse.json();
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
    return updateResponse.json();
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
  }
  


  


