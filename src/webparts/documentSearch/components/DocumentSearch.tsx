import * as React from 'react';
import styles from './DocumentSearch.module.scss';
import { IDocumentSearchProps,IState,IData,IColumn } from './IDocumentSearchProps';
import { SPHttpClient } from '@microsoft/sp-http';
import { DetailsList } from '@fluentui/react';
import { SelectionMode } from '@fluentui/react/lib/DetailsList';
export default class DocumentSearch extends React.Component<IDocumentSearchProps, IState> {

  constructor(props: IDocumentSearchProps) {
    super(props);

    this.state = {
      vendorName: '',
      GST: '',
      PAN: '',
      vendorCode: '',
      TANNo:''  
    };
  }
  private handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    this.setState({ ...this.state, [name]: value });
  };

 private getRequestDetails = async (requestNo: string) => {
 
  const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('QuotationApproval')/items?$filter=RequestNo eq '${requestNo}'`;

    console.log("URL:",url)  
  const response = await this.props.context.spHttpClient.get(
    url,
    SPHttpClient.configurations.v1
  );
  
 const data = await response.json();

 const [items, setItems] = React.useState([
    { id: 1, name: 'Vendor A', amount: 1000 },
    { id: 2, name: 'Vendor B', amount: 2000 },
    { id: 3, name: 'Vendor C', amount: 3000 }
  ]);

  const columns: IColumn[] = [
    { key: 'col1', name: 'ID', fieldName: 'id', minWidth: 50 },
    { key: 'col2', name: 'Name', fieldName: 'name', minWidth: 150 },
    { key: 'col3', name: 'Amount', fieldName: 'amount', minWidth: 100 }
  ];
  if (data.value.length > 0) {
    this.setState({
      vendorName: data.value[0].VendorName,
      GST: data.value[0].GST,
      PAN: data.value[0].PAN,
      vendorCode: data.value[0].VendorCode,
      TANNo: data.value[0].TANNo  
    });
  } else {
   
    this.setState({
      vendorName: '',
      GST: '',
      PAN: '',
      vendorCode: '',
      TANNo: ''
    });
  }
};
 
private handleRequestNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  this.setState({ vendorName: value });

 // optional
    this.getRequestDetails(value);
  
};

  private saveData = async () => {

  const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VendorMapping')/items?$format=json`;

  const body = {
    vendorName: this.state.vendorName,
    GST: this.state.GST,
    PAN: this.state.PAN,
    VendorCode: this.state.vendorCode,
    TANNo: this.state.TANNo
     };
  
  const response = await this.props.context.spHttpClient.post(
    url,SPHttpClient.configurations.v1,
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

  private handleSave = () => {
    console.log("Saved Data:", this.state);
    alert("Saved");
  };

  public render(): React.ReactElement<IDocumentSearchProps> {

    return (
      <div className={styles.container}>
          <h2>My Document List</h2>
          <h4>My Document List</h4>

<div className={styles.container}>  
  <h2>Search My Document</h2>
  <div className={styles.leftPanel}>
            <button className={styles.submitBtn} onClick={this.handleSubmit}>Add New Document</button>
          </div>
</div>
<div className={styles.container}>  
  <h2>Search My Document</h2>
  <div className={styles.leftPanel}>
            <button className={styles.submitBtn} onClick={this.handleSubmit}>Add New Document</button>
          </div>          
</div>
        <div className={styles.container}>    

          <label>Vendor Name</label>
          <input name="vendorName" value={this.state.vendorName}  />

          <label>GST</label>
          <input name="GST" value={this.state.GST}   >
          </input>

          <label>PAN</label>
          <input name="PAN" value={this.state.PAN}   >
          </input>

          <label>Vendor Code</label>
          <input name="vendorCode" value={this.state.vendorCode}   >
          </input>

          <label>TAN Number</label>
          <input name="TANNo" value={this.state.TANNo}   >
          </input>
          </div>     
          <div className={styles.container}>   
            {/* <DetailsList
        items=null
        columns={columns}
        selectionMode={SelectionMode.none}
      /> */}
          </div>          
        </div>
    );
  }
}
