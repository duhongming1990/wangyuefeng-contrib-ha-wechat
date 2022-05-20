const crypto = require('crypto');

const iv = 'ha.homeassistant'

/**
 * @util 加密、解密工具类
 */
class CryptoUtil {

    /**
     * 解密
     * @param dataStr {string}
     * @param key {string}
     * @param iv {string}
     * @return {string}
     */
    static decrypt(dataStr, key) {
        //加密
    	let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    	let cipherChunks = [];
        cipherChunks.push(cipher.update(dataStr, charset, cipherEncoding));
        cipherChunks.push(cipher.final(cipherEncoding));
    	let encrypt = cipherChunks.join('');
        encrypt = encrypt.replace(/\+/g, '%2b');
        return encrypt;
    };

    /**
     * 加密
     * @param dataStr {string}
     * @param key {string}
     * @param iv {string}
     * @return {string}
     */
    static encrypt(dataStr, key) {
        dataStr = dataStr.replace(/(%2b)/g, '+');
        //解密start
    	let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    	let plainChunks = [];
        plainChunks.push(decipher.update(dataStr, cipherEncoding, charset));
        plainChunks.push(decipher.final(charset));
        return plainChunks.join('');
    }

    static md5_16(text) {
        return crypto.createHash('md5').update(text).digest("hex").substring(8, 24);
    }

    static md5(text) {
        return crypto.createHash('md5').update(text).digest("hex")
    }

    /************* GPS数据解密 ********************/
    static DecryptDES(data, key, iv) {
        var encrypted = Buffer.from(data, 'base64');
        var decipher = crypto.createDecipheriv('des-ede-cbc', key, iv);
        var decoded = decipher.update(encrypted, 'binary', 'ascii');
        decoded += decipher.final('ascii');
        return decoded;
    }

    static DecryptGPSText(text, key) {
        const today = new Date()
        today.setHours(today.getHours() + 8)
        const timeText = today.toISOString().replace(/[-:T]/g, '')
        const keyText = timeText.substring(0, 12)
        const ivText = timeText.substring(0, 8)
        const encryptKey = crypto.createHash('md5').update(key + keyText).digest("hex")
        return CryptoUtil.DecryptDES(text, Buffer.from(encryptKey.substring(8, 24), 'utf-8'), Buffer.from(Buffer.from(ivText).toString('base64'), 'base64'))
    }
}

module.exports = CryptoUtil;