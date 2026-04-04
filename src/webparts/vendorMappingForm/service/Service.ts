import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="VendorMapping";
  private Departmentmaster ="DepartmentMaster";
   private FetchList ="QuotationApproval";
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
          "Accept": "application/json;odata=nometadata",
          "Content-Type": "application/json;odata=nometadata",
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE"
        },
        body: JSON.stringify(data)
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
        ProjectCode: item.ProjectCode,
        ProjectTitle: item.ProjectTitle,
        ProjectDescription: item.ProjectDescription,
        VendorName: item.VendorName,
        VendorDescription: item.VendorDescription, // 👈 check column name
        Attachments: item.AttachmentFiles || [],
        CurrentStatus:item.CurrentStatus  // 👈 important
      };
    }
  
    return null;
  }


// Fetch QuotationApproval Record
  public async getRequestDetails (requestNo: string) :Promise<any> {
  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.FetchList}')/items?$filter=RequestNo eq '${requestNo}'`;
  console.log("URL:",url)  
  const response = await this.context.spHttpClient.get(
    url,SPHttpClient.configurations.v1
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
          "Accept": "application/json;"
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
 public async deleteAttachmentFromSP(file: any) : Promise<void> {
  
     const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/getfilebyserverrelativeurl('${file.ServerRelativeUrl}')`;

    await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          "IF-MATCH": "*",
          "X-HTTP-Method": "DELETE"
        }
      }
    );

};

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
      const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items$filter=FID eq ${ID} and Title eq '${FormCode}'`;   
      console.log("URL:",url)  
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
   const data = await response.json();
   return data.value;
    }
  
  }
  

