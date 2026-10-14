import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { Expose } from 'hzero-front/lib/utils/remote';
import { isFunction } from 'lodash';

import intl from 'utils/intl';
import request from 'utils/request';
import { getResponse, getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import queryString from 'querystring';

const setLoading = (_this, loading = false) => {
  if (_this?.setState) {
    _this.setState({
      cuxLoading: loading,
    });
  }
};
const handleSave = async (_this, afterFlag = false) => {
  const { headerData, lineDateSource } = _this.state;
  const { form, location } = _this.props;
  const { validateFieldsAndScroll } = form;
  return new Promise((resolve, reject) => {
    validateFieldsAndScroll(async (errs, values) => {
      if (!errs) {
        const { formHeaderId } = queryString.parse(location.search.slice(1));
        const lineData = getEditTableData(lineDateSource).map((item) => ({
          ...item,
          formHeaderId,
        }));
        if (lineDateSource.length !== lineData.length) {
          reject();
          return;
        }
        setLoading(_this, true);
        const customizeUnitCode =
          'SQAM.CREATE_CLAIM.DETAIL.BASIC_INFO,SQAM.CREATE_CLAIM.DETAIL.CLAIM_INFO,SQAM.CREATE_CLAIM.DETAIL.LINES';
        const result = await request(
          `/sqam/v1/${getCurrentOrganizationId()}/claim-form/save?customizeUnitCode=${customizeUnitCode}`,
          {
            method: 'POST',
            body: { ...headerData, ...values, claimFormLineDTOList: lineData },
          }
        );
        if (!getResponse(result)) {
          setLoading(_this, false);
          reject();
          return;
        }
        if (!afterFlag) {
          notification.success();
          if (isFunction(_this.fetchHeader)) {
            await _this.fetchHeader();
          }
          if (isFunction(_this.fetchLines)) {
            _this.fetchLines();
          }
          setLoading(_this, false);
        }
        resolve(true);
      }
      reject();
    });
  });
};

const handleSubmit = async (_this) => {
  try {
    const res = await handleSave(_this, true);
    if (!res) {
      return;
    }
  } catch (e) {
    setLoading(_this, false);
    throw e;
  }
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
  } else {
    if (isFunction(_this.fetchHeader)) {
      await _this.fetchHeader();
    }
    if (isFunction(_this.fetchLines)) {
      _this.fetchLines();
    }
  }
  setLoading(_this, false);
};

const getAppendHeaderBtns = (props) => {
  const { renderProps } = props || {};
  const { _this } = renderProps;
  const { fetchHeaderLoading, fetchLinesLoading, approvalLoading, refuseLoading } =
    _this?.props || {};
  const { cuxLoading } = _this?.state || {};
  const isLoading =
    fetchHeaderLoading || fetchLinesLoading || approvalLoading || refuseLoading || cuxLoading;
  return (
    <>
      <Button loading={isLoading} onClick={() => handleSubmit(_this)}>
        {intl.get('sqam.common.claimApproval.button.approvedFbc').d('提交到FBC')}
      </Button>
      <Button loading={isLoading} onClick={() => handleSave(_this)}>
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
