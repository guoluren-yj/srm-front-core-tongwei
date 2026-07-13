import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Tabs, Timeline, Icon } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import ApproveRecord from '_components/ApproveRecord';
import formatterCollections from 'utils/intl/formatterCollections';

import { maHistoryDs, approveHistroyDs } from '../../stores/historyDs';

import style from './index.less';

const externalProcessUserName = intl
  .get('hzero.common.view.external.processUserName')
  .d('外部人员');

const { TabPane } = Tabs;
const { Item } = Timeline;
const OperationHistory = ({ maHeaderId }) => {
  const maHeaderDataSet = useMemo(() => new DataSet(maHistoryDs(maHeaderId)));
  const approveHistroyDataSet = useMemo(() => new DataSet(approveHistroyDs(maHeaderId)));

  const [classifiedData, setClassified] = useState([]);
  const [dataKey, setDataKey] = useState([]);
  const [approveData, setApproveData] = useState([]);
  const [approveArr, setApproveArr] = useState([]);
  const [activeKey, setActiveKey] = useState('operator');
  useEffect(() => {
    // 操作记录
    maHeaderDataSet.query().then(res => {
      const currentItem = [];
      const batchNoArray = Array.from(
        new Set(
          res.map(ele => {
            if (ele.batchNo) {
              return ele.batchNo;
            } else {
              return ele.creationDate;
            }
          })
        )
      );
      batchNoArray.forEach(item => {
        currentItem.push(res.filter(ele => ele.batchNo === item || ele.creationDate === item));
      });
      const classified = currentItem.map((ele, index) => {
        dataKey[index] = 'off';
        // 只会展示1行动作的, 新建 ,下发,审批通过,审批拒绝,确认,退回,删除,维修,转移,报废
        if (
          ele.length === 1 &&
          [
            'NEW',
            'RELEASE',
            'APPROVED',
            'REJECT',
            'CONFORM',
            'SEND_BACK',
            'DELETE',
            'CHANGE',
            'MAINTAIN',
            'TRANSFER',
            'SCRAP',
          ].includes(ele[0].processType)
        ) {
          const { processType, processTypeMeaning } = ele[0];
          const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
          return {
            ...ele[0],
            ...iconAndProcessMeaning,
            list: [],
          };
          // 'UPDATE', 'UPDATE_LINE', 'MODIFY', 'MOULD_CHANGE_EFFECT' 'DELETE_LINE' 'ADD_LINE',
          // 会展示多行 更新、更新行、变更 新增行 删除行
        } else {
          const { processType, processTypeMeaning } = ele[0];
          const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
          return {
            processType: ele[0].processType,
            creationDate: ele[0].creationDate,
            processUserName: ele[0].processUserName,
            processRoleName: ele[0].processRoleName,
            version: ele[0].version,
            reason: ele[0].reason,
            icon: 'mode_edit',
            ...iconAndProcessMeaning,
            list: ele,
          };
        }
      });
      setClassified(classified);
    });
    // 审批记录
    approveHistroyDataSet.query().then(res => {
      let allHistoricTaskExtList = [];
      res.forEach(ele => {
        allHistoricTaskExtList = allHistoricTaskExtList.concat(ele.historicTaskExtList || []);
      });
      setApproveData(
        allHistoricTaskExtList.reverse().map(e => ({
          ...e,
          name: e.nodeStatus ? (
            <span id={e.id} style={{ marginRight: e.name ? '0px' : '-0.04rem' }}>
              {e.name}
            </span>
          ) : (
            e.name
          ),
        }))
      );
    });
  }, [maHeaderId]);

  const currentStatus = (type, processTypeMeaning) => {
    let icon = 'person_pin_circle';
    let processTypeCodeMeaning = processTypeMeaning;
    switch (true) {
      case ['NEW', 'NEW_LINE', 'MOUID_NEW_LINE', 'NEW_EXPAND_LINE'].includes(type):
        icon = 'add';
        break;
      case ['DELETE', 'DELETE_LINE', 'MOUID_DELETE_LINE', 'DELETE_EXPAND_LINE'].includes(type):
        icon = 'delete';
        break;
      case [
        'UPDATE',
        'MOUID_UPDATE',
        'UPDATE_LINE',
        'MOUID_UPDATE_LINE',
        'UPDATE_EXPAND_LINE',
        'MODIFY',
      ].includes(type):
        icon = 'mode_edit';
        break;
      case ['APPROVED', 'REJECT'].includes(type):
        icon = 'authorize';
        processTypeCodeMeaning = intl.get('siec.mould.button.approval').d('最终审批了');
        break;
      case ['RELEASE'].includes(type):
        icon = 'done_all';
        break;
      case ['CONFORM'].includes(type):
        icon = 'check';
        break;
      case ['SEND_BACK'].includes(type):
        icon = 'reply';
        break;
      case ['MAINTAIN'].includes(type):
        icon = 'build';
        break;
      case ['TRANSFER'].includes(type):
        icon = 'cached';
        break;
      case ['SCRAP'].includes(type):
        icon = 'cancel';
        break;
      case ['MOULD_CHANGE_EFFECT'].includes(type):
        icon = 'cached';
        return {
          icon,
          processTypeCodeMeaning: intl
            .get('siec.mould.currentStatus.changeInfluence')
            .d('变更【模具主数据】影响了'),
          processTypeMeaning: intl
            .get('siec.mould.currentStatus.changeInfluence')
            .d('变更【模具主数据】影响了'),
        };
      default:
        break;
    }
    return { icon, processTypeMeaning, processTypeCodeMeaning };
  };

  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}</span>
      </div>
    );
  };

  const handleChangeTab = useCallback(
    tabKey => {
      if (activeKey === tabKey) return;
      setActiveKey(tabKey);
    },
    [activeKey]
  );

  const onViewDetail = useCallback(data => {
    setActiveKey('approved');

    setTimeout(() => {
      const nowTime = data.creationDate;
      // 先从审批记录里面过滤出审批节点
      const approveNodeArr = approveArr.length
        ? approveArr
        : approveData
            .filter(ele => ele.nodeStatusCode)
            .sort((a, b) => (a.endTime > b.endTime ? 1 : -1));
      setApproveArr(approveNodeArr);

      // 查找距离操作记录工作流审批距离最近的审批节点，即对应的审批节点

      // 操作记录的节点时间 大于 审批记录的节点时间
      let index = null;

      for (let i = 0; i < approveNodeArr.length; i++) {
        if (i === approveNodeArr.length - 1 && approveNodeArr[i].startTime < nowTime) {
          index = i;
        }
        if (approveNodeArr[i].startTime > nowTime && index === null) {
          index = i - 1;
        }
      }

      if (index !== -1) {
        // 跳转到具体对应的节点
        const down = document.createElement('a');
        down.href = `#${approveNodeArr[index].id}`;
        down.click();
        down.remove();
      }
    }, 0);
  });

  const renderOperateHistory = () => {
    return (
      <Timeline className="operating-timeline">
        {classifiedData.map((item, index) => (
          <Item
            color={item.color || '#E5E5E5'}
            onClick={() => {
              const [...current] = dataKey;
              current[index] = current[index] === 'on' ? 'off' : 'on';
              setDataKey(current);
            }}
          >
            <Icon type={item.icon} style={{ fontSize: 14 }} />

            <div className="operating-timeline-info">
              {item.approveMethodCode === 'WORKFLOW' ||
              (isEmpty(item.processUserName) && item.approveMethodCode === 'EXTERNAL') ? (
                <>
                  {item.approveMethodCode === 'WORKFLOW' ? (
                    <span>
                      <a
                        onClick={() => onViewDetail(item)}
                        style={{
                          color: item.processType === 'APPROVED' ? '#47b881' : '#f56349',
                        }}
                      >
                        {item.processType === 'APPROVED'
                          ? intl.get(`siec.mould.status.workfolw.adopt`).d('工作流审批通过')
                          : intl.get(`siec.mould.status.workfolw.reject`).d('工作流审批拒绝')}
                      </a>
                    </span>
                  ) : (
                    <span>
                      <a
                        style={{
                          color: item.processType === 'APPROVED' ? '#47b881' : '#f56349',
                        }}
                      >
                        {item.processType === 'APPROVED'
                          ? intl.get(`siec.mould.status.external.adopt`).d('外部系统审批通过')
                          : intl.get(`siec.mould.status.external.reject`).d('外部系统审批拒绝')}
                      </a>
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="operator">
                    {item.processUserName || externalProcessUserName}
                    {item.processRoleName ? `(${item.processRoleName})` : null}
                  </span>

                  <span className="status gray">{item.processTypeCodeMeaning}</span>
                  {!['UPDATE_LINE', 'MOUID_UPDATE_LINE', 'UPDATE_EXPAND_LINE'].includes(
                    item.processType
                  ) && (
                    <span className="result">
                      {intl.get('siec.mould.action.view.mouldAccount').d('【模具台帐】')}
                    </span>
                  )}
                  {/* {['UPDATE_LINE', 'UPDATE_EXPAND_LINE'].includes(item.processType) && (
                      <span className="status gray">
                        {intl.get('siec.mould.model.common.lineNum').d('行号')}:[{item.version}]
                      </span>
                    )} */}
                  {['MODIFY'].includes(item.processType) && (
                    <span className="status gray">
                      {intl.get('siec.mould.model.common.version').d('版本')}:[{item.version}]
                    </span>
                  )}
                  {['APPROVED', 'REJECT'].includes(item.processType) && (
                    <>
                      <span className="status gray">
                        {intl.get('siec.mould.action.view.approveResult').d('审批结果为')}
                      </span>
                      <span className="result">
                        <span
                          style={{
                            color:
                              item.processType === 'APPROVED'
                                ? 'rgb(71, 184, 131)'
                                : 'rgb(245, 102, 73)',
                          }}
                        >
                          【{item.processTypeMeaning}】
                        </span>
                      </span>
                    </>
                  )}
                  {!isEmpty(item.list) && (
                    <Icon type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'} />
                  )}
                  {item.list &&
                    dataKey[index] === 'on' &&
                    item.list.map(ele => {
                      if (
                        [
                          'UPDATE',
                          'MOUID_UPDATE',
                          'UPDATE_LINE',
                          'MOUID_UPDATE_LINE',
                          'MODIFY',
                          'UPDATE_EXPAND_LINE',
                        ].includes(ele.processType)
                        // ele.processType === 'UPDATE' ||
                        // ele.processType === 'UPDATE_LINE' ||
                        // ele.processType === 'MODIFY'
                      ) {
                        return (
                          <div className="date">
                            <span className="status gray">
                              {ele.processUserName || externalProcessUserName}
                              &nbsp;
                            </span>
                            {intl
                              .getHTML('siec.mould.action.view.changeTo', {
                                processRemark: ele?.processRemark ?? '',
                                oldValue: ele?.oldValue ?? '',
                                newValue: ele?.newValue ?? '',
                              })
                              .d(
                                <>
                                  将<span className="status gray">【{ele.processRemark}】</span>由
                                  <span className="status gray">【{ele.oldValue}】</span>
                                  改成
                                  <span className="status gray">【{ele.newValue}】</span>
                                </>
                              )}
                            {['UPDATE_LINE', 'MOUID_UPDATE_LINE', 'UPDATE_EXPAND_LINE'].includes(
                              ele.processType
                            ) && ele.version ? (
                              <>
                                {intl.get('siec.mould.model.common.lineNum').d('行号')}
                                <span className="status gray">【{ele.version}】</span>
                              </>
                            ) : (
                              <></>
                            )}
                          </div>
                        );
                      } else if (ele.processType === 'MOULD_CHANGE_EFFECT') {
                        return (
                          <div className="date">
                            <span className="status gray">
                              {ele.processUserName}
                              &nbsp;
                            </span>
                            {ele.processRemark.includes('删除行') ||
                            ele.processRemark.includes('新增行') ? (
                              <>
                                <span className="date gray">{ele.processRemark}</span>
                                {ele.lineNum && (
                                  <>
                                    &nbsp;{intl.get('siec.mould.model.common.lineNum').d('行号')}
                                    <span className="status gray">【{ele.lineNum}】</span>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {intl
                                  .getHTML('siec.mould.action.view.changeTo', {
                                    processRemark: ele?.processRemark ?? '',
                                    oldValue: ele?.oldValue ?? '',
                                    newValue: ele?.newValue ?? '',
                                  })
                                  .d(
                                    <>
                                      将<span className="status gray">【{ele.processRemark}】</span>
                                      由<span className="status gray">【{ele.oldValue}】</span>
                                      改成
                                      <span className="status gray">【{ele.newValue}】</span>
                                    </>
                                  )}
                                {ele.version && (
                                  <>
                                    {intl.get('siec.mould.model.common.lineNum').d('行号')}
                                    <span className="status gray">【{ele.version}】</span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        );
                      } else if (
                        [
                          'NEW_LINE',
                          'DELETE_LINE',
                          'MOUID_NEW_LINE',
                          'MOUID_DELETE_LINE',
                          'DELETE_EXPAND_LINE',
                          'NEW_EXPAND_LINE',
                        ].includes(ele.processType)
                      ) {
                        return (
                          <div className="date">
                            <span className="status gray">
                              {/* 行号:{ele.version}&nbsp;物料:{ele.processRemark} */}
                              {ele.processRemark ? (
                                intl
                                  .getHTML('siec.mould.model.lineAndProcess', {
                                    lineNum: ele.version,
                                    processRemark: ele.processRemark,
                                  })
                                  .d(
                                    <span className="status gray">
                                      行号:{ele.version}&nbsp;物料:{ele.processRemark}
                                    </span>
                                  )
                              ) : (
                                <span className="status gray">
                                  {intl.get('entity.supplier.ecLineNum').d('行号')}:{ele.version}
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      } else {
                        return <div />;
                      }
                    })}
                  {['APPROVED', 'REJECT'].includes(item.processType) && (
                    <div className="date gray">
                      {intl.get('siec.mould.action.view.approveRemark').d('审批意见')}:{' '}
                      {item.processRemark ? item.processRemark : ''}
                    </div>
                  )}
                  {['CHANGE'].includes(item.processType) && (
                    <>
                      <div className="date gray">
                        {intl.get('siec.mould.action.view.changeType').d('异动类型')}:
                        {item.processRemark}
                      </div>
                      <div className="date gray">
                        {intl.get('siec.mould.action.view.changeReason').d('异动原因')}:
                        {item.reason}
                      </div>
                    </>
                  )}
                  {['MAINTAIN', 'TRANSFER', 'SCRAP', 'MODIFY'].includes(item.processType) && (
                    <div className="date gray">
                      {intl.get('siec.mould.action.view.changeReason').d('异动原因')}: {item.reason}
                    </div>
                  )}
                  {['TRANSFER'].includes(item.processType) && (
                    <div className="date gray">
                      {intl.get('siec.mould.action.view.transfer').d('转移供应商')}: {item.oldValue}{' '}
                      ={'>'} {item.newValue}
                    </div>
                  )}
                </>
              )}
              <div className="date gray">{dateTimeRender(item.creationDate)}</div>
            </div>
          </Item>
        ))}
      </Timeline>
    );
  };

  return (
    <div className={style.operating}>
      {approveData?.length ? (
        <div className={style['operating-content']}>
          <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onChange={handleChangeTab}>
            <TabPane
              tab={intl.get('hzero.common.view.message.operateHistory').d('操作记录')}
              key="operator"
            >
              <div className={style['scroll-content']}>{renderOperateHistory()}</div>
            </TabPane>
            <TabPane
              tab={intl.get('hzero.common.button.approveHistory').d('审批记录')}
              key="approved"
            >
              <div className={style['scroll-content']}>
                <>
                  <div style={{ fontWeight: 600, marginBottom: 20 }} />
                  <ApproveRecord data={approveData} />
                </>
                {!approveData?.length && handleNoData()}
              </div>
            </TabPane>
          </Tabs>
        </div>
      ) : (
        renderOperateHistory()
      )}
    </div>
  );
};

export default formatterCollections({
  code: ['hzero.common', 'siec.mould', 'entity.supplier'],
})(OperationHistory);
