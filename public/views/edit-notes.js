let notesContainer = null;
let quillDiv = null;
let nContainer = null;
let editor = null;
let prevSec = 0,
  prevIndex = -1,
  masterNotes = "",
  player, 
  current_playtime,
  tutorialData = "";

function getQuillPad(notesContainer, quillDiv){
  let toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
  
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
  
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
  
    ['clean']                                         // remove formatting button
  ];
  if(notesContainer){
    nContainer = new Quill(notesContainer, {
      theme: "bubble",
      placeholder: "No notes for this video..."
    });
    nContainer.enable(false); //Disable user notes
  }  

  if(quillDiv){
    editor = new Quill(quillDiv, {
      modules: {
        toolbar: toolbarOptions
      },
      theme: "snow",
      placeholder: "Edit notes..."
    });

    editor.on("text-change", function(event) {
      player.pauseVideo();
      let addedTxt = editor.getContents().ops;
      console.log(player.getCurrentTime());
    });
  }
}



function onYouTubeIframeAPIReady() {
  player = new YT.Player("existing-iframe-example", {
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  document.getElementById("existing-iframe-example").style.borderColor =
    "black";
  current_playtime = player.getCurrentTime();
  let id = '5c284dc11a9ac882856c63c8';
  axios.get(`/api/getData/?id=${id}`)
          .then(res => {
                  console.log(res);
                  if(res.data){
                    tutorialData = res.data.data[0];
                  }
                });
  
}

function onPlayerStateChange(event) {
  let setNotes;
  /*
  let tutorialData = {
    ops: [
      { time: 5, insert: "First \n" },
      { time: 7, insert: "Second \n" },
      { time: 10, insert: "Third \n" },
      { time: 13, insert: "Forth \n" },
      { time: 14, insert: "Fifth \n" },
      { time: 16, insert: "Sixth \n" },
      { time: 18, insert: "Seventh \n" },
      { time: 20, insert: "Eigth \n" },
      { time: 21, insert: "Ninth \n" },
      { time: 23, insert: "Tenth \n" }
    ]
  };*/

  if (event.data === YT.PlayerState.PLAYING) {
    setNotes = setInterval(function() {
      current_playtime = player.getCurrentTime();
      let sec = Math.ceil(current_playtime.toFixed(2));
      if(tutorialData && tutorialData.attacherNotes){
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

window.addEventListener("load", () => {
let tag = document.createElement("script");
tag.id = "iframe-demo";
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

notesContainer = document.getElementById('notes-container');
quillDiv = document.getElementById('quill-div');
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
  
  document.getElementById("save-notes-btn").addEventListener("click", () => {
    let result = confirm("Save the notes in the current play time of video?");
    console.log(editor.getContents().ops);
    if(result){
      axios.post("/api/putData", {
        url: 'https://youtube.com/url-123',
        attacherNotes: [
          {
            vTime: player.getCurrentTime().toFixed(2),
            quillOps: editor.getContents().ops
          }
        ]
      });
    }
  });
  
}, false);