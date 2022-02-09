/* eslint valid-jsdoc: "off" */

'use strict'

const path = require('path')
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1644285197676_2955'

  // add your middleware config here
  config.middleware = []

  config.multipart = {
    mode: 'file', // 文件模式
    whitelist: () => true, // 设置白名单，这里是全部文件后缀都可以
  }
  config.UPLOAD_DIR = path.resolve(__dirname, '..', 'app/public') // 加一些文件的配置方便后期扩展，变成可配置的全局的上传文件

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  }

  return {
    ...config,
    ...userConfig,
    security: {
      csrf: {
        enable: false,
      },
    },
    mongoose: {
      client: {
        url: 'mongodb://127.0.0.1:27017/ylthub',
        options: {},
      },
    },
    jwt: {
      secret: '@Kaikeba!123Abc!:',
    },
  }
}
