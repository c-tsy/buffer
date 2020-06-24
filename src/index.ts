import { Buffer } from 'buffer'
// import * as set from 'set-value'
import get = require('get-value');
import set = require('set-value');
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
    let t = ID.toString().padStart(len * 2, '0');
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
    return Math.floor(new Date(date).getTime());
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
    let o = 0x00, u = buf.readUIntLE(0, len);
    for (let i = 0; i < bitlen; i++) {
        o = o | 0x01;
        o = o << 1;
    }
    o = o >> 1
    let rs = (u >> offset) & o;
    return rs;
}

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
    bcd = 'bcd'
}
export class Config {
    Name: string = "";
    Code: string = "";
    Type: DataType = DataType.uint;
    Len: number = 0;
    Memo?: string = "";
    Unit?: number = 1;
    ArrayLen?: number | string = 0;
    Buffer?: {
        Code?: string,
        Len?: number
    } = {}
    Config?: Config[] = []
    Offset?: number = 0;
    Map?: { [index: string]: any } = {}
    constructor(data?: Config) {

    }
}
interface Explain {
    Start: number;
    End: number;
    Hex: string;
    Value: string | number | any;
    Unit: string | number;
    Name: string;
    Code: string;
    Memo: string;
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
            let v: any;
            let t: { [index: string]: any } = {}
            switch (x.Type) {
                case DataType.hex:
                case DataType.buffer:
                    if (obj[x.Code] instanceof Buffer) {
                        bufs.push(obj[x.Code]);
                    } else if ('string' == typeof obj[x.Code]) {
                        bufs.push(Buffer.from(obj[x.Code], 'hex'))
                    } else {
                        throw new Error('Error Buffer Value')
                    }
                    break;
                case DataType.object:
                    t = buffer_encode(obj[x.Code], x.Config || [])
                    bufs.push(t.buf);
                    explain.push(...t.explain)
                    break;
                case DataType.bcd:
                    let v = obj[x.Code];
                    let type = typeof v;
                    if ('string' == type) {
                        bufs.push(hex2buffer(v).reverse());
                    }
                    break;
                case DataType.array:
                    if (obj[x.Code] instanceof Array) {
                        for (let o of obj[x.Code]) {
                            t = buffer_encode(o, x.Config || [])
                            bufs.push(t.buf);
                            explain.push(...t.explain);
                            i += t.buf.length;
                        }
                    }
                    break;
                case DataType.bit:
                    buf = Buffer.alloc(x.Len);
                    if (!x.Config) {
                        bufs.push(buf);
                        continue;
                    }
                    let tnumber = 0, offset = 0;
                    for (let o of x.Config) {
                        //反向MAP
                        tnumber |= bit_encode(obj[x.Code][o.Code] || 0, offset, o.Len || 0);
                        offset += o.Len;
                    }
                    buf.writeUIntLE(tnumber, 0, x.Len)
                    bufs.push(buf);
                    break;
                case DataType.ascii:
                    buf = coder.ascii.encode(obj[x.Code] || '', x.Len)
                    txt.Value = obj[x.Code] || '';
                    bufs.push(buf);
                    break;
                case DataType.timestamp:
                    v = obj[x.Code] || 0
                    buf = coder.uint.encode(coder.timestamp.encode(v), 4);
                    txt.Value = v;
                    bufs.push(buf);
                    break;
                case DataType.uint:
                    v = (obj[x.Code] || 0) / (x.Unit || 1)
                    buf = coder.uint.encode(v, x.Len);
                    txt.Value = v;
                    bufs.push(buf);
                    break;
                case DataType.int:
                    v = (obj[x.Code] || 0) / (x.Unit || 1)
                    buf = coder.int.encode(v, x.Len);
                    txt.Value = v;
                    bufs.push(buf);
                    break;
            }
            txt.Hex = buffer2hex(bufs[bufs.length - 1]);
            explain.push(txt)
            // console.log([x.Name, obj[x.Code], txt.Hex].join('\t'))
            i += x.Len;
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
            let txt: Explain = {
                Start: i,
                End: i + x.Len,
                Hex: buffer2hex(buf.slice(i, i + x.Len)),
                Value: '',
                Unit: x.Unit || 1,
                Name: x.Name,
                Code: x.Code,
                Memo: x.Memo || ''
            };
            let v: any;
            let t: { [index: string]: any } = {}
            switch (x.Type) {
                case DataType.buffer:
                    if (x.Buffer) {
                        let len = x.Buffer.Len || obj[x.Buffer.Code || ''] || x.Len;
                        if (len > 0) {
                            obj[x.Code] = buf.slice(i, len);
                        }
                        x.Len = len;
                    }
                    break;
                case DataType.hex:
                    obj[x.Code] = buf.slice(i, x.Len).toString('hex');
                    txt.Value = obj[x.Code];
                    break;
                case DataType.bcd:
                    obj[x.Code] = buf.slice(i, x.Len).reverse().toString('hex');
                    txt.Value = obj[x.Code];
                    break;
                case DataType.object:
                    let rs = buffer_decode(buf.slice(i, x.Len), t, x.Config || [])
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
                        let rs = buffer_decode(buf.slice(i, x.Len), get(obj, x.Code), x.Config || []);
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
                        t[o.Code] = bit_decode(tbuf, x.Len, offset, o.Len, o.Map)
                        txt.Name = x.Name + ' ' + o.Name;
                        txt.Code = x.Code + '.' + o.Code;
                        txt.Value = t[o.Code];
                        explain.push(txt);
                        offset += o.Len
                    }
                    txt.Name = x.Name
                    txt.Code = x.Code
                    // txt.Value = JSON.stringify(t);
                    obj[x.Code] = t;
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
            i += x.Len;
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