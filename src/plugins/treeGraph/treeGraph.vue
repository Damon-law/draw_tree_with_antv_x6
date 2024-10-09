<!--
 * @Author: Damon Liu
 * @Date: 2024-09-10 10:05:28
 * @LastEditors: Damon Liu
 * @LastEditTime: 2024-10-09 10:06:48
 * @Description: 
-->
<template>
    <div class="tree-graph-container">
        <div class="tree-graph-main-content">
            <div class="graph-top-toolbar">
                <div>
                    <div style="display: flex; align-items: center;">
                        <TreeIcon style="color: var(--lams-color-primary);" />
                        <span style="font-weight: bold; margin-left: 12px;"> antv/x6 画树 </span>
                    </div>
                </div>
                <a-space :size="32" style="margin-left: 64px;" align="center">
                    <a-tooltip title="gitee 仓库链接">  
                        <a href="https://gitee.com/liuloser/draw_tree_with_antv_x6" target="_blank" style="display: flex; align-items: center;">
                            <GiteeIcon/>
                            <span style="margin-left: 4px;"> Gitee 仓库链接 </span>
                        </a>
                    </a-tooltip>
                    <a-tooltip title="掘金详解文章链接"> 
                        <a href="" target="_blank" style="display: flex; align-items: center;">
                            <JueJinIcon/>
                            <span style="margin-left: 4px;"> 掘金详解 </span>
                        </a>
                    </a-tooltip>
                    <a-tooltip title="作者">
                        <a href="https://juejin.cn/user/4332493267283560/posts" target="_blank" style="display: flex; align-items: center;">
                            赛博丁真Damon
                        </a>
                    </a-tooltip>
                </a-space>
                <div style="width: 0; flex: 1;">

                </div>
                <div style="display: flex; align-items: center; padding: 0 12px; ">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <a-tooltip title="导出图片" @click="handleExport">
                            <PictureOutlined style="color: #666;" />
                        </a-tooltip>
                        <a-tooltip :title="minimapShow ? '隐藏小地图' : '显示小地图'" @click="minimapShow = !minimapShow">
                            <div :class="[minimapShow ? 'active-minimap' : 'disactive-minimap']"
                                style="display: flex; align-items: center; padding: 4px; cursor: pointer;">
                                <MiniMapIcon :style="{ color: minimapShow ? '#fff' : '#666' }"></MiniMapIcon>
                            </div>
                        </a-tooltip>
                        <a-tooltip title="缩放居中" @click="handleZoomTofit">
                            <AimOutlined style="color: #666;" />
                        </a-tooltip>
                        <a-tooltip title="全屏" @click="handleFullScreen">
                            <FullscreenOutlined style="color: #666;" />
                        </a-tooltip>
                    </a-space>
                </div>
            </div>
            <div class="graph-content">
                <div v-show="minimapShow" id="minimap">

                </div>
                <div id="container" ref="containerRef">
                </div>
                <TeleportContainer />
            </div>
            <div class="graph-bottom-toolbar">
                <div style="display: flex; align-items: center; color: #333;">
                    <CtrlIcon style="font-size: 20px; color: #000; font-weight: bold;"></CtrlIcon> <span
                        style="font-size: 12px;margin-left: 6px;font-weight: bold;"> + 鼠标滚轮 ： 放大缩小 </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, shallowRef, provide, inject, toRaw } from 'vue';
import { getData } from '../data/data';
import { Graph, DataUri } from '@antv/x6';
import "@antv/x6-vue-shape";
import { register, getTeleport } from '@antv/x6-vue-shape';
import { dataToTreeData } from './algorithmn/dataToTree';
import { Export } from '@antv/x6-plugin-export';
import { MiniMap } from '@antv/x6-plugin-minimap';
import treeNode from './cores/nodes/treeNode.vue'
import CollapsableNode from './cores/nodes/collapsableNode.vue';    

