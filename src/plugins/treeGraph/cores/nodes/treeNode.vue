<!--
 * @Author: Damon Liu
 * @Date: 2024-09-10 16:18:10
 * @LastEditors: Damon Liu
 * @LastEditTime: 2024-10-08 17:41:51
 * @Description: x6 树节点
-->
<template>
    <div :class="[ id && fromGraph.selectedNode.value.id === id ? 'selected-node' : '' ]" style="position: relative; height: 100%;">
        <a-popover :title="title" trigger="click" @click="handleSelectNode">
            <template #content>
                <div class="operation-title">
                    新增:
                </div>
                <div>
                    <a-space wrap>
                        <a-button  type="primary" size="small" @click="handleAddChild"> + 添加后代 </a-button>
                        <a-popconfirm title="是否确认删除该节点及其子孙节点？" ok-text="确认" cancel-text="取消" @confirm="handleDeleteNodeConfirm">
                            <a-button size="small" type="link" danger> <DeleteOutlined />  删除 </a-button>
                        </a-popconfirm>
                    </a-space>
                </div>
            </template>
            <div class="tree-node" style="text-align: center; display: flex; align-items: center;justify-content: center;">
                    {{ index }}
            </div>
        </a-popover>
    </div>
</template>

<script setup>
import { inject, ref, onMounted, computed, h } from 'vue';
import { romanize } from '../../../utils/roma';
import { DeleteOutlined } from '@ant-design/icons-vue';

const getGraph = inject('getGraph');

const getNode = inject('getNode');

const fromGraph = inject('graph', {
    selectedNode: ref({}),
    handleSelectNode: () => {},
    callAddChild: () => {},
    handleDeleteNode: () => {}
})

const id = ref(0)

const index = ref(0);

const layer = ref(0);

const title = computed(() => {
    return `${romanize(layer.value)} - ${index.value}`
})

onMounted(() => {
    const node = getNode();
    index.value = node.data.index;
    layer.value = node.data.layer;
    id.value = node.id;
    node.on("change:data", ({ current }) => {
        index.value = current.index;
        layer.value = current.layer;
    });
})


const handleSelectNode = () => {
    const node = getNode();
    fromGraph.handleSelectNode(node.id)
}

const handleAddChild = () => {
    fromGraph.callAddChild()
}

const handleDeleteNodeConfirm = () => {
    const node = getNode();
    fromGraph.handleDeleteNode(node.id);
}

</script>

<style lang="less" scoped>
.tree-node {
    width: 100%;
    height: 100%;
    border: 1px solid #eee;
    color: #fff;
    font-size: 24px;
    background: rgba(31, 135, 232, 1);
    color: #fff;
    border-radius: 50%;
    &:hover {
        opacity: 0.8;
    }
}

.selected-node {
    .tree-node {
        box-shadow: 0 6px 16px 0 rgba(31, 135, 232, 1),  0 3px 6px -4px rgba(31, 135, 232, 1),  0 9px 28px 8px rgba(31, 135, 232, 1);
    }
   
}

.operation-title {
    font-weight: bold;
    padding: 4px 0;
}
</style>