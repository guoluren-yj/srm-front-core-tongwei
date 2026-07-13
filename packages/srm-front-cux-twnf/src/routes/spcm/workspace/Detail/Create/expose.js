import { Expose } from 'utils/remote';
import { getResponse, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import request from 'utils/request';
import { isNil } from 'lodash';

export default new Expose({
  process: {
    SPCM_WORKSPACE_DETAIL_CREATE_HEADER_DS: (headDsProps, otherProps) => {
      const { pcSourceCode } = otherProps || {};
      if (['SEARCH_SOURCE_RESULT', 'MANUALLY'].includes(pcSourceCode)) {
        // 增加 供应商修改查询供应商实名认证状态
        return {
          ...headDsProps,
          events: {
            ...headDsProps?.events,
            update: async (props) => {
              const oldUpdate = headDsProps?.events?.update;
              if (oldUpdate) {
                oldUpdate(props);
              }
              const { record, name, value } = props || {};
              if (name === 'supplierCompanyIdLov') {
                record.set('attributeVarchar17', value.attributeVarchar17);
              }
            }
          }
        }
      }
      return headDsProps;
    }
  },
  events: {
    afterInitHeaderData: async (eventProps) => {
      const { pcSourceCode, headerFormDs } = eventProps || {};
      const { additionInfo } = getCurrentUser() || {};
      const { employeeCode } = additionInfo || {};
      // 手工创建合同&引用寻源结果创建合同 赋值经办人为当前用户关联员工
      if (['SEARCH_SOURCE_RESULT', 'MANUALLY'].includes(pcSourceCode) && !isNil(employeeCode)) {
        const result = await request(
          `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/zVXNV9QyW5yBoNom2sOzgWAXicvgNX4fQk9iccM8eQpKQ`,
          {
            method: 'GET',
            query: { employeeNum: employeeCode },
          }
        );
        if (getResponse(result) && headerFormDs && headerFormDs.current) {
          headerFormDs.current.set('attributeVarchar16', result);
        };
      }
    }
  }
});