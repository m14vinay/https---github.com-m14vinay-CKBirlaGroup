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
  const { context } = props;
  let datamy: any[] = [];
  let datamypending: any[] = [];
  let counter = 0;
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
  const getmyData = (listName: string,
    userId: number) => {
    console.log("context user : ", context);
    let resturl = `${context.pageContext.web.absoluteUrl}` +
      `/_api/web/lists/getbytitle('${listName}')/items?$filter=AuthorId eq ${userId}&$top=5`;
    context.spHttpClient.get(
      `${resturl}`,
      SPHttpClient.configurations.v1
    ).then(res => res.json()).then(data => {
      console.log(listName, data);
      if (data.value.length > 0) {
        datamy = datamy.concat(...data.value);
      }
      counter++;
      if (counter === lists.length) {
      }
    }).catch(e => {
      console.log(e);
      counter++;
    })
  };
  const getmypendingData = (listName: string, user: any) => {
    console.log("context user : ", context);
    let resturl = {};
    if (listName === "QuotationApproval") {
      resturl = `${context.pageContext.web.absoluteUrl}` + "/_api/web/lists/getbytitle('" + listName + "')/items?$top=5000&$select=*&$filter=(AssignedTo eq '" + user.Title + "' or AssignedTo2 eq '" + user.Title + "') and (CurrentStatus eq 'Pending' or CurrentStatus eq 'Hold')&$top=5";
    }
    else {
      resturl = `${context.pageContext.web.absoluteUrl}` + "/_api/web/lists/getbytitle('" + listName + "')/items?$top=5000&$select=*&$filter=AssignedTo eq '" + user.Title + "' and (CurrentStatus eq 'Pending' or CurrentStatus eq 'Hold')&$top=5";
    }
    context.spHttpClient.get(
      `${resturl}`,
      SPHttpClient.configurations.v1
    ).then(res => res.json()).then(data => {
      console.log(listName, data);
      if (data.value.length > 0) {
        datamypending = datamypending.concat(...data.value);
      }
      counter++;
      if (counter === lists.length) {
      }
    }).catch(e => {
      console.log(e);
      counter++;
    })
  }
  React.useEffect(() => {
    const loadData = async () => {
      const user = await getUser();
      await getMyItemCount("QuotationApproval", user?.Id);
      await getMyItemCount("VendorMapping", user?.Id);
      await getMyItemCount("PoApproval", user?.Id);
      await getMyItemCount("BillProcessing", user?.Id);
      lists.forEach(l => {
        getmypendingData(l, user);
        getmyData(l, user?.Id);
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
        <h2>Dashboard</h2>
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
              {datamy.map((item) => (
                <div key={item.Id} className={styles.requestCard}>
                  <div>
                    <div>Request : {item.RequestNo}</div>
                    <div>Project Title : {item.ProjectTitle}</div>
                    <div>Total Amount : ₹{item.TotalAmount}</div>
                  </div>
                  <span
                    className={
                      item.Status === "Pending"
                        ? styles.pending
                        : item.Status === "Approved"
                          ? styles.approved
                          : styles.rejected
                    }
                  >
                    {item.Status}
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
               {datamypending.map((item) => (
                <div key={item.Id} className={styles.requestCard}>
                  <div>
                    <div>Request : {item.RequestNo}</div>
                    <div>Project Title : {item.ProjectTitle}</div>
                    <div>Total Amount : ₹{item.TotalAmount}</div>
                  </div>
                  <span
                    className={
                      item.Status === "Pending"
                        ? styles.pending:styles.pending
                    }
                  >
                    {item.Status}
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
