import { SPHttpClient } from '@microsoft/sp-http';

export default class Service {
    private context: any;
    private listname = 'QuotationApproval';
    private purchaseOrderDetailsList = 'PurchaseOrderDetails';
    private HistoryList = 'History';

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

    // Create the main quotation item.
    public async createItem(data: any): Promise<any> {
        const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items`;
        const response = await this.context.spHttpClient.post(
            url,
            SPHttpClient.configurations.v1,
            {
                headers: this.getJsonHeaders({
                    'Content-Type': 'application/json;odata=nometadata'
                }),
body: JSON.stringify({
  ...data,
  CurrentStep: 1 
})            }
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

    // Update the main quotation item.
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

    // Load one quotation item by list ID.
    public async getItemByRequestNo(ID: number): Promise<any> {

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

    // Upload a new attachment to the quotation item.
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
    // Load attachments linked to the quotation item.
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

        return data.value || [];
    }

    // Delete an existing attachment from SharePoint.
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
    }

    // Load the current SharePoint user.
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
    // Create one workflow history entry.
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

    // Load approvers for the given department from DepartmentMaster list.
public async getApproversByDepartment(department: string): Promise<any> {

  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('DepartmentMaster')/items?$select=DepartmentName,Departmenthead/Title,Approval1/Title,Approval2/Title,Approval3/Title,Approval4/Title&$expand=Departmenthead,Approval1,Approval2,Approval3,Approval4&$filter=DepartmentName eq '${department}'`;

  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );

  const data = await res.json();
  return data.value?.[0];
}

    // Load all departments from DepartmentMaster list for dropdown options.
 public async getAllDepartments(): Promise<any[]> {

  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('DepartmentMaster')/items?$select=DepartmentName,ActiveDepartment&$filter=ActiveDepartment eq 1`;

  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );

  const data = await res.json();
  return data.value || [];
}
}