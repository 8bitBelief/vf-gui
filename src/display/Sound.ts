import { getSound } from "../utils/Utils";
import { CSSStyle } from "../layout/CSSStyle";
import { SpriteAnimated } from "./SpriteAnimated";
import { GroupController, ComponentEvent } from "../interaction/Index";
import { InputBase } from "./private/InputBase";
export const $sounds = new Map<string,PIXI.sound.Sound>();


/**
 * 音频播放组件
 * 
 * @example let sound = new gui.Sound();
 * 
 * @namespace gui
 * 
 * @link https://vipkid-edu.github.io/vf-gui/play/#example/TestSound
 */
export class Sound extends InputBase {


    public constructor() {
        super();
        const sp = this.spriteAnimated;
        sp.loop = true;
        this.addChild(sp);
        this.container.buttonMode = true;
    }


    protected _sound: PIXI.sound.Sound | undefined;
    protected _mediaInstance: PIXI.sound.IMediaInstance | undefined;

    /**
     * 状态展示
     */
    readonly spriteAnimated = new SpriteAnimated();

    /**
     * 是否自动播放
     * @default false
     */
    private _autoPlay = false;
    public get autoPlay() {
        return this._autoPlay;
    }
    public set autoPlay(value) {
        this._autoPlay = value;
    }

    /**
     * 播放的动画
     */
    private _sheetSkin?: PIXI.Spritesheet;
    public get sheetSkin(){
        return this._sheetSkin;
    }
    public set sheetSkin(value) {
        this._sheetSkin = value;
        this.spriteAnimated.src = value;
    }
 
    public get duration(){
        if( this._sound ){
            return this._sound.duration;
        }
        return 0;
    }

    private _src: number | string | PIXI.sound.Options | ArrayBuffer | HTMLAudioElement | undefined;
    /**
     * 音频源
     */
    public get src() {
        return this._src;
    }
    public set src(src) {
        if(src === this.src){
            return;
        }
        this._src = src;
        this.invalidateProperties();
    }

    /**
     * 动画速度
     */
    public get animationSpeed() {
        return this.spriteAnimated.animationSpeed;
    }
    public set animationSpeed(value) {
        this.spriteAnimated.animationSpeed = value;
    }

    private _speed = 1;
    /**
     * 设置播放速度
     */
    public get speed() {
        return this._speed;
    }
    public set speed(value) {
        this._speed = value;
        if( this._sound ){
            this._sound.speed = value;
        }
    }

    private _volume = 100;
    /**
     * 音量
     * @default 100
     */
    public get volume() {
        return this._volume;
    }
    public set volume(value) {
        this._volume = value;
        if( this._sound ){
            this._sound.volume = value;
        }
    }

    private _loop = false;
    /**
     * 是否循环
     * @default false
     */
    public get loop() {
        return this._loop;
    }
    public set loop(value) {
        this._loop = value;
    }

    protected _curProgress = 0;
    protected _playing = false;
    public get isPlaying(){
        if(this._sound){
            return this._sound.isPlaying;
        }
        return false;
    }

    private _startTime?: number;
    public get startTime() {
        return this._startTime;
    }
    public set startTime(value) {
        this._startTime = value;
    }

    private _endTime?: number;
    public get endTime() {
        return this._endTime;
    }
    public set endTime(value) {
        this._endTime = value;
    }

    public get isPlay() {
        return this.isPlaying;
    }
    public set isPlay(value) {
        if(this._sound == undefined){
            console.warn("curent sound initialization not complete;");
            return;
        }
        if(value){
            this.play();
        }else{
            this.stop();
        }
    }

    protected commitProperties() {
        this.releaseSound();
        if(this.src){
            const sound = this._sound = getSound(this.src);
            sound.volume = this.volume;
            sound.speed = this.speed;
            if(this.autoPlay){
                this.play();
            }else{
                this.stop();
            }
            this.container.hitArea = new PIXI.Rectangle(0, 0, this.width/this.scaleX, this.height/this.scaleY);
        }
    }

    public async play(start = 0,end?: number){
        if(this.startTime){
            start = this.startTime;
        }
        if(this.endTime){
            end = this.endTime;
        }
        if(this._sound && this._sound.isPlaying){
            return;
        }
        const uiObjects = GroupController.getGroup(this.groupName);
        if(uiObjects){
            for(const key in uiObjects){
                if(uiObjects[key] instanceof Sound){
                    (uiObjects[key] as Sound).stop();
                }
                
            }
        }
        if(this._mediaInstance){
            this._mediaInstance.off('progress',this.onProgress,this);
            this._mediaInstance.off('end',this.onEnd,this);
        }
        if(this._sound){
            
            const sound = this._mediaInstance = await this._sound.play( {
                start: start,
                end: end
            });

            sound.on('progress',this.onProgress,this);
            sound.on('end',this.onEnd,this);
        }
        
        this._playing = true;
        if(this._sheetSkin){
            this.spriteAnimated.animationName = "play";
            this.spriteAnimated.play();
        }
    }

    public stop(){
        if(this._sound){
            this._sound.stop();
        }
        this._playing = false;
        if(this._sheetSkin){
            this.spriteAnimated.animationName = "stop";
            this.spriteAnimated.stop();
        }
    }

    /**
     * 恢复播放
     */
    public resume(){
        this.play(this._curProgress);
    }

    /**
     * 暂停播放
     */
    public pause(){
        if(this._mediaInstance &&  this._sound){
            this._curProgress = this._mediaInstance.progress * this._sound.duration;
        }
        this.stop();
    }

    public release() {
        super.release();
        this.releaseSound();
        this.offAll();
        this.spriteAnimated.release();
    }

    private releaseSound() {
        if(this._mediaInstance){
            this._mediaInstance.off('progress',this.onProgress,this);
            this._mediaInstance.off('end',this.onEnd,this);
        }
        if (this._sound) {  
            this._sound.stop();
            this._sound.destroy();
            this._sound = undefined;
        }
    }

    private onProgress(progress: number, duration: number) {
        this._curProgress = progress*duration;
        if(this.listenerCount(ComponentEvent.CHANGEING)>0){
            this.emit(ComponentEvent.CHANGEING,this,this._curProgress);
        }
    }
    private onEnd() {
        if(this.loop){
            this.play();
            this.emit(ComponentEvent.LOOP,this);
        }else{
            this.stop();
            this.emit(ComponentEvent.COMPLETE,this);
        }
    }

    protected onClick(){
        if(this.isPlaying){
            this.stop();
        }else{
            this.play();
        }
    }

}