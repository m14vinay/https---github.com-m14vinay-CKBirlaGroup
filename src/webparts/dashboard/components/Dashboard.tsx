import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { useEffect, useState } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SharePointContext } from '../../homeDashborad/components/SharePointContext';
import { SPHttpClient } from '@microsoft/sp-http-base';
import { Pie } from 'react-chartjs-2';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { IconButton } from '@fluentui/react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Chart
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);
const Dashboard: React.FC<IDashboardProps> = (props) => {
  const [loading, setLoading] = React.useState(false);
  const [quotationCount, setQuotationCount] = useState<number>(0);
  const [vendorMappingCount, setVendorMappingCount] = useState<number>(0);
  const [poApprovalCount, setPoApprovalCount] = useState<number>(0);
  const [billProcessingCount, setBillProcessingCount] = useState<number>(0);
  const [myData, setMyData] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [myPendingData, setMyPendingData] = useState<any[]>([]);
  const [dataset, setDataset] = useState<number[]>([]);
  const [selectedFlow, setSelectedFlow] = React.useState("");
  const { context } = props;
  const lists = ["QuotationApproval", "PoApproval", "ReimburseExpenseMaster", "BillProcessing", "VendorMapping", "QuotationApprovalNEIBTAdmin"];
  const data = {
    labels: [
      `Approved (${dataset[0] || 0})`,
      `Rejected (${dataset[1] || 0})`,
      `Pending (${dataset[2] || 0})`
    ],
    datasets: [{
      data: dataset,
      backgroundColor: [
        '#F06773',
        '#F59Fa7',
        '#6B8AB4'
      ],
      hoverOffset: 4
    }]
  };
  const handleClick = (listname: string, Id: number) => {
    sessionStorage.setItem("DId", Id.toString());
    sessionStorage.setItem("CurrentStatus", "");
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Default.aspx?list=${listname}`;
    window.location.assign(url);
  };
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
  const getPieData = async (listName: string) => {
    const user = await getUser();
    let resturl = `${context.pageContext.web.absoluteUrl}` + `/_api/web/lists/getbytitle('${listName}')/items?$top=5000&$select=CurrentStatus,Id&$filter=AuthorId eq ${user?.Id}`;
    const response = await context.spHttpClient.get(
      resturl,
      SPHttpClient.configurations.v1
    );
    const data = await response.json();
    if (data && data.value && data.value.length > 0) {
      setItems(data.value);
    }
  }
  React.useEffect(() => {
    setLoading(true);
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
      // await getPieData("QuotationApproval");
    };
    loadData();
    setLoading(false);
  }, []);
  const getChartDataSet = () => {
    const Approved = items.filter(q => q.CurrentStatus === "Approved");
    const Rejected = items.filter(q => q.CurrentStatus === "Rejected");
    const IPending = items.filter(q => q.CurrentStatus === "Pending");

    setDataset([Approved.length, Rejected.length, IPending.length]);
  }
  useEffect(() => {
    getChartDataSet()
  }, [items]);
  const cards = [
    { title: 'Quotation', count: quotationCount, className: styles.card1, value: 'QuotationApproval' },
    { title: 'Vendor Mapping', count: vendorMappingCount, className: styles.card2, value: 'VendorMapping' },
    { title: 'PO Approval', count: poApprovalCount, className: styles.card3, value: 'PoApproval' },
    { title: 'Bill Processing', count: billProcessingCount, className: styles.card4, value: 'BillProcessing' }
  ];
  return (
    <section>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(255,255,255,0.6)',
          zIndex: 9999
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
            <Spinner label="Processing..." size={SpinnerSize.large} />
          </div>
        </div>
      )}
      <div className={styles.container}>
        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          {cards.map((card, index) => (
            <div key={index} className={`${styles.summaryCard} ${card.className}`}
              onClick={() => handleClick(card.value, 1)}>
              <h3>{card.title}</h3>
              <span>{card.count}</span>
            </div>
          ))}
        </div>

        {/* Panels */}
        <div className={styles.contentGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>My Requests
              <IconButton
                iconProps={{ iconName: 'BulletedList' }}
                className={styles.listIcon} style={{ marginLeft: '45%' }} onClick={() => handleClick('All', 1)}
              />
            </div>
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
                      onClick={() => {
                        sessionStorage.setItem("CurrentStatus", item.CurrentStatus);
                        sessionStorage.setItem("DId", '1');
                        window.location.href = `${props.context.pageContext.web.absoluteUrl}/SitePages/Default.aspx?list=All`;
                      }}
                    >
                      {item.CurrentStatus}                      
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              Workflow Status
            </div>
            <select className={styles.flowDropdown}
              onChange={(e) => getPieData(e.target.value)}>
              <option value="">Select Flow</option>
              {lists.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className={styles.chartArea}>
              {items.length > 0 && <Pie
                data={data}
                options={{
                  plugins: {
                    legend: {
                      position: "right",
                      labels: {
                        usePointStyle: true,
                        pointStyle: "circle"
                      }
                    }
                  }
                }} />}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>Requests For Approval
              <IconButton
                iconProps={{ iconName: 'BulletedList' }}
                className={styles.listIcon} style={{ marginLeft: '10%' }} onClick={() => handleClick('All', 2)}
              />
            </div>
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
