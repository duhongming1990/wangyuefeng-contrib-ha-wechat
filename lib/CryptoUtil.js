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
        let cipherChunks = [];
        let decipher = crypto.createDecipheriv('aes-128-cbc', CryptoUtil.md5_16(key), iv);
        decipher.setAutoPadding(true);
        cipherChunks.push(decipher.update(dataStr, 'base64', 'utf8'));
        cipherChunks.push(decipher.final('utf8'));
        return cipherChunks.join('');
    }

    /**
     * 加密
     * @param dataStr {string}
     * @param key {string}
     * @param iv {string}
     * @return {string}
     */
    static encrypt(dataStr, key) {
        let cipherChunks = [];
        let cipher = crypto.createCipheriv('aes-128-cbc', CryptoUtil.md5_16(key), iv);
        cipher.setAutoPadding(true);
        cipherChunks.push(cipher.update(dataStr, 'utf8', 'base64'));
        cipherChunks.push(cipher.final('base64'));
        return cipherChunks.join('');
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