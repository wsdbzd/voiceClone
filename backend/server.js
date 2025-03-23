import express from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';

const app = express();
const upload = multer({ dest: 'uploads/' });

// 提供音频识别的 API
app.post('/transcribe', upload.single('audio'), (req, res) => {
    const audioPath = req.file.path;

    // 使用 whisper.cpp 进行音频识别
    exec(`./whisper.cpp/main -m ./whisper.cpp/models/ggml-base.bin -f ${audioPath}`, 
    (error, stdout, stderr) => {
        if (error) {
            console.error(`执行错误: ${error.message}`);
            return res.status(500).json({ error: '音频转录失败' });
        }

        // 提取识别结果
        const result = stdout.split('\n').find(line => line.startsWith('[00:00.000 -->'));
        res.json({ result: result || '未识别出语音内容' });
    });
});

// 启动服务器
app.listen(3000, () => console.log('服务器运行在 http://localhost:3000'));
