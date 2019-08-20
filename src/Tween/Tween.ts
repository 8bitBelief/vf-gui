import { UIBase } from "../UIBase";
import { EaseBase } from "../Ease/EaseBase";
import {TweenObject, getObject} from "./TweenObject"
import { TweenItem, getNewTweenItem } from "./TweenItem";
import { getNewCallbackItem } from "./TweenCallbackItem";
/**
 * @protected
 */
export const _activeTweenObjects: {[key: string]: TweenObject} = {};


/**
 * 设置缓动，调用to,from,fromTo
 * @param obj 显示对象
 * @param params 参数
 * @private
 */
export function set (obj: UIBase, params: TAny) {
    const object = getObject(obj);
    const tempObj: TAny = obj;
    for (const key in params) {
        if (typeof tempObj[key] === "undefined") 
            continue;
        object.removeTweenItem(key);
        tempObj[key] = params[key];
    }
}
/**
 * 从当前值到目标值
 * @param obj 显示容器
 * @param time 时间
 * @param params 缓动字段 如: { scale: 1.15, tint: "#ffffff" ,onComplete:(obj)=>{},onUpdate:(delta)=>{}}
 * @param ease 缓动函数 Ease/Ease.ts
 */
export function to(obj: UIBase, time: number, params: TAny, ease: EaseBase){
    const object = getObject(obj);
    let onUpdate = null;
    for (const key in params) {
        if (key === "onComplete") {
            const cb = getNewCallbackItem();
            cb.set(object, params[key], time);
            object.addTweenItem(cb.key,cb);
            continue;
        }

        if (key === "onUpdate") {
            onUpdate = params[key];
            continue;
        }

        if (time) {
            const tempObj = obj as TAny;
            if (typeof tempObj[key] === "undefined") 
                continue;
            const match = params[key] === tempObj[key];
            if (match) {
                object.removeTweenItem(key);
            }
            else {
                let item = object.getTweenItem(key) as TweenItem;
                if(item === undefined){
                    item = getNewTweenItem();
                    object.addTweenItem(key,item);
                }
                item.set(object, key, tempObj[key], params[key], time, ease);
            }
        }
    }

    if (time)
        object.onUpdate = onUpdate;
    else 
        set(obj, params);
}

/**
 * 从指定目标值到属性当前值
 * @param obj 
 * @param time 
 * @param params 
 * @param ease 
 */
export function from(obj: UIBase, time: number, params: TAny, ease: EaseBase) {
    const object = getObject(obj);
    let onUpdate = null;
    for (const key in params) {
        if (key === "onComplete") {
            const cb = getNewCallbackItem();
            cb.set(object, params[key], time);
            object.addTweenItem(cb.key,cb);
            continue;
        }

        if (key === "onUpdate") {
            onUpdate = params[key];
            continue;
        }

        if (time) {
            const tempObj = obj as TAny;
            if (typeof tempObj[key] === "undefined") 
                continue;
            const match = params[key] == tempObj[key];
            if (match) {
                object.removeTweenItem(key);
            }
            else {
                let item = object.getTweenItem(key) as TweenItem;
                if(item === undefined){
                    item = getNewTweenItem();
                    object.addTweenItem(key,item);
                }
                item.set(object, key, params[key],tempObj[key], time, ease);
            }
        }
    }

    if (time)
        object.onUpdate = onUpdate;
    else 
        set(obj, params);
}

/**
 * 执行循环
 * @param obj 
 * @param time 
 * @param params 
 * @param ease 
 */
export function fromTo(obj: UIBase, time: number, paramsFrom: TAny, paramsTo: TAny, ease: EaseBase) {
    const object = getObject(obj);
    let onUpdate = null;
    for (const key in paramsTo) {
        if (key === "onComplete") {
            const cb = getNewCallbackItem();
            cb.set(object, paramsTo[key], time);
            object.addTweenItem(cb.key,cb);
            continue;
        }

        if (key === "onUpdate") {
            onUpdate = paramsTo[key];
            continue;
        }

        if (time) {
            const tempObj = obj as TAny;
            if (typeof tempObj[key] === "undefined" || typeof paramsFrom[key] === "undefined") 
                continue;
            const match = paramsFrom[key] == paramsTo[key];
            if (match) {
                object.removeTweenItem(key);
                tempObj[key] = paramsTo[key];
            }
            else {
                let item = object.getTweenItem(key) as TweenItem;
                if(item === undefined){
                    item = getNewTweenItem();
                    object.addTweenItem(key,item);
                }
                item.set(object, key, paramsFrom[key],paramsTo[key], time, ease);
            }
        }
    }

    if (time)
        object.onUpdate = onUpdate;
    else 
        set(obj, paramsTo);
}

export function _update(delta: number) {
    for (const id in _activeTweenObjects) {
        const object = _activeTweenObjects[id];
        for (const key in object.tweens) {
            object.tweens[key].update(delta);
        }
        if (object.onUpdate) {
            object.onUpdate.call(object.object, delta);
        }
    }
}