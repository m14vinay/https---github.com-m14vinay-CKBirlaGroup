import * as React from 'react';
import styles from './VendorRegistrationDetail.module.scss';
import type { IVendorRegistrationDetailProps } from './IVendorRegistrationDetailProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class VendorRegistrationDetail extends React.Component<IVendorRegistrationDetailProps> {
  public render(): React.ReactElement<IVendorRegistrationDetailProps> {
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
                      
                    </div>                    
                      <div className="accordion" id="accordionPanelsStayOpenExample">
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                              General Information
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show">
                            <div className="accordion-body">
                            <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Name of the Vendor</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Year of Establishment</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Date of Commencement of Business</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>GST</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>PAN</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>TIN</label>
                                    <input className='form-control' type='text' />
                              </div>                
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Central Sales Tax No.</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Service Tax Regd No.</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Nature of Services/Goods</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>MSME Registration No.</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>ESIC No.</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Excise Registration No.</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Work Contract Tax No</label>
                                    <input className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                              Address of the organization from where material will be supplied/services will be provided
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse">
                            <div className="accordion-body">
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Full Address</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Telephone No.</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Fax No.</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Email ID</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Contacted Person</label>
                                    <input className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
                              Address of the Registered Office
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseThree" className="accordion-collapse collapse">
                            <div className="accordion-body">
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Registered Full Address</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Registered Telephone No.</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Registered Fax No.</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Registered Email ID</label>
                                    <input className='form-control' type='text' />
                              </div>
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Registered Contacted Person</label>
                                    <input className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFour" aria-expanded="false" aria-controls="panelsStayOpen-collapseFour">
                              Constitution of Organization
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseFour" className="accordion-collapse collapse">
                            <div className="accordion-body">
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Whether Proprietary or Partnership firm or Pvt. Ltd. Or Public Ltd.</label>
                                    <input className='form-control' type='text' />
                              </div>                
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFive" aria-expanded="false" aria-controls="panelsStayOpen-collapseFive">
                              Nature of Business
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseFive" className="accordion-collapse collapse">
                            <div className="accordion-body">
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Manufacturer</label>
                                    <input className='form-control' type='text' />
                              </div>  
                               <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Authorized Agent</label>
                                    <input className='form-control' type='text' />
                              </div>  
                               <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Trader</label>
                                    <input className='form-control' type='text' />
                              </div>  
                               <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Consulting</label>
                                    <input className='form-control' type='text' />
                              </div>  
                               <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Other(Specify)</label>
                                    <input className='form-control' type='text' />
                              </div>                
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseSix" aria-expanded="false" aria-controls="panelsStayOpen-collapseSix">
                              Details of Proprietor / Partners / Directors
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseSix" className="accordion-collapse collapse">
                            <div className="accordion-body">
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Name</label>
                                    <input className='form-control' type='text' />
                              </div>  
                               <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Address</label>
                                    <input className='form-control' type='text' />
                              </div>  
                               <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Contact No.</label>
                                    <input className='form-control' type='text' />
                              </div>                                     
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseSeven" aria-expanded="false" aria-controls="panelsStayOpen-collapseSeven">
                              Conflict of interest
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseSeven" className="accordion-collapse collapse">
                            <div className="accordion-body">
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Details (if any)</label>
                                    <input className='form-control' type='text' />
                              </div>                                                                    
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseEight" aria-expanded="false" aria-controls="panelsStayOpen-collapseEight">
                              Details of Banks Accounts
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseEight" className="accordion-collapse collapse">
                            <div className="accordion-body">
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Bank Name</label>
                                    <input className='form-control' type='text' />
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Branch Address</label>
                                    <input className='form-control' type='text' />
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Name as appearing in account</label>
                                    <input className='form-control' type='text' />
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Bank Account No.</label>
                                    <input className='form-control' type='text' />
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Bank IFSC/MICR code</label>
                                    <input className='form-control' type='text' />
                              </div>                                                                    
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseNine" aria-expanded="false" aria-controls="panelsStayOpen-collapseNine">
                              Upload Documents
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseNine" className="accordion-collapse collapse">
                            <div className="accordion-body">
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Partnership Deed or Memorandum of Article of Association</label>
                                    <input name="files" type="file" multiple/>
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>MSME Registration Certificate</label>
                                   <input name="files" type="file" multiple/>
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Factory License</label>
                                   <input name="files" type="file" multiple/>
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>ISO 9001 Certificates</label>
                                    <input name="files" type="file" multiple/>
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Bank IFSC/MICR code</label>
                                    <input name="files" type="file" multiple/>
                              </div> 
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Copy of Pan</label>
                                    <input name="files" type="file" multiple/>
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Service Tax Registration</label>
                                    <input name="files" type="file" multiple/>
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>VAT/CST Registration</label>
                                    <input name="files" type="file" multiple/>
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Telephone and Electricity Bill</label>
                                    <input name="files" type="file" multiple/>
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Name and Address of All Partners/ Directors</label>
                                    <input name="files" type="file" multiple/>
                              </div> 
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Cancelled cheque</label>
                                    <input name="files" type="file" multiple/>
                              </div>   
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Registration Certificate with any other authority (if required)</label>
                                    <input name="files" type="file" multiple/>
                              </div> 
                              <div className={styles['col-md-12']} style={{display:"inline-flex"}}>
                                    <label>Any other document (as per the nature of the transaction/vendor)</label>
                                    <input name="files" type="file" multiple/>
                              </div>                                                                    
                            </div>
                          </div>
                        </div>
                    </div>                          
                  </div>
                  <div className={styles["btn-group"]}>
                    <button className={styles.ApproveBtn} style={{borderRadius:"10px"}} >Submit</button>&nbsp;
                    <button className={styles.RejectBtn} style={{borderRadius:"10px"}}>Cancel</button>
                  </div>   
                </div>
              </div>
            </div>
            <div className={styles['col-md-3']}>
          <div className={styles.leftPanelHeader}>        
          </div>        
              <div className={styles.rightPanel}>        
                  {/* Templates */}
                  <div className={styles.card}>
                    <div>
                      <h6>Templates</h6>              
                    </div>
                  </div>
                  {/* Guidelines */}
                  <div className={styles.card}>
                    <div>
                      <h6>Importance Guidelines</h6>              
                    </div>
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
        </div>      
      </section>
    );
  }
}
