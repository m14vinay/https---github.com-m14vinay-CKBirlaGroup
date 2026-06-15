import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import { escape } from '@microsoft/sp-lodash-subset';

const Dashboard: React.FC<IDashboardProps> = (props) => {

  const cards = [
    { title: 'Quotation', count: 30, className: styles.card1 },
    { title: 'Vendor Mapping', count: 30, className: styles.card2 },
    { title: 'PO Approval', count: 30, className: styles.card3 },
    { title: 'Bill Processing', count: 30, className: styles.card4 }
  ];
  const menuItems = [
    { title: "Dashboard", url: "#" },
    { title: "Forms", url: "#" },
    { title: "Approval NEIBT", url: "#" },
    { title: "AP Reports", url: "#" },
    { title: "NEIBT Admin Reports", url: "#" },
    { title: "Reimbursement", url: "#" },
    { title: "Expense Reports", url: "#" }
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
            <div className={styles.requestCard}>
              <div>
                <div>Request : PRJ-1100</div>
                <div>Project Title : Project Title</div>
                <div>Total Amount : ₹100000</div>
              </div>
              <span className={styles.pending}>Pending</span>
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
            <div className={styles.requestCard}>
              <div>
                <div>Request : PRJ-1100</div>
                <div>Project Title : Project Title</div>
                <div>Total Amount : ₹100000</div>
              </div>
              <span className={styles.pending}>Pending</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Dashboard;
