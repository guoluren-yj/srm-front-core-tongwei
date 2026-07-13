import { isEmpty } from 'lodash';

import { filterNullValueObject } from 'hzero-front/lib/utils/utils';

// 定义字段类型
interface FieldConfig {
  name: string;
  startName: string;
  endName: string;
}

// 时间筛选处理
export const timeFilerProcess = (originFilterData:object = {}, arrFields:FieldConfig[]) => {
  if (!isEmpty(originFilterData) && arrFields && arrFields.length > 0) {
    const filterData = {};
    arrFields.forEach((field) => {
      if (!field) return;
      const originData = originFilterData[field.name];
      if (originData && field) {
        const arr = originData.split(',');
        filterData[`${field.startName}`] =  arr[0];
        filterData[`${field.endName}`] =  arr[1];
      };
      delete originFilterData[field.name];
    });
    return {
      ...originFilterData,
      ...filterNullValueObject(filterData),
    };
  };
  return {};
};

// 处理查询参数
export const handleDealQueryData = (originQueryData) => {
  if (isEmpty(originQueryData)) {
    return originQueryData;
  };
  const newQueryData = filterNullValueObject(originQueryData);
  Object.keys(newQueryData).forEach(name => {
    if(Array.isArray(originQueryData[name]) && originQueryData[name]) {
      newQueryData[name] = newQueryData[name][0];
    }
  });
  return newQueryData;
};