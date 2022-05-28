export function toCSS(str: string) {
  const cssArray = str.split(',');
  const newCssArray = cssArray.map((item) => {
    if (item) {
      let [name, value] = item.split(':');

      name = name.replace(/[A-Z]/g, function (match) {
        return '-' + match.toLowerCase();
      });

      value = value.replace(/'/g, '');

      return `${name}:${value}`;
    }
    return item;
  });
  return newCssArray.join(';');
}
