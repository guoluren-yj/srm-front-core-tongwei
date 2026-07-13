/**
 * 发布历史
 */
import React, { useState, useMemo, useCallback } from 'react';
import { map, noop, isEmpty } from 'lodash';
import { Icon } from 'choerodon-ui';
import { Progress, Tooltip, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './index.less';

const prefixCls = 'release-history-record';

export default function ReleaseHistory(props) {
  const {
    dataSource = {},
    onRepublish = noop,
    onQueryReleasedProgress = noop,
    onDeleteReleasedHistory = noop,
  } = props;
  const [spinning, setSpinning] = useState(false);

  const finishedCount = useMemo(() => {
    let count = 0;
    Object.values(dataSource).forEach((value) => {
      if (value.status === 'success' && value.progress === 100) {
        count++;
      }
    });
    return count;
  }, [dataSource]);

  const processingCount = useMemo(() => {
    // 发布中
    let count = 0;
    Object.values(dataSource).forEach((value) => {
      if (value.status === 'success' && value.progress < 100) {
        count++;
      }
    });
    return count;
  }, [dataSource]);

  const totalCount = useMemo(() => Object.values(dataSource).length, [dataSource]);

  const failedCount = totalCount - finishedCount - processingCount;

  const releaseLoading = finishedCount + failedCount < totalCount;

  const releaseStatus = useMemo(() => {
    if (releaseLoading) {
      return 'processing';
    }
    if (failedCount) {
      return 'failed';
    } else {
      return 'success';
    }
  }, [finishedCount, totalCount, releaseLoading]);

  const handleClear = useCallback(async (releaseBatch) => {
    try {
      setSpinning(true);
      await onDeleteReleasedHistory(releaseBatch);
      onQueryReleasedProgress();
    } finally {
      setSpinning(false);
    }
  }, []);

  const handleRepublish = useCallback(async (releaseBatch) => {
    try {
      setSpinning(true);
      await onRepublish(releaseBatch);
      onQueryReleasedProgress();
    } finally {
      setSpinning(false);
    }
  }, []);

  const renderProcessingItem = (item) => {
    const { totalCount: count, progress } = item;
    return (
      <div className={styles[`${prefixCls}-processing-item-wrapper`]}>
        <Icon type="publish2" />
        <span className={styles[`${prefixCls}-item-count`]}>
          {intl
            .get(`ssrc.priceLibraryNew.view.message.priceReleaseCount`, {
              count,
            })
            .d('发布{count}条价格')}
        </span>
        <span className={styles[`${prefixCls}-item-rate`]}>
          {intl.get(`ssrc.priceLibraryNew.view.message.priceReleaseStatus`).d('正在发布价格')}{' '}
          {progress}%
        </span>
        <div className={styles[`${prefixCls}-item-progress`]}>
          <div
            className={styles[`${prefixCls}-item-progress-finished`]}
            style={{ width: `${Number(progress)}%` }}
          />
          <div
            className={styles[`${prefixCls}-item-progress-pending`]}
            style={{ width: `${100 - Number(progress)}%` }}
          />
        </div>
      </div>
    );
  };
  const renderSucceedItem = (item) => {
    const { totalCount: count, deliveryDate, releaseBatch } = item;
    return (
      <div className={styles[`${prefixCls}-succeed-item-wrapper`]}>
        <Icon type="publish2" />
        <span className={styles[`${prefixCls}-item-count`]}>
          {intl
            .get(`ssrc.priceLibraryNew.view.message.priceReleaseCount`, {
              count,
            })
            .d('发布{count}条价格')}
        </span>
        <span className={styles[`${prefixCls}-succeed-item-time`]}>
          {deliveryDate}
          <Icon type="check_circle" className={styles['icon-succeed']} />
          <Icon
            type="close"
            className={styles['icon-close']}
            onClick={() => handleClear(releaseBatch)}
          />
        </span>
      </div>
    );
  };
  const renderFailedItem = (item) => {
    const { totalCount: count, releaseBatch, errorMsg } = item;
    return (
      <div className={styles[`${prefixCls}-failed-item-wrapper`]}>
        <Icon type="publish2" />
        <span className={styles[`${prefixCls}-item-count`]}>
          {intl
            .get(`ssrc.priceLibraryNew.view.message.priceReleaseCount`, {
              count,
            })
            .d('发布{count}条价格')}
        </span>
        <span className={styles[`${prefixCls}-failed-item-desc`]}>
          {intl.get(`ssrc.priceLibraryNew.view.message.releaseFailed`).d('发布失败, 请重新发布')}
          <Tooltip title={intl.get(`ssrc.priceLibraryNew.view.message.releaseAgain`).d('重新发布')}>
            <Icon
              type="replay"
              className={styles['icon-replay']}
              onClick={() => handleRepublish(releaseBatch)}
            />
          </Tooltip>
          <Icon
            type="close"
            className={styles['icon-close']}
            onClick={() => handleClear(releaseBatch)}
          />
        </span>
        {errorMsg ? (
          <div className={styles['release-msg']}>
            <div className={styles['release-msg-name']}>
              {intl.get(`ssrc.priceLibraryNew.view.message.failedReasons`).d('失败原因:')}
            </div>
            <div
              className={styles['release-msg-content']}
              onMouseEnter={(e) => handleEnter(e, errorMsg)}
              onMouseLeave={handleLeave}
            >
              {errorMsg}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  // 鼠标进入事件
  const handleEnter = (e, errorMsg) => {
    if (e.target.scrollHeight > e.target.clientHeight) {
      Tooltip.show(e.target, {
        title: errorMsg,
        placement: 'leftTop',
      });
    }
  };

  const handleLeave = () => {
    Tooltip.hide();
  };

  const renderItem = (item) => {
    if (item.status === 'success' && item.progress === 100) {
      return renderSucceedItem(item);
    } else if (item.status === 'success' && item.progress < 100) {
      return renderProcessingItem(item);
    } else {
      return renderFailedItem(item);
    }
  };

  const renderProcessingTitle = () => {
    return (
      <>
        <Progress key="loading" type="loading" size="small" />
        <span className={styles['release-status']}>
          {intl.get(`ssrc.priceLibraryNew.view.message.finished`).d('已完成')}（
          {`${finishedCount}/${totalCount}`}）
        </span>
      </>
    );
  };
  const renderSucceedTitle = () => {
    return (
      <>
        <Icon type="check_circle" className={styles['icon-succeed']} />
        <span className={styles['release-status']}>
          {intl.get(`ssrc.priceLibraryNew.view.message.finished`).d('已完成')}（
          {`${finishedCount}/${totalCount}`}）
        </span>
        {!isEmpty(dataSource) && (
          <span className={styles['clear-btn']} onClick={() => handleClear()}>
            {intl.get(`ssrc.priceLibraryNew.view.button.clearAll`).d('全部清空')}
          </span>
        )}
      </>
    );
  };
  const renderFailedTitle = () => {
    return (
      <>
        <Icon type="cancel" className={styles['icon-failed']} />
        <span className={styles['release-status']}>
          {intl
            .get(`ssrc.priceLibraryNew.view.message.releaseFailedInfo`, { count: failedCount })
            .d('{count}项发布失败')}
        </span>
        {!isEmpty(dataSource) && (
          <span className={styles['clear-btn']} onClick={() => handleClear()}>
            {intl.get(`ssrc.priceLibraryNew.view.button.clearAll`).d('全部清空')}
          </span>
        )}
      </>
    );
  };

  const renderTitle = () => {
    switch (releaseStatus) {
      case 'processing':
        return renderProcessingTitle();
      case 'success':
        return renderSucceedTitle();
      case 'failed':
        return renderFailedTitle();
      default:
        return renderProcessingTitle();
    }
  };

  return (
    <Spin spinning={spinning}>
      <div className={styles[`${prefixCls}-container`]}>
        <div className={styles[`${prefixCls}-title`]}>{renderTitle()}</div>
        <div className={styles[`${prefixCls}-content`]}>
          {isEmpty(dataSource) && (
            <div className={styles[`${prefixCls}-empty-wrapper`]}>
              <span>{intl.get('ssrc.priceLibraryNew.view.message.emptyData').d('暂无数据')}</span>
            </div>
          )}
          {map(Object.entries(dataSource), ([key, item]) => {
            return <div key={key}>{renderItem(item)}</div>;
          })}
        </div>
      </div>
    </Spin>
  );
}
