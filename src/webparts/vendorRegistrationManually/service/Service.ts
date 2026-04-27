import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname = "AllVendor";
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

  public async getUser(): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data;
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
  public getUniqueFileName = (file: File): string => {
    const timestamp = new Date().getTime();
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    const name = file.name.replace(ext, '');

    return `${name}_${timestamp}${ext}`;
  };
  // Upload Files

  public async uploadFile(itemId: number, file: File): Promise<void> {
    const uniqueFileName = this.getUniqueFileName(file);
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${itemId})/AttachmentFiles/add(FileName='${uniqueFileName}')`;

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
  public async deleteAttachmentFromSP(file: any): Promise<void> {

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

  public checkGSTExists = async (gst: string, currentId?: number): Promise<boolean> => {

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
  public checkPanExists = async (Pan: string, currentId?: number): Promise<boolean> => {

    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?$filter=Pan eq '${Pan}'`;

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

  public toSafeString = (value: any): string => {
    return value ? value.toString() : "";
  };
  public saveToSharePoint = async (items: any[]) => {
    const results: any[] = [];

    for (const item of items) {
      const gst = item.GST?.toString().trim();
      const Pan = item.Pan?.toString().trim();
      if (gst != undefined) {
        const IsValid = this.validateGST(gst);
        if (!IsValid) {
          console.log(`Please enter valid GST No.: ${gst}`);
          alert("Please enter valid GST No.");
          return;
        }
        const isExists = await this.checkGSTExists(gst);
        if (isExists) {
          console.log(`GST already exists: ${gst}`);
          alert("GST already exists");
          return;
        }
      }
      if (Pan !== undefined) {
        const ispanExists = await this.checkPanExists(Pan);
        if (ispanExists) {
          console.log(`Pan already exists: ${Pan}`);
          alert("Pan No already exists");
          return;
        }
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
            Title: this.toSafeString(item.Title),
            YearofEstablishment: this.toSafeString(item.YearofEstablishment),
            GST: this.toSafeString(gst),
            CommencementDate: new Date(utc_value * 1000),
            Pan: this.toSafeString(item.Pan),
            Tin: this.toSafeString(item.Tin),
            CentralSalesTaxNo: this.toSafeString(item.CentralSalesTaxNo),
            ServiceTaxRegNo: this.toSafeString(item.ServiceTaxRegNo),
            NatureofService: this.toSafeString(item.NatureofService),
            MSMERegistrationNo: this.toSafeString(item.MSMERegistrationNo),
            ESICNo: this.toSafeString(item.ESICNo),
            ExciseRegisterNo: this.toSafeString(item.ExciseRegisterNo),
            WorkContractTaxNo: this.toSafeString(item.WorkContractTaxNo),
            FullAddress: this.toSafeString(item.FullAddress),
            TelephoneNo: this.toSafeString(item.TelephoneNo),
            FaxNo: this.toSafeString(item.FaxNo),
            EmailId: this.toSafeString(item.EmailId),
            ContactPerson: this.toSafeString(item.ContactPerson),
            RegFullAddress: this.toSafeString(item.RegFullAddress),
            RegTelephoneNo: this.toSafeString(item.RegTelephoneNo),
            RegFaxNo: this.toSafeString(item.RegFaxNo),
            RegEmailId: this.toSafeString(item.RegEmailId),
            RegContactPerson: this.toSafeString(item.RegContactPerson),
            Manufacturer: this.toSafeString(item.Manufacturer),
            AuthorizedAgent: this.toSafeString(item.AuthorizedAgent),
            Trader: this.toSafeString(item.Trader),
            ConsultingCompany: this.toSafeString(item.ConsultingCompany),
            Other: this.toSafeString(item.Other),
            ConstitutionofOrganization: this.toSafeString(item.ConstitutionofOrganization),
            Name: this.toSafeString(item.Name),
            Address: this.toSafeString(item.Address),
            ContactNo: this.toSafeString(item.ContactNo),
            Details: this.toSafeString(item.Details),
            BankName: this.toSafeString(item.BankName),
            BankAddress: this.toSafeString(item.BankAddress),
            NameinBankAccount: this.toSafeString(item.NameinBankAccount),
            BankAccountNo: this.toSafeString(item.BankAccountNo),
            BankIFSCMICRCode: this.toSafeString(item.BankIFSCMICRCode),
            CurrentStatus: 'Completed'
          })
        }
      );
      const data = await response.json();
      results.push(data);
    }
    return results;
  };

  public validateGST = (value: string): boolean => {
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(value.toUpperCase());
  };
}
