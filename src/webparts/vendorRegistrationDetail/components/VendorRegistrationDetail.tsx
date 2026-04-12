import * as React from 'react';
import type { IVendorRegistrationDetailProps } from './IVendorRegistrationDetailProps';
import { escape } from '@microsoft/sp-lodash-subset';
import styles from './VendorRegistrationDetail.module.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import SharePointService from '../service/Service';

const VendorRegistrationDetail: React.FC<IVendorRegistrationDetailProps> = (props) => {
  const [isActiveExcel, setIsActiveExcel] = React.useState(false);
  const [isActiveManual, setIsActiveManual] = React.useState(false);
  const [itemId, setItemId] = React.useState<number>(0);
  const service = new SharePointService(props.context);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  //  Define State
  const [form, setForm] = React.useState({
    Title: '',
    YearofEstablishment: '',
    CommencementDate: new Date(),
    GST: '',
    Pan: '',
    Tin: '',
    CentralSalesTaxNo: '',
    ServiceTaxRegNo: '',
    NatureofService: '',
    MSMERegistrationNo: '',
    ESICNo: '',
    ExciseRegisterNo: '',
    WorkContractTaxNo: '',
    FullAddress: '',
    TelephoneNo: '',
    FaxNo: '',
    EmailId: '',
    ContactPerson: '',
    RegFullAddress: '',
    RegTelephoneNo: '',
    RegFaxNo: '',
    RegEmailId: '',
    RegContactPerson: '',
    Manufacturer: '',
    AuthorizedAgent: '',
    Trader: '',
    ConsultingCompany: '',
    Other: '',
    ConstitutionofOrganization: '',
    Name: '',
    Address: '',
    ContactNo: '',
    Details: '',
    BankName: '',
    BankAddress: '',
    NameinBankAccount: '',
    BankAccountNo: '',
    BankIFSCMICRCode: '',
    CurrentStatus: '',
    files: [] as File[],
    UploadExcelFile: [] as File[]
  });
  // Get Value From Query String
  const getIdFromQueryString = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('RequestId');
    return id ? parseInt(id, 10) : null;
  };
  // Load on Mount
  React.useEffect(() => {
    const id = getIdFromQueryString();
    if (id != null) {
      setItemId(id);
      handleFetchById(id);
    }
    else {
      setItemId(0);
    }
  }, []);
  // Fetch Detail by ID
  const handleFetchById = async (id: number) => {
    try {
      console.log("Calling API with ID:", id);
      const result = await service.getItemByID(id);
      console.log("Result:", result);
      if (result) {
        setItemId(result.Id);
        const files = await service.getAttachments(result.Id);
        setAttachments(files);
        setForm(prev => ({
          ...prev,
          Title: result.Title || '',
          YearofEstablishment: result.YearofEstablishment || '',
          GST: result.GST || '',
          CommencementDate: result.CommencementDate || '',
          Pan: result.Pan || '',
          Tin: result.Tin || '',
          CentralSalesTaxNo: result.CentralSalesTaxNo || '',
          ServiceTaxRegNo: result.ServiceTaxRegNo || '',
          NatureofService: result.NatureofService || '',
          MSMERegistrationNo: result.MSMERegistrationNo || '',
          ESICNo: result.ESICNo || '',
          ExciseRegisterNo: result.ExciseRegisterNo || '',
          WorkContractTaxNo: result.WorkContractTaxNo || '',
          FullAddress: result.FullAddress || '',
          TelephoneNo: result.TelephoneNo || '',
          FaxNo: result.FaxNo || '',
          EmailId: result.EmailId || '',
          ContactPerson: result.ContactPerson || '',
          RegFullAddress: result.RegFullAddress || '',
          RegTelephoneNo: result.RegTelephoneNo || '',
          RegFaxNo: result.RegFaxNo || '',
          RegEmailId: result.RegEmailId || '',
          RegContactPerson: result.RegContactPerson || '',
          Manufacturer: result.Manufacturer || '',
          AuthorizedAgent: result.AuthorizedAgent || '',
          Trader: result.Trader || '',
          ConsultingCompany: result.ConsultingCompany || '',
          Other: result.Other || '',
          ConstitutionofOrganization: result.ConstitutionofOrganization || '',
          Name: result.Name || '',
          Address: result.Address || '',
          ContactNo: result.ContactNo || '',
          Details: result.Details || '',
          BankName: result.BankName || '',
          BankAddress: result.BankAddress || '',
          NameinBankAccount: result.NameinBankAccount || '',
          BankAccountNo: result.BankAccountNo || '',
          BankIFSCMICRCode: result.BankIFSCMICRCode || '',
          CurrentStatus: result.CurrentStatus || '',
        }));
      } else {
        alert("No Data Found");
      }
    } catch (error) {
      console.error("Error Occurred,Please Contact To System Administrator.:", error);
    }
    finally {
      setLoading(false);
    }
  };
  const handleCancel = async () => {
    const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
    window.location.assign(url);
  };
  return (
    <section>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Vendor Details
            <span>Digiflow / All Vendor List / Vendor Details</span>
          </h2>
        </div>
        <div className={styles.row}>
          <div className={styles['col-md-9']}>
            <div className={styles.searchBox}>
              <h3>Vendor Details {<b>form.Title</b>}</h3>
              <div className={styles.container}>
                <div className={styles.row}>
                  <div id="Manual">
                    <div className="accordion" id="accordionPanelsStayOpenExample">
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                            General Information
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Name of the Vendor</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='Title' value={form.Title} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Year of Establishment</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='YearofEstablishment' value={form.YearofEstablishment} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Date of Commencement of Business</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly
                                  name="CommencementDate"
                                  type="text"
                                  value={
                                    form.CommencementDate
                                      ? new Date(form.CommencementDate).toISOString().split('T')[0]
                                      : ''
                                  } className='form-control' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>GST</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='GST' value={form.GST} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>PAN</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='Pan' value={form.Pan} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>TIN</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='Tin' value={form.Tin} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Central Sales Tax No.</label>
                                <input style={{ width: '100%' }} name='CentralSalesTaxNo' value={form.CentralSalesTaxNo} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Service Tax Regd No.</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='ServiceTaxRegNo' value={form.ServiceTaxRegNo} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Nature of Services/Goods</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='NatureofService' value={form.NatureofService} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>MSME Registration No.</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='MSMERegistrationNo' value={form.MSMERegistrationNo} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>ESIC No.</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='ESICNo' value={form.ESICNo} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Excise Registration No.</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='ExciseRegisterNo' value={form.ExciseRegisterNo} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Work Contract Tax No</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='WorkContractTaxNo' value={form.WorkContractTaxNo} className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                            Address of the organization from where material will be supplied/services will be provided
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Full Address</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='FullAddress' value={form.FullAddress} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Telephone No.</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='TelephoneNo' value={form.TelephoneNo} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Fax No.</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='FaxNo' value={form.FaxNo} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Email ID</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='EmailId' value={form.EmailId} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Contacted Person</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='ContactPerson' value={form.ContactPerson} className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
                            Address of the Registered Office
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseThree" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Registered Full Address</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='RegFullAddress' value={form.RegFullAddress} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Registered Telephone No.</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='RegTelephoneNo' value={form.RegTelephoneNo} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Registered Fax No.</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='RegFaxNo' value={form.RegFaxNo} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Registered Email ID</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='RegEmailId' value={form.RegEmailId} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Registered Contacted Person</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='RegContactPerson' value={form.RegContactPerson} className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFour" aria-expanded="false" aria-controls="panelsStayOpen-collapseFour">
                            Constitution of Organization
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseFour" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Whether Proprietary or Partnership firm or Pvt. Ltd. Or Public Ltd.</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='ConstitutionofOrganization' value={form.ConstitutionofOrganization} className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFive" aria-expanded="false" aria-controls="panelsStayOpen-collapseFive">
                            Nature of Business
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseFive" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Manufacturer</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='Manufacturer' value={form.Manufacturer} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Authorized Agent</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='AuthorizedAgent' value={form.AuthorizedAgent} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Trader</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='Trader' value={form.Trader} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Consulting</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='ConsultingCompany' value={form.ConsultingCompany} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Other(Specify)</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='Other' value={form.Other} className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseSix" aria-expanded="false" aria-controls="panelsStayOpen-collapseSix">
                            Details of Proprietor / Partners / Directors
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseSix" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Name</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='Name' value={form.Name} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Address</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='Address' value={form.Address} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Contact No.</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='ContactNo' value={form.ContactNo} className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseSeven" aria-expanded="false" aria-controls="panelsStayOpen-collapseSeven">
                            Conflict of interest
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseSeven" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Details (if any)</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='Details' value={form.Details} className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseEight" aria-expanded="false" aria-controls="panelsStayOpen-collapseEight">
                            Details of Banks Accounts
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseEight" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Bank Name</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='BankName' value={form.BankName} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Branch Address</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='BankAddress' value={form.BankAddress} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Name as appearing in account</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='NameinBankAccount' value={form.NameinBankAccount} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Bank Account No.</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='BankAccountNo' value={form.BankAccountNo} className='form-control' type='text' />
                              </div>
                            </div>
                            <div className={styles['col-md-12']}>
                              <div className={styles["formGroup"]}>
                                <label style={{ width: '50%' }}>Bank IFSC/MICR code</label>
                                <input style={{ width: '100%', backgroundColor: "lightgray" }} readOnly name='BankIFSCMICRCode' value={form.BankIFSCMICRCode} className='form-control' type='text' />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles["accordion-item"]}>
                        <h2 className="accordion-header">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseNine" aria-expanded="false" aria-controls="panelsStayOpen-collapseNine">
                            Documents
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseNine" className="accordion-collapse collapse">
                          <div className={styles["accordion-body"]}>
                            {attachments.map((file, index) => (
                              <div key={index}>
                                <a href={file.ServerRelativeUrl} target="_blank">
                                  {file.FileName}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles['btn-group']}>
                      <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles['col-md-3']}>
            {/* Templates */}
            <div className={styles.searchBox}>
              <h3>Templates</h3>
              <ol>
                <li>Vendor Registration Form_v1.0.</li>
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
};
export default VendorRegistrationDetail;