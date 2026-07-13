interface statusIconTypeItem {
  value: string,
  description: string,
  icon: string,
}

interface OperationRecordProps {
  btnText?: string;
  btnType?: 'button' | 'aTag';
  btnIcon?: string;
  modalDrawer?: boolean;
  modalWidth?: number;
  modalContentType?: 'notabs' | 'tabs';
  tablePk: string;
  tableUrl: string;
  tableOtherParams?: Object;
  statusIconTypes?: Array<statusIconTypeItem>;
  recordName: string,
  approvalShowFlag: boolean,
  businessKey: Object,
  fetchApprovalUrl: string,
  method: string,
  operateTransportParams?: Object,
}

interface ModalContentProps {
  tablePk: string;
  tableUrl: string;
  recordName: string;
  tableOtherParams?: Object;
  modalContentType?: string;
  statusIconTypes?: Array<statusIconTypeItem>;
  // statusIconTypes: statusIconTypeItem[];
  approvalShowFlag: boolean,
  businessKey: Object,
  fetchApprovalUrl: string,
  method: string,
  operateTransportParams?: Object,
}

export { OperationRecordProps, ModalContentProps, statusIconTypeItem };