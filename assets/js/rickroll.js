class rickroll {
    static async showup() {
        if (!rickroll.showup.only_once && rickroll.playing) {
            return false;
        }

        const video = document.createElement("video");
        video.load();
        video.src = rickroll.video;
        video.style.display = "block";
        video.style.width = "100%";
        video.style.height = "auto";
        video.style.position = "fixed";
        video.style.top = "0";
        video.style.bottom = "0";
        video.style.left = "0";
        video.style.right = "0";
        video.loop = rickroll.showup.loop || true;
        rickroll.playing = true;

        try {
            await video.play();
            document.open();
            document.appendChild(video);
            document.close();

            return true;
        } catch (error) {
            rickroll.playing = false;
            return error;
        }
    }
}

rickroll.video = "assets/img/rickroll.mp4";
rickroll.showup.only_once = true;
rickroll.showup.loop = true;
rickroll.playing = false;  
