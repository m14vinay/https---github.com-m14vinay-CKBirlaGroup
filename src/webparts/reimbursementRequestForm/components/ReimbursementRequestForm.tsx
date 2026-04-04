import * as React from 'react';
import styles from './ReimbursementRequestForm.module.scss';
import type { IReimbursementRequestFormProps } from './IReimbursementRequestFormProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import { Checkbox, Modal, PrimaryButton } from '@fluentui/react';
import 'bootstrap/dist/css/bootstrap.min.css';
interface IState {
  RRequestNo: string;
  ProjectTitle: string;
  Department: string;
  Remarks: string;
  TotalAmount: number;
  ExpenseType: string;
  SelectedDocument: string;
  BillNo: string
  BillAmount: number;
  BillDate: string;
  ClaimAmount: number;
  Description: string;
  SupportingAvailable: boolean;
  isOpen: boolean;
  setIsOpen: boolean;
}
export default class ReimbursementRequestForm extends React.Component<IReimbursementRequestFormProps, IState> {

  constructor(props: IReimbursementRequestFormProps) {
    super(props);

    this.state = {
      RRequestNo: '',
      ProjectTitle: '',
      Department: '',
      Remarks: '',
      TotalAmount: 0,
      ExpenseType: '',
      SelectedDocument: '',
      BillNo: '',
      BillAmount: 0,
      BillDate: '',
      ClaimAmount: 0,
      Description: '',
      SupportingAvailable: false,
      isOpen: false,
      setIsOpen: false
    };
  }

