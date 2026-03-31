import * as React from 'react';
import styles from './VendorRegistration.module.scss';
import { IVendorRegistrationProps } from './IVendorRegistrationProps';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import SharePointService from '../service/Service';
import { Spinner, SpinnerSize } from '@fluentui/react';
import * as XLSX from "xlsx";
import { Title } from 'chart.js';
import { resultContent } from '@fluentui/react/lib/components/FloatingPicker/PeoplePicker/PeoplePicker.scss';
const VendorRegistration: React.FC<IVendorRegistrationProps> = (props) => {
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
});
const service = new SharePointService(props.context);
const MAX_TOTAL_SIZE_MB = 25;
const INVALID_FILENAME_REGEX = /[^a-zA-Z0-9_.\- ]/;
 const [form, setForm]=React.useState({
    Title: '',
    files: [] as File[],
    attachments: []
  });
const handleFileUpload = async (event: any) => {
  const file = event.target.files[0];
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  console.log(jsonData);
  const result=await service.InsertRecord(jsonData);
  
  
};
const handleManual = () => {
     const url = `${props.context.pageContext.web.absoluteUrl}/SitePages/Home.aspx`;
     window.location.assign(url);
   };
   const handleFileChange = (event?: React.ChangeEvent<HTMLInputElement>) => {
       const files = event?.target?.files;
     if (!files) return;
   
     
     const filesArray = Array.from(files);
   
     const totalSizeMB = filesArray.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
     if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
       alert(`Total file size must not exceed ${MAX_TOTAL_SIZE_MB} MB`);
       return;
     }
      // Invalid filename check
     const invalidFiles = filesArray.filter(file => INVALID_FILENAME_REGEX.test(file.name));
     if (invalidFiles.length > 0) {
       alert(`File names cannot have special characters: ${invalidFiles.map(f => f.name).join(", ")}`);
       return;
     }
      if (event.target.files) {
       const selectedFiles = Array.from(event.target.files);
   
       setForm((prev: any) => ({
         ...prev,
         files: [...prev.files, ...selectedFiles]
       }));
     }
   };
  // 🔹 UI
  return (
      <section>
      </section>
    );
};

export default VendorRegistration;