import { defineStore } from 'pinia'

export const useAudioStore = defineStore('audio', {
    state: () => ({
        audio: null, // 上传或选择的音频文件
        recordAudio: null, // 录制的音频文件
        bgMusic: null, // 背景音乐文件
        text: null, // 文本内容
        language: null, // 语言
        speed: 1, // 语速
        sampleAudioItems: [], // 示例音频列表
        audioUrls: [], // 音频列表url
        rawAudio: null, // 原始音频文件
        rawRecordAudio: null, // 原始录制音频文件
        rawBgMusic: null, // 原始背景音乐文件
        characterList: [], // 角色列表
        selectCharacter: null, // 选择的角色
        selectCharacterIndex: 0, // 选择的角色索引
        isCloseAudioList: false, // 是否关闭音频列表
    }),
    actions: {
        cloneFile(file) {
            const clone = new File([file], file.name, { 
                type: file.type,
                lastModified: file.lastModified,
                size: file.size
            });
            return clone;
        }
    },
    getters: {

    }
})