export function toCSS(str: string) {
  const cssArray = str.split('\n');
  const newCssArray = cssArray.map((item) => {
    if (item) {
      let [name, value] = item.split(':');

      name = name.trim().replace(/[A-Z]/g, function (match) {
        return '-' + match.toLowerCase();
      });
      // 单引号去掉
      value = value.replace(/'/g, '');
      // 结尾逗号去掉
      value = value.replace(/,$/, '');

      return `${name}:${value}`;
    }
    return item;
  });
  return newCssArray.join(';\n');
}
