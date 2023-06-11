// pages/account/login.js
//获取应用实例
var app = getApp();
var util = require('../../utils/util.js');
import WxValidate from '../../utils/validate';

var inputContent = {};//输入内容
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentTab: 0,   // tab切换
        paracont: "获取验证码",//验证码文字
        vcdisabled: true,//验证码按钮状态
        verifycode: "",//返回的验证码
        userInfo:"",
        phoneNum:""
    },

    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数

        //删除记住用户信息
        wx.removeStorageSync("userid");
        wx.removeStorageSync("usersecret");
        wx.removeStorageSync("user");
        wx.removeStorageSync("token");
        wx.removeStorageSync("expires_in");
        //接口API授权 type 1.是公共授权  2.登录授权
        util.authorization(1, function () {
            //微信授权登录
            util.wxLogin();
        })
        let user=wx.getStorageSync('user')
        console.log('进入小程序的页面获取缓存',user)
        this.setData({
          userInfo:user
        })
    },
/**
     * 获取用户手机号 
     */
    getPhoneNumber: function(e){
      console.log("4324234", e);
      if (e.detail.errMsg == "getPhoneNumber:fail user deny") {
        wx.showToast({
          title: '拒绝授权，无法获取用户手机号码！',
        }) 
        return;
      }
      //解密数据获取手机号码
      console.log(e.detail.code);
      //this.decryptData(this.data.sessionKey,e.detail.iv,e.detail.encryptedData);
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    /**
     * 获取用户输入
     */
    bindChange: function (e) {
        inputContent[e.currentTarget.id] = e.detail.value;
        util.verifyCodeBtn(e, this);
    },
    /**
     * 获取验证码
     */
    getVerifyCode: function (e) {
        var that = this;
        util.getVerifyCode(inputContent['user'], this, function (data) {
            that.setData({
                verifycode: data.data
            })
        })

    },
   
    login(){
      wx.getUserProfile({
        desc: '必须授权才能继续使用', // 必填 声明获取用户个人信息后的用途，后续会展示在弹窗中
        success:(res)=> { 
          let user=res.userInfo
            console.log('授权成功', res);
            this.setData({ 
                userInfo:res.userInfo
            })
           this.loginAgain(user)
        },
        fail:(err)=> {
            console.log('授权失败', err);
            wx.showToast({
              title: "授权失败",
              icon: 'error',
              duration: 3000
            })
        }
    })

      // wx.getUserProfile({
      //   desc: '用于完善会员资料',//声明获取用户个人信息后的用途，后续会展示在弹窗中
      //   success:res =>{
      //     let user = res.userInfo
      //     //把用户信息缓存到本地
      //   //  this.loginSubmit(user)
      //     wx.setStorageSync('user', user)
      //     console.log("用户信息",user)
      //     this.setData({
      //       userInfo:user
      //     })
      //     // loginSucess(user)
      //   },
      //   fail: res=>{
      //     console.log('授权失败',res)
      //   }
      // })
    },

    loginAgain:function(user){
      wx.login({
        success: (res) => {
          let code =res.code
          console.log("wx.login返回code:",res.code)
          util.https(app.globalData.api + "/wechat/login", "POST", {
           code:code,
            client: 0,
            avatarUrl:user.avatarUrl,
            city: user.city,
            country:user.country,
            gender: user.gender.toString(),
            language: user.language,
            nickName: user.nickName,
            province:user.province,
            openid: wx.getStorageSync("openid")
           
        },
        function (data) {
          console.log("232232:",data)
            if(data.code==1001){
              console.log("登录接口返回：",data)
              //  that.loginSucess(data);
            }else {
              console.log("登录接口返回111：",data)
                //util.toolTip(that,data.message)
            }

        }
      )
        },
      })
    },
    /**
     * 登录提交
     */
    loginSubmit: function (e) {
        var that = this;
 

        util.wxValidate(function () {
            /*     console.log(wx.getSystemInfoSync().platform);*/
            //用户手机登录
            if (that.data.currentTab == 0) {
                if (that.data.verifycode != inputContent.verifycode) {
                    util.toolTip(that,"验证码输入不正确")
                    return;
                }
                util.https(app.globalData.api + "/api/user/login_mobile", "POST", {
                        mobile: inputContent.user,
                        code: inputContent.verifycode,
                        client: 0,
                        openID: wx.getStorageSync("openid"),
                        invitecode: ""
                    },
                    function (data) {
                        if(data.code==1001){
                            that.loginSucess(data);
                        }else {
                            util.toolTip(that,data.message)
                        }


                    }
                )
            } else if (that.data.currentTab == 1) { //用户名密码登录
                util.https(app.globalData.api + "/api/user/login", "POST", {
                        account: inputContent.account,
                        password: inputContent.password,
                        client: 0,
                        openID: wx.getStorageSync("openid"),
                        invitecode: ""
                    },
                    function (data) {
                        if(data.code==1001){
                            that.loginSucess(data);
                        }else {
                            util.toolTip(that,data.message)
                        }

                    }
                )
            }

        });

    },
    /**
     * 登录成功后
     */
    loginSucess: function (data) {
        wx.setStorageSync("userid", data.data.userid);
        wx.setStorageSync("usersecret", data.data.usersecret);
        //接口API授权 type 1.是公共授权  2.登录授权
        util.authorization(2, function () {
            //根据会员ID获取会员账号基本信息
            util.getUserInfo(function (data) {
                //返回上一页
        /*        wx.navigateBack({
                    delta: 1
                })*/
                wx.reLaunch({
                    url: '../index/index'
                })

            })
        },true);


    },
    /**
     * 点击tab切换
     */
    swichNav: function (e) {
        util.swichNav(e, this)
    }
})