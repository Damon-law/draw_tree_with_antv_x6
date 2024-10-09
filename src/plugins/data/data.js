/*
 * @Author: Damon Liu
 * @Date: 2024-09-10 09:35:01
 * @LastEditors: Damon Liu
 * @LastEditTime: 2024-09-23 14:12:08
 * @Description:  生成虚拟数据
 */
import { v4 as uuidv4 } from 'uuid'
export const mockData = [
    {
        layer: 1,   // 层级
        id: uuidv4(),   // id， -1 表示虚拟根节点
        index: 1,   // 索引值
        pId: -1,    // 父节点id， null表示无父节点
    },
]


/**
 * @Author: Damon Liu
 * @Date: 2024-09-10 09:55:48
 * @LastEditors: Damon Liu
 * @LastEditTime: 
 * @Description: 模拟后端生成树的算法
 * @param {*} layer              树的层数
 * @param {*} childrenCount      子节点数量
 */
export const getData = function (_layer, _childrenCount) {
    const res = []; // 最终数据
    const layers = _layer ? _layer : parseInt(parseInt(Math.random() * 1e3) % 6) + 1;    //  获取生成树的层级有多少， 有传入值取传入值，无则随机
    const bfs = [...mockData];
    let index = 1;
    while(bfs.length) {
        const currentNode = bfs.shift();    // 获取节点
        res.push(currentNode);
        // 如果当前节点的层级已到达最高的节点
        if(currentNode.layer >= layers) {
            continue;
        }
        // 没有则添加子节点
        else {
            const childrenCount = _childrenCount ? _childrenCount : parseInt(parseInt(Math.random() * 1e3) % 3) + 1;
            for(let i = 0; i < childrenCount; ++i) {
                const newNode = {
                    id: uuidv4(),
                    layer: currentNode.layer + 1,
                    index: ++index,
                    pId: currentNode.id,
                }
                
                bfs.push(newNode);
            }
        }
    }
    // 虚拟根节点
    res.unshift({
        layer: 0,
        id: -1,
        index: -1,
        pId: null,
    })
    return res;
}