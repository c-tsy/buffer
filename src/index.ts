import { Buffer } from 'buffer'
import { get, set } from 'lodash'
exports.Buffer = Buffer;
/**
 * hex转buffer
 * @param hex 
 */
export function hex2buffer(hex: string): Buffer {
    return Buffer.from(hex.replace(/ /g, ''), 'hex')
}
/**
 * Buffer转hex字符串
 * @param b 
 */
export function buffer2hex(b: Buffer): string {
    let s = b.toString('hex').toUpperCase(), bs = [];
    for (let i = 0; i < s.length / 2; i++) {
        bs.push(s.substr(i * 2, 2))
    }
    return bs.join(' ');
}

/**
 * 有符号整型编码
 * @param num 
 * @param len 
 */
export function int_encode(num: number, len: number = 1) {
    let b = Buffer.alloc(len);
    b.writeIntLE(num, 0, len)
    return b;
}

/**
 * 有符号整数
 * @param buf 
 * @param len 
 * @param offset 
 */
export function int_decode(buf: Buffer, len: number, offset: number = 0) {
    return buf.readIntLE(offset, len);
}
/**
 * 无符号整数编码
 * @param num 
 * @param len 
 */
export function uint_encode(num: number, len: number) {
    let b = Buffer.alloc(len)
    b.writeUIntLE(Number(num), 0, len);
    return b;
}

/**
 * 读数
 * @param b 
 * @param len 
 * @param offset 
 */
export function uint_decode(b: Buffer, len: number, offset: number = 0) {
    return b.readUIntLE(offset, len);
}

/**
 * BCD编码
 * @param ID 
 * @param len 
 */
export function bcd_encode(ID: string | number, len: number) {
    let t = Number(ID).toString().padStart(len * 2, '0');
    let b = '';
    for (let i = t.length; i >= 0; i -= 2) {
        b += t.slice(i - 2, i);
    }
    return Buffer.from(b, 'hex');
}
/**
 * BCD解码
 * @param b 
 * @param offset 
 * @param len 
 */
export function bcd_decode(b: Buffer, len: number, offset: number) {
    let o = Number(b.slice(offset, offset + len).reverse().toString('hex'));
    b.slice(offset, offset + len).reverse()
    return o;
}
/**
 * ASCII 编码
 * @param str 
 * @param len 
 */
export function ascii_encode(str: string, len: number) {
    return Buffer.from(str.padStart(len, ' '));
}
/**
 * ASCII 解码
 * @param buf 
 * @param len 
 * @param offset 
 */
export function ascii_decode(buf: Buffer, len: number, offset: number = 0) {
    return buf.slice(offset, offset + len).toString();
}

/**
 * 时间戳编码
 * @param date 
 */
export function timestamp_encode(date: Date | string | number) {
    if (date instanceof Date) {
        return Math.floor(date.getTime() / 1000);
    } else if ('string' == typeof date) {
        if ('NaN' == Number(date).toString())
            return Math.floor(new Date(date).getTime() / 1000)
        else
            date = Number(date);
    }
    if ('number' == typeof date) {
        if (date.toString().length <= 10) {
            date *= 1000;
        }
        return Math.floor(new Date(date).getTime() / 1000);
    }
    return 0;
}
/**
 * 时间戳解码
 * @param buf 
 * @param len 
 * @param offset 
 */
export function timestamp_decode(buf: Buffer, len: number, offset: number) {
    return uint_decode(buf, len, offset);
}
/**
 * 按位解码
 * @param buf 
 * @param len 
 * @param offset 
 * @param bitlen 
 * @param map 
 */
export function bit_decode(buf: Buffer, len: number, offset: number = 0, bitlen: number = 1, map: { [index: string]: any } = {}) {
    let a = bit_split(buf.slice(0, len))
    return bit_join(a.slice(offset, offset + bitlen))
    let o = 0x00, u = buf.readUIntBE(0, len);
    for (let i = 0; i < bitlen; i++) {
        o = o | 0x80;
        o = o >> 1;
    }
    o = o << 1
    let rs = (u << offset) & o;
    console.log(u, offset, bitlen, o, rs)
    return rs;
}

// console.log(bit_decode(Buffer.from('0209', 'hex'), 2, 2, 1))

