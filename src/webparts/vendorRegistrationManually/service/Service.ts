import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="AllVendor";
  constructor(context: any) {
    this.context = context;
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
  // Fetch the Record
  public async getItemByID(ID: number): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?$filter=ID eq ${ID} and CurrentStatus eq 'Draft'`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data.value.length > 0 ? 1 : 0;
  }
  // UPdate the Item
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

// Delete
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

public checkGSTExists = async (gst: string,currentId?:number): Promise<boolean> => {

  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?$filter=GST eq '${gst}'`;

  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );

  const data = await res.json();
if (currentId) {
    return data.value.some((item: any) => item.Id !== currentId);
  }
  return data.value.length > 0;
};

public saveToSharePoint = async (items: any[]) => {
  const results: any[] = [];

  for (const item of items) {
    const gst = item.GST?.toString().trim();

    //  Skip empty GST
    if (!gst) continue;
  const isExists = await this.checkGSTExists(gst);
    // 🔥 GST check inside loop
    
    // Already exists → skip
    if (isExists) {
      console.log(`GST already exists: ${gst}`);
      alert("GST already exists");
      continue;
    }
  const utc_days = Math.floor(item.CommencementDate - 25569);
  const utc_value = utc_days * 86400; 

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items`;   
    const response = await this.context.spHttpClient.post(
      url,
     SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Title: item.Title,
      YearofEstablishment: item.YearofEstablishment,   
      GST:gst,
      CommencementDate: new Date(utc_value * 1000),
      Pan: item.Pan,
      Tin:item.Tin,
      CentralSalesTaxNo:item.CentralSalesTaxNo,
      ServiceTaxRegNo:item.ServiceTaxRegNo,
      NatureofService:item.NatureofService,
      MSMERegistrationNo:item.MSMERegistrationNo,
      ESICNo:item.ESICNo,
      ExciseRegisterNo:item.ExciseRegisterNo,
      WorkContractTaxNo:item.WorkContractTaxNo,
      FullAddress:item.FullAddress,
      TelephoneNo:item.TelephoneNo,
      FaxNo:item.FaxNo,
      EmailId:item.EmailId,
      ContactPerson:item.ContactPerson,
      RegFullAddress:item.RegFullAddress,
      RegTelephoneNo:item.RegTelephoneNo,
      RegFaxNo:item.RegFaxNo,
      RegEmailId:item.RegEmailId,
      RegContactPerson:item.RegContactPerson,
      Manufacturer:item.Manufacturer,
      AuthorizedAgent:item.AuthorizedAgent,
      Trader:item.Trader,
      ConsultingCompany:item.ConsultingCompany,
      Other:item.Other,
      ConstitutionofOrganization:item.ConstitutionofOrganization,
      Name:item.Name,
      Address:item.Address,
      ContactNo:item.ContactNo,
      Details:item.Details,
      BankName:item.BankName,
      BankAddress:item.BankAddress,
      NameinBankAccount:item.NameinBankAccount,
      BankAccountNo:item.BankAccountNo,
      BankIFSCMICRCode:item.BankIFSCMICRCode,
      CurrentStatus:'Completed'
          })
        }
    );
    const data = await response.json();
    results.push(data);
  }
  return results;
};

}
