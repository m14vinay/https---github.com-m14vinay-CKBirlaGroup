import * as React from 'react';
import styles from './DigiflowMenu.module.scss';
import type { IDigiflowMenuProps } from './IDigiflowMenuProps';
import { escape, set } from '@microsoft/sp-lodash-subset';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { SPHttpClient, SPHttpClientConfiguration, SPHttpClientResponse } from '@microsoft/sp-http'
const HomeIcon = require('../assets/Home.png');
const FormIcon = require('../assets/Form.png');
const ReportIcon = require('../assets/Report.png');
import 'bootstrap/dist/css/bootstrap.min.css';
import './HideTopBar.css';
import { useState } from 'react';

interface IDigiflowMenuState {
  items: any[];
  showDropdown: string;
  flag: boolean;
  NEIBTFlag: boolean;
  selectedCompany: string;
}
export default class DigiflowMenu extends React.Component<IDigiflowMenuProps, IDigiflowMenuState> {

  constructor(props: IDigiflowMenuProps) {
    super(props);

    this.state = {
      items: [],
      showDropdown: "",
      flag: false,
      NEIBTFlag: false,
      selectedCompany: sessionStorage.getItem("SelectedCompany") || ""
    };
    this.getMenuItems = this.getMenuItems.bind(this);
    this.setMenuDropdown = this.setMenuDropdown.bind(this);
    this.getMenuItems();
  }

  private getMenuItems() {
    let webUrl = this.props.context.pageContext.web.absoluteUrl;

    this.props.context.spHttpClient.get(webUrl + `/_api/web/lists/getbytitle('MenuMaster')/items?$oorderby=Order0`, SPHttpClient.configurations.v1)
      .then(r => r.json())
      .then(d => {
        console.log("Menu", d);
        this.setState({
          items: d.value
        });
      })
    const checkUser = async () => {
      const value: boolean = await this.getUserExists("User Change Access");
      this.setState({
        flag: value
      });
    };
    const checkUserNEIBT = async () => {
      const value: boolean = await this.getUserExists("NEIBT Admins");
      this.setState({
        NEIBTFlag: value
      });
    };
    checkUser();
    checkUserNEIBT();
  }

