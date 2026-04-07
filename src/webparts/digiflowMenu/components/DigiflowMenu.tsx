import * as React from 'react';
import styles from './DigiflowMenu.module.scss';
import type { IDigiflowMenuProps } from './IDigiflowMenuProps';
import { escape } from '@microsoft/sp-lodash-subset';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
const HomeIcon = require('../assets/Home.png');
const FormIcon = require('../assets/Form.png');
const ReportIcon = require('../assets/Report.png');
import 'bootstrap/dist/css/bootstrap.min.css';

export default class DigiflowMenu extends React.Component<IDigiflowMenuProps> {
  public render(): React.ReactElement<IDigiflowMenuProps> {
    const {
      context
    } = this.props;

    let webUrl = context.pageContext.web.absoluteUrl;
    return (
      <div>
        <Navbar expand="lg" bg='light' className="bg-body-tertiary">
          <Container>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href={webUrl + "/SitePages/Dashboard.aspx"}>
                <span><img className={styles.iconImg} src={HomeIcon}></img></span>
                <span className={styles.menuHaeding}>Dashboard</span></Nav.Link>
                <NavDropdown title={
                  <><span><img className={styles.iconImg} src={FormIcon}></img></span><span className={styles.menuHaeding}>Forms</span></>
                } id="basic-nav-dropdown">
                  <NavDropdown.Item href={webUrl + "/SitePages/Dashboard.aspx"}>Quotation Approval</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.3">Vendor Mapping / New Vendor Registration</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href={webUrl + "/SitePages/Dashboard.aspx"}>PO Approval
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.4">Bill Processing
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.4">IT Approval
                  </NavDropdown.Item>
                </NavDropdown>
                <Nav.Link href={webUrl + "/SitePages/Dashboard.aspx"}>
                <span><img className={styles.iconImg} src={HomeIcon}></img></span>
                <span className={styles.menuHaeding}>Approval NEIBT</span></Nav.Link>
                <NavDropdown title={
                  <span><span><img className={styles.iconImg} src={ReportIcon}></img></span><span className={styles.menuHaeding}>AP Reports</span></span>
                } id="basic-nav-dropdown">
                  <NavDropdown.Item href={webUrl + "/SitePages/Dashboard.aspx"}>Summary Report</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href={webUrl + "/SitePages/Dashboard.aspx"}>Finance Report
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.3">Request History Report </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.4">Workflow History Report
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.4">Suspended Requests
                  </NavDropdown.Item>
                </NavDropdown>
                <Nav.Link href={webUrl + "/SitePages/Dashboard.aspx"}><span><img className={styles.iconImg} src={ReportIcon}></img></span><span className={styles.menuHaeding}>NEIBT Admin Reports</span></Nav.Link>
                <Nav.Link href={webUrl + "/SitePages/Dashboard.aspx"}><span><img className={styles.iconImg} src={FormIcon}></img></span><span className={styles.menuHaeding}>Reimbursement</span></Nav.Link>
                <NavDropdown title={
                  <><span><img className={styles.iconImg} src={ReportIcon}></img></span><span className={styles.menuHaeding}>Expense Reports</span></>
                } id="basic-nav-dropdown">
                  <NavDropdown.Item href={webUrl + "/SitePages/Dashboard.aspx"}>Summary Report</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href={webUrl + "/SitePages/Dashboard.aspx"}>Finance Report
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.3">Workflow History Report </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
    );
  }
}
