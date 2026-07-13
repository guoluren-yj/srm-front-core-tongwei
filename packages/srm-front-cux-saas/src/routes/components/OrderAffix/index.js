/*
 * OrderAffix - 工作台明细页面锚点
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component, Fragment } from 'react';
import { Icon, Anchor } from 'choerodon-ui';
import { Bind, debounce } from 'lodash-decorators';
import classnames from 'classnames';

import intl from 'utils/intl';

import styles from './index.less';

const { Link } = Anchor;

export default class OrderAffix extends Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorShow: false,
    };
  }

  // 触发锚点展示
  @debounce(500)
  @Bind()
  toggleAnchor = () => {
    this.setState((preStaus) => {
      return {
        anchorShow: !preStaus.anchorShow,
      };
    });
  };

  renderLinks = () => {
    const { isCreate, isMall, isEcommerce } = this.props;
    return (
      <Fragment>
        <Link
          href="#order-workSpace-detail-content-basicInfo"
          title={intl.get('sodr.workspace.view.panel.basicInfo').d('订单基础信息')}
        />
        <Link
          href="#order-workSpace-detail-content-organizationInfo"
          title={intl.get('sodr.workspace.view.panel.organization').d('交易方及采买组织信息')}
        />
        {!isCreate && (
          <Link
            href="#order-workSpace-detail-content-detailInfo"
            title={intl.get('sodr.workspace.view.panel.detailInfo').d('订单明细信息')}
          />
        )}
        {(isMall || isEcommerce) && (
          <Link
            href="#order-workSpace-detail-content-receiptInfo"
            title={intl.get('sodr.workspace.view.panel.receiptInfo').d('收货/收单信息')}
          />
        )}
        {isEcommerce && (
          <Link
            href="#order-workSpace-detail-content-billingInfo"
            title={intl.get('sodr.workspace.view.panel.billingInfo').d('开票信息')}
          />
        )}
        {!isCreate && (
          <Link
            href="#order-workSpace-detail-content-attachmentInfo"
            title={intl.get('sodr.workspace.view.panel.attachmentInfo').d('附件')}
          />
        )}
      </Fragment>
    );
  };

  render() {
    const {
      currentOffsetTop = null,
      currentAnchorContainer = () =>
        document.getElementsByClassName('page-container')[0] || document.body,
    } = this.props;
    const { anchorShow = true } = this.state;

    return (
      <div
        className={classnames(styles['page-anchor-container'], {})}
        style={{ width: anchorShow ? '220px' : '0px', paddingLeft: anchorShow ? '20px' : '0px' }}
      >
        <div className={styles['anchor-icon']} onClick={this.toggleAnchor}>
          <Icon
            type="baseline-arrow_right"
            className={anchorShow ? null : styles['anchor-icon-custom-left']}
            style={{ fontSize: '12px' }}
          />
        </div>
        <div className={classnames(styles['anchor-content'])}>
          <Anchor offsetTop={currentOffsetTop || 100} getContainer={currentAnchorContainer}>
            {this.renderLinks()}
          </Anchor>
        </div>
      </div>
    );
  }
}
