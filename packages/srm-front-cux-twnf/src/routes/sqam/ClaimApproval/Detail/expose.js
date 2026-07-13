import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { Expose } from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import request from 'utils/request';
import { getResponse, getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import queryString from 'querystring';

const handleSave = async (_this, afterFlag = false) => {
    const { headerData, lineDateSource } = _this.state;
    const { form, location, history } = _this.props;
    const { validateFieldsAndScroll } = form;
    await new Promise((resolve, reject) => {
      validateFieldsAndScroll(async (errs, values) => {
        if (!errs) {
          const { formHeaderId } = queryString.parse(location.search.slice(1));
          const lineData = getEditTableData(lineDateSource).map((item) => ({
            ...item,
            formHeaderId,
          }));
            const customizeUnitCode =
      'SQAM.CREATE_CLAIM.DETAIL.BASIC_INFO,SQAM.CREATE_CLAIM.DETAIL.CLAIM_INFO,SQAM.CREATE_CLAIM.DETAIL.LINES';
          const result = await request(
            `/sqam/v1/${getCurrentOrganizationId()}/claim-form/save?customizeUnitCode=${customizeUnitCode}`,
            {
              method: 'POST',
              body: { ...headerData, ...values, claimFormLineDTOList: lineData },
            }
          );
          if (getResponse(result) && !afterFlag) {
            notification.success();
            history.push({
              pathname: `/sqam/claimApproval/detail`,
              search: queryString.stringify({ formHeaderId }),
            });
          }
          resolve();
        }
        reject();
      });
    });
};

const handleSubmit = async (_this) => {
  await handleSave(_this, true);
  const { location, history } = _this.props;
  const { formHeaderId } = queryString.parse(location.search.slice(1));
  const result = await request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/G3y8np65SFHxYRr4RGb6IgiaiciaZ7Avt206SwDT5ViaPmk`,
    {
      method: 'POST',
      body: { formHeaderId },
    }
  );
  if (getResponse(result)) {
    notification.success();
    history.push({
      pathname: `/sqam/claimApproval/list`,
    });
  }
};

const getAppendHeaderBtns = (props) => {
  const { renderProps } = props || {};
  const { _this } = renderProps;
  return (
    <>
      <Button
        onClick={() => handleSubmit(_this)}
      >
        {intl.get('sqam.common.claimApproval.button.approvedFbc').d('提交到FBC')}
      </Button>
      <Button
        onClick={() => handleSave(_this)}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>
    </>
  );
};

export default new Expose({
  process: {
    SQAM_CLAIM_APPROVAL_DETAIL_HEADER_BTN_APPROVED_FLAG: () => false,
    SQAM_CLAIM_APPROVAL_DETAIL_HEADER_BTN_REJECT_FLAG: () => true,
  },
  render: {
    SQAM_CLAIM_APPROVAL_DETAIL_HEADER_BTNS: getAppendHeaderBtns,
  },
});
