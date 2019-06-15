//animeTitles;


function touch(assoc, val, zero){
  if(assoc[val] == undefined){
    assoc[val] = zero;
  }
  return assoc[val];
}

function countMarkov(store, s){
  for(var i = 0; i < s.length - 1; i ++){
    touch(store, s[i], {});
    touch(store[s[i]], s[i + 1], 0);
    store[s[i]][s[i + 1]] += 1;
  }
}

function keys(assoc){
  var ret = [];
  for(var k in assoc){
    ret.push(k);
  }
  return ret;
}
function weightKeys(assoc){
  var ret = [];
  for(var k in assoc){
    for(var i = 0; i < assoc[k]; i ++){
      ret.push(k);
    }
  }
  return ret;
}


function choice(arr){
  var l = arr.length;
  var r = Math.floor(Math.random() * l);
  return arr[r];
}

var markovOne = {};

function nextChar(ch){
  var keyList = weightKeys(markovOne[ch]);  
  return choice(keyList);
}


for(var i = 0; i < animeTitles.length; i ++){
  animeTitles[i] = "^" + animeTitles[i] + "$";
}

animeTitles.forEach(function(v){
  countMarkov(markovOne, v);
});

console.log(markovOne);

var keyList = keys(markovOne);

var ch = "^";
var output = "";

while(ch != "$"){
  ch = nextChar(ch);
  if(ch != "$"){
    output += ch;
  }
}

console.log(output);

var titleElm = document.getElementById("title");
titleElm.appendChild(document.createTextNode(output));
