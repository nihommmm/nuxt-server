'use strict'

const { Service } = require('egg')
const path = require('path')
const fse = require('fs-extra')
const nodemailer = require('nodemailer')


const userEmail = 'yanlt1996@163.com'
const transporter = nodemailer.createTransport({
  service: '163',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'XQIACYWJEYHYJZSO',
  },
})


class ToolService extends Service {
  async mergeFile(filepPath, filehash, size) {
    const chunkdDir = path.resolve(this.config.UPLOAD_DIR, filehash) // 切片的文件夹
    let chunks = await fse.readdir(chunkdDir)
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1]) // 排序 需要严格按照数字排序
    chunks = chunks.map(cp => path.resolve(chunkdDir, cp))
    await this.mergeChunks(chunks, filepPath, size)

  }
  async mergeChunks(files, dest, size) {
    const pipStream = (filePath, writeStream) => new Promise(resolve => {
      const readStream = fse.createReadStream(filePath)
      readStream.on('end', () => {
        fse.unlinkSync(filePath)
        resolve()
      })
      readStream.pipe(writeStream)
    })

    await Promise.all(
      files.map((file, index) =>
        pipStream(file, fse.createWriteStream(dest, {
          start: parseInt(index * size),
          end: parseInt((index + 1) * size),
        }))
      )
    )
  }
  async sendMail(email, subject, text, html) {
    console.log(email, subject, html)
    const mailOptions = {
      from: userEmail,
      cc: userEmail, // 抄送，可以规避被一些邮箱当垃圾邮件
      to: email,
      subject,
      text,
      html,
    }
    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch (err) {
      console.log('email error', err)
      return false
    }
  }
}


module.exports = ToolService
