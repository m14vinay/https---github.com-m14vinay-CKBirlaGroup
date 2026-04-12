import * as React from 'react';
import styles from './DigiflowMenu.module.scss';
import type { IDigiflowMenuProps } from './IDigiflowMenuProps';
import { escape } from '@microsoft/sp-lodash-subset';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http'
const HomeIcon = require('../assets/Home.png');
const FormIcon = require('../assets/Form.png');
const ReportIcon = require('../assets/Report.png');
import 'bootstrap/dist/css/bootstrap.min.css';
import './HideTopBar.css';

interface IDigiflowMenuState {
  items:any[];
  showDropdown:string;
}

export default class DigiflowMenu extends React.Component<IDigiflowMenuProps, IDigiflowMenuState> {

  constructor(props:IDigiflowMenuProps){
    super(props);

    this.state = {
      items:[],
      showDropdown:""
    }

    this.getMenuItems = this.getMenuItems.bind(this);
    this.setMenuDropdown = this.setMenuDropdown.bind(this);
    this.getMenuItems();
  }

  private getMenuItems() {
    let webUrl = this.props.context.pageContext.web.absoluteUrl;

    this.props.context.spHttpClient.get(webUrl + `/_api/web/lists/getbytitle('MenuMaster')/items?$oorderby=Order0`,SPHttpClient.configurations.v1)
    .then(r => r.json())
    .then(d => {
      console.log("Menu",d);
      this.setState({
        items:d.value
      });
    })
  }

  private setMenuDropdown(value:string){
    this.setState({
      showDropdown:value
    })
  }

  private menuBar() {
    let base = this.state.items.filter(item => {
      return item.ParentId === null;
    });

    return (
      <Nav className="me-auto">
        {base.map(b => {
          let childItems = this.state.items.filter(item => item.ParentId == b.Id);
          if(childItems.length > 0){
            return <NavDropdown 
            onMouseEnter={() => this.setMenuDropdown(b.Title)}
            onMouseLeave={() => this.setMenuDropdown("")}
            show={this.state.showDropdown === b.Title}
            title={
                  <span><span><img className={styles.iconImg} src={b.Icon}></img></span><span className={styles.menuHaeding}>{b.Title}</span></span>
                } id="basic-nav-dropdown">
                  {childItems.map((c,i) => {
                    return <><NavDropdown.Item href={c.Link}>{c.Title}</NavDropdown.Item>
                    {i < childItems.length -1 && <NavDropdown.Divider />}
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
        })}
      </Nav>
    )
  }

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
              {this.menuBar()}
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
    );
  }
}
