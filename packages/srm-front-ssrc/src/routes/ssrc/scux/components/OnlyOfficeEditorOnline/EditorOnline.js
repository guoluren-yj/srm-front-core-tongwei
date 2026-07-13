/*
 * EditorOnline  -  在线编辑通用组件
 * @date: 2019年5月20日 10:52:02
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { getResponse } from 'utils/utils';
import uuid from 'uuid/v4';
import { isFunction } from 'lodash';

import { cuxQueryOnlyOffice } from '@/services/fileTemplateManageService';

import WebOfficeSDK from './web-office-sdk-es.js';

/**
 * EditorOnline - 在线编辑通用组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [headerId] - 头ID
 *
 */
export default class EditorOnline extends Component {
  constructor(props) {
    super(props);
    this.uuid = uuid();
  }

  async componentDidMount() {
    const { initFetchFun } = this.props;
    if (initFetchFun && isFunction(initFetchFun)) {
      const url = await initFetchFun();
      if (getResponse(url)) {
        this.writeFrameDocumentWps(url);
      }

    } else {
      this.initFetch();
    }
  }

  @Bind()
  initFetch() {
    const { fileTemplateId, attachmentLineId, pageType } = this.props;
    // pageType等于【template】取fileTemplateId，pageType等于【attachLine】取attachmentLineId
    const requestProps = pageType === 'template' ? { fileTemplateId } : { attachmentLineId };
    cuxQueryOnlyOffice(requestProps).then((url) => {
      if (getResponse(url)) {
        this.writeFrameDocumentWps(url);
      }
    });
  }

  componentWillUnmount() {
    clearTimeout(this.timeOut1);
    clearTimeout(this.timeOut2);
  }

  /**
   * 动态写入iframe的document
   * @param {String} content
   */
  @Bind()
  async writeFrameDocumentWps(url, count) {
    this.url = url;
    clearTimeout(this.timeOut2);
    this.timeOut1 = setTimeout(() => {
      this.writeFrameDocumentWps2(url, count);
    }, 50);
  }

  @Bind()
  getIdSuffix = () => {
    const { headerId, fileTemplateId, attachmentLineId, fullScreenFlag, pageType } = this.props;
    const fileId = pageType === 'template' ? fileTemplateId : attachmentLineId;
    return `H${headerId}T${fileId}${fullScreenFlag ? 'full' : ''}${this.uuid}`;
  };

  /**
   * 动态写入iframe的document
   * @param {String} content
   */
  @Bind()
  async writeFrameDocumentWps2(url, count) {
    const { templateFlag } = this.props;
    if (url && url.startsWith('http')) {
      const idSuffix = this.getIdSuffix();
      if (document.querySelector(`.editor-online-mount-wps${idSuffix}`)) {
        // eslint-disable-next-line
        const jssdk = WebOfficeSDK.config({
          url,
          mount: document.querySelector(`.editor-online-mount-wps${idSuffix}`),
        });
        this.jssdk = jssdk;
        await this.jssdk.ready();
        const iframe = await this.jssdk.iframe;
        this.app = this.jssdk.Application;
        iframe.style.width = '100%';
        if (templateFlag) {
          // 页面定制对象：更多菜单
          const moreMenus = await this.app.CommandBars('MoreMenus');
          // 控制更多菜单禁用
          moreMenus.Enabled = false;
        }
      } else if (count !== 0) {
        const newCount = (count || 3) - 1;
        this.timeOut2 = setTimeout(() => {
          this.writeFrameDocumentWps(url, newCount);
        }, 1500);
      }
    } else {
      try {
        getResponse(JSON.parse(url));
      } catch (error) {
        console.log(error);
      }
    }
  }

  render() {
    const {
      iframeStyle = {
        width: '100%',
        height: '100%',
      },
    } = this.props;
    const idSuffix = this.getIdSuffix();
    return (
      <div style={{ display: 'flex', height: '100%' }}>
        <div
          className={`editor-online-mount-wps editor-online-mount-wps${idSuffix}`}
          style={{ border: '0', flex: 1, ...iframeStyle }}
        />
      </div>
    );
  }
}
