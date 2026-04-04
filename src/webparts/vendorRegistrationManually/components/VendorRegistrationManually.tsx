import * as React from 'react';
import type { IVendorRegistrationManuallyProps } from './IVendorRegistrationManuallyProps';
import { escape } from '@microsoft/sp-lodash-subset';
import styles from './VendorRegistrationManually.module.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default class VendorRegistrationManually extends React.Component<IVendorRegistrationManuallyProps> {
  public render(): React.ReactElement<IVendorRegistrationManuallyProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <section>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>New Vendor Registration
              <span>Digiflow / All Vendor List / New Vendor Registration</span>
            </h2>
          </div>
          <div className={styles.row}>
            <div className={styles['col-md-9']}>
              <div className={styles.searchBox}>
                <h3>New Vendor Registration</h3>
                <div className={styles.container}>
                  <div className={styles.row}>
                    <div className={styles['col-md-12']}>
                      <div className={styles.btnBox}>
                        <div className={styles.btnUpload}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" className="bi bi-file-earmark-excel-fill" viewBox="0 0 16 16">
                            <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64" />
                          </svg>
                          <span>Upload Vendor Registration Excel</span>
                        </div>
                        <div className={styles.btnFill}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" className="bi bi-person-lines-fill" viewBox="0 0 16 16">
                            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z" />
                          </svg>
                          <span>Manually Fill All Details</span>
                        </div>
                      </div>
                    </div>
                    <div className="accordion" id="accordionPanelsStayOpenExample">
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className={styles['accordion-button']} type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                            General Information
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Name of the Vendor</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Year of Establishment</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Date of Commencement of Business</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>GST</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>PAN</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>TIN</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Central Sales Tax No.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Service Tax Regd No.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Nature of Services/Goods</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>MSME Registration No.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>ESIC No.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Excise Registration No.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Work Contract Tax No</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className={`${styles['accordion-button']} ${styles.collapsed}"}`} type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                            Address of the organization from where material will be supplied/services will be provided
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Full Address</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Telephone No.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Fax No.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Email ID</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Contacted Person</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className={`${styles['accordion-button']} ${styles.collapsed}"}`} type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
                            Address of the Registered Office
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseThree" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Registered Full Address</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Registered Telephone No.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Registered Fax No.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Registered Email ID</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Registered Contacted Person</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className={`${styles['accordion-button']} ${styles.collapsed}"}`} type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFour" aria-expanded="false" aria-controls="panelsStayOpen-collapseFour">
                            Constitution of Organization
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseFour" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Whether Proprietary or Partnership firm or Pvt. Ltd. Or Public Ltd.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className={`${styles['accordion-button']} ${styles.collapsed}"}`} type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFive" aria-expanded="false" aria-controls="panelsStayOpen-collapseFive">
                            Nature of Business
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseFive" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Manufacturer</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Authorized Agent</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Trader</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Consulting</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Other(Specify)</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className={`${styles['accordion-button']} ${styles.collapsed}"}`} type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseSix" aria-expanded="false" aria-controls="panelsStayOpen-collapseSix">
                            Details of Proprietor / Partners / Directors
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseSix" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Name</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Address</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Contact No.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className={`${styles['accordion-button']} ${styles.collapsed}"}`} type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseSeven" aria-expanded="false" aria-controls="panelsStayOpen-collapseSeven">
                            Conflict of interest
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseSeven" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Details (if any)</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className={`${styles['accordion-button']} ${styles.collapsed}"}`} type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseEight" aria-expanded="false" aria-controls="panelsStayOpen-collapseEight">
                            Details of Banks Accounts
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseEight" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Bank Name</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Branch Address</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Name as appearing in account</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Bank Account No.</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Bank IFSC/MICR code</label>
                                <input className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className={`${styles['accordion-button']} ${styles.collapsed}"}`} type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseNine" aria-expanded="false" aria-controls="panelsStayOpen-collapseNine">
                            Upload Documents
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseNine" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Partnership Deed or Memorandum of Article of Association</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>MSME Registration Certificate</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Factory License</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>ISO 9001 Certificates</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Bank IFSC/MICR code</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Copy of Pan</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Service Tax Registration</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>VAT/CST Registration</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Telephone and Electricity Bill</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Name and Address of All Partners/ Directors</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Cancelled cheque</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Registration Certificate with any other authority (if required)</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles['form-group']}>
                                <label>Any other document (as per the nature of the transaction/vendor)</label>
                                <input name="files" type="file" multiple />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles['btn-group']}>
                    <button className={styles.btnSubmit}>Submit</button>&nbsp;
                    <button className={styles.btnSave}>Save</button>&nbsp;
                    <button className={styles.btnCancel}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles['col-md-3']}>
              {/* Templates */}
              <div className={styles.searchBox}>
                <h3>Templates</h3>
                <ol>
                  <li>Select approval path carefully.</li>
                </ol>
              </div>
              {/* Guidelines */}
              <div className={styles.searchBox}>
                <h3>Importance Guidelines</h3>
                <ol>
                  <li>Select approval path carefully.</li>
                  <li>Use project reference if needed.</li>
                  <li>Attach all documents (Max 25 MB).</li>
                  <li>Avoid special characters in file names.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}