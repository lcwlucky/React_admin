import React, {Component} from 'react'
import {connect} from 'react-redux'
import {logout} from '../../redux/actions'
import './header.less'

import {withRouter} from 'react-router-dom'
import {Modal} from 'antd'
import {reqWeather} from '../../api'
import menuList from '../../config/menuConfig'
import {formateDate} from '../../utils/dateUtils'

import memoryUtils from '../../utils/memoryUtils'
import storageUtils from '../../utils/storageUtils'

import LinkButton from '../link-button'

class Header extends Component {

    state = {
        currentTime: formateDate(Date.now()), // 当前时间字符串
        dayPictureUrl: '', // 天气图片url
        weather: '', // 天气的文本
    }

    getTime = () => {
        // 每隔1s获取当前时间, 并更新状态数据currentTime
        this.intervalId = setInterval(() => {
            const currentTime = formateDate(Date.now())
            this.setState({currentTime})
        }, 1000)
    }

    getWeather = async () => {
        // 调用接口请求异步获取数据
        const {dayPictureUrl, weather} = await reqWeather('杭州')
        // 更新状态
        this.setState({dayPictureUrl, weather})
    }

    getTitle = () => {
        // 得到当前请求路径
        const path = this.props.location.pathname
        let title
        menuList.forEach(item => {
            if (item.key === path) { // 如果当前item对象的key与path一样,item的title就是需要显示的title
                title = item.title
            } else if (item.children) {
                // 在所有子item中查找匹配的
                const cItem = item.children.find(cItem => path.indexOf(cItem.key) === 0)
                // 如果有值才说明有匹配的
                if (cItem) {
                    // 取出它的title
                    title = cItem.title
                }
            }
        })
        return title
    }

    //退出登陆
    logout = () => {
        // 显示确认框
        Modal.confirm({
            content: '确定退出吗?',
            onOk: () => {
                /*
                // 删除保存的user数据
                storageUtils.removeUser()
                memoryUtils.user = {}
                // 跳转到login
                this.props.history.replace('/login')*/

               //使用redux
                this.props.logout()
            }
        })
    }

    componentDidMount() {
        // 获取当前的时间
        this.getTime()
        // 获取当前天气
        this.getWeather()
    }

    /*
  当前组件卸载之前调用
   */
    componentWillUnmount() {
        // 清除定时器
        clearInterval(this.intervalId)
    }

    render() {
        const {currentTime, dayPictureUrl, weather} = this.state
        const username = this.props.user.username
        // 得到当前需要显示的title
        // const title = this.getTitle()
        const title = this.props.headTitle  //使用redux管理了标题

        return (
            <div className="header">
                <div className="header-top">
                    <span className='info'>欢迎 , <span className='name'>{username}</span></span>
                    <LinkButton onClick={this.logout}>退出</LinkButton>
                </div>
                <div className="header-bottom">
                    <div className="header-bottom-left">{title}</div>
                    <div className="header-bottom-right">
                        <span>{currentTime}</span>
                        <img src={dayPictureUrl} alt="weather"/>
                        <span>{weather}</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(
    state => ({headTitle: state.headTitle, user: state.user}),
    {logout}
)(withRouter(Header))
