import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  constructor(context: any) {
    this.context = context;
  }

  // Fetch the Record
  public async getItemByTitle(listname:string): Promise<any[]> {
  let url:string = "";
 if(listname === "BillProcessing"){
     url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listname}')/items
?$select=*,
Author/Title,
Editor/Title,
Approver2/Title,
Approver3/Title,
Approver5/Title,
DepartmentHead/Title
&$expand=Author,Editor,Approver2,Approver3,Approver5,DepartmentHead&$filter=CurrentStatus eq 'Rejected'`;
  }
  if(listname === "PoApproval"){
    url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listname}')/items
?$select=*,
Author/Title,
Editor/Title,
Approver2/Title,
DepartmentHead/Title
&$expand=Author,Editor,Approver2,DepartmentHead&$filter=CurrentStatus eq 'Rejected'`;
  }
  if(listname === "VendorMapping")
  {
    url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listname}')/items
?$select=*,
Author/Title,
Editor/Title
&$expand=Author,Editor&$filter=CurrentStatus eq 'Rejected'`;
  }
  if(listname === "QuotationApproval")
  {
url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listname}')/items
?$select=*,
Approval1/Title,
Approval2/Title,
Approval3/Title,
Approval4/Title,
Approval5/Title,
Author/Title,
Editor/Title
&$expand=Author,Editor,Approval1,Approval2,Approval3,Approval4,Approval5&$filter=CurrentStatus eq 'Rejected'`;
  }
  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );
  const data = await res.json();
  return data.value.length > 0 ? data.value: []; // Return array of results or empty array if no matches
}
// Get User
 public async getUser(): Promise<any> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser`;
    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await res.json();
    return data;
  }

}
