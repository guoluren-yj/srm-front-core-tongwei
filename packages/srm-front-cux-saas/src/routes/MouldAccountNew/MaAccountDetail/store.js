import React, { createContext, useMemo, useEffect, useState, useCallback } from 'react';
import { ModalProvider, useDataSet } from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { isArray } from 'lodash';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import remote from 'hzero-front/lib/utils/remote';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import {
  maDetailDs,
  maDetailModifyDs,
  tableLineDS,
  maExpandLine,
  reasonFormDs,
} from '../stores/maDetailDs';
import {
  // saveData,
  // deleteData,
  // publishData,
  queryPageInfo,
  // publishAll,
  queryInitialStateCorrespondingOperation,
  fetchPermissions,
} from '@/services/mouldAccountService';
// import {
//   mouldMasterDataDetail, // 明细
// } from '@/services/mouldMasterData';

// import '../tag.less';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const {
    source, // 来源那个页面
    pageForm, // 維修，報廢，轉移頁面判斷
    children,
    headerUnitCode,
    itemUnitCode,
    linkUnitCode,
    customizeTable,
    customizeForm,
    maHeaderId,
    history,
    pubPathFlag,
    remoteProps,
  } = props;

  console.log(pageForm);

  const organizationId = getCurrentOrganizationId();
  const [isSupplier] = useState(!location.pathname?.includes('purchaser')); // 是否供应商
  const [statusConfigId, setStatusConfigId] = useState(null);
  const [operationCodes, setOperationCodes] = useState(null);
  const [statusMaps, setStatusMap] = useState({});
  const [allBtnText, setAllBtnText] = useState({});
  const [showContent, setShowContent] = useState(false);

  const itemTableDs = useDataSet(
    () =>
      tableLineDS({
        source,
        maHeaderId,
        organizationId,
        customizeUnitCode: itemUnitCode,
      }),
    [source, maHeaderId, organizationId, itemUnitCode]
  );
  const linkTableDs = useDataSet(
    () =>
      maExpandLine({
        source,
        maHeaderId,
        organizationId,
        customizeUnitCode: linkUnitCode,
      }),
    [source, maHeaderId, organizationId, linkUnitCode]
  );
  const changeDs = useDataSet(
    () =>
      maDetailModifyDs({
        source,
        maHeaderId,
        organizationId,
        customizeUnitCode: `SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE_EXPAND,SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE,SIEC.MOULD_PLATFORM.APPROVE.MODIFY.HEADER`,
      }),
    [source, maHeaderId, organizationId, headerUnitCode]
  );
  const reasonForm = useDataSet(
    () =>
      reasonFormDs({
        pageForm,
      }),
    [source, maHeaderId, organizationId]
  );
  const headerDs = useDataSet(
    () =>
      maDetailDs({
        source,
        maHeaderId,
        organizationId,
        customizeUnitCode: `${headerUnitCode},${linkUnitCode},${itemUnitCode}`,
        linkTableDs,
        itemTableDs,
      }),
    [source, maHeaderId, organizationId, headerUnitCode, linkTableDs, itemTableDs]
  );
  const header = headerDs?.current;

  // 获取页面单据信息
  const handleGetInfo = useCallback(async () => {
    if (header && header.status && source === 'create') {
      header.status = 'update';
    }
    const headerFlag = await header?.validate(false, false);
    const itemTbValidate = await itemTableDs.validate();
    const linkTbValidateFlag = await linkTableDs.validate();
    if (headerFlag && itemTbValidate && linkTbValidateFlag) {
      return {
        ...header?.toData(),
        customizeUnitCode:
          'SIEC.MOULD_PLATFORM.DETAIL.LIST,SIEC.MOULD_PLATFORM.DETAIL.HEADER,SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE',
        maLineList: itemTableDs.toData(),
        mouldAccountLineExpandList: linkTableDs.toData(),
        statusConfigId,
      };
    } else {
      getAllErrorMsg();
    }
  }, [header, statusConfigId, itemTableDs, linkTableDs, getAllErrorMsg]);

  // 获取所有报错信息
  const getAllErrorMsg = async () => {
    const headerValidate = await headerDs.validate();
    const itemTbValidate = await itemTableDs.validate();
    const linkTbValidate = await linkTableDs.validate();
    let headerMsg = '';
    if (!headerValidate) {
      const { records } = await headerDs.getAllValidationErrors();
      headerMsg = getHeaderErrorMsg(records);
    }
    const itemErrMsg = getLineErrorMsg(await itemTableDs.getAllValidationErrors());
    const linkErrMsg = getLineErrorMsg(await linkTableDs.getAllValidationErrors());
    notification.error({
      message: (
        <div>
          {headerMsg}
          {!itemTbValidate && (
            <div>
              <p style={{ marginBottom: 3, fontWeight: 600 }}>
                {intl.get('siec.mould.common.relateItemInfo').d('关联物料信息')}:
              </p>
              {itemErrMsg.map(e => e)}
            </div>
          )}
          {!linkTbValidate && (
            <div>
              <p style={{ marginBottom: 3, fontWeight: 600 }}>
                {intl.get('siec.mould.common.expandLine').d('关联子模具信息')}:
              </p>
              {linkErrMsg}
            </div>
          )}
        </div>
      ),
    });
  };

  // 头报错信息解析
  const getHeaderErrorMsg = (allErrors = []) => {
    if (allErrors.length > 0) {
      const [{ errors }] = allErrors;
      const allerrorTpye = errors.map(ele => ele.errors[0].ruleName);
      const allError = errors.map(ele => ele.errors[0]);
      const filtedErrorType = Array.from(new Set(allerrorTpye));
      let errorMsg = '';
      filtedErrorType.forEach(e => {
        const classifyType = allError.filter(item => item.ruleName === e);
        if (e === 'valueMissing') {
          const filedName = Array.from(
            new Set(
              classifyType.map(item => item.injectionOptions?.label || item.validationProps?.name)
            )
          );
          errorMsg += intl.get('hzero.common.validation.notNull', {
            name: filedName.join('，'),
          });
        } else {
          classifyType.forEach(item => {
            errorMsg += `${item.validationMessage}，`;
          });
        }
      });
      return errorMsg;
    }
  };

  // 行报错信息解析
  const getLineErrorMsg = ({ records }) => {
    return records.map(({ errors }) => {
      const allError = errors.map(ele => ele.errors[0]);
      const allerrorTpye = allError.map(ele => ele.ruleName);
      const filtedErrorType = Array.from(new Set(allerrorTpye));
      const lineIndex =
        allError[0].validationProps.record.get('virtualLineNum') ||
        allError[0].validationProps.record.index + 1;
      let errorMsg = '';
      filtedErrorType.forEach(e => {
        const classifyType = allError.filter(item => item.ruleName === e);
        if (e === 'valueMissing') {
          const filedName = Array.from(
            new Set(
              classifyType.map(item => item.injectionOptions?.label || item.validationProps?.name)
            )
          );
          errorMsg += intl.get('hzero.common.validation.notNull', {
            name: filedName.join('，'),
          });
        } else {
          classifyType.forEach(item => {
            errorMsg += `${item.validationMessage}，`;
          });
        }
      });
      return allError[0].validationProps.record.get('virtualLineNum') ? (
        <div>{`行号为${lineIndex}，数据校验不通过。具体原因为:${errorMsg}`}</div>
      ) : (
        <div>
          {intl.get('sprm.common.model.intlTips', { value: lineIndex }).d(`第${lineIndex}行`)}
          {`，${errorMsg}`}
        </div>
      );
    });
  };

  const commonUpdate = () => {
    headerDs.query().then(res => {
      if (res && ['MODIFY', 'TRANSFER'].includes(res.maType)) {
        changeDs.query().then(changeRes => {
          const data = getResponse(changeRes);
          if (data) {
            const { modifyLineList = [], modifyLineExpandList = [], ...others } = data;
            console.log(others, data);
            headerDs.setState('modifyHeader', others);
            itemTableDs.forEach(record => {
              const updateLine = modifyLineList.find(
                item => item.maLineId === record.get('maLineId')
              );
              if (updateLine) {
                record.set({ modifyItem: updateLine });
              }
            });
            linkTableDs.forEach(record => {
              const updateLine = modifyLineExpandList.find(
                item => item.mouldAccountLineExpandId === record.get('mouldAccountLineExpandId')
              );
              if (updateLine) {
                record.set({ modifyItem: updateLine });
              }
            });
            itemTableDs.appendData(modifyLineList.filter(e => !e.maLineId));
            linkTableDs.appendData(modifyLineExpandList.filter(e => !e.mouldAccountLineExpandId));
          }
        });
      }
    });
  };

  useEffect(() => {
    if (maHeaderId) {
      commonUpdate();
    } else {
      const defalutData = { attachmentUuId: uuid(), sourcePlatform: 'SRM' };
      headerDs.loadData([]);
      headerDs.create(defalutData);
    }
  }, [maHeaderId]);

  const value = useMemo(() => {
    return {
      isSupplier,
      showContent,
      source,
      changeDs,
      organizationId,
      maHeaderId,
      itemTableDs,
      linkTableDs,
      headerDs,
      reasonForm,
      pageForm,
      customizeTable,
      customizeForm,
      linkUnitCode,
      itemUnitCode,
      headerUnitCode,
      history,
      pubPathFlag,
      statusConfigId,
      operationCodes,
      statusMaps,
      getAllErrorMsg,
      handleGetInfo,
      remoteProps,
      allBtnText,
      commonUpdate,
    };
  }, [
    isSupplier,
    showContent,
    source,
    changeDs,
    organizationId,
    maHeaderId,
    itemTableDs,
    linkTableDs,
    headerDs,
    reasonForm,
    pageForm,
    customizeTable,
    customizeForm,
    linkUnitCode,
    itemUnitCode,
    headerUnitCode,
    history,
    pubPathFlag,
    statusConfigId,
    operationCodes,
    statusMaps,
    getAllErrorMsg,
    handleGetInfo,
    remoteProps,
    allBtnText,
    commonUpdate,
  ]);

  // 初始化数据
  useEffect(() => {
    // 查状态机1.0
    fetchStatusConfigId();
    fetchPermissions([
      isSupplier
        ? 'srm.pcn-admin.mould-manager.mould-accounts.ps.maexpend_content'
        : 'srm.pcn-admin.mould-manager.mould-accounts-purchaser.ps.maexpend_content',
    ]).then(res => {
      if (getResponse(res) && isArray(res)) {
        setShowContent(res[0]?.approve);
      }
    });
  }, []);

  // 获取状态机状态
  const fetchStatusConfigId = () => {
    queryInitialStateCorrespondingOperation({ moduleCode: 'MOULD_ACCOUNT' }).then(async res => {
      const result = getResponse(res);
      if (result) {
        const operationCode = (res.pageOperationList || []).map(item => item.operationCode);
        // 查状态机2.0
        const statusMapRes = getResponse(
          await queryPageInfo({ statusConfigId: result?.statusConfigId })
        );
        const statusMap = new Map();
        const allBtnTextList = {};
        if (statusMapRes) {
          // eslint-disable-next-line no-unused-expressions
          (statusMapRes?.statusList || [])?.forEach(item => {
            statusMap.set(
              item.statusCode,
              (item.pageOperationList || []).map(i => i.operationCode)
            );
            (item.pageOperationList || []).forEach(e => {
              if (e && e.operationCode && e.operationDesc) {
                allBtnTextList[e.operationCode] = e.operationDesc;
              }
            });
          });
        }
        setStatusConfigId(result?.statusConfigId);
        setOperationCodes(operationCode);
        setStatusMap(statusMap);
        setAllBtnText(allBtnTextList);
      }
    });
  };
  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default remote(
  {
    code: 'SAAS_MOULD_ACCOUNT_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remoteProps', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      renderExtendCuxEditBtn: undefined, // 编辑页面
      renderExtendCuxHeaderTitle: undefined, // 自定义标题
      renderExtendCuxReason: undefined, // 自定义原因描述
      cuxChangeApply: undefined,
      handleRenderDetail: undefined,
      cuxDefaultActiveKey: undefined,
    },
  }
)(observer(StoreProvider));
