/*
 * @Author: Damon Liu
 * @Date: 2024-09-10 09:32:32
 * @LastEditors: Damon Liu
 * @LastEditTime: 2024-09-10 09:32:36
 * @Description:  工具类
 */
// 全屏操作工具类
// 由于单纯的元素全屏会影响到其他具有遮罩层的元素的正常使用，所以需要特殊处理
// 处理方法： 将document.Element设为全屏元素，需要全屏展示的元素则通过fixed布局和z-index 来进行处理
import { ref, watch } from "vue";
import { useFullscreen } from "@vueuse/core";
// 元素全屏工具类
const { isFullscreen, enter, exit, toggle } = useFullscreen(ref(document.documentElement));

export  { isFullscreen };

// 需要全屏的元素
const fullScreenElementRef = ref(null);

// 全屏toggle事件，el为需要全屏的元素
export const toggleFullScreen = (el) => {
    /* console.log(el)
    return ; */
    // 如果当前是全屏， 而且是同一元素点击，则退出全屏
    if(fullScreenElementRef.value && fullScreenElementRef.value === el && isFullscreen.value) {
        toggle();
        el.classList.remove('fullscreen-el')
    }
    // 如果当前是全屏，但是是另一元素点击全屏事件，则只更改全屏元素
    else if(isFullscreen.value && fullScreenElementRef.value !== el) {
        fullScreenElementRef.value && fullScreenElementRef.value.classList.remove('fullscreen-el');
        el.classList.add('fullscreen-el')
        fullScreenElementRef.value = el;
    }
    // 如果当前没有全屏元素， 则正常全屏
    else if(!isFullscreen.value) {
        toggle();
        el.classList.add('fullscreen-el')
        fullScreenElementRef.value = el;
    }
}

// 如果是ESC退出全屏的
watch(() => isFullscreen.value, (newVal) => {
    if(!newVal) {
        if(fullScreenElementRef.value) {
            fullScreenElementRef.value.classList.remove('fullscreen-el');
            fullScreenElementRef.value = null;
        }
    }
})

// 用于获取目标的元素是否是全屏/退出全屏
export const getElIsFullScreen = (el) => {
    return (fullScreenElementRef.value === el && isFullscreen.value);
}