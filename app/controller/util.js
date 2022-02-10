'use strict'

const svgCaptcha = require('svg-captcha')
const path = require('path')
const BaseController = require('./base')
const fse = require('fs-extra')

class UtilController extends BaseController {
  async captcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      noise: 3,
    })
    console.log('captcha=>', captcha.text)
    this.ctx.session.captcha = captcha.text // 把这个值临时存入session，可以随时清空销毁
    this.ctx.response.type = 'image/svg+xml' // 相应的是图片
    this.ctx.body = captcha.data
  }

  async sendcode() {
    const { ctx } = this
    const email = ctx.query.email
    const code = Math.random().toString().slice(2, 6)
    console.log('邮箱' + email + '验证码:' + code)
    ctx.session.emailcode = code

    const subject = '验证码'
    const text = ''
    const html = `<h2>小开社区</h2><a href="https://kaikeba.com"><span>${code}</span></a>`
    const hasSend = await this.service.tools.sendMail(email, subject, text, html) // service需要自己注册 通用的服务需要放在service里面
    if (hasSend) {
      this.message('发送成功')
    } else {
      this.error('发送失败')
    }
  }

  async uploadfile() {
    // 文件上传1.0
    // 文件获取到之后直接放置在静态资源的位置下，直接访问即可
    const { ctx } = this
    console.log(ctx.request, 'aaaa==>aaaa')
    const file = ctx.request.files[0]
    const { hash, name } = ctx.request.body
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash)

    // const filePath = path.resolve() // 文件最终存储的位置。合并之后

    // console.log(name,file)

    // console.log(file.filepath)
    // console.log(this.config.UPLOAD_DIR)
    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath)
    }

    await fse.move(file.filepath, `${chunkPath}/${name}`)

    this.message('切片上传成功')
  }

  async mergefile() {
    const { ext, size, hash } = this.ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    await this.ctx.service.tools.mergeFile(filePath, hash, size)
    this.success({
      url: `/public/${hash}.${ext}`,
    })
  }
}

module.exports = UtilController
