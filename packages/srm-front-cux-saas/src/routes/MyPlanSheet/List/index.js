/*
 * @Descripttion:
 * @version: 0.0.1
 * @Author: lilingfeng <lingfeng.li@going-link.com>
 * @Date: 2021-08-27 09:31:45
 * @LastEditors: lilingfeng
 * @LastEditTime: 2021-08-27 15:53:23
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import PropTypes from 'prop-types';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';

import Search from './Search';
import ListTable from './ListTable';

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sodr.receivedOrder',
    'sodr.orderApproval',
    'ssrc.inquiryHall',
    'entity.company',
    'entity.customer',
    'entity.business',
    'entity.order',
    'entity.item',
    'entity.roles',
  ],
})
export default class List extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: (e) => e,
  };

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields) {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch(fields);
    }
  }

  render() {
    const {
      form,
      handleReset,
      dataSource,
      loading,
      tenantId,
      dispatch,
      pagination,
      rowSelection,
      enumMap = {},
      onJumpDetail,
      handleOperating,
    } = this.props;
    const filterProps = {
      form,
      enumMap,
      tenantId,
      handleReset,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.searchForm = node;
      },
    };
    const listProps = {
      dispatch,
      loading,
      dataSource,
      pagination,
      rowSelection,
      onJumpDetail,
      handleOperating,
      onSearch: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Search {...filterProps} />
        <ListTable {...listProps} />
      </React.Fragment>
    );
  }
}
