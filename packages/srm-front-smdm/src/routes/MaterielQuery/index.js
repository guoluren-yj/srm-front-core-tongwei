/*
 * @Description: 物料查询
 * @Date: 2020-05-08 17:26:41
 * @Author: HJ <jinhuang02@hand-china.com>
 * @Copyright: Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Tooltip } from 'hzero-ui';
import { Button as PermissionButton } from 'components/Permission';
import { Bind } from 'lodash-decorators';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { isUndefined, isEmpty } from 'lodash';
import qs from 'querystring';

import { SRM_MDM } from '_utils/config';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender, dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { openTab } from 'utils/menuTab';
import FilterForm from './FilterForm';

/**
 * 物料定义
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} materiel - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch= e=>e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SMDM_MATERIELQUERY_LIST.GRID',
    'SMDM_MATERIELQUERY_LIST.BTNS',
    'SMDM_MATERIELQUERY_LIST.SEARCH',
  ],
})
@connect(({ materielQuery, loading }) => ({
  materielQuery,
  loading: loading.effects['materielQuery/fetchMaterialData'],
  organizationId: getCurrentOrganizationId(),
}))
@cuxRemote(
  {
    code: 'SMDM_MATERIEL_QUERY',
    name: 'remote',
  },
  {
    process: {
      cuxHandeleQueryParams: undefined,
      cuxCloumns: undefined,
      cuxHeadBtns: undefined,
    },
  }
)
@formatterCollections({
  code: [
    'smdm.materiel',
    'smdm.materielApplication',
    'entity.attachment',
    'entity.customer',
    'entity.item',
    'smdm.common',
  ],
})
export default class Materiel extends PureComponent {
  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {
      btnLoading: false,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      materielQuery: { pagination = {} },
      custLoading,
    } = this.props;
    this.queryFlagList();
    dispatch({
      type: 'materielQuery/updateState',
      payload: {
        materielDetail: {}, // 物料详情表单数据
        attributeData: [], // 自定义物品属性数据
        partnerData: {}, // 客户物品数据
        categoryData: [], // 自主品类
        affliatedData: {}, // 所属组织
        enclosureDataSource: [], // 附件
      },
    });
    if (!custLoading) {
      this.handleMaterialData(pagination);
    }
    window.handleScuxMaterialData = this.handleMaterialData;
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      materielQuery: { pagination = {} },
    } = this.props;

    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingChange) {
      this.handleMaterialData(pagination);
    }
  }

  componentWillUnmount() {
    window.handleScuxMaterialData = undefined;
  }

  /**
   * 物料数据查询
   * @param {object} payload - 查询参数
   */
  @Bind()
  handleMaterialData(payload = {}, _, sorter) {
    const { dispatch, organizationId, remote } = this.props;
    const { cuxHandeleQueryParams } = remote?.props?.process || {};
    const cuxParams =
      typeof cuxHandeleQueryParams === 'function' ? cuxHandeleQueryParams({ sorter }) : {};
    const form = this.filterForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    //  const timeArray = ['creationDateFrom', 'creationDateTo'];
    //  timeArray.forEach(item => {
    //    dealTime[item] = filterValues[item]
    //      ? filterValues[item].format(DEFAULT_DATETIME_FORMAT)
    //      : undefined;
    //  });
    dispatch({
      type: 'materielQuery/fetchMaterialData',
      payload: {
        organizationId,
        page: isEmpty(payload) ? {} : payload,
        ...filterValues,
        itemCodeMultiSelect: Array.from(new Set(filterValues?.itemCodeMultiSelect || []))?.join(
          ','
        ),
        lastUpdateDateFrom: filterValues.lastUpdateDateFrom
          ? filterValues.lastUpdateDateFrom.format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        lastUpdateDateTo: filterValues.lastUpdateDateTo
          ? filterValues.lastUpdateDateTo.format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        ...cuxParams,
        customizeUnitCode:
          'SMDM_MATERIELQUERY_LIST.GRID,SMDM_MATERIELQUERY_LIST.SEARCH,SMDM_MATERIELQUERY_DETAIL.BASEINFO',
      },
    }).then(() => {
      dispatch({
        type: 'materielQuery/updateState',
        payload: {
          selectedRows: [],
          selectedRowKeys: [],
        },
      });
    });
  }

  /**
   * 查询是否值集
   */
  @Bind()
  queryFlagList() {
    const { dispatch } = this.props;
    dispatch({ type: 'materielQuery/queryFlagList' });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    // this.setState({ form: ref.props.form });
    this.filterForm = ref.props.form;
  }

  @Bind()
  setBtnLoading(flag) {
    this.setState({ btnLoading: flag });
  }

  /**
   * 物料数据查询
   * @param {string} itemId - 物料Id
   */
  @Bind()
  handleGoDetail(itemId = '') {
    if (itemId) {
      this.props.history.push(`/smdm/materiel-query/detail/${itemId}`);
    }
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const form = this.filterForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    return {
      ...filterValues,
      lastUpdateDateFrom: filterValues.lastUpdateDateFrom
        ? filterValues.lastUpdateDateFrom.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      lastUpdateDateTo: filterValues.lastUpdateDateTo
        ? filterValues.lastUpdateDateTo.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      customizeUnitCode: 'SMDM_MATERIELQUERY_LIST.GRID,SMDM_MATERIELQUERY_LIST.SEARCH',
    };
  }

  /**
   * 需求执行人导入
   */
  @Bind()
  handleBatchImport(code) {
    const retitle = intl.get('smdm.materiel.view.option.demandImport').d('需求执行人导入');
    openTab({
      key: `/smdm/purchase/category/import/${code}`,
      search: qs.stringify({
        key: `/smdm/purchase/category/import/${code}`,
        title: retitle,
        action: retitle,
      }),
    });
  }

  /**
   * 商品图片导入
   */
  @Bind()
  handleImgImport = () => {
    const path = '/smdm/materiel/img-import';
    this.props.history.push(path);
  };

  @Bind()
  onTableSelectedRowChange(selectedRowKeys, selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'materielQuery/updateState',
      payload: {
        selectedRows,
        selectedRowKeys,
      },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      materielQuery: {
        materielData = {},
        pagination = {},
        flagList = [],
        yesOrNoList = [],
        selectedRowKeys = [],
      },
      loading: queryLoading,
      organizationId,
      customizeTable,
      customizeBtnGroup,
      customizeFilterForm,
      remote,
    } = this.props;
    const { btnLoading } = this.state;
    const loading = queryLoading || btnLoading;
    const { cuxCloumns } = remote?.props?.process || {};
    const { content = [] } = materielData;
    const filterProps = {
      flagList,
      yesOrNoList,
      onSearch: this.handleMaterialData,
      onRef: this.handleBindRef,
      customizeFilterForm,
    };
    const columns = [
      {
        title: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
        render: (text, record) => <a onClick={() => this.handleGoDetail(record.itemId)}>{text}</a>,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.originItemCode').d('原始物料编码'),
        dataIndex: 'originItemCode',
        width: 200,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.itemName').d('物料名称'),
        dataIndex: 'itemName',
        render: (text) => (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        ),
        width: 350,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.version`).d('版本'),
        width: 150,
        dataIndex: 'versionNumber',
      },
      {
        title: intl.get('smdm.materiel.model.materiel.specifications').d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.model').d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.itemNumber`).d('云平台物料编码'),
        width: 150,
        dataIndex: 'itemNumber',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.commonName`).d('通用名'),
        width: 200,
        dataIndex: 'commonName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.categoryNameType`).d('平台分类'),
        width: 100,
        dataIndex: 'categoryName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.primaryUomName`).d('基本计量单位'),
        width: 150,
        dataIndex: 'uomName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.lastUpdatedName`).d('最后更新人'),
        width: 100,
        dataIndex: 'lastUpdatedName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.lastUpdateDate`).d('最后更新时间'),
        width: 150,
        dataIndex: 'lastUpdateDate',
        render: (val) => dateTimeRender(val),
      },
      {
        title: intl.get('smdm.materiel.model.common.externalSystemCode').d('外部来源系统编码'),
        width: 100,
        align: 'center',
        dataIndex: 'externalSystemCode',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 75,
        align: 'center',
        dataIndex: 'enabledFlag',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
    ];

    const newColumns = typeof cuxCloumns === 'function' ? cuxCloumns({ columns }) : columns;

    const otherButtonProps = {
      icon: 'unarchive',
      type: 'c7n-pro',
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onTableSelectedRowChange,
    };

    const HeaderBtn = observer(() => {
      const { selectedRows } = this.props.materielQuery;
      const { cuxHeadBtns } = remote?.props?.process || {};
      const normalBtns = [
        {
          name: 'newExport',
          btnComp: ExcelExportPro,
          btnType: 'c7n-pro',
          btnProps: {
            templateCode: 'SRM_SMDM_ITEM_LIST_EXPORT',
            otherButtonProps: {
              ...otherButtonProps,
              permissionList: [
                {
                  code: 'srm.bg.manager.mdm.materiel-query.ps.new.list.export',
                  type: 'button',
                },
              ],
            },
            buttonText: intl.get('hzero.common.export.new').d('导出-新'),
            requestUrl: `${SRM_MDM}/v1/${organizationId}/items/export`,
            queryParams: this.handleGetFormValue(),
          },
        },
        {
          name: 'export',
          btnComp: ExcelExport,
          btnType: 'c7n-pro',
          btnProps: {
            exportAsync: true,
            otherButtonProps: {
              ...otherButtonProps,
              permissionList: [
                {
                  code: 'srm.bg.manager.mdm.materiel-query.ps.list.export',
                  type: 'button',
                },
              ],
            },
            buttonText: intl.get('hzero.common.button.export').d('导出'),
            requestUrl: `${SRM_MDM}/v1/${organizationId}/items/export`,
            queryParams: this.handleGetFormValue(),
          },
        },
        {
          name: 'imgImport',
          noNest: true,
          btnProps: {
            onClick: () => this.handleImgImport(),
          },
          child: (
            <PermissionButton
              type="c7n-pro"
              icon="archive"
              permissionList={[
                {
                  code: `srm.bg.manager.mdm.materiel-query.button.imgImport`,
                  type: 'button',
                },
              ]}
              onClick={() => this.handleImgImport()}
            >
              {intl.get('smdm.materiel.view.option.imgImport').d('物料图片导入')}
            </PermissionButton>
          ),
        },
      ];
      const headerButtons =
        typeof cuxHeadBtns === 'function'
          ? cuxHeadBtns(normalBtns, {
            btnLoading,
            selectedRows,
            setBtnLoading: this.setBtnLoading,
            onQueryList: this.handleMaterialData,
          })
          : normalBtns;
      return (
        <>
          {customizeBtnGroup(
            {
              code: 'SMDM_MATERIELQUERY_LIST.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={headerButtons} />
          )}
        </>
      );
    });

    return (
      <React.Fragment>
        <Header
          title={intl.get(`smdm.materiel.view.message.title.detail.materielSearch`).d('物料查询')}
        >
          <HeaderBtn />
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            {
              code: 'SMDM_MATERIELQUERY_LIST.GRID',
            },
            <Table
              bordered
              rowKey="itemId"
              loading={loading}
              dataSource={content}
              columns={newColumns}
              pagination={pagination}
              rowSelection={rowSelection}
              onChange={this.handleMaterialData}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
