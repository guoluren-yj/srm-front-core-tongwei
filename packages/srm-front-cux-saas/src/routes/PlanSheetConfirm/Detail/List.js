/*
 * ListTable - 计划单维护
 * @date: 2019/12/11 15:04:50
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment } from 'react';
import { Form, InputNumber, Input } from 'hzero-ui';
import { isNumber, sum, uniqBy } from 'lodash';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { formatAumont } from '../../components/utils';
import './index.less';

@Form.create({ fieldNameProp: null })
@connect(({ planSheet, planSheetConfirm }) => ({
  planSheet,
  planSheetConfirm,
}))
export default class ListTable extends React.Component {
  @Bind()
  renderPlanNum(plan, planIdx, record) {
    const { key, planQuantity = 0, planType, planDate } = plan;
    return (
      <Form.Item>
        {this.props.form.getFieldDecorator(key + planDate + planType, {
          initialValue: planQuantity,
        })(
          <InputNumber
            disabled={planType !== 'FEEDBACK'}
            min={0}
            onChange={(text) => this.handleChangePlanData(text, plan, record)}
          />
        )}
      </Form.Item>
    );
  }

  /**
   * 渲染动态列表格数据源
   * @param {*} [dataSource=[]]
   * @returns
   */
  @Bind()
  renderDataSource(dataSource = []) {
    if (dataSource.length > 0) {
      const planDataSource = dataSource.map((item) => {
        let elementValue = {};
        const { scheduleDetailList = [], ...otherItem } = item;
        scheduleDetailList.forEach((elementItem) => {
          elementValue = {
            ...elementValue,
            [`key${elementItem.key}`]: elementItem.planQuantity,
          };
        });
        return {
          ...otherItem,
          ...elementValue,
        };
      });
      return planDataSource;
    } else {
      return [];
    }
  }

  /**
   * 处理后端返回数据
   */
  @Bind()
  handleResultData(arr) {
    const tempArr = [];
    const newArr = [];
    for (let i = 0; i < arr.length; i++) {
      if (tempArr.indexOf(arr[i].planDate) === -1) {
        newArr.push({
          ...arr[i],
          planDate: arr[i].planDate,
          list: [arr[i].planQuantity],
          disabled: arr[i].planType === 'PLAN',
        });
        tempArr.push(arr[i].planDate);
      } else {
        for (let j = 0; j < newArr.length; j++) {
          if (newArr[j].planDate === arr[i].planDate) {
            newArr[j].list.push(arr[i].planQuantity);
          }
        }
      }
    }
    return newArr;
  }

  /**
   * 动态列
   */
  @Bind()
  renderPlanCol(dataSource) {
    if (dataSource.length !== 0) {
      const { scheduleDetailMap = {} } = dataSource[0];
      const arr = [];
      // eslint-disable-next-line guard-for-in
      for (const i in scheduleDetailMap) {
        arr.push(...scheduleDetailMap[i]);
      }
      // console.log('arr', this.handleResultData(arr));
      return this.handleResultData(arr).map((item) => {
        return {
          dataIndex: `$$${item.planDate}`,
          title: item.planDate,
          width: 120,
          className: 'date no-padding',
          center: true,
          render: (val = [], record) => {
            return {
              children: val.map((plan, planIdx) => (
                <div>{this.renderPlanNum(plan, planIdx, record)}</div>
              )),
            };
          },
        };
      });
    }
  }

  @Bind()
  handleChangePlanData(value, plan) {
    const { dispatch, dataSource, transformOrigin, transformRender } = this.props;
    const _dataSource = JSON.parse(JSON.stringify(transformRender(dataSource)));
    _dataSource.forEach((item) => {
      if (item && item[`$$${plan.planDate}`]) {
        item[`$$${plan.planDate}`].forEach((t) => {
          if (t.key && plan.key && t.key === plan.key) {
            // eslint-disable-next-line no-param-reassign
            t.planQuantity = value;
          }
        });
      }
    });

    const planDataSource = transformOrigin(_dataSource, dataSource);
    dispatch({
      type: 'planSheetConfirm/updateState',
      // payload: { planDataSource },
      payload: { planDetailList: planDataSource },
    });
  }

  @Bind()
  handleChangeSupRemark(value, record, index) {
    const { dispatch, dataSource } = this.props;
    dataSource[index].supplierRemark = value;
    dispatch({
      type: 'planSheetConfirm/updateState',
      // payload: { planDataSource: dataSource },
      payload: { planDetailList: dataSource },
    });
  }

  @Bind()
  getColumns(dataSource) {
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'serialLineNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.common.model.common.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.needQuantity`).d('需求数量'),
        dataIndex: 'quantity',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.readyPlanQuantity`).d('可计划数量'),
        dataIndex: 'readyPlanQuantity',
        width: 130,
      },
      {
        title: intl.get(`sodr.common.model.common.planQuantity`).d('本次计划数量'),
        dataIndex: 'planQuantity',
        width: 140,
      },
      {
        title: intl.get(`sodr.common.model.common.readyPlanQuantitys`).d('类别'),
        dataIndex: 'readyPlanQuantity',
        width: 80,
        render: (_, record) => {
          const { scheduleDetailMap = {} } = record;
          const arr = [];
          // eslint-disable-next-line guard-for-in
          for (const i in scheduleDetailMap) {
            arr.push(...scheduleDetailMap[i]);
          }
          return {
            children: uniqBy(arr, 'planTypeMeaning').map((item) => (
              <div className="planType">{item.planTypeMeaning}</div>
            )),
          };
        },
        center: true,
        className: 'date no-padding',
      },
      {
        title: this.planTitle(),
        children: this.renderPlanCol(dataSource),
        className: 'date no-padding',
        center: true,
      },
      {
        title: intl.get(`sodr.common.model.common.purchaserRemark1`).d('采购方备注'),
        dataIndex: 'purchaserRemark',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierRemark`).d('供应商备注'),
        dataIndex: 'supplierRemark',
        width: 150,
        render: (val, record, index) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierRemark', {
                initialValue: val,
              })(
                <Input
                  onChange={(e) => this.handleChangeSupRemark(e.target.value, record, index)}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    return columns;
  }

  /**
   * 计划单动态title
   */
  @Bind()
  planTitle() {
    const { planDetailHeader = {} } = this.props;
    let title;
    switch (planDetailHeader.planningCycle) {
      case 'WEEK':
        title = intl.get(`sodr.common.model.common.weekPlan`).d('周度计划排程数量');
        break;
      case 'DOUBLE_WEEK':
        title = intl.get(`sodr.common.model.common.doubleWeekPlan`).d('双周计划排程数量');
        break;
      case 'MONTH':
        title = intl.get(`sodr.common.model.common.monthPlan`).d('月度计划排程数量');
        break;
      case 'TWO_MONTH':
        title = intl.get(`sodr.common.model.common.doubleMonthPlan`).d('双月计划排程数量');
        break;
      case 'THREE_MONTH':
        title = intl.get(`sodr.common.model.common.threeMonthPlan`).d('季度计划排程数量');
        break;
      default:
        title = intl.get(`sodr.common.model.common.weekPlan`).d('周度计划排程数量');
        break;
    }
    return title;
  }

  render() {
    const { dataSource = [], transformRender } = this.props;
    const columns = this.getColumns(dataSource);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 1000;
    return (
      <Fragment>
        <EditTable
          // loading={loading}
          rowKey="planLineId"
          bordered
          scroll={{ x: scrollX }}
          columns={columns}
          dataSource={transformRender(dataSource) || []}
        />
      </Fragment>
    );
  }
}
