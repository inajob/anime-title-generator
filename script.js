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

function countMarkov2(store, s){
  for(var i = 0; i < s.length - 2; i ++){
    touch(store, s[i], {});
    touch(store[s[i]], s[i + 1], {});
    touch(store[s[i]][s[i + 1]], s[i + 2], 0);
    store[s[i]][s[i + 1]][s[i + 2]] += 1;
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
      ret.push([k, assoc[k]]);
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
var markovTwo = {};

function nextChar(ch){
  var keyList = weightKeys(markovOne[ch]);  
  return choice(keyList);
}
function nextChar2(ch, preCh){
  if(markovTwo[preCh] != undefined && markovTwo[preCh][ch] != undefined){
    var keyList = weightKeys(markovTwo[preCh][ch]);  
    return choice(keyList);
  }
  return null;
}

// initialize titles
for(var i = 0; i < animeTitles.length; i ++){
  animeTitles[i] = "^" + animeTitles[i] + "$";
}

// setup markov data
animeTitles.forEach(function(v){
  countMarkov(markovOne, v);
  countMarkov2(markovTwo, v);
});

function generate(){
  var ch = "^";
  var preCh = "";
  var output = "";
  var count = 0;
  var tmp;
  var rawScore = 0;
  var cost = 0;
  var dtext = "";
  while(ch != "$"){
    count ++;
    if(count > 100)break;
    if(preCh == "" || Math.random()>0.4){
      tmp = nextChar(ch);
      ch = tmp[0];
      cost = tmp[1];
    }else{
      tmp = nextChar2(ch, preCh);
      if(tmp == null){
        console.log("2")
        tmp = nextChar(ch);
        ch = tmp[0]
        cost = tmp[1];
      }else{
        console.log("1")
        ch = tmp[0];
        cost = tmp[1];
      }
    }
  
    if(ch != "$"){
      output += ch;
    }
    dtext += ch;
    dtext += cost+"-";
    rawScore += cost;
    preCh = ch;
  }
  
  console.log(output);
  //output = "「"+output+"」";
  return {
    text: output,
    dtext: dtext,
    rawScore: rawScore,
    score: rawScore/count,
  };
}

var titleElm = document.getElementById("title");
var items = [];
var results = [];

for(var i = 0; i < 50; i ++){
  items.push(generate());
}
items.forEach(function(v){
  var score = 0;

  animeTitles.forEach(function(title){
    if(v.text.indexOf(title) != -1){ // target include title?
      score += 10;
    }
    if(title.indexOf(v.text) != -1){ // title include target?
      score += 10;
    }
  });
  function unbalance(sc, ec){
    var ret = false;
    if(v.text.indexOf(sc) != -1 || v.text.indexOf(ec) != -1){
      var s = v.text.indexOf(sc);
      var e = v.text.indexOf(ec);
      if(s == -1 || e == -1 || s < e){
        ret = true;
      }
    }
    return ret;
  }
  score += unbalance("「","」")?100:0;
  score += unbalance("『","』")?100:0;
  score += unbalance("（","）")?100:0;
  score += unbalance("［","］")?100:0;
  score += unbalance("〔","〕")?100:0;
  score += unbalance( "(", ")")?100:0;
  score += unbalance( "[", "]")?100:0;
  score += unbalance( "【", "】")?100:0;

  function katakana(s){
    var count = 0;
    var ret = true;
    var c;
    for(var i = 0; i < s.length; i ++){
      c = s.charAt(i);
      if(c.search(/[ァ-ヴー・]/) == 0){
        count ++;
      }else{
        if(count == 1){
          ret = false;
        }
        count = 0;
      }
    }
    if(count == 1){ret = false;}
    return ret;
  }
  score += katakana(v.text)?0:10;

  if(v.text.search(/^[a-zA-Z.!?！？]*$/) == 0){
    score += 10;
  }

  if(v.text.search(/[ぁ-ん]{6}/) != -1){
    score += 10;
  }
  if(v.text.search(/[ァ-ヴ]{6}/) != -1){
    score += 10;
  }

  // length check
  if(v.text.length < 5){
    score += 10;
  }
  if(v.text.length > 10){
    score += Math.abs(v.text.length - 6) * 10;
  }
  
  results.push({
    score: score,
    text: v.text,
    dtext: v.dtext,
    pscore: v.score
  });
});

results.sort(function(a,b){return b.pscore - a.pscore;});
results.forEach(function (v){
  if(v.score > 0){
    return;
  }
  titleElm.appendChild(document.createTextNode(v.text/*+":"+ v.dtext +", "+ v.pscore*/));
  var a;
  titleElm.appendChild(a = document.createElement("a"));
  a.appendChild(document.createTextNode("[つぶやく]"));
  a.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(v.text) + '&hashtags=アニメタイトル生成器&url=' + encodeURIComponent(document.location.href);

  titleElm.appendChild(document.createElement("br"));
});

