import { Buffer } from 'buffer'
import * as set from 'set-value'
import get = require('get-value');
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
    return Math.floor(new Date(date).getTime() / 1000);
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
    }
}

export enum DataType {
    ascii = 'ascii',
    uint = 'uint',
    int = 'int',
    bit = 'bit',
    timestamp = 'timestamp',
    object = 'object',
    array = 'array'
}
export class Config {
    Name: string = "";
    Code: string = "";
    Type: DataType = DataType.uint;
    Len: number = 0;
    Memo: string = "";
    Unit: number = 0;
    ArrayLen: number | string = 0;
    Config: Config[] = []
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
export function encode() { }
export function decode(buf: Buffer, obj: any, conf: Config[]) {
    let i = 0;
    let explain: Explain[] = [];
    for (let x of conf) {
        let txt: Explain = {
            Start: i,
            End: i + x.Len,
            Hex: buffer2hex(buf.slice(i, i + x.Len)),
            Value: '',
            Unit: x.Unit,
            Name: x.Name,
            Code: x.Code,
            Memo: x.Memo
        };
        let v: any;
        switch (x.Type) {
            case DataType.object:
                obj[x.Code] = decode(buf.slice(i, x.Len),)
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
                    len = x.ArrayLen
                }
                for (let o = 0; o < len; o++) {
                    if (x.Config.length == 1) {

                    }
                    obj[x.Code].push(decode(buf.slice(i, x.Len), get(obj, x.Code), x.Config))
                    i += x.Len;
                }
                break;
            case DataType.bit:

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
                v = coder.uint.decode(buf, x.Len, i) * x.Unit;
                txt.Value = v;
                set(obj, x.Code, v)
                break;
            case DataType.int:
                v = coder.int.decode(buf, x.Len, i) * x.Unit;
                txt.Value = v;
                set(obj, x.Code, v)
                break;
        }
        explain.push(txt)
        i += x.Len;
    }
}