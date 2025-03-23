import axios from "axios";
import { Client } from "@gradio/client";
import Hls from "hls.js";

// 获取音频信息
export const getAudiosInfo = async () => {
  const response = await axios.get("/api/getAudiosInfo");
  const data = response.data;
  console.log("getAudiosInfo data: ", data);

  // 使用 Promise.all 提高并行请求速度
  await Promise.all(
    data.map(async (item) => {
      const [imgResponse] = await Promise.all([getAudioOrImg(item.imgPath)]);

      item.imgUrl = URL.createObjectURL(imgResponse);
    })
  );

  return data;
};

// 获取音频文件
export const getAudioOrImg = async (filepath) => {
  const response = await axios.get(`/api/getAudioOrImg/${filepath}`, {
    responseType: "blob",
  });
  // console.log(response);

  return response.data;
};

// 上传ppt文件，并获取ppt文件的第一张ppt图片
export const uploadPPT = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post("/api/uploadPPT", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });
  console.log("uploadPPT response: ", response);

  return response.data;
};

// 语音识别
export const recognizeAudioContent = async (audio) => {
  const formData = new FormData();
  formData.append("audio", audio);
  const response = await axios.post("/api/recognizeAudioContent", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log("recognizeAudioContent response: ", response);

  return response.data;
};

// 语音克隆
export const getCloneAudio = async (audio, tts_text, prompt_text) => {
  let audioBlob;
  if (audio instanceof Blob) audioBlob = audio;
  else if (audio instanceof File)
    audioBlob = new Blob([audio], { type: audio.type });

  console.log("audioBlob", audioBlob);
  console.log("audio instanceof Blob", audio instanceof Blob);

  // cosyvoice2
  const client = await Client.connect("http://localhost:50000/");
  const result = await client.predict('/generate_audio', {
    tts_text: tts_text,
  	mode_checkbox_group: "3s极速复刻",
  	prompt_text: prompt_text,
  	prompt_wav_upload: audioBlob,
  	prompt_wav_record: audioBlob,
  	instruct_text: "",
  	seed: 3,
  	stream: false,
  })

  // f5tts
//   const client = await Client.connect("http://127.0.0.1:50003/");
//   const result = await client.predict("/basic_tts", {
//     ref_audio_input: exampleAudio,
//     ref_text_input: "Hello!!",
//     gen_text_input: "Hello!!",
//     remove_silence: true,
//     cross_fade_duration_slider: 0,
//     nfe_slider: 4,
//     speed_slider: 0.3,
//   });

  console.log("result.data", result.data);
  return result.data;
};

export const changeAudioFormat = async (blob) => {
  const formData = new FormData();
  formData.append("audio", blob);
  const response = await axios.post("/api/changeAudioFormat", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });
  console.log("changeAudioFormat response: ", response);
  return response.data;
};
