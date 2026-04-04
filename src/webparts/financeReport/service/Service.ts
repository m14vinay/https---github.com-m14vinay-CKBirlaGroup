import { SPHttpClient } from '@microsoft/sp-http';
export default class Service {

  private context: any;
  private listname="BillProcessing";

  constructor(context: any) {
    this.context = context;
  }
  // Fetch the Record
  public async getItemByTitle(
  FromDate: string,
  ToDate: string
): Promise<any[]> {
  let filters: string[] = [];
  if (FromDate) {
    // start of day
    const start = new Date(FromDate);
    start.setHours(0, 0, 0, 0);

    // end of day
    const end = new Date(ToDate);
    end.setHours(23, 59, 59, 999);

    filters.push(
      `Created ge datetime'${start.toISOString()}' and Created lt datetime'${end.toISOString()}'`
    );
  }

  // Combine filters
  const filterQuery = filters.length > 0 ? `$filter=${filters.join(" or ")}` : "";
  const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listname}')/items?${filterQuery}`;
  const res = await this.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );
  const data = await res.json();
  return data.value.length > 0 ? data.value: []; // Return array of results or empty array if no matches
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

}
