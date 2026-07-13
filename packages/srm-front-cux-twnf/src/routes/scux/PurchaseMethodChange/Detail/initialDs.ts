import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT, PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const organizationId = getCurrentOrganizationId();
const intlPrompt = 'scux.purchaseMethodChange';

const formDataSet = (fbcNum): DataSetProps => {
  return {
    autoQuery: !!fbcNum,
    fields: [
      { name: 'fbcNum', type: FieldType.string, label: intl.get(`${intlPrompt}.form.fbcNum`).d('自采申请单号') },
      { name: 'title', type: FieldType.string, label: intl.get(`${intlPrompt}.form.title`).d('主题') },
      { name: 'applyUser', type: FieldType.string, label: intl.get(`${intlPrompt}.form.applyUser`).d('申请人') },
      { name: 'applyTime', type: FieldType.dateTime, label: intl.get(`${intlPrompt}.form.applyTime`).d('申请时间') },
      { name: 'status', type: FieldType.string, label: intl.get(`${intlPrompt}.form.status`).d('申请状态') },
      { name: 'currencyCode', type: FieldType.string, label: intl.get(`${intlPrompt}.form.currencyCode`).d('币种') },
      { name: 'amount', type: FieldType.number, label: intl.get(`${intlPrompt}.form.amount`).d('申请金额（元）') },
      { name: 'amountStr', type: FieldType.string, label: intl.get(`${intlPrompt}.form.amountStr`).d('大写金额') },
      { name: 'company', type: FieldType.string, label: intl.get(`${intlPrompt}.form.company`).d('申请公司') },
      { name: 'purchaseRange', type: FieldType.string, label: intl.get(`${intlPrompt}.form.purchaseRange`).d('拟自行采购范围') },
      { name: 'processLink', type: FieldType.string, label: intl.get(`${intlPrompt}.form.processLink`).d('流程链接') },
      { name: 'purchaseReson', type: FieldType.string, label: intl.get(`${intlPrompt}.form.purchaseReson`).d('拟自行采购原因') },
      { name: 'attachment', type: FieldType.attachment, label: intl.get(`${intlPrompt}.form.attachment`).d('申请附件'), bucketName: PRIVATE_BUCKET, bucketDirectory: '', },
    ],
    transport: {
      read: () => ({
        url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/8dWrPxjlgvFsnJLhFNMnIRZdZEG9iaruatfrtz20faSg`,
        method: 'GET',
        params: { fbcNum },
        transformResponse: (response) => {
        let res: any = {};
          try {
            res = JSON.parse(response);
          } catch(e) {
            throw e;
          }
          const { header } = res || {};
          return header;
        },
      }),
    },
  };
};

const lineDataSet = (fbcNum): DataSetProps => {
  return {
    autoQuery: !!fbcNum,
    pageSize: 10,
    selection:false,
       fields: [
      { name: 'lineNum', type: FieldType.number, label: intl.get(`${intlPrompt}.form.lineNum`).d('序号') },
      { name: 'requestUser', type: FieldType.string, label: intl.get(`${intlPrompt}.form.requestUser`).d('需求申请人') },
      { name: 'requestTime', type: FieldType.dateTime, label: intl.get(`${intlPrompt}.form.requestTime`).d('需求申请时间') },
      { name: 'requestNum', type: FieldType.string, label: intl.get(`${intlPrompt}.table.requestNum`).d('需求流程单号') },
      { name: 'dipRequestNum', type: FieldType.string, label: intl.get(`${intlPrompt}.form.dipRequestNum`).d('DIP需求单号') },
      { name: 'projectCode', type: FieldType.string, label: intl.get(`${intlPrompt}.form.projectCode`).d('项目编码') },
      { name: 'projectName', type: FieldType.string, label: intl.get(`${intlPrompt}.form.projectName`).d('项目名称') },
      { name: 'executionAmount', type: FieldType.number, label: intl.get(`${intlPrompt}.form.executionAmount`).d('执行金额（元）') },
      { name: 'executionLink', type: FieldType.string, label: intl.get(`${intlPrompt}.form.executionLink`).d('执行单据') },
      { name: 'remark', type: FieldType.string, label: intl.get(`${intlPrompt}.form.remark`).d('备注') },
    ],
    transport: {
      read: ({ params }) => ({
        url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/8dWrPxjlgvFsnJLhFNMnIRZdZEG9iaruatfrtz20faSg`,
        method: 'GET',
        params: { fbcNum, ...params },
                transformResponse: (response) => {
        let res: any = {};
          try {
            res = JSON.parse(response);
          } catch(e) {
            throw e;
          }
          const { lines } = res || {};
          return lines;
        },
      }),
    },
  };
};

export { formDataSet, lineDataSet, intlPrompt };
