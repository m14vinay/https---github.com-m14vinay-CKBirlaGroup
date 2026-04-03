import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="QuotationApprovalNEIBTAdmin";
  private Departmentmaster ="DepartmentMaster";
  private DepartmentmasterNEBT ="DepartmentMasterNEI";
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
}