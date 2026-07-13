import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

const tableDS = ({ handleDataSource }) => ({
  primaryKey: 'templateDetailId',
  paging: 'server',
  idField: 'templateDetailId',
  parentField: 'parentDetailId',
  expandField: 'expand',
  selection: false,
  autoQuery: false,
  dataToJSON: 'all',
  pageSize: 10,

  fields: [
    {
      name: 'configCode',
      label: intl.get(`ssrc.common.model.common.configCode`).d('报价明细项编码'),
      trim: 'both',
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('configCode'))) {
          return intl
            .get(`ssrc.common.model.common.validation.configCode`)
            .d('报价明细列编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'configName',
      label: intl.get(`ssrc.common.model.common.configName`).d('报价明细项名称'),
      type: 'intl',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { templateId, quotationTemplateId } = dataSet.queryParameter || {};
      return {
        url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/6icEjOibfS8tYkMSWO5s0qKuAfx15rxCXMsXPLDeJmtBicErGdgKJMt9FZJecbU0cF6`,
        method: 'GET',
        data: {
          templateId,
          quotationTemplateId,
          type: 'PAGE',
        },
        transformResponse: (res) => {
          const result = JSON.parse(res);
          if (result && !result.failed) {
            const {
              supQuotationDetailPage: { content = [], ...pages },
            } = result;
            const data = handleDataSource(content);
            return { ...pages, content: data };
          }
        },
      };
    },
  },
});

export { tableDS };
