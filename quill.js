var teamId = `955c7caa-fc27-48dd-b8aa-4c33b258f311`
var resourceId = `68299569a5ef77b61a944c15`
var baseUri = `http://127.0.0.1:3000`
var authToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjNmYTQwNmRkOWJmNDJlNWZmYjU5YyIsImVtYWlsIjoibW96YWtrLmlvQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoibW96YWtrLmlvIiwiZmlyc3RfbmFtZSI6Ik1vaGFtbWVkIiwibGFzdF9uYW1lIjoiWmFrYXJpYSIsImF2YXRhciI6Imh0dHBzOi8vbWVkaWEubGljZG4uY29tL2Rtcy9pbWFnZS92Mi9ENEUwM0FRRXNjR3hvUmJnT0F3L3Byb2ZpbGUtZGlzcGxheXBob3RvLXNocmlua184MDBfODAwL0I0RVpQb3NHajZIc0FjLS8wLzE3MzQ3NzU2OTU5MTA_ZT0xNzUzMzE1MjAwJnY9YmV0YSZ0PW8yVTVwckVpZ1VaSVdXNDQ0THdGRDF1TmVaenBmb25TdmZ1RUpOSzkxbVEiLCJpYXQiOjE3NDc3NTkxOTksImV4cCI6MTc0ODM2Mzk5OX0.a85vmvkBIDx3eYVKb1elRX8aGfM8izjhT0yX6TQ5roU`


import Quill from "quill"
import * as QuillWord from "quill-to-word"
import { pdfExporter } from 'quill-to-pdf';
import {saveAs} from "file-saver"


import 'quill/dist/quill.snow.css';
var quill = new Quill("#editor", {
    theme: "snow",
    modules: {
        toolbar: [
            [{ font: [] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ align: [] }],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ header: [1, 2, 3] }],
            ['link', 'image'],
            ['blockquote', 'code-block'],
        ],
    },
});




//export document as docx
async function exportAsDoc(){
    try {
        const content = quill.getContents();
        const blob = await QuillWord.generateWord(content, { exportAs: 'blob' });
        
        saveAs(blob, document.title);

    } catch (error) {
        console.error("Error fetching document:", error);
    }
}
const exportAsDocBtn =  document.getElementById("exportAsDocBtn")
exportAsDocBtn.addEventListener("click", exportAsDoc);




//export document as pdf
async function exportAsPdf(){
    try {
        const content = quill.getContents();
        const blob = await pdfExporter.generatePdf(content);
        
        saveAs(blob, document.title);

    } catch (error) {
        console.error("Error fetching document:", error);
    }
}
const exportAsPdfBtn =  document.getElementById("exportAsPdfBtn")
exportAsPdfBtn.addEventListener("click", exportAsPdf);



//speach to text
async function speachText(){
    try {
        if (annyang) {
        annyang.setLanguage('en-US'); 
      
        // Tell KITT to use annyang
        SpeechKITT.annyang();
      
        // Define a stylesheet for KITT to use
        SpeechKITT.setStylesheet('https://cdnjs.cloudflare.com/ajax/libs/SpeechKITT/1.0.0/themes/flat-midnight-blue.css');
      
        SpeechKITT.setInstructionsText('talk and we write');
      
        // Render KITT's interface
        SpeechKITT.vroom();
      
            const commands = {
              '*text': (text) => {
                  const range = quill.getSelection(true);             
                  quill.insertText(range.index, text + ' ', 'user');   
                  quill.setSelection(range.index + text.length + 1, 0, 'silent');
              }   
            };
      
            annyang.addCommands(commands); 
      
            annyang.start({ continuous: true, autoRestart: true }); 
          } else {
            alert('Speech recognition not supported in this browser.');
          }

    } catch (error) {
        console.error("Error fetching document:", error);
    }
}






async function getDocument(){
    try {
        const response = await fetch(`${baseUri}/api/teams/${teamId}/resources/${resourceId}` , {
            headers : {
                'Authorization': `Bearer ${authToken}`,
            }
        })
        const data = await response.json();
        if (data.status === "success") {
            const Document = data.data;
            document.title = name || 'Untitled';   
            if(Document.content){
                quill.setContents(JSON.parse(Document.content));
            }
        } else {
            console.error("Error fetching document:", data.message);
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
}

//write document
async function writeDocument(content){
    try {
        await fetch(`${baseUri}/api/teams/${teamId}/resources/${resourceId}` , {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                content: JSON.stringify(content),
            }),
        })
    } catch (error) {
        console.error("Error fetching document:", error);
    }
}






//text to speech
const playBtn   = document.getElementById('playBtn');
const pauseBtn  = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn   = document.getElementById('stopBtn');
let utterance;

//speechSynthesis.speak(utterance);
playBtn.addEventListener('click', () => {
  const text = quill.getText();
  utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
  pauseBtn.classList.remove('hidden');
  stopBtn.classList.remove('hidden');
  playBtn.disabled   = true;
});

//speechSynthesis.pause()
pauseBtn.addEventListener('click', () => {
  speechSynthesis.pause();
  pauseBtn.classList.add('hidden');
  resumeBtn.classList.remove('hidden');
});

resumeBtn.addEventListener('click', () => {
  speechSynthesis.resume();
  resumeBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
});

stopBtn.addEventListener('click', () => {
  speechSynthesis.cancel();
  // Hide control buttons except Play
  pauseBtn.classList.add('hidden');
  resumeBtn.classList.add('hidden');
  stopBtn.classList.add('hidden');
  playBtn.disabled   = false;
});

// Reset UI on speech end
document.addEventListener('speechend', () => {
  pauseBtn.classList.add('hidden');
  resumeBtn.classList.add('hidden');
  stopBtn.classList.add('hidden');
  playBtn.disabled   = false;
});




quill.on("text-change",(delta, oldDelta, source) => {
    if(source === "user"){
        const content = quill.getContents()
        writeDocument(content)
    }
})





getDocument()
speachText()

