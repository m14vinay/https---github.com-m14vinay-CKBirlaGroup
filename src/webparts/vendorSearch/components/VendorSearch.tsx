import * as React from 'react';
import styles from './VendorSearch.module.scss';
import { IVendorSearchProps } from './IVendorSearchProps';  
import { escape } from '@microsoft/sp-lodash-subset';


interface IState {
  currentPage:number;
}
export default class VendorSearch extends React.Component<IVendorSearchProps, IState> {
  constructor(props:IVendorSearchProps) {
    super(props)
    this.state={
      currentPage:1
    };
  }
  public render(): React.ReactElement<IVendorSearchProps> {
    const vendorData=Array.from({length:60}, (_, i)=>({
      code:`CKBCSL/${i+1}`,
      name: `Vendor ${i+1}`,
      type: "Bill Processing"
    }));
    return (
      <div></div>
    )
  }
}
