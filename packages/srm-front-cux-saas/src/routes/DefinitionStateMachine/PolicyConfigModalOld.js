/*
 * @Descripttion:
 * @version: 0.0.1
 * @Author: lilingfeng <lingfeng.li@going-link.com>
 * @Date: 2021-08-06 10:39:07
 * @LastEditors: lilingfeng
 * @LastEditTime: 2021-08-16 15:25:58
 */
/**
 * 策略配置弹框
 * @date: 2021-06-04
 * @author: ChenJing <jing.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, SelectBox } from 'choerodon-ui/pro';
import { Modal } from 'choerodon-ui';
import intl from 'utils/intl';
// import Context from '../../components/Context';

import RuleCard from './RuleCard';

const { Option } = SelectBox;
const { Sidebar } = Modal;

export default class PolicyConfigModal extends Component {
  render() {
    const {
      visible,
      cancel,
      title,
      onOk,
      handleConditionVisible,
      policyConfigDataDs,
      conditionJsonDs,
      conditionVisible = true,
      paramTableDs,
    } = this.props;

    /**
     * SelectBox onChange 改变方法，如果 value === true 将条件规则隐藏
     * @param {String} value
     */
    const handleChange = (value) => {
      if (value === 'TRUE') {
        handleConditionVisible(false);
      } else {
        handleConditionVisible(true);
      }
    };

    return (
      <Sidebar
        visible={visible}
        zIndex={1}
        maskStyle={{
          zIndex: 1,
        }}
        style={{ zIndex: 1 }}
        title={title}
        width={800}
        closable
        onOk={() => onOk()}
        onCancel={() => cancel()}
        maskClosable={false}
        destroyOnClose
        mask
      >
        <Form dataSet={policyConfigDataDs} columns={2}>
          <SelectBox
            label={intl
              .get('spfm.rulesDefinition.model.rulesDefinition.conditionType')
              .d('策略逻辑')}
            name="conditionType"
            onChange={handleChange}
            colSpan={2}
            defaultValue="TRUE"
            //   disabled={conditionTypeDisabled}
          >
            <Option value="OR">
              {intl.get('spfm.rulesDefinition.view.select.or').d('满足任一条件')}
            </Option>
            <Option value="AND">
              {intl.get('spfm.rulesDefinition.view.select.and').d('满足所有条件')}
            </Option>
            <Option value="TRUE">
              {intl.get('spfm.rulesDefinition.view.select.true').d('无条件限制')}
            </Option>
          </SelectBox>
        </Form>
        {conditionVisible && (
          <RuleCard
            title={intl.get('spfm.rulesDefinition.view.card.condition').d('条件规则')}
            conditionDataSet={conditionJsonDs}
            selectorDataSet={paramTableDs}
          />
        )}
      </Sidebar>
    );
  }
}
