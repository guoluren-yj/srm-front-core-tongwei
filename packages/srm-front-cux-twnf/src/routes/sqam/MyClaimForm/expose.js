import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { Expose } from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import request from 'utils/request';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

const handleSeal = async (selectedRowKeys, handleSearch) => {
  const result = await request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/KA5YqYBgiapfuY4Vic6OUynw5Lpx4gVHRtTNIb6XKmymU`,
    {
      method: 'POST',
      body: selectedRowKeys.map((i) => ({ formHeaderId: i }))[0],
    }
  );
  if (getResponse(result)) {
    notification.success();
    handleSearch();
  }
};

const handleReSync = async (selectedRowKeys, handleSearch) => {
  const result = await request(
    `/sqam/v1/${getCurrentOrganizationId()}/claim-form/export/external`,
    {
      method: 'POST',
      body: selectedRowKeys,
    }
  );
  if (getResponse(result)) {
    notification.success();
    handleSearch();
  }
};

const getHeaderBtns = (_, otherProps) => {
  const { loading, selectedRowKeys, selectedRows, handleSearch } = otherProps || {};
  return (
    <>
      <Button
        loading={loading}
        disabled={
          selectedRowKeys.length !== 1 ||
          selectedRows.some(
            (i) => !['APPROVED', 'CONFIRMED'].includes(i.statusCode) || i.ecStatus === '签署完成'
          )
        }
        onClick={() => handleSeal(selectedRowKeys, handleSearch)}
      >
        {intl.get('sqam.common.cux.twnf.btn.seal').d('盖章')}
      </Button>
      <Button
        loading={loading}
        disabled={
          selectedRowKeys.length === 0 ||
          selectedRows.some(
            (i) => !['CONFIRMED'].includes(i.statusCode) || i.syncStatus !== 'SYNC_FAILURE'
          )
        }
        onClick={() => handleReSync(selectedRowKeys, handleSearch)}
      >
        {intl.get('sqam.common.cux.twnf.btn.reSync').d('重新同步')}
      </Button>
    </>
  );
};

export default new Expose({
  process: {
    SQAM_MY_CLAIM_FORM_LIST_CUX_BTNS: getHeaderBtns,
  },
});
