import React from 'react';
import { Modal, Button, DataSet, Form, TextField } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import { Expose } from 'utils/remote';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';

function handleSignContract(payload) {
  const { pcHeaderId, partnerDataSource, history } = payload || {};
  // 乙方
  const record = (partnerDataSource || []).filter((item) => item.partnerTypeCode === 'YF');
  if (!record?.length || !pcHeaderId) return;
  const { contacts, telNum } = record?.[0] || {};
  const formDS = new DataSet({
    data: [{
      contacts,
      telNum,
    }],
    fields: [
      {
        label: intl.get('scux.spcm.modal.orderExecutionDetail.sign.twnf.user').d('签署人'),
        name: 'contacts',
        disabled: true,
      },
      {
        label: intl.get('scux.spcm.modal.orderExecutionDetail.sign.twnf.phone').d('联系方式'),
        name: 'telNum',
        disabled: true,
      },
    ],
  });

  Modal.open({
    key: Modal.key(),
    title: intl.get(`hzero.common.button.sign`).d('签章'),
    destroyOnClose: true,
    children: (
      <Spin spinning={formDS.status === 'loading'}>
        <Form dataSet={formDS} columns={1} labelLayout="vertical" labelAlign="right">
          <TextField name="contacts" />
          <TextField name="telNum" />
        </Form>
      </Spin>
    ),
    onOk: async () => {
      const result = await request(
        `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/KA5YqYBgiapfuY4Vic6OUynw5Lpx4gVHRtTNIb6XKmymU`,
        {
          method: 'POST',
          body: { pcHeaderId },
        }
      );
      if (getResponse(result)) {
        notification.success();
        if (history) {
          history.push('/spcm/contract-sign/list');
        };
      };
    },
  });
}

export default new Expose({
  process: {
    SPCM_CONTRACT_SIGN_DETAIL_PROCESS_HEADER_BUTTONS: (buttons, otherProps) => {
      const { headerInfo, isPub, current } = otherProps || {};
      const { pcHeaderId, partnerDataSource } = current?.state || {};
      if (!current || !pcHeaderId) return buttons;
      const { attributeVarchar17, attributeLongtext10, pcStatusCode } = headerInfo || {};
      // 如果是电签（attributeVarchar17=APPROVED），且合同头attributeLongtext10≠100550001时，则显示按钮【签章】，隐藏按钮【确认协议】
      const signBtnFlag =
        !isPub && pcHeaderId && attributeVarchar17 === 'APPROVED' && attributeLongtext10 !== '100550001';
      const signBtn = signBtnFlag && (
        <Button
          data-name="cuxSignContract"
          key="signContract"
          disabled={ // ps: 因为签章和确认协议二选一，所以这里可点击条件应该和标准的确认协议一致
            !pcHeaderId ||
            isEmpty(headerInfo) ||
            !['PUBLISHED', 'TERMINATION_CONFIRM', 'SUPPLIER_SIGN_CONTRACT', 'TERMINATION'].includes(pcStatusCode)
          }
          onClick={() => handleSignContract({
            pcHeaderId,
            partnerDataSource,
            history: current?.props?.history,
          })}
        >
          {intl.get('spcm.contractSign.twnf.button.signContract').d('签章')}
        </Button>
      );
      return [...buttons, signBtn].filter(Boolean);
    },
  },
});