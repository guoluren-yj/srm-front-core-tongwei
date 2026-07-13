/*
 * @Date: 2023-11-23 16:27:02
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Dropdown, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import HistoryVersion from '../HistoryVersion';

const HeaderBtns = observer(
  ({
    isEdit,
    loading,
    onSave,
    onEdit,
    onPublish,
    dispatch,
    basicDs,
    versionNum,
    jumpSource,
    sourceEvalTplId,
    sourceEvalTplType,
    editFlag,
    historyFlag,
  }) => {
    const { evalStatusCode } = basicDs.current?.get(['evalStatusCode']) || {};
    // (!jumpSource && versionNum === 0) 版本为0，点击编码进来的
    // historyFlag 历史版本只有一条数据，从历史版本进入详情页不展示历史版本按钮
    const hiddenHistory =
      isEdit ||
      evalStatusCode !== 'PUBLISHED' ||
      (!jumpSource && versionNum === 0) ||
      historyFlag === '0';
    return (
      <Fragment>
        <Button
          icon="publish2"
          color="primary"
          hidden={!isEdit}
          loading={loading}
          onClick={onPublish}
        >
          {intl.get(`hzero.common.button.release`).d('发布')}
        </Button>
        <Button icon="save" funcType="flat" hidden={!isEdit} loading={loading} onClick={onSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button
          icon="mode_edit"
          funcType="flat"
          onClick={onEdit}
          loading={loading}
          hidden={isEdit || !(editFlag === '1' && !jumpSource)} // jumpSource不为空，说明是从历史版本跳转进来的，需隐藏操作按钮
        >
          {intl.get('hzero.common.button.edit').d('编辑')}
        </Button>
        <Dropdown
          overlay={
            <HistoryVersion
              filterData
              editFlag={editFlag}
              dispatch={dispatch}
              showSubMenuFlag={false}
              record={basicDs.current}
              type={jumpSource || 'DETAIL_HISTORY'}
              sourceEvalTplId={sourceEvalTplId}
              sourceEvalTplType={sourceEvalTplType}
            />
          }
        >
          <Button icon="schedule" funcType="flat" loading={loading} hidden={hiddenHistory}>
            <span>{intl.get('hzero.common.button.historyVersion').d('历史版本')}</span>
            <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
          </Button>
        </Dropdown>
      </Fragment>
    );
  }
);

export default HeaderBtns;
