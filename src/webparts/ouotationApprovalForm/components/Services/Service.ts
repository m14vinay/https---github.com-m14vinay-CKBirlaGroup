import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {
    private context: any;
    private listname = "QuotationApproval";
    private purchaseOrderDetailsList = "PurchaseOrderDetails";
    private Departmentmaster = "DepartmentMaster";
    //private DepartmentmasterNEBT = "DepartmentMasterNEI";
    private HistoryList = "History";
    private VendorList = "";

    constructor(context: any) {
        this.context = context;
    }

    private async throwIfNotOk(response: Response, fallbackMessage: string): Promise<void> {
        if (response.ok) {
            return;
        }

        const errorText = await response.text();
        throw new Error(errorText || fallbackMessage);
    }

  private getJsonHeaders(extraHeaders?: { [key: string]: string }): { [key: string]: string } {
  return {
    'Accept': 'application/json;odata.metadata=minimal',
    'Content-Type': 'application/json;odata.metadata=minimal',
    ...extraHeaders
  };
}

    public async getDepartmentData(department: string) {
        const dept = department.trim().toLowerCase();

        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('DepartmentMaster')/items
  ?$select=*,Approval1/Id,Approval1/Title,Approval2/Id,Approval2/Title,Approval3/Id,Approval3/Title
  &$expand=Approval1,Approval2,Approval3
  &$filter=tolower(DepartmentName) eq '${dept}'`;

        const response = await this.context.spHttpClient.get(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders()
            }
        );

        const data = await response.json();
        return data.value;
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
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders()
            }
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
                headers: this.getJsonHeaders({
                    'Content-Type': 'application/json;odata=nometadata'
                }),
                body: JSON.stringify(data)
            }
        );
        await this.throwIfNotOk(response as unknown as Response, 'Create item failed');
        return response.json();
    }

    public async getPurchaseOrderDetails(quotationId: number): Promise<any[]> {
        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.purchaseOrderDetailsList}')/items?$filter=QuotationIdId eq ${quotationId}`;
        const res = await this.context.spHttpClient.get(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders()
            }
        );

        const data = await res.json();
        return data.value || [];
    }

    public async deletePurchaseOrderDetailsByQuotationId(quotationId: number): Promise<void> {
        const items = await this.getPurchaseOrderDetails(quotationId);

        for (const item of items) {
            const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.purchaseOrderDetailsList}')/items(${item.Id})`;
            const response = await this.context.spHttpClient.post(
                url,
                SPHttpClient.configurations.v1,
                {
                    headers: this.getJsonHeaders({
                        'IF-MATCH': '*',
                        'X-HTTP-Method': 'DELETE'
                    })
                }
            );

            await this.throwIfNotOk(response as unknown as Response, 'Delete purchase order detail failed');
        }
    }

    public async createPurchaseOrderDetail(data: any): Promise<any> {
        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.purchaseOrderDetailsList}')/items`;
        const response = await this.context.spHttpClient.post(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders({
                    'Content-Type': 'application/json;odata=nometadata'
                }),
                body: JSON.stringify(data)
            }
        );

        await this.throwIfNotOk(response as unknown as Response, 'Create purchase order detail failed');
        return response.json();
    }

    // Update the Record (Submit)
    public async updateItem(ID: number, data: any): Promise<void> {
        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${ID})`;

        const response = await this.context.spHttpClient.post(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders({
                    "Content-Type": "application/json;odata=nometadata",
                    "IF-MATCH": "*",
                    "X-HTTP-Method": "MERGE"
                }),
                body: JSON.stringify(data)
            }
        );
        await this.throwIfNotOk(response as unknown as Response, 'Update item failed');
    }

    // Fetch the Record
    public async getItemByRequestNo(ID: Number): Promise<any> {

        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${ID})?$expand=AttachmentFiles`;
        const res = await this.context.spHttpClient.get(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders()
            }
        );

        const item = await res.json();

        return item;

    }

    // Upload Files

    public async uploadFile(itemId: number, file: File): Promise<void> {
        const encodedFileName = encodeURIComponent(file.name);
        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${itemId})/AttachmentFiles/add(FileName='${encodedFileName}')`;

        const buffer = await file.arrayBuffer();

        const response = await this.context.spHttpClient.post(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders(),
                body: buffer
            }
        );

        await this.throwIfNotOk(response as unknown as Response, 'Upload file failed');
    }
    // Fetch the Files from List
    public async getAttachments(itemId: number): Promise<any[]> {

        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items(${itemId})/AttachmentFiles`;

        const res = await this.context.spHttpClient.get(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders()
            }
        );

        const data = await res.json();

        return data.value; // array of attachments
    }

    //Atatchments Delete
    public async deleteAttachmentFromSP(file: any): Promise<void> {

        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/getfilebyserverrelativeurl('${file.ServerRelativeUrl}')`;

        await this.context.spHttpClient.post(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders({
                    "IF-MATCH": "*",
                    "X-HTTP-Method": "DELETE"
                })
            }
        );

    };
    ///Get User Details by ID
    public async getUserById(userId: number): Promise<any> {

        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/getuserbyid(${userId})`;
        const response = await this.context.spHttpClient.get(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders()
            }
        );

        const user = await response.json();
        return user;
    }

    public async getDepartmentApprovers(department: string): Promise<any[]> {

        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Departmentmaster}')/items
?$select=DepartmentName,Advancepayment,
Approval1/Id,Approval1/Title,
Approval2/Id,Approval2/Title,
Approval3/Id,Approval3/Title
&$expand=Approval1,Approval2,Approval3
&$filter=tolower(DepartmentName) eq '${department.trim().toLowerCase()}'`;
        const res = await this.context.spHttpClient.get(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders()
            }
        );

        const data = await res.json();

        return data.value || [];
    }
    public async getUser(): Promise<any> {
        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser`;
        const res = await this.context.spHttpClient.get(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders()
            }
        );
        const data = await res.json();
        return data;
    }
    // Save the Hitory Record
    public async createHistoryItem(data: any): Promise<any> {
        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items`;
        const response = await this.context.spHttpClient.post(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders({
                    'Content-Type': 'application/json;odata=nometadata'
                }),
                body: JSON.stringify(data)
            }
        );
        await this.throwIfNotOk(response as unknown as Response, 'Create history failed');
        return response.json();
    }
    // Get the History Record
    public async GetHistoryItem(ID: Number, FormCode: string): Promise<any> {
        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.HistoryList}')/items?$filter=FID eq ${ID} and Title eq '${FormCode}'`;
        console.log("URL:", url)
        const response = await this.context.spHttpClient.get(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders()
            }
        );
        const data = await response.json();
        return data.value;
    }
    private async getListItemType(): Promise<string> {
        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')?$select=ListItemEntityTypeFullName`;

        const res = await this.context.spHttpClient.get(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders()
            }
        );

        const data = await res.json();
        return data.ListItemEntityTypeFullName;
    }

}
