const crypto = require('crypto')

const secret = process.env.SECRET_KEY
const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(secret, 'salt', 32)
const ivLength = 16

exports.encrypt = (text) => {
    const iv = crypto.randomBytes(ivLength)
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return `${iv.toString('hex')}:${encrypted}`
}

exports.decrypt = (encryptedTextWithIv) => {
    const parts = encryptedTextWithIv.split(':')
    const iv = Buffer.from(parts.shift(), 'hex')
    const encryptedText = parts.join(':')
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}