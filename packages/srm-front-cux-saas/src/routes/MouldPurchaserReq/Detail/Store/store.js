import React, { createContext, useMemo, useEffect, useState, useCallback } from 'react';
import { ModalProvider, useDataSet } from 'choerodon-ui/pro';
// import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { fetchPermissions } from '@/services/mouldMasterData';
import { maDetailDs, tableLineDS, maExpandLine } from './allDs';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const {
    source, // 来源那个页面
    children,
    headerUnitCode,
    itemUnitCode,
    linkUnitCode,
    buttonUnit,
    attachUnit,
    customizeTable,
    customizeForm,
    customizeBtnGroup,
    mouldReqId,
    history,
    pubPathFlag,
  } = props;
  const organizationId = getCurrentOrganizationId();
  const [isSupplier] = useState(!location.pathname?.includes('purchaser')); // 是否供应商
  const [showContent, setShowContent] = useState(false);

  const itemTableDs = useDataSet(
    () =>
      tableLineDS({
        source,
        isSupplier,
        mouldReqId,
        organizationId,
        customizeUnitCode: itemUnitCode,
      }),
    [source, mouldReqId, organizationId, itemUnitCode]
  );
  const linkTableDs = useDataSet(
    () =>
      maExpandLine({
        source,
        isSupplier,
        mouldReqId,
        organizationId,
        customizeUnitCode: linkUnitCode,
      }),
    [source, mouldReqId, organizationId, linkUnitCode]
  );
  const headerDs = useDataSet(
    () =>
      maDetailDs({
        source,
        isSupplier,
        mouldReqId,
        organizationId,
        customizeUnitCode: `${linkUnitCode},${itemUnitCode},${headerUnitCode},${attachUnit}`,
        linkTableDs,
        itemTableDs,
      }),
    [source, mouldReqId, organizationId, headerUnitCode, attachUnit, linkTableDs, itemTableDs]
  );
  const header = headerDs?.current;

  // 获取页面单据信息
  const handleGetInfo = useCallback(async () => {
    if (header && header.status && ['create', 'change'].includes(source)) {
      header.status = 'update';
    }
    const headerFlag = await header?.validate(false, false);
    const itemTbValidate = await itemTableDs.validate();
    const linkTbValidateFlag = await linkTableDs.validate();
    if (headerFlag && itemTbValidate && linkTbValidateFlag) {
      return {
        ...header?.toData(),
        customizeUnitCode: `${headerUnitCode},${linkUnitCode},${itemUnitCode},${attachUnit}`,
        mouldReqItemList: itemTableDs.toData(),
        mouldReqLineExpandList: linkTableDs.toData(),
      };
    } else {
      getAllErrorMsg();
    }
  }, [header, itemTableDs, linkTableDs, getAllErrorMsg]);

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

  useEffect(() => {
    if (mouldReqId) {
      headerDs.query();
    } else {
      const defalutData = {};
      headerDs.loadData([]);
      headerDs.create(defalutData);
    }
    if (isSupplier) {
      fetchPermissions(['srm.bg.manager.mold.application.supplier.api.expend']).then(res => {
        setShowContent(res[0]?.approve);
      });
    } else {
      fetchPermissions(['srm.bg.manager.mold.application.api.expend']).then(res => {
        setShowContent(res[0]?.approve);
      });
    }
  }, [mouldReqId]);

  const value = useMemo(() => {
    return {
      isSupplier,
      source,
      organizationId,
      mouldReqId,
      itemTableDs,
      linkTableDs,
      headerDs,
      customizeTable,
      customizeForm,
      customizeBtnGroup,
      linkUnitCode,
      itemUnitCode,
      headerUnitCode,
      buttonUnit,
      attachUnit,
      history,
      pubPathFlag,
      showContent,
      getAllErrorMsg,
      handleGetInfo,
    };
  }, [
    isSupplier,
    source,
    organizationId,
    mouldReqId,
    itemTableDs,
    linkTableDs,
    headerDs,
    customizeTable,
    customizeForm,
    customizeBtnGroup,
    linkUnitCode,
    itemUnitCode,
    headerUnitCode,
    buttonUnit,
    attachUnit,
    history,
    pubPathFlag,
    showContent,
    getAllErrorMsg,
    handleGetInfo,
  ]);

  console.log(value);
  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default observer(StoreProvider);
