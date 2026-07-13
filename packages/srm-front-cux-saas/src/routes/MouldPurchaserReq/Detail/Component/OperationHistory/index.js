import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Tabs, Timeline, Icon } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import ApproveRecord from '_components/ApproveRecord';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SIEC } from 'srm-front-boot/lib/utils/config';

import { getCurrentOrganizationId } from 'utils/utils';

import { maHistoryDs, approveHistroyDs } from '../../../indexDs';

import style from './index.less';

const externalProcessUserName = intl
  .get('hzero.common.view.external.processUserName')
  .d('外部人员');

const { TabPane } = Tabs;
const { Item } = Timeline;
const OperationHistory = ({ mouldReqId, isFilterFlag, modal }) => {
  const maHeaderDataSet = useMemo(() => new DataSet(maHistoryDs(mouldReqId)), [mouldReqId]);
  const approveHistroyDataSet = useMemo(() => new DataSet(approveHistroyDs(mouldReqId)));

  const [classifiedData, setClassified] = useState([]);
  const [dataKey, setDataKey] = useState([]);
  const [approveData, setApproveData] = useState([]);
  const [approveArr, setApproveArr] = useState([]);
  const [activeKey, setActiveKey] = useState('operator');
  useEffect(() => {
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
  }, [mouldReqId]);

  useEffect(() => {
    handleQuery({});
  }, [handleQuery]);

  const handleQuery = useCallback((params) => {
    // 操作记录
    const { processedDateRange, ...other } = params?.params || {};
    const [createDateStr, createDateEnd] = processedDateRange?.split(',') || [];
    const queryParams = { createDateStr, createDateEnd, ...other };
    maHeaderDataSet.setState({ queryParams });
    maHeaderDataSet.query(0, queryParams).then(res => {
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
          ['NEW', 'NEW_CHANGE', 'SUBMIT', 'DELETE'].includes(ele[0].processType)
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
          const {
            processType,
            processTypeMeaning,
            processRemark,
            version,
            reason,
            processUserName,
            creationDate,
            processRoleName,
          } = ele[0];
          const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
          return {
            processType,
            creationDate,
            processUserName,
            processRoleName,
            version,
            reason,
            processRemark,
            icon: 'mode_edit',
            ...iconAndProcessMeaning,
            list: ele,
          };
        }
      });
      setClassified(classified);
    });
  }, [maHeaderDataSet]);

  useEffect(() => {
    handleUpdateFooterBtn();
  }, [handleUpdateFooterBtn, activeKey]);

  const getQueryParams = useCallback(() => {
    return {
      ...(maHeaderDataSet.getState('queryParams')),
      mouldReqId,
    };
  }, [mouldReqId, maHeaderDataSet]);

  const handleUpdateFooterBtn =useCallback(() => {
    if (modal && isFilterFlag) {
      if (activeKey === 'operator') {
        modal.update({
          footer: (okBtn) => [
            okBtn,
            <ExcelExportPro
              buttonText={intl.get('hzero.common.button.export').d('导出')}
              templateCode='SIEC_MOULD_REQ_ACTION_EXPORT' // 导出模板编码
              exportAsync
              otherButtonProps={{
                type: 'c7n-pro',
              }}
              requestUrl={`${SRM_SIEC}/v1/${getCurrentOrganizationId()}/mould-reqs/mould-req-action/record/export`}
              queryParams={() => getQueryParams()}
              allBody
              method="POST"
            />,
          ],
        });
      } else {
        modal.update({
          footer: (okBtn) => [okBtn],
        });
      }
    }
  }, [modal, getQueryParams, activeKey]);

  const currentStatus = (type, processTypeMeaning) => {
    let icon = 'person_pin_circle';
    let color;
    let processTypeCodeMeaning = processTypeMeaning;
    switch (true) {
      case ['NEW', 'NEW_CHANGE'].includes(type):
        icon = 'add';
        break;
      case ['DELETE', 'DELETE_LINE', 'DELETE_EXPAND_LINE'].includes(type):
        icon = 'delete';
        break;
      case ['UPDATE', 'UPDATE_LINE', 'UPDATE_EXPAND_LINE', 'MODIFY', 'NEW_EXPAND_LINE'].includes(
        type
      ):
        icon = 'mode_edit';
        processTypeCodeMeaning = intl.get('sprm.common.view.edited').d('更新了');
        break;
      case ['APPROVED', 'REJECTED', 'WORKFLOW_APPROVED', 'WORKFLOW_REJECTED'].includes(type):
        icon = 'authorize';
        color = ['APPROVED', 'WORKFLOW_APPROVED']?.includes(type)
          ? 'rgb(71, 184, 131)'
          : 'rgb(245, 102, 73)';
        processTypeCodeMeaning = intl.get('siec.mould.button.approvaled').d('审批了');
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
      default:
        break;
    }
    return { icon, color, processTypeMeaning, processTypeCodeMeaning };
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

      console.log(approveNodeArr);
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
      <div>
        {
          isFilterFlag && (
            <FilterBar
              dataSet={[maHeaderDataSet]}
              onQuery={handleQuery}
              autoQuery={false}
              expandable={false}
            />
          )
        }
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
              <Icon
                type={item.icon}
                style={{
                  fontSize: 14,
                  color: item.color,
                }}
              />

              <div className="operating-timeline-info">
                {['WORKFLOW_APPROVED', 'WORKFLOW_REJECTED'].includes(item.processType) ? (
                  <span>
                    <a
                      onClick={() => onViewDetail(item)}
                      style={{
                        color: item.processType === 'WORKFLOW_APPROVED' ? '#47b881' : '#f56349',
                      }}
                    >
                      {item.processType === 'WORKFLOW_APPROVED'
                        ? intl.get(`siec.mould.status.workfolw.adopt`).d('工作流审批通过')
                        : intl.get(`siec.mould.status.workfolw.reject`).d('工作流审批拒绝')}
                    </a>
                  </span>
                ) : (
                  <>
                    <span className="operator">
                      {item.processUserName || externalProcessUserName}
                      {item.processRoleName ? `(${item.processRoleName})` : null}
                    </span>

                    <span className="status gray">{item.processTypeCodeMeaning}</span>
                    <span className="result">
                      {intl.get('siec.mould.action.view.mouldReq').d('【模具申请单】')}
                    </span>
                    {['APPROVED', 'REJECTED'].includes(item.processType) && (
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
                            'CHANGE',
                            'UPDATE_LINE',
                            'MODIFY',
                            'UPDATE_EXPAND_LINE',
                          ].includes(ele.processType)
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
                              {['UPDATE_LINE', 'UPDATE_EXPAND_LINE'].includes(ele.processType) &&
                              ele.lineNum &&
                              ele.processType !== 'NEW_EXPAND_LINE' ? (
                                <>
                                  {intl.get('siec.mould.model.common.lineNum').d('行号')}
                                  <span className="status gray">【{ele.lineNum}】</span>
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
                              {[
                                'NEW_LINE',
                                'DELETE_LINE',
                                'NEW_EXPAND_LINE',
                                'DELETE_EXPAND_LINE',
                              ].includes(ele.processType) ? (
                                ['NEW_EXPAND_LINE', 'DELETE_EXPAND_LINE'].includes(
                                  ele.processType
                                ) ? (
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
                                    <span className="date gray">{ele.processTypeMeaning}</span>
                                    <span className="date gray">{ele.processRemark}</span>
                                    &nbsp;{intl.get('siec.mould.model.common.lineNum').d('行号')}
                                    <span className="status gray">【{ele.lineNum}】</span>
                                  </>
                                )
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
                                  {ele.lineNum && (
                                    <>
                                      {intl.get('siec.mould.model.common.lineNum').d('行号')}
                                      <span className="status gray">【{ele.lineNum}】</span>
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
                            'DELETE_EXPAND_LINE',
                            'NEW_EXPAND_LINE',
                          ].includes(ele.processType)
                        ) {
                          return (
                            <div className="date">
                              <span className="status gray">
                                {/* 行号:{ele.version}&nbsp;物料:{ele.processRemark} */}
                                {ele.processRemark && ele.processType === 'UPDATE_LINE' ? (
                                  intl
                                    .getHTML('siec.mould.model.lineAndProcess', {
                                      lineNum: ele.lineNum,
                                      processRemark: ele.processRemark,
                                    })
                                    .d(
                                      <span className="status gray">
                                        行号:{ele.lineNum}&nbsp;物料:{ele.processRemark}
                                      </span>
                                    )
                                ) : ['NEW_EXPAND_LINE', 'DELETE_EXPAND_LINE'].includes(
                                    ele.processType
                                  ) ? (
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
                                    <span className="date gray">
                                      {ele.processTypeMeaning}&nbsp;物料:{ele.processRemark}
                                    </span>
                                    {ele.lineNum && (
                                      <>
                                        &nbsp;{intl.get('siec.mould.model.common.lineNum').d('行号')}
                                        <span className="status gray">【{ele.lineNum}】</span>
                                      </>
                                    )}
                                  </>
                                )}
                              </span>
                            </div>
                          );
                        } else {
                          return <div />;
                        }
                      })}
                    {['APPROVED', 'REJECTED', 'WORKFLOW_REJECTED', 'WORKFLOW_APPROVED'].includes(
                      item.processType
                    ) &&
                      dataKey[index] === 'on' && (
                        <div className="date gray">
                          {intl.get('siec.mould.action.view.approveRemark').d('审批意见')}:{' '}
                          {item.processRemark ? item.processRemark : '-'}
                        </div>
                      )}
                  </>
                )}
                <div className="date gray">{dateTimeRender(item.creationDate)}</div>
              </div>
            </Item>
          ))}
        </Timeline>
      </div>
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
                <ApproveRecord data={approveData} />
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
