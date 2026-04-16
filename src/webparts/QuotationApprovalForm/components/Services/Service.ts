import { SPHttpClient } from '@microsoft/sp-http';

export default class Service {
    private context: any;
    private listname = 'QuotationApproval';
    private purchaseOrderDetailsList = 'PurchaseOrderDetails';
    private HistoryList = 'History';
    private Department = 'DepartmentMaster';

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
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
    );
    if (!response.ok) {
  const error = await response.text();
  console.error("API ERROR:", error);
  throw new Error(error);
}

return await response.json();
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
public async getDepartmentApprovers(department: string): Promise<any[]> {
 const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.Department}')/items
?$select=Id,Title,
Approval1/Id,Approval1/Title,
Approval2/Id,Approval2/Title,
Approval3/Id,Approval3/Title,
Approval4/Id,Approval4/Title,
Approval5/Id,Approval5/Title,
Departmenthead/Id,Departmenthead/Title
&$expand=Approval1,Approval2,Approval3,Approval4,Approval5,Departmenthead
&$filter=DepartmentName eq '${department}'`;
  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );

  const data = await res.json();

  return data.value || [];
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
    // Upload a new attachment to the quotation item.
   
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
public async getApproversByDepartment(department: string): Promise<any[]> {

  const dept = department.trim().toLowerCase();

const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('DepartmentMaster')/items
?$select=DepartmentName,
Approval1/Title,Approval1/Id,
Approval2/Title,Approval2/Id,
Approval3/Title,Approval3/Id,
Approval4/Title,Approval4/Id
&$expand=Approval1,Approval2,Approval3,Approval4`;

  console.log("FINAL API URL:", url);

  const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
  const data = await res.json();

  console.log("FINAL API RESULT:", data);

  return data.value || [];
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

// Resolve a user by email, used for setting approver fields in the list item.
public async getUserByEmail(email: string): Promise<any> {

  const body = JSON.stringify({
    logonName: email
  });

  const res = await this.context.spHttpClient.post(
    `${this.context.pageContext.web.absoluteUrl}/_api/web/ensureuser`,
    SPHttpClient.configurations.v1,
    {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json'
      },
      body: body
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to resolve user");
  }

  return await res.json();
}
}