export function bit_join(a: number[]) {
    let n = 0;
    for (let x of a) {
        n *= 2;
        if (x > 0) {
            n += 1
        }
    }
    // console.log(a)
    return n;
    // let b = Buffer.alloc(Math.floor(a.length / 8));
    // for (let i = 0; i < b.length; i++) {
    //     for (let o = 7; o >= 0; o++) {
    //         let k = (i * 8) + o
    //         if (!a[k]) {
    //             break;
    //         }
    //         if (a[k] > 0)
    //             b[i] |= (0x01 << o)
    //     }
    // }
    // return b;
}
// console.log(bit_join("0000001000001001".split('').map((v) => Number(v))))
export function bit_split(buf: Buffer) {
    let a = [];
    for (let i = 0; i < buf.length; i++) {
        for (let o = 7; o >= 0; o--) {
            let p = 0x01 << o;
            // console.log(i, o, p, buf[i] & p)
            a.push((buf[i] & p) > 0 ? 1 : 0)
        }
    }
    // console.log(a)
    return a;
}

// console.log(bit_split(Buffer.from('0209', 'hex')))

/**
 * 按位编码
 * @param val 
 * @param offset 
 * @param bitlen 
 */
export function bit_encode(val: number, offset: number = 0, bitlen: number = 1) {
    let o = 0x00;
    for (let i = 0; i < bitlen; i++) {
        o = o | 0x01;
        o = o << 1;
    }
    o = o >> 1
    return (val & o) << offset;
}

const coder = {
    ascii: {
        encode: ascii_encode,
        decode: ascii_decode,
    },
    uint: {
        encode: uint_encode,
        decode: uint_decode,
    },
    int: {
        encode: int_encode,
        decode: int_decode
    },
    timestamp: {
        encode: timestamp_encode,
        decode: timestamp_decode
    },
    bit: {
        encode: bit_encode,
        decode: bit_decode,
    },
    buffer: {
        // encode: buffer_encode,
        // decode: buffer_decode,
    }
}

export enum DataType {
    ascii = 'ascii',
    uint = 'uint',
    int = 'int',
    bit = 'bit',
    timestamp = 'timestamp',
    object = 'object',
    array = 'array',
    buffer = 'buffer',
    hex = 'hex',
    bcd = 'bcd',
    /**
     * 定长字符串，同ascii
     */
    string = "string",
    /**
     * 末尾检测的string
     */
    split_string = ""
}
export class Config {
    /**
     * 命名
     */
    Name: string = "";
    /**
     * 字段名称
     */
    Code: string = "";
    /**
     * 数据类型
     */
    Type: DataType = DataType.uint;
    /**
     * 长度
     */
    Len: number = 0;
    /**
     * 注释
     */
    Memo?: string = "";
    /**
     * 单位
     */
    Unit?: number = 1;
    /**
     * 数组长度
     */
    ArrayLen?: number | string = 0;
    /**
     * 二进制解码配置
     */
    Buffer?: {
        Code?: string,
        Len?: number
    } = {}
    /**
     * 二进制解码深层配置，递归算法
     */
    Config?: Config[] = []
    /**
     * 偏移量
     */
    Offset?: number = 0;
    /**
     * 是否翻转该部分数据
     */
    Reverse?: boolean = false;
    /**
     * 是否补齐
     */
    Pad?: 'start' | 'end';
    /**
     * 数据字典
     */
    Map?: { [index: string]: any } = {}
    /**
     * split_string模式下的末尾检测
     */
    SplitHex?: string = '00'
    constructor(data?: Config | any) {
        if (data) {
            let that: any = this;
            for (let x in data) {
                that[x] = data[x];
            }
        }
    }
}
class Explain {
    /**
     * 起点
     */
    Start: number = 0;
    /**
     * 结束点
     */
    End: number = 0;
    /**
     * Hex 模式内容
     */
    Hex: string = '';
    /**
     * 解析值
     */
    Value: string | number | any = '';
    /**
     * 单位
     */
    Unit: string | number = 0;
    /**
     * 名称
     */
    Name: string = '';
    /**
     * 代码
     */
    Code: string = '';
    /**
     * 注释
     */
    Memo: string = '';
}
/**
 * 二进制编码
 * @param obj 
 * @param conf 
 */
