export const isEmpty = value => value === undefined || value === null || value.length === 0 || value === '' || (value.constructor === Object && Object.keys(value).length === 0);
