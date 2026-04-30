import { SPHttpClient } from '@microsoft/sp-http';
import { sp } from "@pnp/sp/presets/all";
export default class Service {

  private context: any;
  private listname="ReimburseExpenseMaster";

  constructor(context: any) {
    this.context = context;
  }
  // Fetch the Record
  public async getItemByTitle(
  FromDate: string,
  ToDate: string
): Promise<any[]> {

  try {

    // ✅ Parse dd-MM-yyyy safely
    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split("-");
      return new Date(`${year}-${month}-${day}`);
    };

    const start = parseDate(FromDate);
    start.setHours(0, 0, 0, 0);

    const end = parseDate(ToDate);
    end.setHours(23, 59, 59, 999);

    const camlQuery = `
      <View>
        <Query>
          <Where>
            <And>
              <Geq>
                <FieldRef Name='Created' />
                <Value Type='DateTime' IncludeTimeValue='TRUE'>
                  ${start.toISOString()}
                </Value>
              </Geq>
              <Leq>
                <FieldRef Name='Created' />
                <Value Type='DateTime' IncludeTimeValue='TRUE'>
                  ${end.toISOString()}
                </Value>
              </Leq>
            </And>
          </Where>
        </Query>
        <RowLimit>200</RowLimit>
      </View>`;
    const items = await sp.web.lists
      .getByTitle(this.listname)
      .getItemsByCAMLQuery({ ViewXml: camlQuery });

    return items || [];

  } catch (error) {
    console.error("Error:", error);
    return [];
  }
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
