import React from 'react';
import { Tag } from 'choerodon-ui';

// 采购申请工作台tag颜色
const colorRender = (value, meaning) => {
  let styleColor = 'yellow';
  switch (value) {
    case 'NOT_STARTED':
      styleColor = 'gray';
      break;
    case 'REJECTED':
    case 'SEND_BACK':
    case 'CANCELLED':
    case 'CLOSED':
      styleColor = 'red';
      break;
    case 'SUBMIT_SYNC':
    case 'UNCLOSED':
    case 'UNCANCELLED':
    case 'EXCUTED':
    case 'ASSIGNED':
    case 'APPROVED':
    case 'SUBMITTED':
    case 'FINISHED':
      styleColor = 'green';
      break;
    default:
      styleColor = 'yellow';
      break;
  }
  return (
    value && (
      <Tag color={styleColor} style={{ border: 0 }}>
        {meaning}
      </Tag>
    )
  );
};

export { colorRender };