export function buffer_encode(obj: any, conf: Config[]): { buf: Buffer, explain: Explain[], error: Error } {
    let i = 0;
    let explain: Explain[] = [];
    let bufs: Buffer[] = [], buf: Buffer, error = new Error();
    try {
        for (let x of conf) {
            let txt: Explain = {
                Start: i,
                End: i + x.Len,
                Hex: '',
                Value: '',
                Unit: x.Unit || 1,
                Name: x.Name,
                Code: x.Code,
                Memo: x.Memo || ''
            };
            let v: any = obj[x.Code];
            let t: { [index: string]: any } = {}
            let tlen = x.Len;
            let tbuf = Buffer.alloc(0);
            // if ('Data,Len'.split(',').includes(x.Code)) { debugger }
            switch (x.Type) {
                case DataType.hex:
                case DataType.buffer:
                    if (v instanceof Buffer) {
                        tbuf = v;
                    } else if ('string' == typeof v) {
                        if (v.length % 2 == 1) {
                            switch (x.Pad) {
                                case 'end':
                                    v.padEnd(x.Len * 2, '0')
                                    break;
                                default:
                                    v.padStart(x.Len * 2, '0')
                                    break;
                            }
                        }
                        tbuf = (Buffer.from(v, 'hex'))
                    } else {
                        throw new Error('Error Buffer Value')
                    }
                    break;
                case DataType.object:
                    t = buffer_encode(v, x.Config || [])
                    explain.push(...t.explain)
                    break;
                case DataType.bcd:
                    v = v;
                    // let type = typeof v;
                    // if ('string' == type) {
                    tbuf = bcd_encode(v, x.Len)
                    // bufs.push(bcd_encode(v, x.Len));
                    // }
                    break;
                case DataType.array:
                    if (v instanceof Array) {
                        let otbuf = [];
                        for (let o of v) {
                            t = buffer_encode(o, x.Config || [])
                            otbuf.push(t.buf);
                            // bufs.push(t.buf);
                            explain.push(...t.explain);
                            i += t.buf.length;
                        }
                        tbuf = Buffer.concat(otbuf);
                    }
                    break;
                case DataType.bit:
                    buf = Buffer.alloc(x.Len);
                    if (!x.Config) {
                        tbuf = buf;
                        continue;
                    }
                    let tnumber = 0, offset = 0;
                    for (let o of x.Config) {
                        //反向MAP
                        tnumber |= bit_encode(v[o.Code] || 0, offset, o.Len || 0);
                        offset += o.Len;
                    }
                    buf.writeUIntLE(tnumber, 0, x.Len)
                    tbuf = buf;
                    break;
                case DataType.split_string:
                    tlen = (v || '').length;
                    tbuf = Buffer.concat([
                        ascii_encode(v || '', tlen),
                        Buffer.alloc(1, x.Len || 0)
                    ])
                    txt.Start = i;
                    txt.End = i + tlen;
                case DataType.ascii:
                    tbuf = coder.ascii.encode(v || '', x.Len)
                    txt.Value = v || '';
                    break;
                case DataType.timestamp:
                    v = v || 0
                    tbuf = coder.uint.encode(coder.timestamp.encode(v), 4);
                    txt.Value = v;
                    break;
                case DataType.uint:
                    v = (v || 0) / (x.Unit || 1)
                    tbuf = coder.uint.encode(v, x.Len);
                    txt.Value = v;
                    break;
                case DataType.int:
                    v = (v || 0) / (x.Unit || 1)
                    tbuf = coder.int.encode(v, x.Len);
                    txt.Value = v;
                    break;
            }
            i += tlen;
            if (x.Reverse) {
                tbuf = tbuf.reverse()
            }
            txt.Hex = buffer2hex(tbuf);
            explain.push(txt)
            if (tbuf.length > 0) {
                bufs.push(tbuf);
            }
        }
    } catch (error) {
        error = error;
    } finally {
        return {
            explain,
            buf: Buffer.concat(bufs),
            error
        };
    }
}
/**
 * 解码
 * @param buf 
 * @param obj 
 * @param conf 
 */
