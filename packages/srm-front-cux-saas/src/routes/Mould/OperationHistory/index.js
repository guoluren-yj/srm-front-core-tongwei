import React, { useEffect, useState, useMemo } from 'react';
import { Timeline, Icon } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import { mouldHistoryDs } from '../store/historyDs';

import style from './index.less';

const externalProcessUserName = intl
  .get('hzero.common.view.external.processUserName')
  .d('外部人员');

const { Item } = Timeline;
const OperationHistory = ({ mouldId }) => {
  const maHeaderDataSet = useMemo(() => new DataSet(mouldHistoryDs(mouldId)));

  const [classifiedData, setClassified] = useState([]);
  const [dataKey, setDataKey] = useState([]);

  useEffect(() => {
    // 操作记录
    maHeaderDataSet.query().then((res) => {
      const currentItem = [];
      const batchNoArray = Array.from(
        new Set(
          res.map((ele) => {
            if (ele.batchNo) {
              return ele.batchNo;
            } else {
              return ele.creationDate;
            }
          })
        )
      );
      batchNoArray.forEach((item) => {
        currentItem.push(res.filter((ele) => ele.batchNo === item || ele.creationDate === item));
      });
      const classified = currentItem.map((ele, index) => {
        dataKey[index] = 'off';
        // 只会展示1行动作的, 新建, 删除, 生效
        if (
          ele.length === 1 &&
          [
            'NEW',
            // 'NEW_LINE',
            // 'DELETE_LINE',
            'DELETE',
            'EFFECTIVE',
            // 'CHANGE',
          ].includes(ele[0].processType)
        ) {
          const { processType, processTypeMeaning } = ele[0];
          const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
          return {
            ...ele[0],
            ...iconAndProcessMeaning,
            list: [],
          };
          // 'UPDATE', 'UPDATE_LINE' 'CHANGE'
          // 会展示多行 更新、更新行、变更行 删除行 新增行
        } else {
          const { processType, processTypeMeaning } = ele[0];
          const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
          return {
            processType: ele[0].processType,
            creationDate: ele[0].creationDate,
            processUserName: ele[0].processUserName,
            lineNum: ele[0].lineNum,
            icon: 'mode_edit',
            processRemark: ele[0]?.processRemark,
            ...iconAndProcessMeaning,
            list: ele,
          };
        }
      });
      setClassified(classified);
    });
  }, [mouldId]);

  const currentStatus = (type, processTypeMeaning) => {
    let icon = 'person_pin_circle';
    switch (true) {
      case ['NEW', 'NEW_LINE', 'MOUID_NEW_LINE'].includes(type):
        icon = 'add';
        break;
      case ['DELETE', 'DELETE_LINE', 'MOUID_DELETE_LINE'].includes(type):
        icon = 'delete';
        break;
      case ['UPDATE', 'MOUID_UPDATE', 'UPDATE_LINE', 'MOUID_UPDATE_LINE'].includes(type):
        icon = 'mode_edit';
        break;
      case ['EFFECTIVE'].includes(type):
        icon = 'check';
        break;
      case ['APPROVED', 'REJECTED'].includes(type):
        icon = 'authorize';
        break;
      case ['CHANGE'].includes(type):
        icon = 'cached';
        break;
      case ['REQ_CHANGE'].includes(type):
        icon = 'cached';
        return {
          icon,
          processTypeCodeMeaning: intl
            .get('siec.mould.currentStatus.changeReq')
            .d('变更【模具申请单】影响了'),
          processTypeMeaning: intl
            .get('siec.mould.currentStatus.changeReq')
            .d('变更【模具申请单】影响了'),
        };
      case [
        'ACCOUNT-UPDATE_LINE',
        'ACCOUNT-NEW_LINE',
        'ACCOUNT-TRANSFER',
        'ACCOUNT-CHANGE',
      ].includes(type):
        icon = 'cached';
        return {
          icon,
          processTypeCodeMeaning: intl
            .get('siec.mould.currentStatus.mouldChange')
            .d('通过异动联动变更了'),
          processTypeMeaning: intl
            .get('siec.mould.currentStatus.mouldChange')
            .d('通过异动联动变更了'),
        };
      default:
        break;
    }
    return { icon, processTypeMeaning };
  };

  return (
    <div className={style.operating}>
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
              <span className="operator">{item.processUserName || externalProcessUserName}</span>
              <span className="status gray">{item.processTypeMeaning}</span>
              {!['UPDATE_LINE'].includes(item.processType) && (
                <span className="result">
                  {intl.get('siec.mould.action.view.mouldData').d('【模具主数据】')}
                </span>
              )}
              {['UPDATE_LINE'].includes(item.processType) && (
                <span className="status gray">
                  {intl.get('siec.mould.model.common.lineNum').d('行号')}:[{item.lineNum}]
                </span>
              )}
              {!isEmpty(item.list) && (
                <Icon type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'} />
              )}
              {item.list &&
                dataKey[index] === 'on' &&
                item.list.map((ele) => {
                  if (
                    ['MOUID_UPDATE_LINE', 'UPDATE_LINE', 'UPDATE', 'MOUID_UPDATE'].includes(
                      ele.processType
                    )
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
                      </div>
                    );
                  } else if (
                    [
                      'CHANGE',
                      'REQ_CHANGE',
                      'UPDATE_EXPAND_LINE',
                      'MOUID_NEW_LINE',
                      'MOUID_DELETE_LINE',
                      'ACCOUNT-UPDATE_LINE',
                      'ACCOUNT-TRANSFER',
                      'ACCOUNT-CHANGE',
                    ].includes(ele.processType)
                  ) {
                    return (
                      <div className="date">
                        <span className="status gray">
                          {ele.processUserName}
                          &nbsp;
                        </span>
                        {ele.processRemark &&
                        (ele.processRemark.includes('删除行') ||
                          ele.processRemark.includes('新增行')) ? (
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
                                  将<span className="status gray">【{ele.processRemark}】</span>由
                                  <span className="status gray">【{ele.oldValue}】</span>
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
                      'ACCOUNT-NEW_LINE',
                    ].includes(ele.processType)
                  ) {
                    return (
                      <div className="date">
                        {ele.processRemark ? (
                          intl
                            .getHTML('siec.mould.model.lineAndProcess', {
                              lineNum: ele.lineNum,
                              processRemark: ele.processRemark,
                            })
                            .d(
                              <span className="status gray">
                                行号:{ele.lineNum} &nbsp;物料:{ele.processRemark}
                              </span>
                            )
                        ) : (
                          <span className="status gray">行号:{ele.lineNum}</span>
                        )}
                      </div>
                    );
                  } else if (['APPROVED', 'REJECTED'].includes(ele.processType)) {
                    return (
                      <div className="date">
                        {intl.get('siec.mould.action.view.approveRemark').d('审批意见')}:【
                        {ele.processRemark || ''}】
                      </div>
                    );
                  } else {
                    return <div />;
                  }
                })}
              <div className="date gray">{dateTimeRender(item.creationDate)}</div>
            </div>
          </Item>
        ))}
      </Timeline>
    </div>
  );
};

export default formatterCollections({
  code: ['hzero.common', 'siec.mould'],
})(OperationHistory);
