// =============================================================================
// ============================ DYNAMIC CODE EDITOR ============================
// =============================================================================

var codestr_p1 = `# "DisCoolVer" v3.0.8
#
# CODERUBBER License
# Copyright (c) 2025 Amin.h
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software, bla bla bla ..., and again some more bla. In a nutshell,
# feel free to copy and paste, as it's a vital part of education.

"""
  ** Helo?
     .  lo
      .  lo
       .   o
  >> Hey, what's up?
  ** Oh my God; what's happening?!
  >> Relax, I won't do any harm. I'm just hacking your system.
  ** (scary face) O_O You must be kidding, right?
  >> Yeah, sorry, but you should've seen your face XD
     Now that I can type in the console, we may have some fun.
     Likeee ... hmmm... let's write some code!!!
       
       /)ii/)
     (o "   )
         | |
         |o|
         | |_____||
         |   o    |
         | o _ o_ |
         ||||   |||
         ||||   |||
"""

"""
  >> First, beautify the console.
"""
from darkweb.vip.amin import magic
magic.beautify("console")
`;

var codestr_p2 = `
"""
  >> This module can even beautify your face :), kids call it Photoshop nowadays.
     You can access it by magic.beautify("face")

  >> Now we will use Deep Learning to find out if you're cool, no offense :]
"""
from darkweb.vip.amin import load_data, load_model, secrets, system


# -----------------------
# Load the data and model
# -----------------------

# The name is a cover. All_Chimpanzees includes personal characteristics
# of almost every human being (GOOGLE is not that gentle, after all :])
trainset, valset, fullset = load_data(
  'All_Chimpanzees', split=['train', 'validation', 'complete']
)

"CONSOLE" > # Downloading dataset: 98.67GB/s
`;

var codestr_p3 = `
model = load_model("darkweb/VIPs/Amin/DisCoolVer")

"CONSOLE" > # Loading the magical model ...
`;

var codestr_p4 = `
# ------------------
# Training the model
# ------------------

model.fit(trainset)

"CONSOLE" > # Training the model ...
`;

var codestr_p5 = `
# --------------------
# Evaluating the model
# --------------------

print(model.evaluate(valset, verbose=0))

"CONSOLE" > # val_acc: 99.23% (Good job!)

# ---------------------
# Utilizing on new data
# ---------------------
"""
  >> Here is where we check if you're cool :)
     Sit still, we're about to find out ...
  >> (self-reflection: Don't mess it up! The reader is in fullset,
     not foolset ...)
"""
# Extract your characteristics
reader_chars = fullset.smart_ones.find(name=secrets.reader.name)
reader_is_cool = model.predict(reader_chars)

if reader_is_cool == False:
  # Close the window before the reader gets angry! Bye Bye
  system.window.get_command("Alt + F4")

else:
  print("You are COOL!")

"CONSOLE" > # You are COOL!

"""
  >> Sheeesh!!! you're cool! (Surprized? XD)
     (happy face looking angry at me :|)

  >> I also tested this model on my friend and it turned out that he 
     isn't cool. So I guess the model works well.

  >> We did it! We made the first "Cool Finder" on Earth! Actually,
     I did it, but... who cares?! We can tell people you helped :)
     (Even the name of my master's supervisor appears on the front 
     page of my thesis. :|)

  >> I had a good time, I hope you did too :) Bye Bye ...
"""

`;

var codestr_fp1 = `# Written with `

var codestr_fp2 = `love <3, have f`

var codestr_fp3 = `keyboard, have fun!!!`

var l_1 = codestr_p1.length;
var l_2 = codestr_p2.length;
var l_3 = codestr_p3.length;
var l_4 = codestr_p4.length;
var l_5 = codestr_p5.length;
var l_f1 = codestr_fp1.length;
var l_f2 = codestr_fp2.length;
var l_f3 = codestr_fp3.length;
var editor = null;
var coditor_started = false;

// Keep the editor's container scrolled to show the latest line without affecting page scroll
function pinEditorScroll() {
  if (!editor) return;
  const container = editor.parentElement; // <pre class="code-editor">
  if (!container) return;
  // Only autoscroll if user is already near the bottom
  const threshold = 24; // px
  const isNearBottom = (container.scrollTop + container.clientHeight) >= (container.scrollHeight - threshold);
  if (isNearBottom) {
    try {
      container.scrollTop = container.scrollHeight;
    } catch (e) { /* no-op */ }
  }
}


