// https://github.com/beshanoe/json2ts

interface IJson2TsConfigPrivate {
  prependWithI: boolean;
  sortAlphabetically: boolean;
  addExport: boolean;
  useArrayGeneric: boolean;
  optionalFields: boolean;
  prefix: string;
  rootObjectName: string;
}

export type IJson2TsConfig = Partial<IJson2TsConfigPrivate>;

export class Json2Ts {
  private config: IJson2TsConfigPrivate;

  private interfaces: {
    [name: string]: {
      [field: string]: string;
    };
  } = {};

  constructor(config: IJson2TsConfig = {}) {
    this.config = {
      // 每个属性都加I
      prependWithI: true,
      // 字母顺序排序
      sortAlphabetically: false,
      // 添加export
      addExport: false,
      // 使用Array<T>
      useArrayGeneric: false,
      // 全部可选
      optionalFields: false,
      // 类型前缀 类似于namespace功能
      prefix: '',
      // 根节点名称
      rootObjectName: 'RootObject',
      ...config,
    };
  }

  convert(json: {}) {
    this.interfaces = {};
    this.unknownToTS(json);
    return this.interfacesToString();
  }

  private unknownToTS(value: {}, key: string | undefined = void 0) {
    let type: string = typeof value;
    if (type === 'object') {
      if (Array.isArray(value)) {
        type = this.arrayToTS(value, key);
      } else {
        type = this.objectToTS(value, key && this.capitalizeFirst(key));
      }
    }
    return type;
  }

  private arrayToTS(array: {}[], key: string | undefined = void 0) {
    let type = array.length ? void 0 : 'any';
    for (let item of array) {
      const itemType = this.unknownToTS(item, this.keyToTypeName(key));
      if (type && itemType !== type) {
        type = 'any';
        break;
      } else {
        type = itemType;
      }
    }
    return this.config.useArrayGeneric ? `Array<${type}>` : `${type}[]`;
  }

  private keyToTypeName(key: string | undefined = void 0) {
    if (!key || key.length < 2) {
      return key;
    }
    const [first, ...rest]: string[] = Array.prototype.slice.apply(key);
    const last = rest.pop();
    return [first.toUpperCase(), ...rest, last === 's' ? '' : last].join('');
  }

  private capitalizeFirst(str: string) {
    const [first, ...rest]: string[] = Array.prototype.slice.apply(str);
    return [first.toUpperCase(), ...rest].join('');
  }

  private objectToTS(
    obj: Record<string, string>,
    type: string = this.config.rootObjectName
  ) {
    if (obj === null) {
      return 'any';
    }
    const { prependWithI, prefix } = this.config;
    if (prependWithI) {
      type = `I${prefix || ''}${type}`;
    }
    if (!this.interfaces[type]) {
      this.interfaces[type] = {};
    }
    const interfaceName = this.interfaces[type];
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const fieldType = this.unknownToTS(value, key);
      if (!interfaceName[key] || interfaceName[key].indexOf('any') === 0) {
        interfaceName[key] = fieldType;
      }
    });
    return type;
  }

  private interfacesToString() {
    const { sortAlphabetically, addExport, optionalFields } = this.config;
    return Object.keys(this.interfaces)
      .map((name) => {
        const interfaceStr = [
          `${addExport ? 'export ' : ''}interface ${name} {`,
        ];
        const fields = Object.keys(this.interfaces[name]);
        if (sortAlphabetically) {
          fields.sort();
        }
        fields.forEach((field) => {
          const type = this.interfaces[name][field];
          interfaceStr.push(`  ${field}${optionalFields ? '?' : ''}: ${type};`);
        });
        interfaceStr.push('}\n');
        return interfaceStr.join('\n');
      })
      .join('\n');
  }
}
