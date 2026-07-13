/*
 * C7nMessage - 留言板
 * @date: 2021/07/06 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo, useEffect, useState, Fragment, useRef } from 'react';
import { Modal, Button, Tabs, TextArea } from 'choerodon-ui/pro';
import { List, Avatar, Icon } from 'choerodon-ui';
import { isString, trim, isEmpty } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import noMessageImg from 'hzero-front/lib/assets/no-message.png';
import { getResponse, getAttachmentUrl, createPagination } from 'utils/utils';

import { queryMessage, sendMessage } from '@/services/orderWorkspaceService';
import { BUCKET_NAME, BUCKET_DIRECTORY } from '../utils/constant';
import styles from './index.less';

const ModalContent = (props) => {
  const {
    poHeaderId,
    modal: { handleOk, update },
  } = props;

  const [data, setData] = useState([]);
  const [loadings, setLoadings] = useState({});
  const [pagination, setPagination] = useState({});

  const input = useRef();

  const empty = useMemo(
    () => (
      <div className={styles['modal-content-empty']}>
        <img
          src={noMessageImg}
          alt={intl.get('sodr.workspace.view,message.noMessage').d('暂无留言')}
        />
        <p>{intl.get('sodr.workspace.view,message.noMessage').d('暂无留言')}</p>
      </div>
    ),
    []
  );
  const avatarStyleMap = useMemo(() => ({
    PURCHASER: {
      backgroundColor: '#d2f2e7',
      color: '#1cbc86',
    },
    SUPPLIER: {
      backgroundColor: '#dfe5fa',
      color: '#5867dd',
    },
  }));

  useEffect(() => {
    const container = document.getElementsByClassName('c7n-list-split')[0];
    container.addEventListener('scroll', listenScroll, true);
    return () => {
      container.removeEventListener('scroll', listenScroll, true);
    };
  }, [pagination]);

  useEffect(() => {
    handleOk(onOk);
    handleQuery({}, true, true);
    update({ okProps: { loading: loadings.onOk } });
  }, []);

  const handleQuery = (param = {}, isRefresh, isScrollBottom) => {
    const params = { poHeaderId, ...param };
    loading({ queryMessage: true });
    queryMessage(params).then((res) => {
      loading({ queryMessage: false });
      if (getResponse(res)) {
        const container = document.getElementsByClassName('c7n-list-split')[0];
        setData(isRefresh ? res.content : res.content.concat(data));
        setPagination(createPagination(res.content));
        if (isScrollBottom) {
          container.scrollTop = container.scrollHeight;
        }
      }
    });
  };

  const listenScroll = (e) => {
    if (e.target.scrollTop === 0) {
      handleQuery({ page: { ...pagination, current: 1 } });
    }
  };

  const onOk = async () => {
    if (input) {
      const message = input.current.value;
      if (!isEmpty(trim(message))) {
        const payload = {
          poHeaderId,
          message,
          userCampCode: 'PURCHASE',
        };
        loading({ onOk: true });
        const res = await sendMessage(payload);
        loading({ onOk: false });
        if (getResponse(res)) {
          input.current.value = '';
          handleQuery({ page: { ...pagination, current: 1 } });
        }
      } else {
        notification.warning({
          description: intl.get(`sodr.workspace.view.message.needMessage`).d('消息不能为空'),
        });
      }
      return false;
    }
    return false;
  };

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  const renderItem = (item) => {
    return (
      <List.Item
        key={item.messageId}
        className={item.senderFlag ? styles['content-list-item'] : undefined}
      >
        <List.Item.Meta
          avatar={
            <div>
              <Avatar alt={item.createdByName} style={avatarStyleMap[item.userCampCode]}>
                {isString(item.createdByName) ? (
                  item.createdByName[0].toLocaleUpperCase()
                ) : (
                  <Icon type="user" />
                )}
              </Avatar>
            </div>
          }
          title={
            item.attachmentUrl ? (
              <a
                href={getAttachmentUrl(item.attachmentUrl, BUCKET_NAME, BUCKET_DIRECTORY)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.attachmentName}
              </a>
            ) : (
              <pre>{item.message}</pre>
            )
          }
          description={`${item.createdByName} ${item.creationDate}`}
        />
      </List.Item>
    );
  };

  return (
    <Fragment>
      <div className={styles['order-workspace-messageBoard']}>
        <List
          loading={loadings.queryMessage}
          empty={empty}
          dataSource={data}
          renderItem={renderItem}
        />
        <Tabs className="wrapper-button-tab">
          <Tabs.TabPane key="basic" tab={<Icon type="message2" />}>
            <TextArea
              rows={6}
              ref={input}
              placeholder={intl
                .get('sodr.workspace.view.message.pleaseEnterMessage')
                .d('请输入留言')}
            />
          </Tabs.TabPane>
          {/* <Tabs.TabPane key="enclosure" tab={<Icon type="attach_file" />}>
            <C7NUpload
              icon="attach_file"
              record={ds.current}
              bucketName={BUCKET_NAME}
              bucketDirectory={BUCKET_DIRECTORY}
              name="attachmentUuid"
            />
          </Tabs.TabPane> */}
        </Tabs>
      </div>
    </Fragment>
  );
};

const C7nMessage = (props) => {
  const { poHeaderId } = props;
  const {
    btnProps = {
      icon: 'message2',
      funcType: 'flat',
    },
  } = props;

  const handleOpen = () => {
    Modal.open({
      drawer: true,
      title: intl.get('sodr.workspace.view.button.messageBoard').d('留言板'),
      children: <ModalContent poHeaderId={poHeaderId} />,
      okText: intl.get('hzero.common.button.send').d('发送'),
      okProps: { loading: false },
    });
  };
  return (
    <Button onClick={handleOpen} {...btnProps}>
      {intl.get('sodr.workspace.view.button.messageBoard').d('留言板')}
    </Button>
  );
};

export default C7nMessage;