export function buffer_decode(buf: Buffer, obj: any, conf: Config[]): { obj: any, explain: Explain[], error: Error } {
    let i = 0;
    let explain: Explain[] = [], error = new Error;
    try {
        for (let x of conf) {
            // console.log(x.Code)
            let tlen = x.Len;
            let tbuf = buf.slice(i, i + tlen);
            if (x.Reverse && x.Type != DataType.split_string) { tbuf = tbuf.reverse() }
            let txt: Explain = {
                Start: i,
                End: i + x.Len,
                Hex: buffer2hex(tbuf),
                Value: '',
                Unit: x.Unit || 1,
                Name: x.Name,
                Code: x.Code,
                Memo: x.Memo || ''
            };
            let v: any;
            let t: { [index: string]: any } = {}
            // if ('Data,Len'.split(',').includes(x.Code)) { debugger }
            switch (x.Type) {
                case DataType.buffer:
                    if (x.Buffer) {
                        let len = x.Buffer.Len || obj[x.Buffer.Code || '']
                        if (!x.Buffer.Code && !len) {
                            len = x.Len;
                        }
                        if (len > 0) {
                            obj[x.Code] = buf.slice(i, i + len);
                        } else {
                            obj[x.Code] = Buffer.alloc(0);
                        }
                        x.Len = len;
                    }
                    break;
                case DataType.hex:
                    obj[x.Code] = buf.slice(i, i + x.Len).toString('hex');
                    if (x.Pad) {
                        obj[x.Code] = Number(obj[x.Code]).toString()
                    }
                    txt.Value = obj[x.Code];
                    break;
                case DataType.bcd:
                    obj[x.Code] = Number(buf.slice(i, i + x.Len).reverse().toString('hex'));
                    txt.Value = obj[x.Code];
                    break;
                case DataType.object:
                    let rs = buffer_decode(buf.slice(i, i + x.Len), t, x.Config || [])
                    obj[x.Code] = rs.obj;
                    explain.push(...rs.explain);
                    break;
                case DataType.array:
                    if (obj[x.Code] instanceof Array) {

                    } else {
                        obj[x.Code] = [];
                    }
                    let len = 0;
                    if ('string' == typeof x.ArrayLen) {
                        len = Number(obj[x.ArrayLen]);
                    } else {
                        len = x.ArrayLen || 0
                    }
                    for (let o = 0; o < len; o++) {
                        let rs = buffer_decode(buf.slice(i, i + x.Len), get(obj, x.Code), x.Config || []);
                        obj[x.Code].push(rs.obj)
                        explain.push(...rs.explain)
                        i += x.Len;
                    }
                    break;
                case DataType.bit:
                    if (!x.Config) {
                        continue;
                    }
                    let tbuf = buf.slice(i, i + x.Len), offset = 0;
                    for (let o of x.Config) {
                        let txt = new Explain()
                        t[o.Code] = bit_decode(tbuf, x.Len, offset, o.Len, o.Map)
                        txt.Name = x.Name + ' ' + o.Name;
                        txt.Code = x.Code + '.' + o.Code;
                        // txt.Hex=x
                        txt.Start = i;
                        txt.End = i + x.Len
                        txt.Value = t[o.Code];
                        explain.push(txt);
                        offset += o.Len
                    }
                    txt.Name = x.Name
                    txt.Code = x.Code
                    // txt.Value = JSON.stringify(t);
                    obj[x.Code] = t;
                    break;
                case DataType.split_string:
                    let s = Buffer.alloc(0), e = i, hex = buffer2hex(buf).split(' ');
                    let spl = x.SplitHex || '00'
                    for (let p = i; p < hex.length; p++) {
                        if (hex[i] === spl) {
                            i++;
                            continue;
                        }
                        if (hex[p] === spl) {
                            // tlen = p - i + 1;
                            e = p;
                            break;
                        }
                        // e=p;
                    }
                    s = buf.slice(i, e)
                    if (x.Reverse) {
                        s.reverse();
                    }
                    tlen = s.length + 1;
                    txt.Hex = buffer2hex(s)
                    v = Buffer.from(s).toString();
                    let n = Number(v)
                    if (n.toString() != 'NaN') {
                        v = n;
                    }
                    if (x.Unit) {
                        v = n * x.Unit
                    }
                    txt.Value = v
                    set(obj, x.Code, v);
                    break;
                case DataType.ascii:
                    v = coder.ascii.decode(buf, x.Len, i);
                    txt.Value = v;
                    set(obj, x.Code, v)
                    break;
                case DataType.timestamp:
                    v = coder.timestamp.decode(buf, x.Len, i);
                    txt.Value = v;
                    set(obj, x.Code, v)
                    break;
                case DataType.uint:
                    v = coder.uint.decode(buf, x.Len, i) * (x.Unit || 1);
                    txt.Value = v;
                    set(obj, x.Code, v)
                    break;
                case DataType.int:
                    v = coder.int.decode(buf, x.Len, i) * (x.Unit || 1);
                    txt.Value = v;
                    set(obj, x.Code, v)
                    break;
            }
            explain.push(txt)
            i += tlen;
        }
    } catch (error) {
        error = error;
    } finally {
        return {
            explain,
            obj,
            error
        };
    }
}

/**
 * 解析输出成csv内容，复制粘贴到csv文件中查看
 * @param explain 
 * @param type 
 */
export function explain(explain: Explain[], type: 'csv' | 'log' = 'csv') {
    let t = ['名称,代码,起始,结束,Hex,值,单位']
    for (let x of explain) {
        t.push([x.Name, x.Code, x.Start, x.End, x.Hex, x.Value, x.Unit].join(','))
    }
    return t.join('\r\n')
}