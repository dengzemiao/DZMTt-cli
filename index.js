// 文档地址：https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/developer-instrument/development-assistance/ide-order-instrument
const ci = require("tt-ide-cli")
const fs = require('fs')
const path = require('path')
const colors = require('colors')
const readline = require('readline')

// 提示
console.log('============================== 开始发布 =============================='.bgGreen)

// 项目文件夹名
const fileName = process.env.NODE_ENV === 'production' ? 'build' : 'dev'
// 项目文件路径
const filePath = `./dist/${fileName}/mp-toutiao`
// 微信小程序ID
const appid = process.env.APPID
// 微信小程序版本
const version = process.env.VERSION
// 输入框
var input = null

// 项目是否打包
if (!fs.existsSync(path.join(__dirname, filePath))) {
	console.log(`Error：找不到小程序《${appid}》打包后的项目工程，请先打包!`.red)
	// 记录日志
	setLog('找不到项目工程！')
	// 结束脚本
	process.exit(1)
}
// 读取微信项目配置文件，做一下校验，因为命令提交不会管appid是否一致，都能正常提交
const config = JSON.parse(fs.readFileSync(path.join(__dirname, `${filePath}/project.config.json`), 'utf8'))
// 记录日志
setLog('开始上传...')
// 校验 appid 是否一致
if (config.appid === appid) {
	// 匹配，正常跑起来
	run()
} else {
	// 不匹配，中断
	console.log(`Error：本地 dist 文件中小程序包的 appid《${config.appid}》 与指定提交的 appid《${appid}》 不匹配，请重新打包对应的微信小程序!`.red)
	// 记录日志
	setLog(`本地 dist 文件中小程序包的 appid《${config.appid}》 与指定提交的 appid《${appid}》 不匹配`)
	// 结束脚本
	process.exit(1)
}

// 执行
async function run() {
	// 检查是否有登录
	const session = await ci.checkSession()
	// 未登录
	if (!session.isValid) {
		// 提示错误
		console.log(session.errMsg.red)
		// 记录日志
		setLog(`${session.errMsg}！`)
		// 创建 readline 接口实例
		input = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		})
		// 输入手机号
		inputPhone()
	} else {
		// 开始上传
		upload()
	}
}

// 输入手机号
function inputPhone() {
	input.question('请输入手机号：', async (phone) => {
		try {
			// 发送验证码
			await ci.sendVerificationCodeToPhone({ phoneNumber: phone })
			// 提示
			console.log('发送验证码成功'.green)
			// 输入验证码
			inputCode(phone)
		} catch (error) {
			// 发送失败
			console.log(error.message.red)
			// 记录日志
			setLog(`${error.message}！`)
			// 再次输入
			inputPhone()
		}
	})
}

// 输入验证码
function inputCode(phone) {
	// 输入验证码
	input.question('请输入验证码：', async (code) => {
		try {
			// 登录
			await ci.loginByPhone({
				phoneNumber: phone,
				code: code
			})
			// 提示
			console.log('登录成功，开始发布'.green)
			// 开始上传
			upload()
		} catch (error) {
			// 验证码有误
			console.log(error.message.red)
			// 记录日志
			setLog(`${error.message}！`)
			// 再次输入
			inputCode(phone)
		}
	})
}

// 上传项目
async function upload() {
	try {
		// 提交上传
		const result = await ci.upload({
			// 项目配置
			project: {
				// 项目地址
				path: filePath,
			},
			// 备注
			changeLog: `${version} - ${process.env.NODE_ENV}`,
			// 本次更新版本
			version: version,
			// 是否上传后生成 sourcemap，推荐使用 true，否则开发者后台解析错误时将不能展示原始代码
			needUploadSourcemap: true
		})
		// 上传结果
		console.log('======================================================================'.bgGreen)
		console.log(`项目名称：${config.projectname}(${config.appid})\n项目版本：${version}\n打包环境：${process.env.NODE_ENV}\n上传结果：成功\n上传时间：${nowDate()}`.green)
		console.log('提示信息：测试、发包直接前往：小程序后台管理【版本管理】中扫码体验、测试、发包！'.yellow)
		// console.log(result)
		console.log('======================================================================'.bgGreen)
		// 记录日志
		setLog(`上传成功！`)
		// 结束脚本
		process.exit(0)
	} catch (error) {
		// 验证码有误
		console.log(error.message.red)
		// 记录日志
		setLog(`${error.message}！`)
		// 是否是因为没有登录
		if (error.message.includes('重新登录')) {
			// 输入手机号
			inputPhone()
		} else {
			// 结束脚本
			process.exit(1)
		}
	}
}

// 日志记录
function setLog(msg) {
	// 文件名称
	const logFileName = 'log.txt'
	// 创建日志文件
	if (!fs.existsSync(path.join(__dirname, logFileName))) { fs.writeFileSync(logFileName, '', 'utf-8') }
	// 写入进度
	fs.appendFileSync(logFileName, `【 ${nowDate()} 】- ${appid} - ${version} - ${process.env.NODE_ENV}:${config.projectname ? `【${config.projectname}】` : ' '}${msg}\n`, 'utf-8')
}

// 获取当前时间
function nowDate() {
	var date = new Date()
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = date.getDate()
	var hour = date.getHours()
	var minute = date.getMinutes()
	var second = date.getSeconds()
	if (month >= 1 && month <= 9) { month = '0' + month }
	if (day >= 0 && day <= 9) { day = '0' + day }
	if (hour >= 0 && hour <= 9) { hour = '0' + hour }
	if (minute >= 0 && minute <= 9) { minute = '0' + minute }
	if (second >= 0 && second <= 9) { second = '0' + second }
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}