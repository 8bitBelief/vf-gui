import { UISettings } from "./UISettings";
import { log } from "./Utils";
import { Stage } from "./Stage";
import { HorizontalAlignEnum, VerticalAlignEnum } from "./Align";
import { DragEvent } from "./Interaction/DragEvent";
import { interaction } from "pixi.js";
import * as DragDropController from "./Interaction/DragDropController";
import { DraggableEventEnum } from "./Interaction/DraggableEventEnum";
import { TouchEventEnum } from "./Interaction/TouchEventEnum";

/**
 * UI的顶级类，基础的UI对象
 *
 * @class
 * @extends PIXI.UI.UIBase
 * @param width {Number} Width UI对象的宽度
 * @param height {Number} Height UI对象的高度
 */
export class UIBase extends PIXI.utils.EventEmitter {

    constructor(width: number | string, height: number | string) {
        super();
        this.container = new PIXI.Container();
        this.setting = new UISettings();

        const widthItem = this.getPetValue(width);
        if (widthItem.num) {
            this.setting.width = widthItem.num;
        } else {
            this.setting.widthPct = widthItem.pct;
        }

        const heightItem = this.getPetValue(height);
        if (heightItem.num) {
            this.setting.height = heightItem.num;
        } else {
            this.setting.heightPct = heightItem.pct;
        }
    }
    /** 
     * 当前的显示容器 
     */
    public container: PIXI.Container;
    /** 
     * UI对象的显示属性集合 
     */
    public setting: UISettings;
    /** 
     * 当前UI包含的节点
     * @default 
     */
    public children: UIBase[] = [];
    /** 
     * 父容器 
     */
    public parent: UIBase | undefined;
    /**  
     * 舞台引用
     */
    public stage: Stage | undefined;
    /** 
     * 是否初始化 
     * @default
     */
    public initialized = false;
    /** 
     * 可拖动初始化
     *  @default
     */
    public dragInitialized = false;
    /** 
     * 可被掉落初始化
     * @default
    */
    public dropInitialized = false;
    /** 
     * 是否脏数据
     * @default
     */
    public dirty = true;
    /** 测量值 */
    protected _width = 0;
    protected _height = 0;
    protected _minWidth: number | undefined;
    protected _minHeight: number | undefined;
    protected _maxWidth: number | undefined;
    protected _maxHeight: number | undefined;
    protected _anchorLeft: number | undefined;
    protected _anchorRight: number | undefined;
    protected _anchorTop: number | undefined;
    protected _anchorBottom: number | undefined;
    protected _left: number | undefined;
    protected _right: number | undefined;
    protected _top: number | undefined;
    protected _bottom: number | undefined;
    protected _parentWidth = 0;
    protected _parentHeight = 0;
    /** 覆盖缓动播放时的位置 */
    protected _dragPosition: PIXI.Point | undefined;
    /**
     * 上次的宽度（未使用，丢弃）
     */
    protected _oldWidth = -1;
    /**
     * 上次的高度（未使用，丢弃）
     */
    protected _oldHeight = -1;
    /**
    *  在不同分辨率下保持像素稳定 
    * @default
    */
    public pixelPerfect = true;
    /** 
     * 是否拖动中
     * @default
     */
    public dragging = false;
    /** 拖动控制类 */
    public drag: DragEvent | undefined;
    /** 当前拖动组件的事件ID，用于处理DragDropController中多组件的选定 */
    public dragDropEventId: number | undefined;
    /** 
     * 数值或百分比，转换为数值类型
     */
    private getPetValue(value: number | string) {
        let num: number | undefined;
        let pct: number | undefined;
        if (typeof (value) == "number") {
            num = value || 0;
        } else if (typeof (value) == "string" && value != "") {
            if (value.indexOf('%') !== -1) {
                pct = parseFloat(value.replace('%', '')) * 0.01 || undefined;
            } else {
                num = parseInt(value);
            }
        } else {
            pct = undefined;
        }
        return { num, pct };
    }
    /** 获取设置X */
    set x(value: number) {
        this.left = value;
    }
    get x() {
        return this.setting.left as number;
    }
    /** 获取设置Y */
    set y(value: number) {
        this.top = value;
    }
    get y() {
        return this.setting.top as number;
    }
    /**
     * 设置宽度，数字或百分比
     */
    set width(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.width = item.num;
        } else {
            this.setting.widthPct = item.pct;
        }
        this.updatesettings(true);
    }
    get width() {
        return this.setting.width;
    }
    /** 
     * 立即获取渲染的实际宽度
     */
    protected get actual_width() {
        if (this.dirty) {
            if (this.setting.widthPct && this.parent) {
                this._width = this.parent._width * this.setting.widthPct;
            }
            else {
                this._width = this.setting.width;
            }
        }
        return this._width;
    }
    /**
     * 设置宽度，数字或百分比
     */
    set height(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.height = item.num;
        } else {
            this.setting.heightPct = item.pct;
        }
        this.updatesettings(true);
    }
    get height() {
        return this.setting.height;
    }
    /** 
     * 立即获取渲染的实际高度
     */
    protected get actual_height() {
        if (this.dirty) {
            if (this.setting.heightPct && this.parent) {
                this._height = this.parent._height * this.setting.heightPct;
            }
            else {
                this._height = this.setting.height;
            }
        }
        return this._height;
    }
    /**
     * 设置最小宽度，数字或百分比
     */
    set minWidth(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.minWidth = item.num;
        } else {
            this.setting.minWidthPct = item.pct;
        }
        this.updatesettings(true);
    }
    get minWidth() {
        return this.setting.minWidth;
    }
    /** 
     * 立即获取渲染的实际最小宽度
     */
    protected get actual_minWidth() {
        if (this.dirty) {
            if (this.setting.minWidthPct && this.parent) {
                this._minWidth = this.parent._width * this.setting.minWidthPct;
            }
            else {
                this._minWidth = this.setting.minWidth;
            }
        }
        return this._minWidth;
    }
    /**
     * 设置最小高度，数字或百分比
     */
    set minHeight(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.minHeight = item.num;
        } else {
            this.setting.minHeightPct = item.pct;
        }
        this.updatesettings(true);
    }
    get minHeight() {
        return this.setting.minHeight;
    }
    /** 
     * 立即获取渲染的实际最小高度
     */
    protected get actual_minHeight() {
        if (this.dirty) {
            if (this.setting.minHeightPct && this.parent) {
                this._minHeight = this.parent._height * this.setting.minHeightPct;
            }
            else {
                this._minHeight = this.setting.minHeight;
            }
        }
        return this._minHeight;
    }
    /**
     * 设置最大宽度，数字或百分比
     */
    set maxWidth(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.maxWidth = item.num;
        } else {
            this.setting.maxWidthPct = item.pct;
        }
        this.updatesettings(true);
    }
    get maxWidth() {
        return this.setting.maxWidth;
    }
    /** 
     * 立即获取渲染的实际最小高度
     */
    protected get actual_maxWidth() {
        if (this.dirty) {
            if (this.setting.maxWidthPct && this.parent) {
                this._maxWidth = this.parent._width * this.setting.maxWidthPct;
            }
            else {
                this._maxWidth = this.setting.maxWidth;
            }
        }
        return this._maxWidth;
    }
    /**
     * 设置最大高度，数字或百分比
     */
    set maxHeight(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.maxHeight = item.num;
        } else {
            this.setting.maxHeightPct = item.pct;
        }
        this.updatesettings(true);
    }
    get maxHeight() {
        return this.setting.maxHeight;
    }
    /** 
     * 立即获取渲染的实际最小高度
     */
    protected get actual_maxHeight() {
        if (this.dirty) {
            if (this.setting.maxHeightPct && this.parent) {
                this._maxHeight = this.parent._height * this.setting.maxHeightPct;
            }
            else {
                this._maxHeight = this.setting.maxHeight;
            }
        }
        return this._maxHeight;
    }
    /**
     * 设置锚点距左边距离，数字或百分比
     */
    set anchorLeft(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.anchorLeft = item.num;
        } else {
            this.setting.anchorLeftPct = item.pct;
        }
        this.updatesettings(true);
    }
    get anchorLeft() {
        return this.setting.anchorLeft;
    }
    /** 
     * 立即获取渲染的实际锚点左边距离
     */
    protected get actual_anchorLeft() {
        if (this.dirty) {
            if (this.setting.anchorLeftPct && this.parent) {
                this._anchorLeft = this.parent._width * this.setting.anchorLeftPct;
            }
            else {
                this._anchorLeft = this.setting.anchorLeft;
            }
        }
        return this._anchorLeft;
    }
    /**
     * 获取设置锚点右边距离，数字或百分比
     */
    set anchorRight(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.anchorRight = item.num;
        } else {
            this.setting.anchorRightPct = item.pct;
        }
        this.updatesettings(true);
    }
    get anchorRight() {
        return this.setting.anchorRight;
    }
    /** 
     * 立即获取渲染的实际锚点右边距离
     */
    protected get actual_anchorRight() {
        if (this.dirty) {
            if (this.setting.anchorRightPct && this.parent) {
                this._anchorRight = this.parent._width * this.setting.anchorRightPct;
            }
            else {
                this._anchorRight = this.setting.anchorRight;
            }
        }
        return this._anchorRight;
    }
    /**
     * 获取或设置锚点距离顶部距离，数字或百分比
     */
    set anchorTop(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.anchorTop = item.num;
        } else {
            this.setting.anchorTopPct = item.pct;
        }
        this.updatesettings(true);
    }
    get anchorTop() {
        return this.setting.anchorTop;
    }
    /** 
     * 立即获取渲染的实际锚点顶部距离
     */
    protected get actual_anchorTop() {
        if (this.dirty) {
            if (this.setting.anchorTopPct && this.parent) {
                this._anchorTop = this.parent._height * this.setting.anchorTopPct;
            }
            else {
                this._anchorTop = this.setting.anchorTop;
            }
        }
        return this._anchorTop;
    }
    /**
     * 获取或设置锚点距离底部距离，数字或百分比
     */
    set anchorBottom(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.anchorBottom = item.num;
        } else {
            this.setting.anchorBottomPct = item.pct;
        }
        this.updatesettings(true);
    }
    get anchorBottom() {
        return this.setting.anchorBottom;
    }
    /** 
     * 立即获取渲染的实际锚点底部距离
     */
    protected get actual_anchorBottom() {
        if (this.dirty) {
            if (this.setting.anchorBottomPct && this.parent) {
                this._anchorBottom = this.parent._height * this.setting.anchorBottomPct;
            }
            else {
                this._anchorBottom = this.setting.anchorBottom;
            }
        }
        return this._anchorBottom;
    }

    /** 获取或设置距离左边的距离 */
    set left(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.left = item.num;
        } else {
            this.setting.leftPct = item.pct;
        }
        this.updatesettings(true);
    }
    get left() {
        return this.setting.left;
    }
    /** 
     * 立即获取渲染的实际左部距离
     */
    protected get actual_left() {
        if (this.dirty) {
            if (this.setting.leftPct && this.parent) {
                this._left = this.parent._width * this.setting.leftPct;
            }
            else {
                this._left = this.setting.left;
            }
        }
        return this._left;
    }
    /** 获取或设置距离右边的距离 */
    set right(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.right = item.num;
        } else {
            this.setting.rightPct = item.pct;
        }
        this.updatesettings(true);
    }
    get right() {
        return this.setting.right;
    }
    /** 
     * 立即获取渲染的实际右部距离
     */
    protected get actual_right() {
        if (this.dirty) {
            if (this.setting.rightPct && this.parent) {
                this._right = this.parent.width * this.setting.rightPct;
            }
            else {
                this._right = this.setting.right;
            }
        }
        return this._right;
    }
    /**
     * 获取设置距离顶部距离
     */
    set top(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.top = item.num;
        } else {
            this.setting.topPct = item.pct;
        }
        this.updatesettings(true);
    }
    get top() {
        return this.setting.left;
    }
    /** 
     * 立即获取渲染的实际顶部距离
     */
    protected get actual_top() {
        if (this.dirty) {
            if (this.setting.topPct && this.parent) {
                this._top = this.parent._height * this.setting.topPct;
            }
            else {
                this._top = this.setting.top;
            }
        }
        return this._top;
    }
    /**
     * 获取或设置距离底部距离
     */
    set bottom(value: any) {
        const item = this.getPetValue(value);
        if (item.num) {
            this.setting.bottom = item.num;
        } else {
            this.setting.bottomPct = item.pct;
        }
        this.updatesettings(true);
    }
    get bottom() {
        return this.setting.bottom;
    }
    /** 
     * 立即获取渲染的实际顶部距离
     */
    protected get actual_bottom() {
        if (this.dirty) {
            if (this.setting.bottomPct && this.parent) {
                this._bottom = this.parent.height * this.setting.bottomPct;
            }
            else {
                this._bottom = this.setting.bottom;
            }
        }
        return this._bottom;
    }
    /**
     * 垂直布局
     */
    set verticalAlign(value: number | undefined) {
        this.setting.verticalAlign = value;
        this.baseupdate();
    }
    get verticalAlign() {
        return this.setting.verticalAlign;
    }
    /**
     * 垂直布局 verticalAlign简写
     */
    set valign(value: number | undefined) {
        this.setting.verticalAlign = value;
        this.baseupdate();
    }
    get valign() {
        return this.setting.verticalAlign;
    }
    /**
     * 水平布局
     */
    set horizontalAlign(value: number | undefined) {
        this.setting.horizontalAlign = value;
        this.baseupdate();
    }
    get horizontalAlign() {
        return this.setting.horizontalAlign;
    }
    /**
     * 水平布局 horizontalAlign 简写
     */
    set align(value: number | undefined) {
        this.setting.horizontalAlign = value;
        this.baseupdate();
    }
    get align() {
        return this.setting.horizontalAlign;
    }
    /**
     * 显示对象填充色
     */
    set tint(value: number) {
        this.setting.tint = value;
        this.update();
    }
    get tint() {
        return this.setting.tint || 0;
    }
    /**
     * 获取设置透明度
     */
    set alpha(value: number) {
        this.setting.alpha = value;
        this.container.alpha = value;
    }
    get alpha() {
        return this.setting.alpha;
    }
    /**
     * 获取设置旋转
     */
    set rotation(value: number) {
        this.setting.rotation = value;
        this.container.rotation = value;
    }
    get rotation() {
        return this.setting.rotation || 0;
    }
    /**
     * 设置混合模式参考，PIXI.BLEND_MODES
     */
    set 获取blendMode(value: number) {
        this.setting.blendMode = value;
        this.update();
    }
    get blendMode() {
        return this.setting.blendMode || NaN;
    }
    /**
     * 获取设置锚点Y的像素
     */
    set pivotX(value: number) {
        this.setting.pivotX = value;
        this.baseupdate();
        this.update();
    }
    get pivotX() {
        return this.setting.pivotX;
    }
    /**
     * 获取设置锚点Y的像素
     */
    set pivotY(value: number) {
        this.setting.pivotY = value;
        this.baseupdate();
        this.update();
    }
    get pivotY() {
        return this.setting.pivotY;
    }
    /**
     * 锚点的像素表示法,便捷的方法，避免单独设置
     */
    set pivot(value: number) {
        this.setting.pivotX = value;
        this.setting.pivotY = value;
        this.baseupdate();
        this.update();
    }
    /**
     * 设置X轴缩放
     */
    set scaleX(value: number) {
        this.setting.scaleX = value;
        this.container.scale.x = value;
        this.baseupdate();
    }
    get scaleX() {
        return this.setting.scaleX;
    }
    /**
     * 设置Y轴缩放
     */
    set scaleY(value: number) {
        this.setting.scaleY = value;
        this.container.scale.y = value;
    }
    get scaleY() {
        return this.setting.scaleY;
    }
    /**
     * 进行统一缩放，当单独设置过scaleX、scaleY后，调用scale取值为scaleX
     */
    set scale(value: number) {
        this.setting.scaleX = value;
        this.setting.scaleY = value;
        this.container.scale.x = value;
        this.container.scale.y = value;
    }
    get scale() {
        return this.setting.scaleX;
    }
    /**
     * 是否开启拖动
     * @default false
     */
    set draggable(value: boolean) {
        this.setting.draggable = value;
        if (this.initialized) {
            if (value)
                this.initDraggable();
            else
                this.clearDraggable();
        }
    }
    get draggable() {
        return this.setting.draggable;
    }
    /**
     * 是否开启限制拖动范围
     */
    set dragRestricted(value: boolean) {
        this.setting.dragRestricted = value;
    }
    get dragRestricted() {
        return this.setting.dragRestricted;
    }
    /**
     * 限制拖动抽X抽或Y抽，需要开启dragRestricted
     */
    set dragRestrictAxis(value: "x" | "y" | undefined) {
        this.setting.dragRestrictAxis = value;
    }
    get dragRestrictAxis() {
        return this.setting.dragRestrictAxis;
    }
    /**
     * 拖动限制门槛,小于设置的数不执行拖动
     */
    set dragThreshold(value: number) {
        this.setting.dragThreshold = value;
    }
    get dragThreshold() {
        return this.setting.dragThreshold;
    }
    /**
     * 拖动分组
     */
    set dragGroup(value: string | undefined) {
        this.setting.dragGroup = value;
    }
    get dragGroup() {
        return this.setting.dragGroup;
    }
    /**
     * 拖动的容器
     */
    set dragContainer(value: PIXI.Container | UIBase | undefined) {
        this.setting.dragContainer = value;
    }
    get dragContainer() {
        return this.setting.dragContainer;
    }
    /**
     * 是否开拖动掉落
     */
    set droppable(value: boolean | undefined) {
        this.setting.droppable = true;
        if (this.initialized) {
            if (value)
                this.initDroppable();
            else
                this.clearDroppable();
        }
    }
    get droppable() {
        return this.setting.droppable;
    }
    /**
     * 接收掉落的新容器
     */
    set droppableReparent(value: UIBase | undefined) {
        this.setting.droppableReparent = value;
    }
    get droppableReparent() {
        return this.setting.droppableReparent;
    }
    /**
     * 接收拖动掉落的分组名
     */
    set dropGroup(value: string | undefined) {
        this.setting.dropGroup = value;
    }
    get dropGroup() {
        return this.setting.dropGroup;
    }
    /**
     * 是否绘制显示对象，如果false不进行绘制，不过仍然会进行相关的更新计算。
     * 只影响父级的递归调用。
     */
    set renderable(value: boolean) {
        this.container.renderable = value;
    }
    get renderable() {
        return this.container.renderable;
    }
    /**
     * 显示对象是否可见
     */
    set visible(value: boolean) {
        this.container.visible = value;
    }
    get visible() {
        return this.container.visible;
    }
    /**
     * 缓存当前的显示对象，如果移除缓存，设置false即可
     * 在设置这个值时，请确保你的纹理位图已经加载
     */
    set cacheAsBitmap(value: boolean) {
        this.container.cacheAsBitmap = value;
    }
    get cacheAsBitmap() {
        return this.container.cacheAsBitmap;
    }
    /**
     * 对象是否可以接收事件
     */
    set interactive(value: boolean) {
        this.container.interactive = value;
    }
    get interactive() {
        return this.container.interactive;
    }
    /**
     * 子对象是否可以接收事件，设置false后，会绕过HitTest方法的递归
     */
    set interactiveChildren(value: boolean) {
        this.container.interactiveChildren = value;
    }
    get interactiveChildren() {
        return this.container.interactiveChildren;
    }
    /**
     * 绘制渲染对象
     * @param updateChildren 是否渲染子节点，true渲染
     * @param updateParent  是否渲染父容器，true渲染
     */
    public updatesettings(updateChildren: boolean, updateParent?: boolean) {
        if (!this.initialized) {
            if (this.parent == null) {
                return;
            }
            if (this.parent.stage !== null && this.parent.initialized) {
                this.initialize();
            }
        }

        if (updateParent) this.updateParent();
        this.baseupdate();
        this.update();
        if (updateChildren) this.updateChildren();
    }
    /**
     * 更新方法，其他组件重写
     */
    public update() {

    }
    /**
     * 渲染父容器
     */
    public updateParent() {
        if (this.parent && this.parent.updatesettings) {
            this.parent.updatesettings(false, true);
        }
    }
    /** 
     * 更新渲染设置属性
     */
    public baseupdate() {
        if (!this.parent) {
            return;
        }
        let parentHeight: number, parentWidth: number;
        //transform convertion (% etc)
        this.dirty = true;
        this._width = this.actual_width;
        this._height = this.actual_height;
        this._minWidth = this.actual_minWidth;
        this._minHeight = this.actual_minHeight;
        this._maxWidth = this.actual_maxWidth;
        this._maxHeight = this.actual_maxHeight;
        this._anchorLeft = this.actual_anchorLeft;
        this._anchorRight = this.actual_anchorRight;
        this._anchorTop = this.actual_anchorTop;
        this._anchorBottom = this.actual_anchorBottom;
        this._left = this.actual_left;
        this._right = this.actual_right;
        this._top = this.actual_top;
        this._bottom = this.actual_bottom;
        this._parentWidth = parentWidth = this.parent._width;
        this._parentHeight = parentHeight = this.parent._height;
        this.dirty = false;

        let pivotXOffset = this.pivotX * this._width;
        let pivotYOffset = this.pivotY * this._height;

        if (this.pixelPerfect) {
            pivotXOffset = Math.round(pivotXOffset);
            pivotYOffset = Math.round(pivotYOffset);
        }

        if (this.horizontalAlign === undefined) {

            //get anchors (use left right if conflict)
            if (this._anchorLeft !== undefined && this._anchorRight === undefined && this._right !== undefined)
                this._anchorRight = this._right;
            else if (this._anchorLeft === undefined && this._anchorRight !== undefined && this._left !== undefined)
                this._anchorLeft = this._left;
            else if (this._anchorLeft === undefined && this._anchorRight === undefined && this._left !== undefined && this._right !== undefined) {
                this._anchorLeft = this._left;
                this._anchorRight = this._right;
            }

            const useHorizontalAnchor = this._anchorLeft !== undefined || this._anchorRight !== undefined;
            const useLeftRight = !useHorizontalAnchor && (this._left !== undefined || this._right !== undefined);

            if (useLeftRight) {
                if (this._left !== undefined)
                    this.container.position.x = this._left;
                else if (this._right !== undefined)
                    this.container.position.x = parentWidth - this._right;
            }
            else if (useHorizontalAnchor) {
                if (this._anchorLeft !== undefined && this._anchorRight === undefined)
                    this.container.position.x = this._anchorLeft;
                else if (this._anchorLeft === undefined && this._anchorRight !== undefined)
                    this.container.position.x = parentWidth - this._width - this._anchorRight;
                else if (this._anchorLeft !== undefined && this._anchorRight !== undefined) {
                    this.container.position.x = this._anchorLeft;
                    this._width = parentWidth - this._anchorLeft - this._anchorRight;
                }
                this.container.position.x += pivotXOffset;
            }
            else {
                this.container.position.x = 0;
            }
        }


        if (this.verticalAlign === undefined) {
            //get anchors (use top bottom if conflict)
            if (this._anchorTop !== undefined && this._anchorBottom === undefined && this._bottom !== undefined)
                this._anchorBottom = this._bottom;
            if (this._anchorTop === undefined && this._anchorBottom !== undefined && this._top !== undefined)
                this._anchorTop = this._top;

            const useVerticalAnchor = this._anchorTop !== undefined || this._anchorBottom !== undefined;
            const useTopBottom = !useVerticalAnchor && (this._top !== undefined || this._bottom !== undefined);

            if (useTopBottom) {
                if (this._top !== undefined)
                    this.container.position.y = this._top;
                else if (this._bottom !== undefined)
                    this.container.position.y = parentHeight - this._bottom;
            }
            else if (useVerticalAnchor) {
                if (this._anchorTop !== undefined && this._anchorBottom === undefined)
                    this.container.position.y = this._anchorTop;
                else if (this._anchorTop === undefined && this._anchorBottom !== undefined)
                    this.container.position.y = parentHeight - this._height - this._anchorBottom;
                else if (this._anchorTop !== undefined && this._anchorBottom !== undefined) {
                    this.container.position.y = this._anchorTop;
                    this._height = parentHeight - this._anchorTop - this._anchorBottom;
                }
                this.container.position.y += pivotYOffset;
            }
            else {
                this.container.position.y = 0;
            }
        }

        //min/max sizes
        if (this._maxWidth !== undefined && this._width > this._maxWidth) this._width = this._maxWidth;
        if (this._minWidth !== undefined && this._width < this._minWidth) this._width = this._minWidth;

        if (this._maxHeight !== undefined && this._height > this._maxHeight) this._height = this._maxHeight;
        if (this._minHeight !== undefined && this._height < this._minHeight) this._height = this._minHeight;


        //pure vertical/horizontal align
        if (this.horizontalAlign !== undefined) {
            if (this.horizontalAlign == HorizontalAlignEnum.center)
                this.container.position.x = parentWidth * 0.5 - this._width * 0.5;
            else if (this.horizontalAlign == HorizontalAlignEnum.right)
                this.container.position.x = parentWidth - this._width;
            else
                this.container.position.x = 0;
            this.container.position.x += pivotXOffset;
        }
        if (this.verticalAlign !== undefined) {
            if (this.verticalAlign == VerticalAlignEnum.middle)
                this.container.position.y = parentHeight * 0.5 - this._height * 0.5;
            else if (this.verticalAlign == VerticalAlignEnum.bottom)
                this.container.position.y = parentHeight - this._height;
            else
                this.container.position.y = 0;
            this.container.position.y += pivotYOffset;
        }

        //Unrestricted dragging
        if (this.dragging && !this.setting.dragRestricted && this._dragPosition) {
            this.container.position.x = this._dragPosition.x;
            this.container.position.y = this._dragPosition.y;
        }

        //scale
        this.container.scale.x = this.setting.scaleX;
        this.container.scale.y = this.setting.scaleY;

        //pivot
        this.container.pivot.x = pivotXOffset;
        this.container.pivot.y = pivotYOffset;

        this.container.alpha = this.setting.alpha;
        if (this.setting.rotation !== undefined) this.container.rotation = this.setting.rotation;

        //make pixel perfect
        if (this.pixelPerfect) {
            this._width = Math.round(this._width);
            this._height = Math.round(this._height);
            this.container.position.x = Math.round(this.container.position.x);
            this.container.position.y = Math.round(this.container.position.y);
        }

    }
    /** 
     * 更新所有子节点
     */
    public updateChildren() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].updatesettings(true);
        }
    }
    /**
     * 添加UI元件，可以同时添加多个如addChild(a,b,c,d)
     * @param UIObject 要添加的UI组件
     */
    public addChild(UIObject: UIBase) {
        const argumentsLength = arguments.length;
        if (argumentsLength > 1) {
            for (let i = 0; i < argumentsLength; i++) {
                this.addChild(arguments[i]);
            }
        }
        else {
            if (UIObject.parent) {
                UIObject.parent.removeChild(UIObject);
            }

            UIObject.parent = this;
            this.container.addChild(UIObject.container);
            this.children.push(UIObject);
            this.updatesettings(true, true);
        }

        return UIObject;
    }
    /**
     * 移除已添加的UI组件，可以同时移除多个如addChild(a,b,c,d)
     * @param UIObject 要移除的UI组件
     */
    public removeChild(UIObject: UIBase) {
        const argumentLenght = arguments.length;
        if (argumentLenght > 1) {
            for (let i = 0; i < argumentLenght; i++) {
                this.removeChild(arguments[i]);
            }
        }
        else {
            const index = this.children.indexOf(UIObject);
            if (index !== -1) {
                const oldUIParent = UIObject.parent;
                //var oldParent = UIObject.container.parent;
                UIObject.container.parent.removeChild(UIObject.container);
                this.children.splice(index, 1);
                UIObject.parent = undefined;

                //oldParent._recursivePostUpdateTransform();
                setTimeout(() => { //hack but cant get the transforms to update propertly otherwice?
                    if (oldUIParent && oldUIParent.updatesettings)
                        oldUIParent.updatesettings(true, true);
                }, 0);
            }
        }
    }
    /**
     * Initializes the object when its added to an UIStage
     * 将对象添加到UIStage时，进行的初始化方法
     */
    protected initialize() {
        this.initialized = true;
        this.stage = this.parent && this.parent.stage;
        if (this.draggable) {
            this.initDraggable();
        }

        if (this.droppable) {
            this.initDroppable();
        }
    }

    protected clearDraggable() {
        if (this.dragInitialized) {
            this.dragInitialized = false;
            this.drag && this.drag.stopEvent();
        }
    }

    protected initDraggable() {
        if (!this.dragInitialized) {
            this.dragInitialized = true;
            const containerStart = new PIXI.Point(),
                stageOffset = new PIXI.Point();
            //self = this;

            this._dragPosition = new PIXI.Point();
            this.drag = new DragEvent(this);
            this.drag.onDragStart = (e: interaction.InteractionEvent) => {
                const added = DragDropController.add(this, e);
                if (!this.dragging && added) {
                    this.dragging = true;
                    this.container.interactive = false;
                    containerStart.copyFrom(this.container.position);
                    if (this.dragContainer) {
                        let c: PIXI.Container | undefined;
                        if (this.dragContainer instanceof UIBase) {
                            c = this.dragContainer.container;
                        } else if (this.dragContainer instanceof PIXI.Container) {
                            c = this.dragContainer;
                        }
                        if (c && this.parent) {
                            //_this.container._recursivePostUpdateTransform();
                            stageOffset.set(c.worldTransform.tx - this.parent.container.worldTransform.tx, c.worldTransform.ty - this.parent.container.worldTransform.ty);
                            c.addChild(this.container);
                        }
                    } else {
                        stageOffset.set(0);
                    }
                    this.emit(DraggableEventEnum.draggablestart, e);
                }
            };


            this.drag.onDragMove = (e: interaction.InteractionEvent, offset) => {
                if (this.dragging && this._dragPosition) {
                    this._dragPosition.set(containerStart.x + offset.x - stageOffset.x, containerStart.y + offset.y - stageOffset.y);
                    this.x = this._dragPosition.x;
                    this.y = this._dragPosition.y;
                    this.emit(DraggableEventEnum.draggablemove, e);
                }

            };

            this.drag.onDragEnd = (e: interaction.InteractionEvent) => {
                if (this.dragging) {
                    this.dragging = false;
                    //Return to container after 0ms if not picked up by a droppable
                    setTimeout(() => {

                        this.container.interactive = true;
                        const item = DragDropController.getItem(this);
                        if (item && this.parent) {
                            let container: PIXI.Container | Stage | undefined;
                            if (this.parent instanceof Stage) {
                                container = this.stage;
                            } else {
                                container = this.parent.container;
                            }
                            if (container)
                                container.toLocal(this.container.position, this.container.parent);
                            if (container != this.container) {
                                this.parent.addChild(this);
                            }
                        }
                        this.emit(DraggableEventEnum.draggableend, e);
                    }, 0);
                }

            };
        }
    }

    protected clearDroppable() {
        if (this.dropInitialized) {
            this.dropInitialized = false;
            this.container.removeListener(TouchEventEnum.mouseup, this.onDrop, this);
            this.container.removeListener(TouchEventEnum.touchend, this.onDrop, this);
        }
    }

    protected initDroppable() {
        if (!this.dropInitialized) {
            this.dropInitialized = true;
            const container = this.container;
            //self = this;
            this.container.interactive = true;
            container.on(TouchEventEnum.mouseup, this.onDrop, this);
            container.on(TouchEventEnum.touchend, this.onDrop, this);
        }
    }

    private onDrop(e: interaction.InteractionEvent) {
        const item = DragDropController.getEventItem(e, this.dropGroup);
        if (item && item.dragging) {
            item.dragging = false;
            item.container.interactive = true;
            const parent = this.droppableReparent !== undefined ? this.droppableReparent : this;
            if (parent) {
                parent.container.toLocal(item.container.position, item.container.parent);
                if (parent.container != item.container.parent)
                    parent.addChild(item);
            }
        }
    }


}