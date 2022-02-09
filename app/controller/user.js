'use strict'
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const BaseController = require('./base')

const HashSalt = ':Kaikeba@good!@123'
const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  passwd: { type: 'string' },
  captcha: { type: 'string' },
}
class UserController extends BaseController {
  async login() {
    // 登录
    const { ctx, app } = this
    const { email, captcha, passwd, emailcode } = ctx.request.body
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }
    console.log(emailcode)
    if (emailcode !== ctx.session.emailcode) {
      return this.error('邮箱验证码错误')
    }

    const user = await ctx.model.User.findOne({
      email,
      passwd: md5(passwd + HashSalt),
    })
    if (!user) {
      return this.error('用户名密码错误')
    }
    // 用户的信息加密成token 返回
    const token = jwt.sign({
      _id: user._id,
      email,
    }, app.config.jwt.secret, {
      expiresIn: '1h',
    })
    this.success({ token, email, nickname: user.nickname })
  }

  async register() {
    // 注册
    const { ctx } = this
    try {
      ctx.validate(createRule)
    } catch (e) {
      this.error('校验信息有误', -1, e.errors)
    }
    const { email, passwd, captcha, nickname } = ctx.request.body
    console.log(email, passwd, captcha, nickname, '=====>register')

    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }
    if (await this.checkEmail(email)) {
      this.error('邮箱重复啦')
    } else {
      const ret = await ctx.model.User.create({
        email,
        nickname,
        passwd: md5(passwd + HashSalt),
      })
      if (ret._id) {
        this.message('注册成功')
      }
    }
  }
  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email })
    return user
  }
  async verify() {
    // 校验用户名是否存在
  }

  async info() {
    // 校验用户信息
    // 获取header，解析
    // 还不知道是哪个用户名之类的信息，需要去token里读取
    // 有的接口需要从token读数据，有的不需要
    const { ctx } = this
    const { email } = ctx.state
    const user = await this.checkEmail(email)
    this.success(user)
  }
}


module.exports = UserController
