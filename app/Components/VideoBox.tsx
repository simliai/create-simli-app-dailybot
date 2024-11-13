
export default function VideoBox(props: any) {
    return (
        <div className="aspect-video flex rounded-sm overflow-hidden items-center h-[350px] w-[350px] justify-center bg-simligray">
            <video ref={props.video} autoPlay playsInline id="simli_video" ></video>
            <audio ref={props.audio} autoPlay id="simli_audio" ></audio>
        </div>
    );
}