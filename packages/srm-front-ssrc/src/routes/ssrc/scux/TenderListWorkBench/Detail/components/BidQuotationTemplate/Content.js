import React, { Fragment, useEffect, useRef, useState, useCallback } from 'react';
import { DataSet, Table, Spin, Lov } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import C7NUpload from '_components/C7NUpload';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  getResponse,
  getCurrentOrganizationId,
  getDateTimeFormat,
  getDateFormat,
} from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import request from 'utils/request';

import { FIlESIZE } from '@/utils/SsrcRegx';

import Anchor from './Anchor';
import { tableDS } from './storeDS';
import style from './index.less';

const organizationId = getCurrentOrganizationId();

function Content(props = {}) {
  const { quotationTemplateId, editorFlag, lovDs } = props || {};
  const tableDsRef = useRef({});
  const headerRef = useRef({});

  const [dynamicColumns, setDynamicColumns] = useState({});
  const [queryLoading, setQueryLoading] = useState(false);

  useEffect(() => {
    if (quotationTemplateId) {
      init({ quotationTemplateId });
    }
  }, [quotationTemplateId]);

  const currentFetchApi = useCallback((param) => {
    return request(
      `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/6icEjOibfS8tYkMSWO5s0qKuAfx15rxCXMsXPLDeJmtBicErGdgKJMt9FZJecbU0cF6`,
      {
        method: 'GET',
        query: param,
      }
    );
  }, []);

  const init = (params) => {
    setQueryLoading(true);
    currentFetchApi(params)
      .then((res) => {
        let result = getResponse(res);
        if (result && !result.failed) {
          const { supQuotationDetailPage = {}, moduleList = [] } = result;

          // const lineData = uiType === 'hzero' ? rowData : rowData?.toData();

          // 基础信息中的标准字段不需要从外部带值，只取result中的
          const noNeedData = {
            templateName: null,
            quoDetailAttachmentUuid: null,
            attachmentNeedFlag: null,
            allowCreateFlag: null,
            allowPurCreateFlag: null,
            attachmentUuid: null,

            creationDate: null,
            versionNumber: null,
            objectVersionNumber: null,
            templateId: null,
            templateNum: null,
            lastUpdatedBy: null,
          };

          result = {
            ...noNeedData,
            ...(result || {}),
          };

          // 缓存头数据
          headerRef.current = result;

          // 分模块
          if (result.moduleRule === 'SUB_MODULE') {
            let columns = {};
            // 缓存ds
            moduleList.forEach((i) => {
              tableDsRef.current = {
                ...tableDsRef.current,
                [i.templateId]: new DataSet(tableDS({ handleDataSource })),
              };
              columns = { ...columns, [i.templateId]: handleDynamicColumns(i) };
              // eslint-disable-next-line no-unused-expressions
              tableDsRef.current?.[i.templateId]?.loadData(
                handleDataSource(i?.supQuotationDetailPage?.content),
                i?.supQuotationDetailPage?.totalElements
              );

              // 查询
              tableDsRef.current[i.templateId].setQueryParameter('templateId', i.templateId);
              tableDsRef.current[i.templateId].setQueryParameter(
                'quotationTemplateId',
                lovDs?.current?.get('quotationTemplateId')
              );
            });
            // 设置动态列
            setDynamicColumns(columns);
          } else if (result.moduleRule === 'NO_DISTINCTION') {
            // 不区分模块
            tableDsRef.current = {
              [result.templateId]: new DataSet(tableDS({ handleDataSource })),
            };
            // 设置动态列
            setDynamicColumns({ [result.templateId]: handleDynamicColumns(result) });
            // eslint-disable-next-line no-unused-expressions
            tableDsRef.current?.[result.templateId]?.loadData(
              handleDataSource(supQuotationDetailPage.content),
              supQuotationDetailPage.totalElements
            );
            tableDsRef.current[result.templateId].setQueryParameter(
              'templateId',
              result.templateId
            );
            tableDsRef.current[result.templateId].setQueryParameter(
              'quotationTemplateId',
              lovDs?.current?.get('quotationTemplateId')
            );
          }
        }
      })
      .finally(() => setQueryLoading(false));
  };

  // 处理数据
  const handleDataSource = (source = []) => {
    if (isEmpty(source)) return [];
    const restructureSource = source.map((item) => {
      let elementValue = {};
      const { quotationColumns = [], ...otherItem } = item;
      // eslint-disable-next-line no-unused-expressions
      quotationColumns?.forEach((newItem) => {
        elementValue = {
          ...elementValue,
          [newItem.columnCode]: renderColumnValue(item, newItem),
        };
      });
      return {
        ...otherItem,
        ...elementValue,
        quotationColumns,
        expand: false, // 控制树形是否默认展开
      };
    });
    return restructureSource;
  };

  /**
   * 渲染单元格值
   */
  const renderColumnValue = (item = {}, elementItem = {}) => {
    let value = elementItem.supQuotationColumnValue;
    const meaningFlag =
      elementItem.componentType === 'Lov' || elementItem.componentType === 'ValueList';
    if (item.quotationDetailType === 'NO') {
      value = elementItem.disabled
        ? elementItem.columnDefaultValue
        : item.supQuotationDetailId
        ? meaningFlag
          ? elementItem.supQuotationColumnValueMeaning
          : elementItem.supQuotationColumnValue
        : meaningFlag
        ? elementItem.supColumnDefaultValueMeaning
        : elementItem.supColumnDefaultValue;
      value = item.supQuotationDetailId
        ? meaningFlag
          ? elementItem.supQuotationColumnValueMeaning
          : elementItem.supQuotationColumnValue
        : meaningFlag
        ? elementItem.supColumnDefaultValueMeaning
        : elementItem.supColumnDefaultValue;
    }
    return value;
  };

  // 设置动态列
  const handleDynamicColumns = (data = {}) => {
    const { quotationColumns = [] } = data || {};
    const columns = [];
    quotationColumns.forEach((item) => {
      const flag = Number(item.visible) === 2 || Number(item.visible) === 1;
      // visible过滤
      if (flag) {
        // eslint-disable-next-line no-unused-expressions
        tableDsRef.current?.[data.templateId].addField(item.columnCode, {
          name: item.columnCode,
          label: item.columnName,
          ...renderFieldType(item, { module: data }),
        });
        columns.push({
          name: item.columnCode,
          width: 150,
          renderer: ({ record }) => renderDisplay(item, record),
        });
      }
    });
    return columns;
  };

  // 渲染类型
  const renderFieldType = (field = {}) => {
    let fieldConfig = {};

    switch (field.componentType) {
      case 'Input':
      case 'TextArea':
      case 'Upload':
      case 'Lov':
      case 'ValueList':
        fieldConfig = {
          type: 'string',
        };
        break;
      case 'InputNumber':
        fieldConfig = {
          type: 'number',
        };
        break;
      case 'DateTimePicker':
        fieldConfig = {
          type: 'dateTime',
          format: getDateTimeFormat(),
        };
        break;
      case 'DatePicker':
        fieldConfig = {
          type: 'date',
          format: getDateFormat(),
        };
        break;
      case 'Switch':
      case 'Checkbox':
        fieldConfig = {
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          transformResponse: (val) => Number(val),
        };
        break;
      default:
        fieldConfig = {
          type: 'string',
        };
        break;
    }

    return fieldConfig;
  };

  // 处理显示单元格
  const renderDisplay = (field, record) => {
    const { componentType, columnCode } = field;
    const displayValue = record.get(`${columnCode}`);
    let display;
    switch (componentType) {
      case 'Switch':
      case 'Checkbox':
        display = yesOrNoRender(Number(displayValue));
        break;
      case 'DatePicker':
        display = displayValue && moment(displayValue).format(DEFAULT_DATE_FORMAT);
        break;
      case 'DateTimePicker':
        display = displayValue && moment(displayValue).format(DEFAULT_DATETIME_FORMAT);
        break;
      case 'Upload':
        display = (
          <C7NUpload
            filePreview
            fileSize={FIlESIZE}
            tenantId={organizationId}
            name={columnCode}
            record={record}
            viewOnly
            bucketName={PRIVATE_BUCKET}
          />
        );
        break;
      default:
        display = displayValue;
        break;
    }
    return display;
  };

  const getColumns = useCallback(
    (templateId) => {
      const preColumns = [
        {
          name: 'configCode',
          width: 150,
          title: (
            <div className={style['quotation-detail-header-config-code']}>
              {intl.get(`ssrc.common.model.common.configCode`).d('报价明细项编码')}
            </div>
          ),
        },
        {
          name: 'configName',
          width: 130,
        },
        ...(dynamicColumns?.[templateId] || []),
      ];
      return preColumns;
    },
    [dynamicColumns, headerRef.current]
  );

  // 选择报价模板
  const handleChangeQuotationTemplate = (value) => {
    const { templateId } = value;
    if (templateId) {
      init({ quotationTemplateId: templateId });
    }
  };

  return (
    <Spin spinning={queryLoading}>
      {!!editorFlag && lovDs ? (
        <Lov
          dataSet={lovDs}
          mode="button"
          icon="add"
          onChange={handleChangeQuotationTemplate}
          name="templateLov"
          clearButton={false}
        >
          {intl.get('scux.tenderDetail.view.button.selectQuotationTemplate').d('选择报价模板')}
        </Lov>
      ) : null}
      {headerRef.current?.moduleRule === 'SUB_MODULE' && (
        <Fragment>
          <Anchor linkList={headerRef.current?.moduleList} />
          {headerRef.current?.moduleList?.map((item) => (
            <Fragment className={style['quotation-info-warp']}>
              <h4 id={item.templateId} className={style['quotation-info']}>
                {item.templateName}
              </h4>
              <Table
                mode="tree"
                dataSet={tableDsRef.current?.[item.templateId]}
                columns={getColumns(item.templateId, item)}
              />
            </Fragment>
          ))}
        </Fragment>
      )}
      {headerRef.current?.moduleRule === 'NO_DISTINCTION' && (
        <Fragment>
          <h4 className={style['quotation-info']}>{headerRef.current?.templateName}</h4>
          <Table
            mode="tree"
            dataSet={tableDsRef.current?.[headerRef.current?.templateId]}
            columns={getColumns(headerRef.current?.templateId)}
          />
        </Fragment>
      )}
    </Spin>
  );
}

export default observer(Content);
