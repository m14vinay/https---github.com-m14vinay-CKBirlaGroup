import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { useState } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SharePointContext } from '../../homeDashborad/components/SharePointContext';
import { SPHttpClient } from '@microsoft/sp-http-base';

const Dashboard: React.FC<IDashboardProps> = (props) => {
  const [quotationCount, setQuotationCount] = useState<number>(0);
  const [vendorMappingCount, setVendorMappingCount] = useState<number>(0);
  const [poApprovalCount, setPoApprovalCount] = useState<number>(0);
  const [billProcessingCount, setBillProcessingCount] = useState<number>(0);
  const [myData, setMyData] = useState<any[]>([]);
  const [myPendingData, setMyPendingData] = useState<any[]>([]);
  const { context } = props;
  const lists = ["QuotationApproval", "PoApproval", "ReimburseExpenseMaster", "BillProcessing", "VendorMapping", "QuotationApprovalNEIBTAdmin"];
  const getUser = async () => {
    try {
      const resturl = `${context.pageContext.web.absoluteUrl}/_api/web/currentuser`;

      const response = await context.spHttpClient.get(
        resturl,
        SPHttpClient.configurations.v1
      );

      const data = await response.json();
      console.log("Current User:", data);

      return data; // IMPORTANT
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  const getMyItemCount = async (
    listName: string,
    userId: number
  ) => {

    const resturl =
      `${context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${listName}')/items?$filter=AuthorId eq ${userId}`;

    const response = await context.spHttpClient.get(
      resturl,
      SPHttpClient.configurations.v1
    );

    const data = await response.json();
    switch (listName) {
      case "QuotationApproval":
        setQuotationCount(data.value.length);
        break;
      case "VendorMapping":
        setVendorMappingCount(data.value.length);
        break;
      case "PoApproval":
        setPoApprovalCount(data.value.length);
        break;
      case "BillProcessing":
        setBillProcessingCount(data.value.length);
        break;
      default:
        break;
    }
    console.log(listName, data.value.length);
  };
  const getmyData = async (listName: string,
    userId: number) => {
    console.log("context user : ", context);
    let resturl = `${context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${listName}')/items?$filter=AuthorId eq ${userId}&$top=5`;
    const response = await context.spHttpClient.get(
      resturl,
      SPHttpClient.configurations.v1
    );
    const data = await response.json();
     if (data && data.value && data.value.length > 0) {
        setMyData(prevData => [...prevData, ...data.value]);
      }
    }
  const getmypendingData = async (listName: string, user: any) => {
    console.log("context user : ", context);
    let resturl: string;
   if (listName === "QuotationApproval") {
  resturl =
    `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listName}')/items` +
    `?$select=*` +
    `&$filter=(AssignedTo eq '${user.Title}' or AssignedTo2 eq '${user.Title}') and (CurrentStatus eq 'Pending' or CurrentStatus eq 'Hold')` +
    `&$orderby=Created desc` +
    `&$top=5`;
} else {
  resturl =
    `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listName}')/items` +
    `?$select=*` +
    `&$filter=AssignedTo eq '${user.Title}' and (CurrentStatus eq 'Pending' or CurrentStatus eq 'Hold')` +
    `&$orderby=Created desc` +
    `&$top=5`;
}
    const response = await context.spHttpClient.get(
      resturl,
      SPHttpClient.configurations.v1
    );
      const data = await response.json();
       if (data && data.value && data.value.length > 0) {
          setMyPendingData(prevData => [...prevData, ...data.value]);
        }      
  }
  React.useEffect(() => {
    const loadData = async () => {
      const user = await getUser();
      await getMyItemCount("QuotationApproval", user?.Id);
      await getMyItemCount("VendorMapping", user?.Id);
      await getMyItemCount("PoApproval", user?.Id);
      await getMyItemCount("BillProcessing", user?.Id);
      lists.forEach(async (l) => {        
        await getmyData(l, user?.Id);
      })
      lists.forEach(async (l) => {
        await getmypendingData(l, user);       
      })
    };
    loadData();
  }, []);
  const cards = [
    { title: 'Quotation', count: quotationCount, className: styles.card1 },
    { title: 'Vendor Mapping', count: vendorMappingCount, className: styles.card2 },
    { title: 'PO Approval', count: poApprovalCount, className: styles.card3 },
    { title: 'Bill Processing', count: billProcessingCount, className: styles.card4 }
  ];
  return (
    <section>
      <div className={styles.container}>
        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          {cards.map((card, index) => (
            <div key={index} className={`${styles.summaryCard} ${card.className}`}>
              <h3>{card.title}</h3>
              <span>{card.count}</span>
            </div>
          ))}
        </div>

        {/* Panels */}
        <div className={styles.contentGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>My Requests</div>
            <div>
              {myData.sort(
      (a, b) =>
        new Date(b.Modified).getTime() -
        new Date(a.Modified).getTime()
    )
    .slice(0, 5).map((item) => (
                <div key={item.Id} className={styles.requestCard}>
                  <div>
                    <div>Request : {item.RequestNo}</div>
                    <div>Project Title : {item.ProjectTitle}</div>
                    <div>Total Amount : ₹{item.TotalAmount}</div>
                  </div>
                  <span
                    className={
                      item.CurrentStatus === "Pending"
                        ? styles.pending
                        : item.CurrentStatus === "Approved"
                          ? styles.approved
                          : styles.rejected
                    }
                  >
                    {item.CurrentStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>Workflow Status</div>
            <select className={styles.flowDropdown}>
              <option>Quotation Approval</option>
            </select>
            <div className={styles.chartArea}>
              Chart Area
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>Requests For Approval</div>
            <div>             
               {myPendingData.map((item) => (
                <div key={item.Id} className={styles.requestCard}>
                  <div>
                    <div>Request : {item.RequestNo}</div>
                    <div>Project Title : {item.ProjectTitle}</div>
                    <div>Total Amount : ₹{item.TotalAmount}</div>
                  </div>
                  <span className={styles.pending}>
                    {item.CurrentStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Dashboard;
