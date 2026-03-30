import * as React from 'react';
import styles from './DocumentSearch.module.scss';
import { IDocumentSearchProps } from './IDocumentSearchProps';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
const DocumentView: React.FC<IDocumentSearchProps> = (props) => {
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
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
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
      <div className={styles.leftPanel}>
        <h2>Upload New Document</h2>
          <h4>My Document List/ Upload New Document</h4>
          <label>Type of Document</label>
          <input name="TypeOfDocument" value={form.TypeOfDocument} readOnly/>
          <label>Name of Document</label>
          <input name="Title" value={form.Title} readOnly/>
          <label>Vendor Name</label>
          <input name="VendorName" value={form.VendorName} readOnly />
          <label>Bill Number</label>
          <input name="BillNumber" value={form.BillNumber}  readOnly>
          </input>
          <label>Bill Date</label>
          <input
            name="BillDate"
            type="date"
            value={
              form.BillDate
                ? new Date(form.BillDate).toISOString().split('T')[0]
                : ''
            }
            readOnly
          />
          <label>Bill Amount</label>
          <input name="BillAmount"  value={form.BillAmount} readOnly/>
          <label>Remarks</label>
          <input name="Remarks" value={form.Remarks} readOnly>
          </input>          
          <label>Attachments</label>
  {attachments.map((file, index) => (
  <div key={index}>
    <a href={file.ServerRelativeUrl} target="_blank">
        {file.FileName}
      </a>
  </div>
))}
<div><br></br></div>
      </div>
    </div>
  );
};

export default DocumentView;