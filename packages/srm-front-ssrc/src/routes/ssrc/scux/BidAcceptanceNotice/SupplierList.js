/**
 * 通威二开 - 中标公告【供应商列表】
 * 数据来自中标公告详情接口下发的 supplierList，按供应商逐行生成中标附件 / 在线编辑 / 电签 / 发送通知
 * 参考：new-bid-hall/bid-update 的「招标文件及附件」表格
 * @date: 2025-9-17
 */
import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { observer } from 'mobx-react';
import { Table, Button, Attachment, useDataSet } from 'choerodon-ui/pro';
import { ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { isFunction } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { numberSeparatorRender } from '@/utils/renderer';
import OnlyOfficeEditorOnline from '@/routes/ssrc/scux/components/OnlyOfficeEditorOnline';
import {
  generateBidNoticeAttachment,
  esignBidNoticeAttachment,
  sendBidNoticeMessage,
} from '@/services/bidAcceptanceNoticeService';

import { bidSupplierListDS, BID_NOTICE_ATTACHMENT_ACCEPT } from './storeDS';

const modelName = 'ssrc.scux.bidAcceptanceNotice.';

const SupplierList = (props) => {
  const {
    rfxHeaderId,
    supplierList = [],
    onRefresh,
    onBeforeSendNotice,
    apiRef = useRef(),
  } = props;

  const supplierListDs = useDataSet(() => bidSupplierListDS(), []);

  useEffect(() => {
    supplierListDs.loadData(supplierList || []);
  }, [supplierList, supplierListDs]);

  // 暴露给父页面：头部【保存】取变更行（附件列上传/删除）一起提交，【发布】取勾选行
  useImperativeHandle(apiRef, () => ({
    getSaveData: () => {
      const [created = [], updated = []] = supplierListDs?.dirtyRecords || [];
      return [...created, ...updated].map((record) => record.toJSONData());
    },
    getSelectedData: () => (supplierListDs?.selected || []).map((record) => record.toData()),
  }));

  /**
   * 统一的供应商行操作
   * @returns {Boolean} false 表示调用失败（失败提示已由 getResponse 弹出）
   */
  const requestAction = async (record, requestFun) => {
    if (!rfxHeaderId) {
      return false;
    }
    supplierListDs.status = 'loading';
    let res;
    try {
      res = await requestFun({
        rfxHeaderId,
        supplierCompanyId: record.get('supplierCompanyId'),
      });
    } finally {
      supplierListDs.status = 'ready';
    }
    if (res && res.failed === true) {
      getResponse(res);
      return false;
    }
    // 电签等接口成功时没有返回体，只要没有失败标识即视为调用成功
    return true;
  };

  // 重新拉取详情刷新列表；有未保存的变更时不刷新，避免把本地改动冲掉
  const refreshList = () => {
    if (!isFunction(onRefresh) || supplierListDs.dirty) {
      return;
    }
    onRefresh();
  };

  // 生成附件：成功后重新请求详情接口，刷新【附件】列等数据
  const handleGenerateAttachment = async (record) => {
    const result = await requestAction(record, generateBidNoticeAttachment);
    if (!result) {
      return;
    }
    notification.success();
    if (isFunction(onRefresh)) {
      onRefresh();
    }
  };

  // 是否中标供应商（值集 HPFM.FLAG.NEW）
  const isWinSupplier = (record) => {
    const suggestFlag = record.get('suggestFlag');
    return Number(suggestFlag) === 1 || suggestFlag === true;
  };

  /**
   * 附件列的渲染：
   * 非中标行展示 '-'；中标行保持 c7n-pro 附件字段的默认输出（只读的「查看附件」），
   * 上传/删除仍由列上的 editor 提供
   */
  const attachmentRender = (name) => ({ record }) =>
    isWinSupplier(record) ? (
      <Attachment readOnly record={record} name={name} viewMode="popup" funcType="link" />
    ) : (
      '-'
    );

  // 电签：强校验中标附件
  const handleElectronicSign = async (record) => {
    if (!record.get('uuid')) {
      notification.error({
        message: intl
          .get(`${modelName}message.attachmentRequired`)
          .d('同步失败，中标通知附件不能为空，请调整'),
      });
      return;
    }
    const result = await requestAction(record, esignBidNoticeAttachment);
    if (result) {
      notification.success();
      refreshList();
    }
  };

  // 发送通知：先校验头部「基础信息」必填，再对中标行强校验签章附件
  const handleSendNotice = async (record) => {
    // 通知一旦发出，头部的【电子签章经办人】【中标模板】就置灰不能再改，所以先校验必填
    if (isFunction(onBeforeSendNotice) && !(await onBeforeSendNotice())) {
      return;
    }
    if (isWinSupplier(record) && !record.get('signUuid')) {
      notification.error({
        message: intl
          .get(`${modelName}message.signAttachmentRequired`)
          .d('同步失败，签章附件不存在，请调整'),
      });
      return;
    }
    const result = await requestAction(record, sendBidNoticeMessage);
    if (result) {
      notification.success();
      refreshList();
    }
  };

  const columns = useMemo(
    () => [
      {
        name: 'supplierCompanyName',
        width: 220,
        lock: true, // 中标供应商：左冻结
      },
      {
        name: 'suggestFlag',
        width: 100,
      },
      {
        name: 'totalSuggestAmount',
        width: 140,
        // 非中标行不展示金额
        renderer: ({ value, record }) =>
          isWinSupplier(record) ? numberSeparatorRender(value, 2) : '-',
      },
      {
        header: intl.get(`${modelName}button.generateAttachment`).d('生成附件'),
        width: 110,
        renderer: ({ record }) => {
          // 只有中标的供应商才能生成中标附件
          if (!isWinSupplier(record)) {
            return '-';
          }
          return (
            <Button
              funcType="link"
              wait={1200}
              disabled={!rfxHeaderId}
              onClick={() => handleGenerateAttachment(record)}
            >
              {intl.get(`${modelName}button.generateAttachment`).d('生成附件')}
            </Button>
          );
        },
      },
      {
        name: 'uuid',
        renderer: attachmentRender('uuid'),
        // 只有中标行提供上传/删除
        editor: (record) =>
          isWinSupplier(record) ? (
            <Attachment
              record={record}
              name="uuid"
              accept={BID_NOTICE_ATTACHMENT_ACCEPT}
              viewMode="popup"
              funcType="link"
            />
          ) : (
            undefined
          ),
      },
      {
        header: intl.get(`${modelName}button.edit`).d('编辑'),
        width: 100,
        renderer: ({ record }) => {
          // 是否可编辑由行上的 editFlag 控制，非中标行不展示
          if (!isWinSupplier(record) || String(record.get('editFlag')) !== '1') {
            return '-';
          }
          return (
            <OnlyOfficeEditorOnline
              headerId={rfxHeaderId}
              attachmentLineId={record.get('suggestNoticeId')}
              // 业务来源标识，仅本场景传，供后端区分取数逻辑
              source="suggestNotice"
              title={intl.get(`${modelName}button.onlineEdit`).d('在线编辑')}
            />
          );
        },
      },
      {
        header: intl.get(`${modelName}button.electronicSignature`).d('电签'),
        width: 90,
        renderer: ({ record }) => {
          // 非中标行不展示电签
          if (!isWinSupplier(record)) {
            return '-';
          }
          return (
            <Button funcType="link" wait={1200} onClick={() => handleElectronicSign(record)}>
              {intl.get(`${modelName}button.electronicSignature`).d('电签')}
            </Button>
          );
        },
      },
      {
        name: 'esignStatus',
        width: 120,
        // 非中标行不展示电签状态
        renderer: ({ text, record }) => (isWinSupplier(record) ? text : '-'),
      },
      {
        name: 'signUuid',
        width: 150,
        renderer: attachmentRender('signUuid'),
        // 只有中标行提供上传/删除
        editor: (record) =>
          isWinSupplier(record) ? (
            <Attachment
              record={record}
              name="signUuid"
              accept={BID_NOTICE_ATTACHMENT_ACCEPT}
              viewMode="popup"
              funcType="link"
            />
          ) : (
            undefined
          ),
      },
      {
        name: 'noticeFlag',
        width: 140,
      },
      {
        header: intl.get('hzero.common.table.column.option').d('操作'),
        width: 120,
        lock: ColumnLock.right, // 操作：右冻结
        renderer: ({ record }) => (
          <Button funcType="link" wait={1200} onClick={() => handleSendNotice(record)}>
            {intl.get(`${modelName}button.sendNotice`).d('发送通知')}
          </Button>
        ),
      },
    ],
    [rfxHeaderId]
  );

  return (
    <Table
      dataSet={supplierListDs}
      columns={columns}
      border={false}
      customizable
      customizedCode="SCUX_TWNF_BID_ACCEPTANCE_NOTICE_SUPPLIER_LIST"
    />
  );
};

export default formatterCollections({ code: ['ssrc.scux'] })(observer(SupplierList));
