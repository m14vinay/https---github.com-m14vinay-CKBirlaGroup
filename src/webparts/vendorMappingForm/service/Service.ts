import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="VendorMapping";
  private Departmentmaster ="DepartmentMaster";
   private FetchList ="QuotationApproval";
  private VendorList="AllVendor";
    private HistoryList="History";
    private Approver="VendorMappingApproval";


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

  //Get Department Data
  public async getVendorApprover(): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Approver}')/items?$select=Id,Title,
Approver/Id,Approver/Title&$expand=Approver`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();

  return data.value?.[0] || null; 
    //return data.value.length > 0 ? data.value[0] : [];
  }

  //Get Vendor Data
  public async getVendor(): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.VendorList}')/items?$orderby=Created desc`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value;
  }


  public async getUserById(userId: number): Promise<any> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/getuserbyid(${userId})`;
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

  const user = await response.json();
  return user;
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

   const response = await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          "Accept": "application/json;",
          "Content-Type": "application/json;",
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE"
        },
        body: JSON.stringify(data)
      }
    );
    const updateText = await response.text();
    return updateText ? JSON.parse(updateText) : JSON.parse('{"success": true}');
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
  }

  public async getItemByProjectCode(requestNo: string): Promise<any> {
  
      const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?$filter=ProjectCode eq '${requestNo}'`;
      const res = await this.context.spHttpClient.get(
        url,
        SPHttpClient.configurations.v1
      );
  
      const item = await res.json();
     
     
    
    return item;
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
    // 🔹 Allowed file extensions
   
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
  

