import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="QuotationApprovalNEIBTAdmin";
  private Departmentmaster ="DepartmentMaster";
  private DepartmentmasterNEBT ="DepartmentMasterNEI";
   private HistoryList="History";
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

  public async getDepartmentsNeiBT(): Promise<any[]> {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.DepartmentmasterNEBT}')/items`;

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
  public async updateItem(ID: number, data: any): Promise<void> {
     const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${ID})`;

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
     
     return item;
     
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
  
  //Atatchments Delete
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

   public async getDepartmentApprovers(department: string, advance: string): Promise<any[]> {

  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.DepartmentmasterNEBT}')/items
?$select=DepartmentName,Advancepayment,
Approval1/Id,Approval1/Title,
Approval2/Id,Approval2/Title,
Approval3/Id,Approval3/Title
&$expand=Approval1,Approval2,Approval3
&$filter=DepartmentName eq '${department}' and Advancepayment eq '${advance}'`;

  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );

  const data = await res.json();

  return data.value || [];
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