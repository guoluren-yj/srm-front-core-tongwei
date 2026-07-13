/*
 * ListTable - 计划单维护
 * @date: 2019/12/11 15:04:50
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, InputNumber, Input } from 'hzero-ui';
import { isNumber, sum, uniqBy } from 'lodash';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import './index.less';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
@connect(({ planSheet }) => ({
  planSheet,
}))
export default class ListTable extends Component {
  /*
  一列日期对应多行
  */
  // @Bind()
  // renderPlanNum(val, record, index, order, symbol) {
  //   return (
  //     <Form.Item>
  //       {this.props.form.getFieldDecorator(
  //         `${symbol}${record.supplierTenantId}#key${index + 1}#${record.planLineId}`,
  //         {
  //           initialValue: val,
  //         }
  //       )(
  //         <InputNumber
  //           disabled={order !== 0}
  //           min={0}
  //           max={999999999}
  //           onChange={text =>
  //             this.handleChangePlanData(text, record.scheduleDetailMap.APLAN[index], record)
  //           }
  //         />
  //       )}
  //     </Form.Item>
  //   );
  // }

  @Bind()
  handleChangePlanData(value, record, index, key) {
    const { dispatch, dataSource, transformOrigin, transformRender } = this.props;
    const _dataRender = transformRender(dataSource);
    _dataRender[index][key].planQuantity = value;
    const _dataSource = transformOrigin(_dataRender, dataSource);
    // console.log('_dataSource', _dataSource);
    dispatch({
      type: 'planSheet/updateState',
      payload: { planDetailList: _dataSource },
    });
  }
  /**
   * 渲染动态列表格数据源
   *
   * @param {*} [dataSource=[]]
   * @returns
   */
  // @Bind()
  // renderDataSource(dataSource = []) {
  //   if (dataSource.length > 0) {
  //     const planDataSource = dataSource.map(item => {
  //       let elementValue = {};
  //       const {
  //         scheduleDetailMap: { APLAN = [] },
  //         ...otherItem
  //       } = item;
  //       APLAN.forEach(elementItem => {
  //         elementValue = {
  //           ...elementValue,
  //           [`key${elementItem.key}`]: elementItem.planQuantity,
  //         };
  //       });
  //       return {
  //         ...otherItem,
  //         ...elementValue,
  //       };
  //     });
  //     return planDataSource;
  //   } else {
  //     return [];
  //   }
  // }

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
          disabled: arr[i].planType !== 'PLAN',
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
  // @Bind()
  // renderPlanCol(dataSource) {
  //   if (dataSource.length !== 0) {
  //     const { scheduleDetailMap = {} } = dataSource[0];
  //     const arr = [];
  //     // eslint-disable-next-line guard-for-in
  //     for (const i in scheduleDetailMap) {
  //       arr.push(...scheduleDetailMap[i]);
  //     }
  //     const temp = this.handleResultData(arr); // 后端数据处理
  //     return temp.map((item, index) => {
  //       return {
  //         dataIndex: `key${item.key}${item.planDate}`,
  //         title: item.planDate,
  //         width: 120,
  //         center: true,
  //         className: 'date no-padding',
  //         // props: { colSpan: 0 },
  //         render: (val, record, i) => {
  //           // console.log(i, 'i'); // 将数据拿到塞进去每一行，每一列数据再另外做拆分
  //           return {
  //             children: [{ key: 1 }, { key: 2 }].map(obj => <span>{obj.key}</span>),
  //           };
  //         },
  //       };
  //     });
  //   }
  // }

  @Bind()
  renderPlanCol(dataSource) {
    if (dataSource.length !== 0) {
      const { scheduleDetailMap = {} } = dataSource[0];
      const arr = [];
      // eslint-disable-next-line guard-for-in
      for (const i in scheduleDetailMap) {
        arr.push(...scheduleDetailMap[i]);
      }
      // const temp = this.handleResultData(arr); // 后端数据处理
      return arr.map((item) => {
        const { planType, planDate } = item;
        return {
          dataIndex: `${planType}$$${planDate}`,
          title: item.planDate,
          width: 120,
          center: true,
          className: 'date no-padding',
          render: (val = {}, record, idx) => {
            // console.log('index', idx);
            const { planQuantity = 0 } = val;
            return ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`${planType}$$${planDate}`, {
                  initialValue: record[`${planType}$$${planDate}`].planQuantity || 0,
                })(
                  <InputNumber
                    // disabled={order !== 0}
                    disabled={planType !== 'APLAN'}
                    min={0}
                    max={999999999}
                    onChange={(value) => {
                      this.handleChangePlanData(value, record, idx, `${planType}$$${planDate}`);
                    }}
                  />
                )}
              </FormItem>
            ) : (
              planQuantity
            );
          },
        };
      });
    }
  }

  @Bind()
  handleChangeData(value, record, index) {
    const { dispatch, dataSource } = this.props;
    dataSource[index].planQuantity = value;
    console.log(dataSource, 'dataSource');
    dispatch({
      type: 'planSheet/updateState',
      payload: { planDetailList: dataSource },
    });
  }

  @Bind()
  handleChangePurRemark(value, record, index) {
    const { dispatch, dataSource } = this.props;
    dataSource[index].purchaserRemark = value;
    dispatch({
      type: 'planSheet/updateState',
      payload: { planDetailList: dataSource },
    });
  }

  // @Bind()
  // handleChangePlanData(value, record, line) {
  //   const { dispatch, dataSource, planSheet } = this.props;
  //   const { aPlan } = planSheet;
  //   // 处理表格多行数据的情况
  //   const changeArr = dataSource.filter(i => i.planLineId === line.planLineId)[0];
  //   const recordIndex = dataSource.findIndex(i => i.planLineId === changeArr.planLineId);
  //   const { scheduleDetailMap } = changeArr;
  //   const arr = []; // 改变数据源
  //   // eslint-disable-next-line guard-for-in
  //   for (const i in scheduleDetailMap) {
  //     arr.push(...scheduleDetailMap[i]);
  //   }
  //   arr.filter(item => item.planDetailId === record.planDetailId)[0].planQuantity = value;
  //   dispatch({
  //     type: 'planSheet/updateState',
  //     payload: {
  //       aPlan: {
  //         ...aPlan,
  //         recordIndex: arr,
  //       },
  //     },
  //   });
  // }

  @Bind()
  getColumns(dataSource) {
    // const {planDetailHeader={}} =this.props;
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
      // 新增字段
      {
        title: intl.get(`sodr.common.model.common.quantity`).d('订单数量'),
        dataIndex: 'quantity',
        width: 130,
      },
      {
        title: intl.get(`sodr.common.model.common.quantityDelivered`).d('已交货数量'),
        dataIndex: 'quantityDelivered',
        width: 130,
      },
      {
        title: intl.get(`sodr.common.model.common.deliveryQuantitys`).d('未交货数量'),
        dataIndex: 'deliveryQuantity',
        width: 130,
      },
      {
        title: intl.get(`sodr.common.model.common.planQuantity`).d('本次计划数量'),
        dataIndex: 'planQuantity',
        width: 140,
        render: (val, record, index) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('planQuantity', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.common.model.common.planQuantity`).d('本次计划数量'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  max={9999999999}
                  style={{ width: '100%' }}
                  onChange={(text) => this.handleChangeData(text, record, index)}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.readyPlanQuantitys`).d('类别'),
        dataIndex: 'readyPlanQuantity',
        width: 60,
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
        className: 'date no-padding',
        center: true,
      },
      {
        title: this.planTitle(),
        // children: this.renderPlanCol(dataSource),
        children: this.renderPlanCol(dataSource),
        className: 'date no-padding',
        center: true,
        // dataIndex: 'scheduleDetailMap',
      },
      {
        title: intl.get(`sodr.common.model.common.purchaserRemark1`).d('采购方备注'),
        dataIndex: 'purchaserRemark',
        width: 150,
        render: (val, record, index) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('purchaserRemark', {
                initialValue: val,
              })(
                <Input
                  onChange={(e) => this.handleChangePurRemark(e.target.value, record, index)}
                  min={0}
                  max={9999999999}
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.supplierRemark`).d('供应商备注'),
        dataIndex: 'supplierRemark',
        width: 150,
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
