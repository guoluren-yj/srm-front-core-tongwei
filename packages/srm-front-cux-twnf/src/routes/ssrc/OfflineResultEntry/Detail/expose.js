import React from 'react';
import { Expose } from 'utils/remote';
import { DataSet, Lov } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';

const renderSupQuoteBtn = renderProps => {
  const { rfxHeaderId, allQuotationDS } = renderProps || {};
  const lovDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'lov',
        type: 'object',
        lovCode: 'SCUX_TWNF_INVITE_SUPPLIER_OFFLINE',
        ignore: 'always',
        multiple: true,
        lovPara: {
          rfxHeaderId,
          tenantId: getCurrentOrganizationId(),
        },
      },
    ],
  });
  return (
    <Lov
      dataSet={lovDs}
      name="lov"
      mode="button"
      clearButton={false}
      onChange={async data => {
        if (data && data.length > 0) {
          const result = await request(
            `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/y1iaDF1YCyiau3lsibKUEauzqXMNic1DLCCy6hbFpRj8EGxEWQC5GqoYuDFib1HmUic7uj`,
            {
              method: 'POST',
              body: data,
            }
          );
          if (getResponse(result)) {
            notification.success();
            lovDs.unSelectAll();
            lovDs.clearCachedSelected();
            lovDs.reset();
            allQuotationDS.query();
          }
        }
      }}
    >
      {intl.get('scux.ssrc.twnf.btn.supplierQuotation').d('代供应商报价')}
    </Lov>
  );
};

export default new Expose({
  render: {
    SSRC_OFFLINE_RESULT_ENTRY_DETAIL_RENDER_ALL_TABLE_BUTTON: props => {
      const { renderProps } = props;
      return <>{renderSupQuoteBtn(renderProps)}</>;
    },
  },
});