import CtrlIcon from '../../assets/icon/ctrl.svg'
import { FullscreenOutlined, AimOutlined, PictureOutlined } from '@ant-design/icons-vue';

import { toggleFullScreen } from '../utils/fullScreen';


import MiniMapIcon from '../../assets/icon/mini_map_graph.svg';
import { Spin } from 'ant-design-vue';

import { message } from 'ant-design-vue';
import { v4 as uuidv4 } from 'uuid'

import GiteeIcon from '../../assets/gitee-copy.svg';
import TreeIcon from '../../assets/tree.svg';
import JueJinIcon from '../../assets/juejin.svg';

register({
    shape: 'treeNode',
    width: 100,
    height: 100,
    component: treeNode,
})

register({
    shape: 'collapsableNode',
    width: 50,
    height: 50,
    component: CollapsableNode
})

const TeleportContainer = getTeleport();    // teleport ref

const treeSize = ref({})        // 树状图的尺寸

const graphInstance = shallowRef();     // x6 图的实例

const orignalData = ref([]);        // 节点原始数据

const mockData = ref(getData());    // 模拟的树节点数据


/**
 * @Author: Damon Liu
 * @Date: 2024-09-23 11:29:46
 * @LastEditors: Damon Liu
 * @LastEditTime: 
 * @Description:  初始化树数据
 */
const initData = () => {
    const newData =  getData();
    // 数据太少的树不好看重新初始化
    if(newData.length < 6) {
        initData()
    }
    else {
        orignalData.value = newData;
    }
}

onMounted(() => {
    // 初始化 x6 图背景板
    const graph = new Graph({
        container: document.getElementById('container'),
        autoResize: true,
        background: {
            color: '#F2F7FA',
        },
        interacting: false,
        grid: {
            visible: true,
            type: 'doubleMesh',
            args: [
                {
                    color: '#eee', // 主网格线颜色
                    thickness: 1, // 主网格线宽度
                },
                {
                    color: '#ddd', // 次网格线颜色
                    thickness: 1, // 次网格线宽度
                    factor: 4, // 主次网格线间隔
                },
            ],
        },
        scroller: {
            enabled: true,
        },
        minimap: true,
        panning: {
            enabled: true,
            eventTypes: ['leftMouseDown', 'rightMouseDown', 'mouseWheel']
        },
        mousewheel: {
            enabled: true,
            modifiers: ['ctrl', 'meta'],
        },
    });
    initData(); // 初始化树数据
    const randomData = dataToTreeData(orignalData.value)    // 转化成x6节点数据
    treeSize.value = randomData.size;   // 树的大小
    // 渲染
    graph.fromJSON({
        nodes: randomData.nodes,
        edges: randomData.edges
    })
    graph.zoomToFit();  // 缩放
    graph.centerContent();  // 居中
    graph.use(new Export()) // 加载导出插件
    // 初始化小地图
    graph.use(
        new MiniMap({
            container: document.getElementById('minimap'),
        }),
    )
    graphInstance.value = graph;    // 保存图实例
})


/**
 * @Author: Damon Liu
 * @Date: 2024-09-23 11:27:08
 * @LastEditors: Damon Liu
 * @LastEditTime: 
 * @Description:  把当前图导出为图片
 */
const handleExport = () => {
    const hide = message.loading('正在导出图片中...请勿操作', 0);
    graphInstance.value.zoomToFit()
    graphInstance.value.centerContent();
    graphInstance.value.exportPNG('chart.png', {
        padding: 100,   // 导出图的边距，树状图周围留白的空间
        quality: 1, // 导出的质量
        width: treeSize.value.width * 2,    // 为了清晰度放大，可自行调整
        height: treeSize.value.height * 2   // 为了清晰度放大，可自行调整
    })
    hide();
}

// 导出为SVG
const handleExportSVG = () => {
    const hide = message.loading('Action in progress..', 0);
    graphInstance.value.zoomToFit()
    graphInstance.value.centerContent();
    graphInstance.value.exportSVG('chart.svg', {

    })
    hide();
}