  private async getUserExists(GroupTitle: string): Promise<boolean> {
    var isMember = false;
    try {
      const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/currentuser?$expand=groups`;
      const response: SPHttpClientResponse = await this.props.context.spHttpClient.get(
        url,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata'
          }
        }
      );
      const data = await response.json();
      isMember = data.Groups.some((g: any) => g.Title === GroupTitle);
      if (isMember) {
        isMember = true;
      }
      else {
        isMember = false;
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      return false;
    }
    return isMember;
  }
  private setMenuDropdown(value: string) {
    this.setState({
      showDropdown: value
    })
  }

  private menuBar() {
    let base = this.state.items.filter(item => {
      return item.ParentId === null;
    });

    return (
      <Nav className="me-auto">
        {base.map(b => {
          if (this.state.flag && b.Title === "Manage Approvers") {
            let childItems = this.state.items.filter(item => item.ParentId == b.Id);
            if (childItems.length > 0) {
              return <NavDropdown
                onMouseEnter={() => this.setMenuDropdown(b.Title)}
                onMouseLeave={() => this.setMenuDropdown("")}
                show={this.state.showDropdown === b.Title}
                title={
                  <span><span><img className={styles.iconImg} src={b.Icon}></img></span><span className={styles.menuHaeding}>{b.Title}</span></span>
                } id="basic-nav-dropdown">
                {childItems.map((c, i) => {
                  return <><NavDropdown.Item href={c.Link}>{c.Title}</NavDropdown.Item>
                    {i < childItems.length - 1 && <NavDropdown.Divider />}
                  </>
                })}
              </NavDropdown>
            }
            else {
              return <Nav.Link href={b.Link}>
                <span><img className={styles.iconImg} src={b.Icon}></img></span>
                <span className={styles.menuHaeding}>{b.Title}</span>
              </Nav.Link>
            }
          }
          else if (sessionStorage.getItem("SelectedCompany") === "NEIBT" && b.Title === "NEIBT Admin Report") {

            let childItems = this.state.items.filter(item => item.ParentId == b.Id);
            if (childItems.length > 0) {
              return <NavDropdown
                onMouseEnter={() => this.setMenuDropdown(b.Title)}
                onMouseLeave={() => this.setMenuDropdown("")}
                show={this.state.showDropdown === b.Title}
                title={
                  <span><span><img className={styles.iconImg} src={b.Icon}></img></span><span className={styles.menuHaeding}>{b.Title}</span></span>
                } id="basic-nav-dropdown">
                {childItems.map((c, i) => {
                  return <><NavDropdown.Item href={c.Link}>{c.Title}</NavDropdown.Item>
                    {i < childItems.length - 1 && <NavDropdown.Divider />}
                  </>
                })}
              </NavDropdown>
            }
            else {
              return <Nav.Link href={b.Link}>
                <span><img className={styles.iconImg} src={b.Icon}></img></span>
                <span className={styles.menuHaeding}>{b.Title}</span>
              </Nav.Link>
            }
          }
          else if (sessionStorage.getItem("SelectedCompany") === "NEIBT" && b.Title === "Approval NEIBT") {
            let childItems = this.state.items.filter(item => item.ParentId == b.Id);
            if (childItems.length > 0) {
              return <NavDropdown
                onMouseEnter={() => this.setMenuDropdown(b.Title)}
                onMouseLeave={() => this.setMenuDropdown("")}
                show={this.state.showDropdown === b.Title}
                title={
                  <span><span><img className={styles.iconImg} src={b.Icon}></img></span><span className={styles.menuHaeding}>{b.Title}</span></span>
                } id="basic-nav-dropdown">
                {childItems.map((c, i) => {
                  return <><NavDropdown.Item href={c.Link}>{c.Title}</NavDropdown.Item>
                    {i < childItems.length - 1 && <NavDropdown.Divider />}
                  </>
                })}
              </NavDropdown>
            }
            else {
              return <Nav.Link href={b.Link}>
                <span><img className={styles.iconImg} src={b.Icon}></img></span>
                <span className={styles.menuHaeding}>{b.Title}</span>
              </Nav.Link>
            }
          }
          else if (b.Title !== "Manage Approvers" && b.Title !== "NEIBT Admin Report" && b.Title !== "Approval NEIBT") {
            let childItems = this.state.items.filter(item => item.ParentId == b.Id);
            if (childItems.length > 0) {
              return <NavDropdown
                onMouseEnter={() => this.setMenuDropdown(b.Title)}
                onMouseLeave={() => this.setMenuDropdown("")}
                show={this.state.showDropdown === b.Title}
                title={
                  <span><span><img className={styles.iconImg} src={b.Icon}></img></span><span className={styles.menuHaeding}>{b.Title}</span></span>
                } id="basic-nav-dropdown">
                {childItems.map((c, i) => {
                  return <><NavDropdown.Item href={c.Link}>{c.Title}</NavDropdown.Item>
                    {i < childItems.length - 1 && <NavDropdown.Divider />}
                  </>
                })}
              </NavDropdown>
            }
            else {
              return <Nav.Link href={b.Link}>
                <span><img className={styles.iconImg} src={b.Icon}></img></span>
                <span className={styles.menuHaeding}>{b.Title}</span>
              </Nav.Link>
            }
          }
        })}
      </Nav>
    )
  }

  private onCompanyChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ): void {
    const companyId = e.target.value;
    sessionStorage.setItem("SelectedCompany", companyId);
  }
  public render(): React.ReactElement<IDigiflowMenuProps> {
    const {
      context
    } = this.props;

    let webUrl = context.pageContext.web.absoluteUrl;
    return (
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>DIGIFLOW</div>
          <div className={styles.headerRight}>
            <select className={styles.dropdown} value={sessionStorage.getItem("SelectedCompany") || ""} onChange={this.onCompanyChange}>            
              <option value="CKBCSL">CKBCSL</option>              
              {this.state.NEIBTFlag && (
                <option value="NEIBT">NEIBT</option>
              )}                        
            </select>
          </div>
        </div>
        <div className={styles.navbar}>
          <Navbar expand="lg">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              {this.menuBar()}
            </Navbar.Collapse>
          </Navbar>
        </div>
      </div>
    );
  }
}
