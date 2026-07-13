/*
 * PlanSheet - 我收到的计划单
 * @date: 2018/10/13 11:47:39
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray } from 'lodash';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getUserOrganizationId, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN } from 'utils/constants';
import ExcelExport from 'components/ExcelExport';
import { SRM_CUSTOMIZATION } from '_utils/config';
import UpdateList from './List';
import OperationRecord from '../components/PlantOperationRecord/OperationRecord';

/**
 * 我收到的计划单
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} myReceivedPlanSheet - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sodr.myReceivedPlanSheet',
    'ssrc.inquiryHall',
    'sodr.common',
    'entity.company',
    'entity.order',
    'entity.customer',
    'entity.business',
    'entity.organization',
    'entity.item',
  ],
})
@connect(({ loading, myReceivedPlanSheet }) => ({
  loadingList: loading.effects['myReceivedPlanSheet/queryMyReceivedPlanUpdateList'],
  myReceivedPlanSheet,
}))
export default class ReceivedOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      supplierTenantId: getUserOrganizationId(),
      selectedCreateRowKeys: [], // 创建计划单 key,
      selectedUpdateRowKeys: [], // 修改计划单 key,
      //  selectedUpdateRows: [], // 修改计划单选择行
      operatingVisible: false, // 操作记录模态框
      operatingPlanHeaderId: null, // 计划单主键id
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 值集查询
    dispatch({
      type: 'myReceivedPlanSheet/init',
    });
  }

  /**
   * 跳转详情
   */
  @Bind()
  onJumpDetail(record) {
    const { history } = this.props;
    history.push({
      pathname: `/scux/qwkj/my-received-plan-sheets/detail/${record.planHeaderId}`,
    });
  }

  /**
   * 查询列表
   * @param {Object} fields
   * @param {*} otherParams
   */
  @Bind()
  handleSearch(page = {}) {
    const fields = this.detailForm ? this.detailForm.searchForm.props.form.getFieldsValue() : {};
    const handleFormValues = this.handleFormQuery(fields);
    this.handleSearchDetailList({
      page,
      ...handleFormValues,
    });
    this.setState({
      selectedUpdateRowKeys: [],
    });
  }

  /**
   * 查询维护列表
   */
  @Bind()
  handleSearchDetailList(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'myReceivedPlanSheet/queryMyReceivedPlanUpdateList',
      payload: { ...fields },
    });
  }

  /**
   * 选中行创建计划单改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleCreateListRowSelectChange(newSelectedRowKeys) {
    this.setState({ selectedCreateRowKeys: newSelectedRowKeys });
  }

  /**
   * 明细选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleUpdateSelectChange(selectedRowKeys) {
    this.setState({ selectedUpdateRowKeys: selectedRowKeys });
  }

  /**
   *  创建计划单
   */
  @Bind()
  handleCreatePlan() {
    const { selectedCreateRowKeys } = this.state;
    const ids = selectedCreateRowKeys.join(',');
    const { dispatch, history } = this.props;
    dispatch({
      type: 'myReceivedPlanSheet/createPlan',
      payload: ids,
    }).then((res) => {
      if (res) {
        notification.success();
        history.push({
          pathname: `/scux/qwkj/plan-sheets/detail/${res.planHeaderId}`,
        });
      }
    });
  }

  /**
   *发布计划单
   */
  @Bind()
  handleRelease() {
    const { dispatch } = this.props;
    const { selectedUpdateRowKeys = [] } = this.state;
    dispatch({
      type: 'myReceivedPlanSheet/releasePlan',
      payload: selectedUpdateRowKeys,
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  /**
   *删除计划单
   */
  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedUpdateRowKeys = [] } = this.state;
    dispatch({
      type: 'myReceivedPlanSheet/deletePlan',
      payload: selectedUpdateRowKeys,
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    let timeArray = [];
    timeArray = ['planDateStart', 'planDateEnd'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 操作记录
   */
  @Bind()
  handleOperating(flag, record) {
    if (flag) {
      this.setState({
        operatingVisible: true,
        operatingPlanHeaderId: record.planHeaderId,
      });
    } else {
      this.setState({
        operatingVisible: false,
      });
    }
  }

  render() {
    const {
      tenantId,
      supplierTenantId,
      selectedUpdateRowKeys,
      operatingVisible,
      operatingPlanHeaderId,
    } = this.state;
    const {
      myReceivedPlanSheet: { enumMap = {}, planUpdateList = [], planUpdateListPagination = {} },
      dispatch,
      loadingList,
    } = this.props;
    const detailSearchProps = {
      enumMap,
      dispatch,
      handleOperating: this.handleOperating,
      rowSelection: {
        selectedRowKeys: selectedUpdateRowKeys,
        onChange: this.handleUpdateSelectChange,
      },
      tenantId,
      supplierTenantId,
      loading: loadingList,
      dataSource: planUpdateList,
      pagination: planUpdateListPagination,
      onJumpDetail: this.onJumpDetail,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.detailForm = node;
      },
    };
    const operationRecordProps = {
      dispatch,
      id: operatingPlanHeaderId,
      // loading: queryPlanOperateLoading,
      visible: operatingVisible,
      hideModal: this.handleOperating,
    };
    const primaryExportBtnProps = {
      icon: 'export',
      type: 'primary',
    };
    const listCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedUpdateRowKeys) && isEmpty(selectedUpdateRowKeys),
    };
    const planHeaderId = selectedUpdateRowKeys;
    return (
      <Fragment>
        <Header title={intl.get(`sodr.myReceivedPlanSheet.view.message.title`).d('我收到的计划单')}>
          <ExcelExport
            otherButtonProps={primaryExportBtnProps}
            requestUrl={`${SRM_CUSTOMIZATION}/v1/${tenantId}/cux/qwkj/schedule/header/export`}
          />
          <ExcelExport
            buttonText={intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出')}
            otherButtonProps={listCheckExportBtnProps}
            requestUrl={`${SRM_CUSTOMIZATION}/v1/${tenantId}/cux/qwkj/schedule/header/export`}
            queryParams={{ planHeaderList: planHeaderId }}
          />
        </Header>
        <Content>
          <UpdateList {...detailSearchProps} />
        </Content>
        {operatingVisible && <OperationRecord {...operationRecordProps} />}
      </Fragment>
    );
  }
}
