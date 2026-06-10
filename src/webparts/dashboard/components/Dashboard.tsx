import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class Dashboard extends React.Component<IDashboardProps> {
  public render(): React.ReactElement<IDashboardProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;
 const cards = [
    { title: 'Quotation', count: 30, className: styles.card1 },
    { title: 'Vendor Mapping', count: 30, className: styles.card2 },
    { title: 'PO Approval', count: 30, className: styles.card3 },
    { title: 'Bill Processing', count: 30, className: styles.card4 }
  ];
    return (
      <section>
        <div className={styles.container}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logo}>DIGIFLOW</div>

            <div className={styles.headerRight}>
              <select className={styles.dropdown}>
                <option>Select Company</option>
              </select>

              <div className={styles.userInfo}>
                <div className={styles.avatar}></div>
                <span>M.Ponnamalai</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className={styles.navbar}>
            <a href="#">Dashboard</a>
            <a href="#">Forms</a>
            <a href="#">Approval NEIBT</a>
            <a href="#">AP Reports</a>
            <a href="#">NEIBT Admin Reports</a>
            <a href="#">Reimbursement</a>
            <a href="#">Expense Reports</a>
          </div>

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
                  <p>Request : PRJ-1100</p>
                  <p>Project Title : Project Title</p>
                  <p>Total Amount : ₹100000</p>
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
                  <p>Request : PRJ-1100</p>
                  <p>Project Title : Project Title</p>
                  <p>Total Amount : ₹100000</p>
                </div>

                <span className={styles.pending}>Pending</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    );
  }
}
