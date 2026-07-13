/**
 * 索赔单创建
 * @date: 2019-11-05
 * @author: MJQ <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Form, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';

import { createPagination } from 'utils/utils';
import notification from 'utils/notification';
import { isEmpty, throttle, isUndefined } from 'lodash';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';

import FilterForm from './FilterForm';
import List from './List';

@connect(({ createClaim, loading }) => ({
  createClaim,
  fetchClaimLoading: loading.effects['createClaim/fetchClaim'],
  submitLoading: loading.effects['createClaim/submitClaim'],
}))
@formatterCollections({
  code: [
    'sqam.common',
    'entity.item',
    'entity.company',
    'entity.business',
    'entity.supplier',
    'entity.organization',
    'entity.roles',
  ],
})
@withCustomize({
  unitCode: ['SQAM.CREATE_CLAIM_LIST.BTNS'],
})
@Form.create({ fieldNameProp: null })
export default class CreateClaim extends Component {
  constructor(props) {
    super(props);
    this.state = {
      claimList: [],
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  // componentDidMount() {
  //   this.fetchClaim();
  // }

  componentDidUpdate(prevProps) {
    if (prevProps.custLoading === true && this.props.custLoading === false) {
      const {
        location: { state: { _back } = {} },
        createClaim: { pagination = {} },
      } = this.props;
      // 校验是否从详情页返回
      const page = isUndefined(_back) ? {} : pagination;
      this.fetchClaim(page);
    }
  }

  // 索赔单查询
  @Bind()
  fetchClaim(page = {}) {
    const {
      dispatch,
      form: { getFieldsValue = (e) => e },
    } = this.props;
    const values = this.handleFormQuery(getFieldsValue());
    const { supplierCompanyIdStash, ...vals } = values;
    dispatch({
      type: 'createClaim/fetchClaim',
      payload: {
        page,
        ...vals,
        supplierCompanyId: supplierCompanyIdStash,
        customizeUnitCode: 'SQAM.CREATE_CLAIM_LIST.GRID,SQAM.CREATE_CLAIM_LIST.FILTER',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          claimList: res.content,
          selectedRowKeys: [],
          pagination: createPagination(res),
        });
      }
    });
  }

  // 新建跳转
  @Bind()
  handleCreateClaim() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/scux/claim-create-sup/create`,
      })
    );
  }

  // 提交索赔单
  @Bind()
  handleSubmit() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    if (Array.isArray(selectedRows) && selectedRows.length === 0) {
      notification.warning({
        message: intl.get('sqam.common.view.message.selectWarning').d('请选择至少一条数据'),
      });
      return;
    }
    const validateOk = () => {
      dispatch({
        type: 'createClaim/submitClaim',
        payload: selectedRows,
      }).then((res) => {
        if (res && isEmpty(res)) {
          notification.success();
        }
        this.fetchClaim();
      });
    };
    dispatch({
      type: 'createClaim/submitValidate',
      payload: selectedRows,
    }).then((valiRes) => {
      if (!valiRes) return;
      const { validatedCode, msg } = valiRes || {};
      if (validatedCode === 'WARNING') {
        Modal.confirm({
          content: msg,
          onOk: validateOk,
        });
      } else if (validatedCode === 'ERROR') {
        notification.error({
          message: intl.get('sqam.common.notification.error').d('操作失败'),
          description: msg,
        });
      } else if (valiRes) {
        return validateOk();
      }
    });
  }

  // 改变选中行
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  // 跳转索赔单维护
  @Bind()
  goDetail(formHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/scux/claim-create-sup/detail/${formHeaderId}`,
      })
    );
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  @Bind()
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo', 'feedbackDateFrom', 'feedbackDateTo'];
    timeArray.forEach((item) => {
      if (['creationDateFrom', 'feedbackDateFrom'].includes(item)) {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
      } else {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
      }
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  @Bind()
  headerBtns() {
    const { fetchClaimLoading, submitLoading } = this.props;
    const isLoading = fetchClaimLoading || submitLoading;
    const allBtns = [
      {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          type: 'primary',
          icon: 'plus',
          onClick: throttle(this.handleCreateClaim, 1500, { trailing: false }),
          loading: isLoading,
        },
      },
    ];
    return allBtns;
  }

  render() {
    const { claimList, pagination, selectedRowKeys } = this.state;
    const { fetchClaimLoading, form } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const filterFormProps = {
      form,
      fetchClaim: this.fetchClaim,
    };
    const listProps = {
      claimList,
      pagination,
      rowSelection,
      goDetail: this.goDetail,
      fetchClaimLoading,
      fetchClaim: this.fetchClaim,
    };
    return (
      <Fragment>
        <Header title={intl.get('sqam.common.view.title.createClaim').d('索赔单创建')}>
          <DynamicButtons buttons={this.headerBtns()} />
        </Header>
        <Content>
          <FilterForm {...filterFormProps} />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
