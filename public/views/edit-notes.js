let notesContainer = null;
let quillDiv = null;
let nContainer = null;
let editor = null;
let prevSec,
  prevIndex,
  masterNotes = "";

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
}

function onPlayerStateChange(event) {
  let setNotes;
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
  };

  if (event.data === YT.PlayerState.PLAYING) {
    setNotes = setInterval(function() {
      current_playtime = player.getCurrentTime();
      let sec = Math.ceil(current_playtime.toFixed(2));
      let index = tutorialData.ops.findIndex((data, index) => {
        return data.time <= sec && data.time >= prevSec;
      });
      if (index > -1 && index > prevIndex) {
        masterNotes += tutorialData.ops[index].insert;
        nContainer.setText(masterNotes);
      }
      prevSec = sec;
      prevIndex = index;
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
let player, current_playtime;

notesContainer = document.getElementById('notes-container');
quillDiv = document.getElementById('quill-div');
getQuillPad(notesContainer, quillDiv);


  
document.getElementById("edit-notes-btn").addEventListener("click", () => {
    let qc = document.getElementById("quill-container");
    if (qc.style.display === "none") {
      qc.style.display = "block";
      editor.setText(masterNotes);
    } else {
      qc.style.display = "none";
      editor.setText("");
    }
  });
  
  document.getElementById("save-notes-btn").addEventListener("click", () => {
    confirm("Save the notes in the current play time of video?");
  });
  
  
}, false);