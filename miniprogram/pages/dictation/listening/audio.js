var wordList = ""
var that
var passed
var wordSum
var flag
var last_idx

Page({

  data: {
    percent: 1, //进度
    content: null, //词汇
    pron: null, //音标
    definition: null, //定义
    hidden: false
  },

  onLoad: function(options) {
    that = this;
    let db = wx.cloud.database();
    let bookid = (options.book == '1') ? "wordlist1" : "wordlist2" //选择单词书
    db.collection(bookid).doc(parseInt(options.part)).field({
      section: true
    }).get().then(res => {
      wordList = res.data.section
      wordSum = wordList.length
      passed = 0
      var idx = Math.floor(Math.random() * (wordList.length - 1))
      last_idx = idx

      //绑定数据到页面
      that.setData({
        content: wordList[idx].content,
        pron: wordList[idx].pron,
        definition: wordList[idx].definition,
        hidden: !that.data.hidden,
        display: false
      })
      that.read()
    })

  },

  showAnswer: function() {
    this.setData({
      display: true
    })
  },

  stillSound: function() {
    this.read()
    flag = true
  },

  onShow: function() {

  },

  onHide: function() {

  },

  onUnload: function() {

  },

  nextSound: function() {
    if (wordList.length == 1) {
      wx.showToast({
        title: '恭喜您听完本课',
        icon: 'success',
        duration: 2000
      })
      this.setData({
        percent: 100
      })
      return
    }
    var that = this;
    if (flag != true) { //在触发下一个之前，不是在听一次
      passed++
      //console.log("delete: " + wordList[last_idx].content)
      wordList.splice(last_idx, 1)
      //console.log(wordList.length)
      //console.log(passed)
    }
    flag = false;

    var idx = Math.floor(Math.random() * (wordList.length - 1)) //任选一个听写
    last_idx = idx
    that.setData({
      //设置加载条
      content: wordList[idx].content,
      pron: wordList[idx].pron,
      definition: wordList[idx].definition,
      // hidden: !that.data.hidden,
      display: false,
      percent: passed * 100 / wordSum
    })
    this.read()
  },

  read: function() {
    var word = that.data.content
    //console.log("准备播放" + word)
    wx.request({
      url: 'https://api.shanbay.com/bdc/search/?word=' + that.data.content,
      data: {},
      method: 'GET',
      success: function(res) {
        var innerAudioContext = wx.createInnerAudioContext()
        innerAudioContext.src = res.data.data.audio
        innerAudioContext.autoplay = true
        innerAudioContext.onPlay(() => {
          //console.log('read()开始播放')
        })
        innerAudioContext.onError((res) => {
          console.log("read()出错了")
          wx.showToast({
            title: '读音走丢了TAT',
            mask: false,
          })
        })
      },
      fail: function() {},
      complete: function() {}
    })
  }


})