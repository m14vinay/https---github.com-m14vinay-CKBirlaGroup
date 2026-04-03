import * as React from 'react';
import styles from './DocumentView.module.scss';
import { IDocumentViewProps } from './IDocumentViewProps';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';

const DocumentView: React.FC<IDocumentViewProps> = (props) => {
  // State
  const [form, setForm] = React.useState({
      TypeOfDocument:'',
      TypeOfDocumentID:'',
      Title: '',
      BillNumber: '',
      BillDate: '',
      VendorName: '',
      BillAmount : 0,
      Remarks: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [itemId, setItemId] = React.useState<number | null>(null);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const params = new URLSearchParams(window.location.search);
  const service = new SharePointService(props.context);
const handleCancel = () => {
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Dashboard.aspx`;
  window.location.assign(url);
};
  // 🔹 Load data
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ID= Number(params.get("ID"));
    getDatafromListByTitle(ID);
  }, []);
const getDatafromListByTitle = async (parm_Title:number) => {
  try
  {
  const data = await service.getItemByTitle(parm_Title);
if(data.Id>0)
      {
     const files = await service.getAttachments(data.Id);
     setAttachments(files);
       if (data.Id > 0) {
  setForm(form=>({...form,
    TypeOfDocument: data.TypeOfDocument || "",
    Title: data.Title || "",
    BillNumber: data.BillNumber || "",
    BillDate: data.BillDate || "",
    VendorName: data.VendorName || "",
    BillAmount: data.BillAmount || 0,
    Remarks: data.Remarks || "",
  }));
}
}
  }catch (error) {
    console.error(error);
    alert("Error occurred");
  }
  finally
  {
    setLoading(false);
  }
};
  // 🔹 UI
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>Document Detail-{form.Title}</h4>          
      </div>
     <div className={styles.row}>
        <div className={styles["col-md-9"]}>
          <div className={styles.leftPanel}>
            <div className={styles.leftPanelHeader}>
              <h4>{form.Title}</h4>              
            </div>
              <div className={styles.formGroup}>
          <label>Type of Document</label>
          <input name="TypeOfDocument" value={form.TypeOfDocument} readOnly style={{backgroundColor:"lightgray"}}/>
          </div>
            <div className={styles.formGroup}>
          <label>Name of Document</label>
          <input name="Title" value={form.Title} readOnly style={{backgroundColor:"lightgray"}}/>
          </div>
            <div className={styles.formGroup}>
          <label>Vendor Name</label>
          <input name="VendorName" value={form.VendorName} readOnly style={{backgroundColor:"lightgray"}}/>
          </div>
            <div className={styles.formGroup}>
          <label>Bill Number</label>
          <input name="BillNumber" value={form.BillNumber}  readOnly style={{backgroundColor:"lightgray"}}>
          </input>
          </div>
            <div className={styles.formGroup}>
          <label>Bill Date</label>
          <input
            name="BillDate"
            type="date"
            value={
              form.BillDate
                ? new Date(form.BillDate).toISOString().split('T')[0]
                : ''
            }
            readOnly style={{backgroundColor:"lightgray"}}
          />
          </div>
            <div className={styles.formGroup}>
          <label>Bill Amount</label>
          <input name="BillAmount"  value={form.BillAmount} readOnly style={{backgroundColor:"lightgray"}}/>
          </div>
            <div className={styles.formGroup}>
          <label>Remarks</label>
          <input name="Remarks" value={form.Remarks} readOnly style={{backgroundColor:"lightgray"}}>        
          </input>          
          </div>
            <div className={styles.formGroup}>
          <label>Attachments</label>
  {attachments.map((file, index) => (
  <div key={index}>
    <a href={file.ServerRelativeUrl} target="_blank">
        {file.FileName}
      </a>
  </div>
))}
</div>
        <div><br></br></div>
        <div className={styles.buttonGroup}>          
            <button className={styles.RejectBtn} style={{borderRadius:"10px"}} onClick={handleCancel}>Cancel</button>
          </div>
      </div>
      </div>
       <div className={styles["col-md-3"]}>
        <div className={styles.leftPanelHeader}>
        <h6>My Document List / View Document</h6>          
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
  );
};

export default DocumentView;