"use client";

import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatFileSize = (size) => {
  if (!size) return "0 B";

  if (size < 1024) {
    return size + " B";
  }

  if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + " KB";
  }

  return (size / 1024 / 1024).toFixed(2) + " MB";
};

export default function VoiceRecordDialog({ onClose }) {
  const [second, setSecond] = useState(10);
  const [error, setError] = useState("");

  const [audioUrl, setAudioUrl] = useState("");
  const [isRecording, setIsRecording] = useState(true);
  const [audioSize, setAudioSize] = useState(0);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const isClosedRef = useRef(false);
  const chunksRef = useRef([]);

  const closeDialog = () => {
    if (isClosedRef.current) return;

    isClosedRef.current = true;

    const recorder = recorderRef.current;

    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    let closeTimer = null;
    let countTimer = null;

    const startRecord = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        streamRef.current = stream;

        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = function (e) {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = function () {
          const audioBlob = new Blob(chunksRef.current, {
            type: "audio/webm",
          });

          const url = URL.createObjectURL(audioBlob);

          console.log("录音文件", audioBlob);
          console.log("录音大小 byte", audioBlob.size);
          console.log("录音播放地址", url);

          setAudioUrl(url);
          setAudioSize(audioBlob.size);
          setIsRecording(false);

          // 后面要上传时，可以在这里处理
          // const formData = new FormData();
          // formData.append("file", audioBlob, "voice.webm");
          // await ky.post("/api/voice", { body: formData });
        };

        recorder.start();

        const endAt = Date.now() + 10000;

        countTimer = setInterval(function () {
          const remainMs = endAt - Date.now();
          const remainSecond = Math.max(Math.ceil(remainMs / 1000), 0);

          setSecond(remainSecond);

          if (remainMs <= 0) {
            clearInterval(countTimer);
            // closeDialog();

            const recorder = recorderRef.current;

            if (recorder && recorder.state === "recording") {
              recorder.stop();
            }

            if (streamRef.current) {
              streamRef.current.getTracks().forEach(function (track) {
                track.stop();
              });
            }
          }
        }, 200);

      } catch (err) {
        console.error(err);
        setError("无法使用麦克风，请确认浏览器权限。");
      }
    };

    startRecord();

    return function () {
      clearTimeout(closeTimer);
      clearInterval(countTimer);

      const recorder = recorderRef.current;

      if (recorder && recorder.state === "recording") {
        recorder.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(function (track) {
          track.stop();
        });
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Mic className="h-10 w-10 text-blue-500" />
          </div>

          {/* <div>
            <div className="text-lg font-semibold">
              正在录音
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              {error || second + " 秒后自动结束"}
            </div>
          </div> */}
          <div>
            <div className="text-lg font-semibold">
              {isRecording ? "正在录音" : "录音完成"}
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              {error || (isRecording ? second + " 秒后自动结束" : "可以试听录音")}
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{
                width: (second / 10) * 100 + "%",
              }}
            />
          </div>

          {audioUrl && (
            <>
              <audio
                controls
                src={audioUrl}
                className="w-full"
              />

              {audioSize > 0 && (
                <div className="text-sm text-muted-foreground">
                  上传体积：{formatFileSize(audioSize)}
                </div>
              )}
            </>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={closeDialog}
          >
            手动关闭
          </Button>
        </div>
      </div>
    </div>
  );
}