// 导出为JSON
const handleExportJSON = () => {
    console.log(graphInstance.value.toJSON())
}


const containerRef = ref();     // 容器ref

/**
 * @Author: Damon Liu
 * @Date: 2024-09-23 11:26:27
 * @LastEditors: Damon Liu
 * @LastEditTime: 
 * @Description: 全屏展示
 */
const handleFullScreen = () => {
    toggleFullScreen(containerRef.value);
}


/**
 * @Author: Damon Liu
 * @Date: 2024-09-23 11:26:06
 * @LastEditors: Damon Liu
 * @LastEditTime: 
 * @Description: 缩放至容器大小并且剧中
 */
const handleZoomTofit = () => {
    graphInstance.value.zoomToFit()
    graphInstance.value.centerContent();
}

const minimapShow = ref(true);  // 是否显示小地图

const selectedNode = ref({});   // 当前选中的节点

/**
 * @Author: Damon Liu
 * @Date: 2024-09-23 11:25:29
 * @LastEditors: Damon Liu
 * @LastEditTime: 
 * @Description: 选中节点
 * @param {*} id
 */
const handleSelectNode = (id) => {
    const nodes = orignalData.value.filter(item => item.id === id);
    if(nodes && nodes.length) {
        selectedNode.value = nodes[0];
    }
    
}

/**
 * @Author: Damon Liu
 * @Date: 2024-09-23 11:25:19
 * @LastEditors: Damon Liu
 * @LastEditTime: 
 * @Description: 新增子节点
 */
const handleAddChild = () => {
    const pId = selectedNode.value.id;
    orignalData.value.push({
        index: orignalData.value.length + 1,
        id: uuidv4(), 
        pId: pId,
        layer: selectedNode.value.layer + 1,
    })
    const randomData = dataToTreeData(orignalData.value)
    treeSize.value = randomData.size;
    graphInstance.value.fromJSON({
        nodes: randomData.nodes,
        edges: randomData.edges
    })
    message.success('新增成功')
}


/**
 * @Author: Damon Liu
 * @Date: 2024-09-23 11:25:04
 * @LastEditors: Damon Liu
 * @LastEditTime: 
 * @Description: 删除节点
 * @param {*} id
 */
const handleDeleteNode = (id) => {
    const newData = orignalData.value.filter(node => ![node.id, node.pId].includes(id)) ;
    orignalData.value = newData;
    const newTreeData = dataToTreeData(orignalData.value);
    treeSize.value = newTreeData.size;
    graphInstance.value.fromJSON({
        nodes: newTreeData.nodes,
        edges: newTreeData.edges
    })
    message.info('已删除')
}

// 通过provide 传递
provide('graph', {
    selectedNode: selectedNode,
    handleSelectNode: handleSelectNode,
    callAddChild: handleAddChild,
    handleDeleteNode: handleDeleteNode
})

</script>

<style lang="less" scoped>
.tree-graph-container {
    width: 100%;
    height: 100vh;
    display: flex;
    background-color: #f9f9f9;

    --border-color: #bbb;
}
.tree-graph-main-content {
    flex: 1;
    width: calc(100% - 514px);
    height: 100%;
    display: flex;
    flex-direction: column;

    .graph-top-toolbar {
        padding: 8px 12px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
    }

    .graph-content {
        flex: 1;
        height: calc(100% - 100px);
        position: relative;

        #minimap {
            position: absolute;
            top: 0;
            right: 0;
            border: 1px solid var(--border-color);
            z-index: 500;
        }

        #container {
            height: 100%;
            width: 100%;
        }
    }

    .graph-bottom-toolbar {
        padding: 8px 12px;
        display: flex;
        align-items: center;
        border-top: 1px solid var(--border-color);
    }

}


.active-minimap {
    background: #1f87e8;
}

.disactive-minimap {
    background: #fff;
}
</style>