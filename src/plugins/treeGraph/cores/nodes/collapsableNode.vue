<!--
 * @Author: Damon Liu
 * @Date: 2024-09-10 16:16:41
 * @LastEditors: Damon Liu
 * @LastEditTime: 2024-09-23 11:47:54
 * @Description: 
-->
<template>
    <div style="height: 100%; width: 100%; cursor: pointer; border-bottom-left-radius: 35%; border-bottom-right-radius: 35%;  background: #1f87e8; color: #fff; font-size: 25px; display: flex; align-items: center; justify-content: center;"
        @click="toggleExpand">
        <a-tooltip :title="expand ? '收起' : '展开'">
            <div v-if="!expand">
                <PlusOutlined />
            </div>
            <div v-else>
                <MinusOutlined />
            </div>
        </a-tooltip>
    </div>
</template>

<script setup>
import { inject, ref, onMounted, computed } from 'vue';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';

const getGraph = inject('getGraph');

const getNode = inject('getNode');

const expand = ref(true);

onMounted(() => {
    const node = getNode();
    const graph = getGraph();
    expand.value = node.data.expand;
    node.on("change:data", ({ current }) => {
        expand.value = current.expand;
    });
    // 监听可见事件
    node.on('change:visible', (e) => {
        // 当存在子节点的时候，遍历子节点并显示
        if (node.data.children) {
            node.data.children.forEach(key => {
                const child = graph.getCellById(key);   // 显示链接的子节点
                const expandChild = graph.getCellById(`expand-${key}`)  // 子节点的收缩节点（不一定存在）
                if (node.visible && node.data.expand) {
                    child.show()    // 显示子节点
                    expandChild?.show() // 存在收缩节点也显示
                }
                else {
                    child.hide()    // 隐藏子节点
                    expandChild?.hide() // 子节点存在收缩节点隐藏
                }

                //console.log(child)
            })
        }
    })
})

/**
 * @Author: Damon Liu
 * @Date: 2024-09-23 11:32:40
 * @LastEditors: Damon Liu
 * @LastEditTime: 
 * @Description: 收起/展开子孙节点
 */
const toggleExpand = () => {
    const node = getNode();
    /* console.log(node) */
    const graph = getGraph();
    // 遍历子节点及其收缩节点进行 显示/隐藏
    if (node.data.children) {
        node.data.children.forEach(key => {
            const child = graph.getCellById(key);
            const expandChild = graph.getCellById(`expand-${key}`)
            if (expand.value) {
                child.hide()
                expandChild?.hide()
            }
            else {
                child.show()
                expandChild?.show()
            }

            //console.log(child)
        })
    }
    // 更新收缩情况
    node.setData({
        expand: !expand.value
    })
}

</script>