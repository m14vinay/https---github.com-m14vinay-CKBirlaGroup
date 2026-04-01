import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IVendorMappingFormProps {
  context: any; // required
  description?: string;
  isDarkTheme?: boolean;
  environmentMessage?: string;
  hasTeamsContext?: boolean;
}