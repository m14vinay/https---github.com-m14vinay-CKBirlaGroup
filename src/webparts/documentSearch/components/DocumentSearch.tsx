import * as React from 'react';
import styles from './DocumentSearch.module.scss';
import { IDocumentSearchProps } from './IDocumentSearchProps';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
import DataTable, { TableColumn } from "react-data-table-component";
import { useState } from 'react';
const DocumentSearch: React.FC<IDocumentSearchProps> = (props) => {
const [form, setForm] = React.useState({
      VendorName: '',
      VendorID: ''
  });
  interface IDocument {
  DocumentID: string;
  DocumentName: string;
  VendorName: string;
  BillNumber: string;
  BillDate: string;
  BillAmount: number;
  Uploader: string;
}

  const [loading, setLoading] = React.useState(false);
  const [vendorOptions, setVendorOptions] = React.useState<IDropdownOption[]>([]);
  const [documents, setDocuments] = React.useState<any[]>([]);
  const params = new URLSearchParams(window.location.search);
  const service = new SharePointService(props.context);
  const [search, setSearch] = useState("");

const filteredData = documents.filter(item =>
  item.DocumentName?.toLowerCase().includes(search.toLowerCase()) ||
  item.VendorName?.toLowerCase().includes(search.toLowerCase())
);

const columns: TableColumn<IDocument>[] = [
  {
    name: "Document ID",
    selector: (row: IDocument) => row.DocumentID,
    sortable: true
  },
  {
    name: "Document Name",
    selector: (row: IDocument) => row.DocumentName,
    sortable: true
  },
  {
    name: "Vendor Name",
    selector: (row: IDocument) => row.VendorName,
    sortable: true
  },
  {
    name: "Bill Number",
    selector: (row: IDocument) => row.BillNumber
  },
  {
    name: "Bill Date",
    selector: (row: IDocument) =>
      row.BillDate ? new Date(row.BillDate).toLocaleDateString() : ""
  },
  {
    name: "Bill Amount",
    selector: (row: IDocument) => row.BillAmount,
    sortable: true,
    right: true
  },
  {
    name: "Uploader",
    selector: (row: IDocument) => row.Uploader
  },
  {
    name: "View",
    cell: (row: IDocument) => (
      <button onClick={() => handleView(row.DocumentID)}>
        View
      </button>
    )
  }
];
  // 🔹 Load data
    React.useEffect(() => {
      loadMaster();
    }, []);
  
    const loadMaster = async () => {
      const data = await service.getMasterDocument();
      if(data && Array.isArray(data))
      {
      const options = data.map((item: any) => ({
        key: item.Id,
        text: item.VendorName
      }));
      setVendorOptions(options);
    }
    };
  const handleAddNewDocument = () => {
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
  window.location.assign(url);
};
 const handleView = (documentId: string) => {
  const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx?documentId=${documentId}`;
  window.location.assign(url);
};
const handlesearch = async () => {
  if (!form.VendorID) {
    alert("Please select a Vendor Name");
    return;
  }
  await getDatafromListByTitle(form.VendorName);
};    
const getDatafromListByTitle = async (parm_vendorname:string) => {
  try
  {
    setLoading(true);
  const data = await service.getItemByTitle(parm_vendorname);
    if(data.Id>0)
    {
      setDocuments(data.value || []);
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
  return (
    <div className={styles.container}>
      <div className={styles.header}> 
        <span className={styles.leftPanel}>My Document List</span>
        <span>className={styles.rightPanel}Search / My Document List</span>
      </div>
      <div className={styles.container}>
        <h2>Search My Document</h2>
        <span><button onClick={handleAddNewDocument} className={styles.btnadd}>Add New Document</button></span>
        <div>
          <label>Vendor Name</label>          
                  <Dropdown
                    options={vendorOptions}
                    selectedKey={form.VendorID}
                    onChange={(e, option) =>
                      setForm({ ...form, VendorName: option?.text as string, VendorID: option?.key as string, })
                    }
                  />
          <button onClick={handlesearch} className={styles.btnsearch}>Search</button>
        </div>   
      </div>
      <div className={styles.container}>
         <span className={styles.leftPanel}>My Document List</span>
         <input
  type="text"
  placeholder="Search..."
  onChange={(e) => setSearch(e.target.value)}
/>
                  <DataTable
          columns={columns}
          data={filteredData}
          pagination
          striped
          highlightOnHover
          responsive
          fixedHeader
          fixedHeaderScrollHeight="400px"
        />
      </div>
  </div>
  );
};
export default DocumentSearch;