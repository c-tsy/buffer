import { Buffer } from 'buffer'
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