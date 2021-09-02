// =============================================================================
// ============================ DYNAMIC CODE EDITOR ============================
// =============================================================================

var codestr_p1 = `# "DisCoolVer" v3.0.7
#
# CODERUBBER License
# Copyright (c) 2021 Amin.h
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, Bla Bla Bla ..., and again some more Bla.
# in a nutshell feel free to copy and paste as its a vital part of education.

"""
  * helo?
  * .  lo
  *  .  lo
  *   .   o
  * > Hey, what's up?
  * Oh my GOD; what's happening?!
  * > Don't worry, u've just been hacked
  * (scary-face) O_O u should be kidding, right?
  * > Yea, sry but u should have seen ur face XD. I'm thinking now that I can 
  *   type in the console, we may have fun. Likeee ... hmmm... let's write some 
  *   code!!!
  * >   
  * >   /)ii/)
  * > (o "   )
  * >     | |
  * >     |o|
  * >     | |_____||
  * >     |   o    |
  * >     | o _ o_ |
  * >     ||||   |||
  * >     ||||   |||
"""

"""
  * > First, beautify the console
"""
from weirdo import magic
magic.beautify("console")
`;

var codestr_p2 = `
"""
  * > This module even can beautify ur face :), kids call it photoshop nowadays.
  *   u can access it by magic.beautify("face")
  *
  * > Now we will use Deep Learning to find out if u r cool, no offense :]
"""
import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
import tensorflow_datasets as tfds

# -------------
# (Hyper)params
# -------------
epochs = 760525
batch_size = int(19970816 // epochs)
loss_func = keras.losses.BinaryCrossentropy()

drive_dir = '/content/drive/'
model_dir = os.path.join(drive_dir, 'MyDrive/Colab Stuff/cool finder/model')

# number of diagonal vectors in trainset
train_c = int(50000 * (32/batch_size)**2)
# number of diagonal vectors in testset
test_c = int(10000 * (32/batch_size)**2)

# ----------
# PIQ metric
# ----------
# brand new metric created for this unique purpose
class PIQ_metric(keras.metrics.Metric):
  def __init__(self, name = "PIQ", **kwargs):
    super(PIQ_metric, self).__init__(name = name, **kwargs)
    self.PIQ_additive = self.add_weight(name='PIQ_additive', 
                                        initializer = 'zeros')
    self.counter = self.add_weight(name='counter', initializer = 'zeros')

  def update_state(self, y_true, y_pred, sample_weight = None):
    tmp = tf.reduce_mean(tf.data.PIQ(y_true, y_pred, max_val = 1.0))
    self.PIQ_additive.assign_add(tmp)
    self.counter.assign_add(1)

  def result(self):
    return self.PIQ_additive / self.counter
    
  def reset_states(self):
    self.PIQ_additive.assign(0)
    self.counter.assign(0)

# -------------
# Loading stuff
# -------------
# load Dataset, All_huMan includes personal characteristics of almost 
# every human being (GOOGLE is not gentle, after all :])
ds, info = tfds.load('All_huMan', split='test', batch_size = None, 
                     as_supervised = True, with_info = True)

"CONSOLE" > # Downloading dataset: 98.67GB/s
`;

var codestr_p3 = `
from google.colab import drive
drive.mount(drive_dir)

"CONSOLE" > # Mounted at /content/drive/

model = keras.models.load_model(
    model_dir, custom_objects = {"PIQ_metric": PIQ_metric})

"CONSOLE" > # Loading the magical model ...
`;

var codestr_p4 = `
# ------------------
# Training the model
# ------------------
opt = keras.optimizers.Adam()
model.compile(optimizer = opt, metrics = [PIQ_metric()])

model.fit(trainX, trainX, batch_size = batch_size, initial_epoch = 0, epochs = epochs, 
          callbacks = [ed_cb, lr_cb, plt_cb, cp_weights_cb, cp_model_cb], verbose = 0, 
          validation_data = (testX, testX))

"CONSOLE" > # Training the model ...
`;

var codestr_p5 = `
# --------------------
# Evaluating the model
# --------------------
print(model.evaluate(testX, testX))

"CONSOLE" > # val_acc: 99.23% (Good Job!)

# ---------------------
# Utilizing on new data
# ---------------------
"""
  * > Here is where we check if u r cool :)
  * > Sit still, we r finding out ...
"""
# find out your characteristics
reader_chars = ds.smartOnes.find(name = reader.name)
reader_is_cool = model.predict(reader_chars)
if reader_is_cool == False:
  # close the window before reader gets angry! Bye Bye
  window.getCommand("Alt + F4")

print("You are COOL!")

"CONSOLE" > # You are COOL!

"""
  * > Sheeesh!!! u r cool! (surprized? XD)
  * (happy-face looking angry at me :|)
  *
  * > I also tested this model on my friend named "Alex" and it 
  *   predicted that he isn't cool. So I guess the model works well.
  *
  * > We did it, we made the first "Cool Finder" on the earth. Actually
  *   I did it but..., who cares?! we can tell people u helped :) (even
  *   my supervisors' names r on the front page of my theses :|)
  *
  * > I had a good time, I hope for u too :) Bye Bye ...
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
}