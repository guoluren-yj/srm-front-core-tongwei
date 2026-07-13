import React from 'react';
import classnames from 'classnames';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { isString } from 'lodash';
import notification from 'utils/notification';
import { revokeWorkFlowByKey, fetchOperationFlag } from '@/services/commonService';
import { Tag } from 'choerodon-ui';

const colorTagRender = ({ record, name, value }) => {
  let styleColor = 'c7n-tag-green';
  if (
    ['NEW', 'CHANGE_NEW', 'IN_PROGRESS', 'APPROVING', 'CANCELING', 'PART_PROCESSED'].includes(value)
  ) {
    styleColor = 'c7n-tag-yellow';
  }
  if (['TERMINATED', 'INVALID', 'CANCELED', 'CLOSED'].includes(value)) {
    styleColor = 'c7n-tag-gray';
  }
  if (['APPROVAL_REJECTED', 'CHANGE_REJECTED', 'WORKFLOW_REJECTED', 'REJECTED'].includes(value)) {
    styleColor = 'c7n-tag-red';
  }
  if (['COMPLETED', 'UNCANCELLED', 'WORKFLOW_APPROVED'].includes(value)) {
    styleColor = 'c7n-tag-green';
  }
  return (
    value && (
      <Tag className={classnames(styleColor)} style={{ border: 0 }}>
        {record.get(`${name}Meaning`)}
      </Tag>
    )
  );
};

/**
 * 撤销工作流审批
 * @param {String} businessKey businessKey
 */
export function revokeWorkFlow(businessKey) {
  return new Promise(async resolve => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('hzero.common.view.revokeApproval.tip')
        .d('是否确认撤销审批？撤销后您仍可再次提交发起审批（仅工作流审批发起人可撤销审批）'),
      onOk: async () => {
        const res = await revokeWorkFlowByKey({ businessKey });
        if (isString(res)) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: res,
          });
        } else if (res && !res.failed) {
          resolve(true);
          notification.success();
        } else if (res && res?.failed) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: res?.message,
          });
        } else {
          resolve(false);
        }
      },
      afterClose: () => {
        resolve(false);
      },
    });
  });
}

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {Array} businessKeys businessKeys
 */
export async function getBatchOperationFlag(businessKeys) {
  const res = getResponse(
    await fetchOperationFlag({ body: businessKeys, query: { revokeFlag: 1 } })
  );
  if (res) {
    return res;
  }
  return {};
}

export { colorTagRender };