  private handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    this.setState({ ...this.state, [name]: value });
  };

  private getRequestDetails = async (requestNo: string) => {

    const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items?$filter=RequestNo eq '${requestNo}'`;

    console.log("URL:", url)
    const response = await this.props.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const data = await response.json();

    if (data.value.length > 0) {
      this.setState({
        RRequestNo: data.value[0].RRequestNo,
        ProjectTitle: data.value[0].ProjectTitle,
        Department: data.value[0].Department,
        Remarks: data.value[0].Remarks,
        TotalAmount: data.value[0].TotalAmount,
        ExpenseType: data.value[0].ExpenseType,
        SelectedDocument: data.value[0].SelectedDocument,
        BillNo: data.value[0].BillNo,
        BillAmount: data.value[0].BillAmount,
        BillDate: data.value[0].BillDate,
        ClaimAmount: data.value[0].ClaimAmount,
        Description: data.value[0].Description,
        SupportingAvailable: data.value[0].SupportingAvailable
      });
    } else {

      this.setState({
        RRequestNo: '',
        ProjectTitle: '',
        Department: '',
        Remarks: '',
        TotalAmount: 0,
        ExpenseType: '',
        SelectedDocument: '',
        BillNo: '',
        BillAmount: 0,
        BillDate: '',
        ClaimAmount: 0,
        Description: '',
        SupportingAvailable: false
      });
    }
  };

  private handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    this.setState({ RRequestNo: value });

    // optional
    this.getRequestDetails(value);

  };

  private saveData = async () => {

    const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VendorMapping')/items?$format=json`;

    const body = {
      RRequestNo: this.state.RRequestNo,
    };

    const response = await this.props.context.spHttpClient.post(
      url, SPHttpClient.configurations.v1,
      {
        headers: {
          "Accept": "application/json;odata=nometadata",
          "Content-Type": "application/json;odata=nometadata"
        },
        body: JSON.stringify(body)
      }
    );
    const result = await response.json();
    console.log("Response:", result);

    if (response.ok) {
      alert("Data Saved Successfully ✅");
    } else {
      alert("Error saving data ❌");
    }
  };


  private handleSubmit = () => {
    console.log("Form Data:", this.state);
    alert("Form Submitted");
  };

  private handleAddNew = () => {
    console.log("Form Data:", this.state);
    alert("Form Submitted");
  };
  private handleSave = () => {
    console.log("Saved Data:", this.state);
    alert("Saved");
  };

  public render(): React.ReactElement<IReimbursementRequestFormProps> {
    function setIsOpen(arg0: boolean): void {
      throw new Error('Function not implemented.');
    }

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Reimbursement Request Form
            <span>Digiflow / Reimbursement Request Form</span>
          </h2>
        </div>
        <div className={styles.searchBox}>
          <h3>Reimbursement Request Form
            {/* <button className={styles.btnAdd} onClick={handleAddNewDocument}>Add New Document</button> */}
          </h3>
          <div className={styles.content}>
            <div className={styles.selectDep}>
              <div className={styles.selectDepInner}>
                <label>Select Department</label>
                <input type='text' className="form-control" value={this.state.Department} onChange={this.handleRequestNoChange} />
              </div>
              <button className={styles.btnAdd} onClick={() => this.setState({ isOpen: true })}>Add New</button>
            </div>
            <div className={styles.info}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#1026e6" className="bi bi-info-circle-fill" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2" />
              </svg>
              <p>Please</p>
            </div>
            <div className='row'>
              <div className='col-md-4'>
                <div className={styles.remBox}>
                  <h3>Reimbursement Details</h3>
                  <p><label>Expense Type: </label><label>Flight</label></p>
                  <p className={styles.btnPara}><button className={styles.btnRemove}>Remove</button></p>
                </div>
              </div>
              <div className='col-md-4'>
                <div className={styles.remBox}>
                  <h3>Reimbursement Details</h3>
                  <p><label>Expense Type: </label><label>Flight</label></p>
                  <p className={styles.btnPara}><button className={styles.btnRemove}>Remove</button></p>
                </div>
              </div>
              <div className='col-md-4'>
                <div className={styles.remBox}>
                  <h3>Reimbursement Details</h3>
                  <p><label>Expense Type: </label><label>Flight</label></p>
                  <p className={styles.btnPara}><button className={styles.btnRemove}>Remove</button></p>
                </div>
              </div>
            </div>

            <div className={styles.form}>
              <div className={styles['form-group']}>
                <label>Total Amount</label>
                <input type='text' className="form-control" name="totalAmount" value={this.state.TotalAmount} />
              </div>
              <div className={styles['form-group']}>
                <label>Remarks</label>
                <input type='text' className="form-control" name="remarks" value={this.state.Remarks} />
              </div>

              {/* Buttons */}
              <div className={styles['btn-group']}>
                <button className={styles.btnSubmit} onClick={this.handleSubmit}>Submit</button>
                <button className={styles.btnSave} onClick={this.saveData}>Save</button>
                <button className={styles.btnCancel}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
        <Modal
          isOpen={this.state.isOpen}
          onDismiss={() => this.setState({ isOpen: false })}
          isBlocking={false}>          
          <div className={styles.searchBox}>
          <h3>Add Reimbursement Detail</h3>
            <div className={styles['form-group']} style={{display:"inline-flex"}}>
              <label>Expense Type</label>
              <input name="expenseType" value={this.state.ExpenseType}>
              </input>
            </div>
            <div className={styles['form-group']} style={{display:"inline-flex"}}>
              <label>Select Document</label>
              <input name="selectedDocument" value={this.state.SelectedDocument}>
              </input>
            </div>
            <div className={styles['form-group']} style={{display:"inline-flex"}}>
              <label>Bill Number</label>
              <input name="billNo" value={this.state.BillNo}   >
              </input>
            </div>
            <div className={styles['form-group']} style={{display:"inline-flex"}}>
              <label>Bill Amount</label>
              <input name="billAmount" value={this.state.BillAmount}>
              </input>
            </div>
            <div className={styles['form-group']} style={{display:"inline-flex"}}>
              <label>Bill Date</label>
              <input name="remarks" value={this.state.BillDate}>
              </input>
            </div>
            <div className={styles['form-group']} style={{display:"inline-flex"}}>
              <label>Claim Amount</label>
              <input name="claimAmount" value={this.state.ClaimAmount}   >
              </input>
            </div>
            <div className={styles['form-group']} style={{display:"inline-flex"}}>
              <label>Description</label>
              <input name="description" value={this.state.Description}   >
              </input>
            </div>
            <div className={styles['form-group']} style={{display:"inline-flex"}}>
              <label>Supporting Available</label>
              <Checkbox name="supportingAvailable" checked={this.state.SupportingAvailable}>
              </Checkbox>
            </div>
            <div className={styles['btn-group']} style={{display:"inline-flex"}}>
              <button className={styles.btnSubmit} onClick={this.handleSubmit}>Submit</button>
              <PrimaryButton text="Close" onClick={() => this.setState({ isOpen: false })} />
            </div>
            </div>
        </Modal>
      </div>
    );
  }
}

