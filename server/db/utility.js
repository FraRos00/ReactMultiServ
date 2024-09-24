'use strict';

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

exports.sortByTimestamp = (rows, order) => {
  const formattedArray = rows.map((e) => ({
    ...e,
    timestamp: dayjs(e.timestamp, 'DD-MM-YYYY HH:mm:ss'),
  }));
  if (order === 'oldest')
    formattedArray.sort((a, b) => {
      return a.timestamp.isBefore(b.timestamp)
        ? -1
        : a.timestamp.isAfter(b.timestamp)
          ? 1
          : 0;
    });
  else if (order === 'latest')
    formattedArray.sort((a, b) => {
      return a.timestamp.isBefore(b.timestamp)
        ? 1
        : a.timestamp.isAfter(b.timestamp)
          ? -1
          : 0;
    });
  return formattedArray;
};