// main function. tag defines what it should do
function write_code(tag){
  switch (tag){
    // start writing codestr_p1 in basic editor (basic <code> tag)
    case 0:
      if (coditor_started == true)
        return
      else
        coditor_started = true
      // first get editor element
      editor = document.getElementById("editor");
      if (editor == null){
        console.log("editor is null!");
      }
      // now write in it
      write_code_basic("", codestr_p1, l_1, 20, 0, 1);
      break;
      
    // colorizing editor
    case 1:
      setTimeout(add_prism_css, 1000);
      setTimeout(highlight_editor, 1500);
      setTimeout(write_code, 1500, 2);
      break;
      
      // start writing codestr_p2 in editor
      case 2:
        write_code_highlight(codestr_p1, codestr_p2, l_2, 5, 0, 3);
        break;
      
      // Console, Downloading dataset: speed illusion
      case 3:
        write_console_download(codestr_p1+codestr_p2, l_1+l_2, 250, 0, 4);
        break;
      
      // start writing codestr_p3 in editor
      case 4:
        write_code_highlight(codestr_p1+codestr_p2, codestr_p3, l_3, 20, 0, 5);
        break;
      
      // Console, Loading the model: loading illusion
      case 5:
        write_console_loading(codestr_p1+codestr_p2+codestr_p3, l_1+l_2+l_3, 500, 0, 99);
        create_nn();    // from nn.js
        setTimeout(write_code, 8000, 6);
        break;
      
      // start writing codestr_p4 in editor
      case 6:
        write_code_highlight(codestr_p1+codestr_p2+codestr_p3, codestr_p4, l_4, 20, 0, 7);
        break;
      
      // Console, Training the model: loading illusion
      case 7:
        write_console_loading(codestr_p1+codestr_p2+codestr_p3+codestr_p4, l_1+l_2+l_3+l_4, 500, 0, 8);
        setTimeout(train_nn, 2000);     // from nn.js
        break;
    
      // Console, Training the model more: loading illusion
      case 8:
        write_console_loading(codestr_p1+codestr_p2+codestr_p3+codestr_p4, l_1+l_2+l_3+l_4, 500, 0, 9);
        break;
      
      // start writing codestr_p5 + codestr_fp1 in editor
      case 9:
        write_code_highlight(codestr_p1+codestr_p2+codestr_p3+codestr_p4, codestr_p5+codestr_fp1+codestr_fp2, 
          l_5+l_f1+l_f2, 20, 0, 10);
        break;
  
      // Console, delete last characters
      case 10:
        setTimeout(write_code, 1500, 11);;
        break;
    
      // Console, delete last characters
      case 11:
        write_code_backspace(codestr_p1+codestr_p2+codestr_p3+codestr_p4+codestr_p5+codestr_fp1+codestr_fp2, 
          l_1+l_2+l_3+l_4+l_5+l_f1+l_f2, 200, 0, 12);
        break;
    
      // start writing codestr_p5 + codestr_fp1 in editor
      case 12:
        write_code_highlight(codestr_p1+codestr_p2+codestr_p3+codestr_p4+codestr_p5+codestr_fp1, codestr_fp3,
          l_f3, 100, 0, 13);
        setTimeout(forward_loop_nn, 5000);     // from nn.js
        break;
      
      default:
        break;
  }
}


// just fills the editor, no highlighting
// pretext always appear and maintext appears char by char till `l` chars
// calls write_code(tag) when done
function write_code_basic(pretext, maintext, l, ms, i, tag){
  editor.innerHTML = pretext + maintext.slice(0, i);
  pinEditorScroll();
  if (i<l)
    setTimeout(write_code_basic, ms, pretext, maintext, l, ms, i+1, tag); 
  else
    write_code(tag);
}


// fills the editor with highlighting
// pretext always appear and maintext appears char by char till `l` chars
// calls write_code(tag) when done
function write_code_highlight(pretext, maintext, l, ms, i, tag){
  editor.innerHTML = pretext + maintext.slice(0, i);
  Prism.highlightElement(editor);
  pinEditorScroll();
  if (i<l)
    setTimeout(write_code_highlight, ms, pretext, maintext, l, ms, i+1, tag); 
  else
    write_code(tag);
}


// fills the editor with highlighting
// removes last 10 chars "98.67GB/s\n" and fills it with random speed
// calls write_code(tag) when done
function write_console_download(pretext, l, ms, i, tag){
  text = pretext.slice(0, l-10);
  dl_speed = (90 + Math.random() * 30);
  dl_speed = dl_speed.toFixed(2);
  text += dl_speed + "GB/s";
  editor.innerHTML = text;
  Prism.highlightElement(editor);
  pinEditorScroll();
  if (i<20)
    setTimeout(write_console_download, ms, pretext, l, ms, i+1, tag); 
  else
    write_code(tag);
}


// fills the editor with highlighting
// removes last 4 chars "...\n" and makes loading illusion
// calls write_code(tag) when done
function write_console_loading(pretext, l, ms, i, tag){
  text = pretext.slice(0, l-4);
  for (var j=0 ; j < i%4 ; j++)
    text += ".";
  editor.innerHTML = text;
  Prism.highlightElement(editor);
  pinEditorScroll();
  if (i<11)
    setTimeout(write_console_loading, ms, pretext, l, ms, i+1, tag); 
  else
    write_code(tag);
}


// fills the editor with highlighting
// backspaces last 15 chars "love <3, have f"
// calls write_code(tag) when done
function write_code_backspace(pretext, l, ms, i, tag){
  editor.innerHTML = pretext.slice(0, l-i);
  Prism.highlightElement(editor);
  pinEditorScroll();
  if (i<15)
    setTimeout(write_code_backspace, ms, pretext, l, ms, i+1, tag); 
  else
    write_code(tag);
}


// add prism's css style sheet (prism.css)
function add_prism_css(){
  var cssId = 'prism_css';
  if (!document.getElementById(cssId)){
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.id   = cssId;
    link.rel  = 'stylesheet';
    link.href = 'styles/prism.css';
    head.appendChild(link);
  }
}


// tell prism to colorize the code and background
function highlight_editor(){
  Prism.highlightElement(editor);
  pinEditorScroll();
}