/*
 * @Author: Damon Liu
 * @Date: 2024-09-10 10:12:40
 * @LastEditors: Damon Liu
 * @LastEditTime: 2024-09-10 17:41:49
 * @Description: 将生成的Data转化为x6绘画的treeData
 */

import { romanize } from '../../utils/roma';

/**
 * @Author: Damon Liu
 * @Date: 2024-09-10 10:14:25
 * @LastEditors: Damon Liu
 * @LastEditTime: 
 * @Description:  一个节点的位置与
 * 
 * @param {*} data           后端存储的树结构
 * @param {*} nodeWidth      节点的宽度
 * @param {*} nodeHeight     节点的高度
 * @param {*} layerGutter    层间距     层与层之间间隔的距离
 * @param {*} nodeGutter     节点间距    同级节点直接的距离
 */
export const dataToTreeData = (data = [], nodeWidth = 80, nodeHeight = 80, layerGutter = 250, nodeGutter = 100) => {
    const dataCopy = JSON.parse(JSON.stringify(data));      // 不影响旧数据，copy一份
    const x6Nodes = [];     // 转换后的X6节点数组
    const x6Edges = [];    // 转换后的x6边组合
    const idToX6Map = {}; // id 对应对象map

    const calcNodes = [];       // 用于计算节点下子树节点的宽高，x,y 数据

    const idToCalcNodesMap = {};       // 用于记录计算数据的 id 对应节点的map

    const collapsableNodes = {};        // 存在收缩展开子节点的功能， 用于记录收缩节点的数据

    dataCopy.forEach((node) => {
        const x6Node = {
            id: node.id,
            shape: 'treeNode',
            width: nodeWidth,
            height: nodeHeight,
            x: 0,
            y: 0,
            data: {
                ...node // 保留额外数据
            }
        }
        idToX6Map[node.id] = x6Node;
        x6Nodes.push(x6Node);

        const calcNode = {
            ...node,
            width: nodeWidth,
            height: nodeHeight,
            subTreeWidth: 0,
            subTreeHeight: nodeHeight,
            usedWidth: 0    // 已经使用了的宽度
        }

        calcNodes.push(calcNode)
        idToCalcNodesMap[node.id] = calcNode;

    })
    // 先排序，防止后端传回/生成的数据顺序有错
    dataCopy.sort((a, b) => {
        // 先按 layer 降序排序
        if (a.layer !== b.layer) {
            return b.layer - a.layer;
        }
        // 同一层内按 pid 升序排序
        return a.pId - b.pId;
    })
    // 记录节点是否已经计算
    // const visitedMap = {};
    // 先绘制 层数编号 元素
    if (dataCopy.length) {
        const maxLayer = dataCopy[0].layer;
        for (let i = maxLayer; i > 0; --i) {
            x6Nodes.push({
                shape: 'rect',
                x: -300,
                y: 200 + i * (layerGutter + nodeHeight),
                width: 100,
                height: 100,
                attrs: {
                    body: {
                        fill: 'none',
                        stroke: 'none'
                    },
                    label: {
                        text: romanize(i),
                        fill: '#666',
                        fontSize: 48
                    }
                }
            })
        }
    }

    // 开始计算 每个节点子树的宽度， 由底向上更新 
    dataCopy.forEach((node) => {
        // 已访问
        //visitedMap[node.id] = true;
        const pid = node.pId;   // 获取父节点的Id
        // 更新子树的宽度， 从 自身节点宽度， 子树大小 中取最大值 （可能没有子树的时候，自身宽度则是子树宽度）
        const maxSubtreeWidth = Math.max(idToCalcNodesMap[node.id].subTreeWidth, idToCalcNodesMap[node.id].width);
        idToCalcNodesMap[node.id].subTreeWidth = maxSubtreeWidth;
        // 存在父节点更新父节点数据
        if (pid) {
            const parentNode = idToCalcNodesMap[pid];
            // 当父节点的子树宽度为0，即是没有兄弟节点访问过，或者不存在兄弟节点
            if (parentNode.subTreeWidth === 0) {
                parentNode.subTreeWidth = parentNode.subTreeWidth + maxSubtreeWidth;    // 没有访问过时候不需要加上节点间距
            }
            else {
                parentNode.subTreeWidth = parentNode.subTreeWidth + maxSubtreeWidth + nodeGutter;   // 父节点的子树增加并且加上节点间距
            }
        }
    })

    // 准备开始计算每个节点的x, y
    const fromRootToLeaf = JSON.parse(JSON.stringify(data));

    idToX6Map[-1].x = parseInt((idToCalcNodesMap[-1].subTreeWidth) / 2) - (nodeWidth) / 2; // 根树的x结点
    idToX6Map[-1].y = 200;

    fromRootToLeaf.sort((a, b) => {
        // 先按 layer 降序排序
        if (a.layer !== b.layer) {
            return a.layer - b.layer;
        }
        // 同一层内按 pid 升序排序
        return a.pId - b.pId;
    })


    fromRootToLeaf.forEach((node) => {
        // 虚拟根节点不需要计算
        if (node.id === -1) {
            return;
        }
        const calcNode = idToCalcNodesMap[node.id];
        const x6Node = idToX6Map[node.id];
        const pid = calcNode.pId;
        const parentCalcNode = idToCalcNodesMap[pid];
        const parentX6Node = idToX6Map[pid];
        const currentNodeWidth = calcNode.width;
        // 当前节点子树开始的x坐标： 父节点的 x 坐标 + 当前节点的宽度 - 父节点子树宽度 / 2 （居中）+ 父节点已经被使用的宽度（被兄弟节点使用过的宽度）
        //const subTreeStartX = parentX6Node.x + calcNode.width / 2 - parseInt(parentCalcNode.subTreeWidth / 2) + parentCalcNode.usedWidth;
        const subTreeStartX = parentX6Node.x + parseInt(calcNode.width / 2 - parentCalcNode.subTreeWidth / 2) + parentCalcNode.usedWidth;
        // 当前节点子树开始的y坐标: 父节点的 y 左边 + 层间距 + 节点高度
        const subTreeStartY = parentX6Node.y + layerGutter + nodeHeight;

        // 
        const nodeX = parseInt(subTreeStartX + calcNode.subTreeWidth / 2 - calcNode.width / 2);

        x6Node.x = nodeX;
        x6Node.y = subTreeStartY;


        // 当父节点不为虚拟根节点的时候, 添加当前节点、父节点、收缩节点之间的边
        if (parentCalcNode.id !== -1) {
            // 父节点到收缩节点之间的边
            x6Edges.push({
                source: parentX6Node.id,
                target: `expand-${parentX6Node.id}`,
                attrs: {
                    line: {
                        stroke: "#999", // 指定 path 元素的填充色
                        targetMarker: null,
                        sourceMarker: null,
                    }
                },
            })

            // 收缩节点到当前节点之间的边
            x6Edges.push({
                source: `expand-${parentX6Node.id}`,
                target: x6Node.id,
                attrs: {
                    line: {
                        stroke: "#999", // 指定 path 元素的填充色
                    }
                },
                router: {
                    name: 'er',
                    args: {
                        offset: 'center',
                        direction: 'B'
                    },
                }
            })
            // 查看 父节点 是否已经存在 改收缩节点， 不存在则添加
            if (!collapsableNodes[parentCalcNode.id]) {
                collapsableNodes[parentCalcNode.id] = {
                    shape: 'collapsableNode',
                    width: 40,
                    height: 40,
                    // x 为父节点 x 坐标 + 父节点宽度的一半 - 20 （自身宽度的一半）
                    x: parentX6Node.x + parseInt(parentCalcNode.width / 2) - 20,
                    // y 坐标为 父节点的 y 坐标 + 父节点高度 + 层间距 / 5 （可以自由调整，我是想更靠近父节点） - 20 (收缩节点自身高度的一半)
                    y: parentX6Node.y + parentCalcNode.height + layerGutter / 5 - 20,
                    data: {
                        expand: true,  // 默认收缩节点全展开
                        children: [calcNode.id] // 收缩节点控制的所有子节点
                    },
                    ports: {
                        bottom: {
                            position: 'bottom',
                            attrs: {
                                circle: {
                                    magnet: true,
                                    stroke: '#8f8f8f',
                                    r: 5,
                                },
                            },
                        }
                    }
                }
            }
            // 存在 则把 当前节点添加为收缩节点的子节点
            else {
                collapsableNodes[parentCalcNode.id].data.children.push(calcNode.id)
            }
        }


        // 更新父节点已使用的宽度， 用于计算下一个子节点的起始x坐标；
        // 此前未使用过
        if (parentCalcNode.usedWidth === 0) {
            // 未使用过， 暂时不存在 兄弟节点， 不需要
            parentCalcNode.usedWidth = parentCalcNode.usedWidth + calcNode.subTreeWidth + nodeGutter;
        }
        // 此前已经使用过
        else {
            parentCalcNode.usedWidth = parentCalcNode.usedWidth + calcNode.subTreeWidth + nodeGutter;
        }
    })

    return {
        nodes: [...x6Nodes.filter(item => item.id !== -1), ...Object.keys(collapsableNodes).map(key => ({ ...collapsableNodes[key], id: `expand-${key}` }))],
        edges: x6Edges,
        size: {
            width: idToCalcNodesMap[-1].subTreeWidth,
            height: Math.max(...calcNodes.map(item => item.layer)) * (nodeHeight + layerGutter) - layerGutter
        }
    };
}
