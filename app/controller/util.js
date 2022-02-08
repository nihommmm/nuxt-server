'use strict'

const svgCaptcha = require('svg-captcha')

const Controller = require('egg').Controller

class UtilController extends Controller {
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
}

module.exports = UtilController
