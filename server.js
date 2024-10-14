const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/split', upload.single('video'), (req, res) => {
    const videoPath = req.file.path;
    const cutDuration = parseInt(req.body.cutDuration) || 5; // مدة القطع
    const nonCutDuration = parseInt(req.body.nonCutDuration) || 5; // مدة عدم القطع

    // مسار ملف الإخراج
    const outputFilePath = `output/output.mp4`;

    // إعداد ffmpeg لتقطيع الفيديو
    ffmpeg(videoPath)
        .outputOptions([
            `-vf "select='not(mod(n\,${cutDuration + nonCutDuration}))',setpts=N/FRAME_RATE/TB"`,
            `-ss 0`,
            `-t ${cutDuration + nonCutDuration}`
        ])
        .save(outputFilePath)
        .on('end', () => {
            res.download(outputFilePath, 'split_video.mp4', (err) => {
                if (err) {
                    console.error(err);
                }
            });
        })
        .on('error', (err) => {
            console.error(err);
            res.status(500).send('Error processing video');
        });
});

// بدء السيرفر
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});