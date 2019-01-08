const defaultVideoId = 'M7lc1UVf-VE';

let nContainer = null,
  editor = null,
  prevSec = 0,
  prevIndex = -1,
  masterNotes = "",
  player,
  tutorialData = "";

function getQuillPad(notesContainer, quillDiv) {
  let toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction

    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ["clean"] // remove formatting button
  ];
  if (notesContainer) {
    nContainer = new Quill(notesContainer, {
      theme: "bubble",
      placeholder: "No notes for this video..."
    });
    nContainer.enable(false); //Disable user notes
  }

  if (quillDiv) {
    editor = new Quill(quillDiv, {
      modules: {
        toolbar: toolbarOptions
      },
      theme: "snow",
      placeholder: "Edit notes..."
    });
  }
}

function onYouTubePlayer() {
  let videoId = getVideoId();
  if (videoId == defaultVideoId) {
    loadAlert();
  }

  player = new YT.Player("player", {
    height: "360",
    width: "50%",
    videoId: getVideoId(),
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {

  document.getElementById("player").style.borderColor = "black";

}

function onPlayerStateChange(event) {
  let setNotes;

  if (event.data === YT.PlayerState.PLAYING) {
    setNotes = setInterval(function () {
      let current_playtime = player.getCurrentTime();
      let sec = Math.ceil(current_playtime.toFixed(2));
      if (tutorialData && tutorialData.attacherNotes.length > 0) {
        let index = tutorialData.attacherNotes.findIndex((data, index) => {
          return data.vTime <= sec && data.vTime >= prevSec;
        });
        if (index > -1 && index > prevIndex) {
          masterNotes = tutorialData.attacherNotes[index].quillOps;
          nContainer.setContents(masterNotes);
          prevIndex = index;
        }
      }
      prevSec = sec;
    }, 1000);
  } else if (
    event.data === YT.PlayerState.ENDED ||
    event.data === YT.PlayerState.PAUSED
  ) {
    clearInterval(setNotes);
  }

  if (event.data === YT.PlayerState.ENDED) {
    masterNotes = "";
  }
}

function loadAlert() {
  alert('Deafult video loaded!');
}

window.addEventListener(
  "load",
  () => {
    let notesContainer = document.getElementById("notes-container");
    let quillDiv = document.getElementById("quill-div");
    if (typeof YT == "undefined" || typeof YT.Player == "undefined") {
      var tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubePlayerAPIReady = function () {
        onYouTubePlayer();
      };
    } else {
      onYouTubePlayer();
    }

    getQuillPad(notesContainer, quillDiv);

    document.getElementById("edit-notes-btn").addEventListener("click", () => {
      let qc = document.getElementById("quill-container");
      if (qc.style.display === "none") {
        qc.style.display = "block";
        editor.setContents(masterNotes);
      } else {
        qc.style.display = "none";
        editor.setText("");
      }
    });

    editor.on("text-change", function (event) {
      player && player.pauseVideo();
    });

    document.getElementById("save-notes-btn").addEventListener("click", () => {
      let result = confirm("Save the notes in the current play time of video?");
      let attacherNotes = [], index;
      let notesAddedTime = Math.round(player.getCurrentTime());
      if (tutorialData && tutorialData.attacherNotes.length > 0) {
        attacherNotes = tutorialData.attacherNotes;
        index = tutorialData.attacherNotes.findIndex(
          (data) => data.vTime === notesAddedTime
        );
        if (index > -1) {
          attacherNotes[index].quillOps = editor.getContents().ops;
        }
      }
      if (!tutorialData || index == -1) {
        attacherNotes.push({
          vTime: notesAddedTime,
          quillOps: editor.getContents().ops
        });
      }

      attacherNotes.sort((v1, v2) => v1.vTime - v2.vTime);
      tutorialData.attacherNotes = attacherNotes;

      if (result) {
        if (tutorialData._id) {
          axios.post("/api/updateData", {
            email: 'ksumaudupa@gmail.com',
            role: 'author',
            url: getUrl(),
            attacherNotes
          });
        }
        else {
          axios.post("/api/putData", {
            email: 'ksumaudupa@gmail.com',
            role: 'author',
            url: getUrl(),
            attacherNotes
          });
        }

      }
    });

    document.getElementById("url-submit-btn").addEventListener("click", () => {
      let videoId = getVideoId();
      if (videoId == defaultVideoId) {
        loadAlert();
      }
      player.loadVideoById(videoId);
      let url = getUrl();
      if (url) {
        axios.get("/api/getData", { params: { url: url } }).then(res => {
          if (res.data) {
            tutorialData = res.data;
          }
        }
        )
      };
    });

    getVideoId = () => {
      let inputURL = document.getElementById("video-url-input").value;
      inputURL = inputURL.trim();
      let videoId = defaultVideoId;
      if (inputURL && (inputURL.search("youtube.com") > -1)) {
        videoId = inputURL.split('v=')[1];
      }
      return videoId;
    }

    getUrl = () => {
      let inputURL = document.getElementById("video-url-input").value;
      inputURL = inputURL.trim();
      if (!inputURL) {
        return null;
      }
      return inputURL;
    }
  },
  false
);
