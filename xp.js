
var _ = require("lodash");
var dispwhoDomWho = false;
var logMe = '';
var nbCollections = 50;
var nbfriends = 10;
var maxfollowers = 100;
var nbvoters = 100;
var matrix = [];
var publicCollectionTradeoffAnalytics ={};
var min= 0, max=0;
var config = require("./config");
var dispwhoDomWho = false;
var logMe = '';
var problem;
var epsilone = [];
var epsilones = [];
var epsVariations = 10;
var change = 0;
var cot = 0;
var cit = 0;
var cpt = 0;
var problemStore = {};
problemStore.problems = [];
problemStore.undoTable = [];
problemStore.eps = [];
var expStore = [];
var tables = {};
var eps = {};
var exp = 0;
var min = [];
var max = [];
var reference = [];
var delta = 0;
var gmax = 100;
var it = 100;
var dangZon;

function refSolution(){
  var solution =[];
  for (var i = 0; i < max.length; i++) {
    solution[i] = max[i];
  }
  return solution;
}

function squaredEuclidean(p, q) {
  var d = 0;
  for (var i = 0; i < p.length; i++) {
    d += ((p[i] - q[i])/(max[i]-min[i])*w[i]) * ((p[i] - q[i])/(max[i]-min[i])*w[i]);
  }
  return d;
}

function euclidean(p, q) {
  return Math.sqrt(squaredEuclidean(p, q));
}

function getActiveObjectives(objectives){
  var objectivesToConsider = [];
  for (var i = 0; i < objectives.length; i++){
    if (objectives[i].is_objective){
      objectivesToConsider.push(objectives[i]);
    }
  }
  return objectivesToConsider;
}

function isDecisive1(pObjective, qObjective, goal, epsilone_){
  var optGoal = goal.toLowerCase();
  var itDoes = 0;
  switch(optGoal) {
    case "max":
      if (pObjective == qObjective){
        itDoes = 1;
      }else{
        if (pObjective > qObjective + epsilone_){
          //console.log('!!!!!!!');
          cot = cot + 1;
          itDoes = 2;//strict
        }else{
          itDoes = 3;
        }
      }
      break;
    case "min":
      if (pObjective == qObjective){
        itDoes = 1;
      }else{
        if (pObjective < qObjective - epsilone_){
          itDoes = 2;//strict
        }else{
          itDoes = 3;
        }
      }
      break;
  }
  return itDoes;
}

function isDecisive2(pObjective, qObjective, goal, epsilone_){
  var optGoal = goal.toLowerCase();
  var itDoes = 0;
  switch(optGoal) {
    case "max":
      if (pObjective == qObjective){
        itDoes = 1;
      }else{
        if (pObjective > qObjective + epsilone_){
          cot = cot + 1;
          itDoes = 2;//strict
        }else{
          itDoes = 3;
        }
      }
      break;
    case "min":
      if (pObjective == qObjective){
        itDoes = 1;
      }else{
        if (pObjective < qObjective - epsilone_){
          itDoes = 2;//strict
        }else{
          itDoes = 3;
        }
      }
      break;
  }
  return itDoes;
}

function isDecisive(pObjective, qObjective, goal){
  var optGoal = goal.toLowerCase();
  var itDoes = 0;
  switch(optGoal) {
    case "max":
      if (pObjective == qObjective){
        itDoes = 1;
      }else{
        if (pObjective > qObjective){
          cit = cit + 1;
          itDoes = 2;//strict
        }else{
          itDoes = 3;
        }
      }
      break;
    case "min":
      if (pObjective == qObjective){
        itDoes = 1;
      }else{
        if (pObjective < qObjective){
          itDoes = 2;//strict
        }else{
          itDoes = 3;
        }
      }
      break;
  }
  return itDoes;
}

function doesDominate(p, q, objectives){
  var itDoes = 0;
  var onceStrict = false;
  var objectivesToConsider = getActiveObjectives(objectives);
  var i = 0;
  while(i < objectivesToConsider.length && itDoes!=3){
    var objective = objectivesToConsider[i].key;
    var pObjective = p.values[objective];
    var qObjective = q.values[objective];
    var goal = objectivesToConsider[i].goal;
    if(change == 0){
      //console.log('cpt = ' + cpt + 'epsilone[0] = ' + epsilone[0]);
      itDoes = isDecisive1(pObjective, qObjective, goal, epsilone[i]);
      //console.log('!!!');
    }else{
      if(change == 1){
        itDoes = isDecisive(pObjective, qObjective, goal);
      }else{
        itDoes = isDecisive2(pObjective, qObjective, goal);
      }
    }

    if(itDoes == 2){
      onceStrict = true;
    }
    i++;
  }
  if(itDoes == 3){
    onceStrict = false;
  }
  return onceStrict;
}

function rw_dominate(p, q, objectives){
  var dominant = 0;
  var res = doesDominate(p, q, objectives);
  if (res === false){ //p not dom q
    res = doesDominate(q, p, objectives);
    if (res){//p not dom q & q dom p
      logMe = logMe + JSON.stringify(q.values) +  " -- dominates -- " + JSON.stringify(p.values) + '\n';
      dominant = -1;
    }else {// //p not dom q & //q not dom p --> incomparable --> we use the weighted Euclidian distance
      var p_dist = euclidean(p, reference);
      var q_dist = euclidean(q, reference);
      if(p_dist<dangZon && q_dist>dangZon){
        //elimiate q
        dominant = 1;
      }else{
        if(q_dist<dangZon && p_dist>dangZon){
          //elimiate p
          dominant = -1;
        }else{
          dominant = 2;
        }
      }
      //logMe = logMe + JSON.stringify(q.values) +  " -- dominates -- " + JSON.stringify(p.values) + '\n';
    }
  } else {
    logMe = logMe + JSON.stringify(p.values) +  " -- dominates -- " + JSON.stringify(q.values) + '\n';
    dominant = 1;
  }
  if(dispwhoDomWho){
    console.log(logMe);
  }
  return dominant;
}

function dangerZone(){
  var delt =  Math.random() * (1 - 0) + 0;
  delta = Math.round(delt * 100) / 100;
  DZ = (1 - (delta * ((1 - (it+1)) / (1-gmax))));
  return DZ;
}

function dominate(p, q, objectives){
  var dominant = 0;
  var res = doesDominate(p, q, objectives);
  if (res === false){ //p not dom q
    res = doesDominate(q, p, objectives);
    if (res){
      logMe = logMe + JSON.stringify(q.values) +  " -- dominates -- " + JSON.stringify(p.values) + '\n';
      dominant = -1;
    }else {
      dominant = 2;
      logMe = logMe + JSON.stringify(q.values) +  " -- dominates -- " + JSON.stringify(p.values) + '\n';
    }
  } else {
    logMe = logMe + JSON.stringify(p.values) +  " -- dominates -- " + JSON.stringify(q.values) + '\n';
    dominant = 1;
  }
  if(dispwhoDomWho){
    console.log(logMe);
  }
  return dominant;
}

function dilemmas(problem, cb){
  var answer = {};
  answer.problem = problem;
  var options = problem.options;
  var objectives = problem.columns;
  var maximaSoFar = [];
  for (var i = 0; i < options.length; i++){
    var option = _.cloneDeep(options[i]);
    var shouldInsert = true;
    for (var j = 0; j < maximaSoFar.length; j++){
      var maximaSoFarOption =  maximaSoFar[j];
      if (maximaSoFarOption.deleted){
        continue;
      }
      var outcome = rw_dominate(option, maximaSoFarOption, objectives );
      if (outcome === -1){ //p not dom q
        shouldInsert = false;
      } else if (outcome === 1 ){
        maximaSoFarOption.deleted = true;
      }
    }
    if (shouldInsert){
      maximaSoFar.push(option);
    }
  }
  answer.resolution = {};
  answer.resolution.solutions = [];
  for (var k = 0; k < maximaSoFar.length; k++){
    if (!maximaSoFar[k].deleted){
      var aSolution = {};
      aSolution.solution_ref = maximaSoFar[k].key;
      aSolution.status = "FRONT";
      answer.resolution.solutions.push(aSolution);
    }
  }
  answer.resolution.solutions = answer.resolution.solutions.filter(function(solution){
    if (solution.status === "FRONT"){
      return true;
    }
    return false;
  });

  answer.resolution.solutionsLength = answer.resolution.solutions.length;
  return cb(null, answer);

}

function syntheticData(){

  for (var i = nbCollections, lookupTable = []; i--;) {
    lookupTable = [];
    lookupTable.push(Math.random()*maxfollowers|0);//F1
    lookupTable.push(Math.random()*nbvoters|0);//F2
    lookupTable.push(Math.random()*nbfriends|0);//F3
    lookupTable.push(Math.random()*nbfriends|0);//F4
    lookupTable.push(Math.random()*2|0);//F5
    lookupTable.push(Math.random()*2|0);//F6
    var geoDistance =  Math.random() * (1 - 0) + 0;
    var indusDistance = Math.random() * (1 - 0) + 0;
    var geoDistance = Math.round(geoDistance * 100) / 100;//F7
    var indusDistance = Math.round(indusDistance * 100) / 100;//F8
    lookupTable.push(geoDistance);
    lookupTable.push(indusDistance);
    matrix[i] = lookupTable;
  }

  min = [];
  max = [];
  for (var i = 0; i < matrix[0].length; i++) {
    min[i] = 99999;
    max[i] = -1;
  }
  for (var j = 0; j < matrix[0].length; j++) {//8
    for (var i = 0; i < matrix.length; i++) {//2
      if(min[j] > matrix[i][j]){
        min[j] = matrix[i][j];
      }
      if(max[j] < matrix[i][j]){
        max[j] = matrix[i][j];
      }
    }
  }
  reference = refSolution();
  var mul;
  for (var k = 0; k < epsVariations; k++){
    epsilones[k] = [];
    mul = (k + 1) * 0.01;
    var d;
    for (var i = 0; i < max.length; i++) {
      d = max[i] - min[i];
      epsilone[i] = mul * d;
      /*      console.log(' max[i] =  ' + max[i]);
       console.log(' epsilone[i] =  ' + epsilone[i]);*/
      epsilones[k][i] = Math.round(epsilone[i] * 100) / 100;
    }
  }

  publicCollectionTradeoffAnalytics = {
    publicCollectionObjectiveDetails : {
      F1 : {
        "key": "F1",
        "full_name": "Followers",
        "type": "NUMERIC",
        "is_objective": config.publicCollectionRecommendations.objectives.followers.active,
        "goal": "MAX"
      },
      F2 : {
        "key": "F2",
        "full_name": "Votes",
        "type": "NUMERIC",
        "is_objective": config.publicCollectionRecommendations.objectives.upvotes.active,
        "goal": "MAX"
      },
      F3 : {
        "key": "F3",
        "full_name": "Votes (among friends)",
        "type": "NUMERIC",
        "is_objective": config.publicCollectionRecommendations.objectives.upvotesAmongFriends.active,
        "goal": "MAX"
      },
      F4 : {
        "key": "F4",
        "full_name": "Followers (among friends)",
        "type": "NUMERIC",
        "is_objective": config.publicCollectionRecommendations.objectives.followersAmongFriends.active,
        "goal": "MAX"
      },
      F5 : {
        "key": "F5",
        "full_name": "isOwner (among friends)",
        "type": "NUMERIC",
        "is_objective": config.publicCollectionRecommendations.objectives.isOwnerAmongFriends.active,
        "goal": "MAX"
      },
      F6 : {
        "key": "F6",
        "full_name": "isOwner verified ",
        "type": "NUMERIC",
        "is_objective": config.publicCollectionRecommendations.objectives.isOwnerVerified.active,
        "goal": "MAX"
      },
      F7 : {
        "key": "F7",
        "full_name": "Contributors geo distance ",
        "type": "NUMERIC",
        "is_objective": config.publicCollectionRecommendations.objectives.geoContributorDistance.active,
        "goal": "MIN"
      },
      F8 : {
        "key": "F8",
        "full_name": "Contributors geo distance",
        "type": "NUMERIC",
        "is_objective": config.publicCollectionRecommendations.objectives.industryContributorDistance.active,
        "goal": "MIN"
      }
    }
  };
};


function gatherProblem(listOfPublicCollectionStatistics, publicCollectionTradeoffAnalytics){
  problem = {};
  problem.options = [];
  var keyIndex = 1;

  problem.subject = "Public Collection Recommendation";
  problem.generate_visualization = false;
  problem.columns =  _.values(publicCollectionTradeoffAnalytics.publicCollectionObjectiveDetails);

  for (var i = 0; i < nbCollections; i++){
    var collectionData = listOfPublicCollectionStatistics[i];
    //     console.log(" ### PAT collectionData ", collectionData);
    var option = {};
    option.key = keyIndex++;
    option.name = 'C-'+option.key;
    option.values = {};
    option.values.F1 = collectionData[0];
    option.values.F2  = collectionData[1];
    option.values.F3 = collectionData[2];
    option.values.F4  = collectionData[3];
    option.values.F5  = collectionData[4];
    option.values.F6  = collectionData[5];
    option.values.F7  = collectionData[6];
    option.values.F8 = collectionData[7];
    problem.options.push(option);
  }
};

function create(){
  syntheticData();
  gatherProblem(matrix, publicCollectionTradeoffAnalytics);
};

function init(){
  matrix = [];
  publicCollectionTradeoffAnalytics ={};
  min= 0;
  max=0;
  dispwhoDomWho = false;
  logMe = '';
  problem={};
  epsilone = [];
  epsilones = [];
  change = 0;
  cot = 0;
  cit = 0;
  cpt = 0;
  problemStore = {};
  problemStore.problems = []
  problemStore.undoTable = [];
  problemStore.eps = [];
};

function Singleexperiment(cont){
  create();
  var probAns = {};
  dangZon = dangerZone();
  var table ={};
  table.undom = [];
  change = 1;
  while(cpt < epsVariations + 1){
    dilemmas(problem, function(err, answer){
      dilemmas(problem, function(err, answer){
        //console.log(" ###", JSON.stringify(answer.resolution.solutions));
        //console.log('nb_undom = ' + answer.resolution.solutionsLength);
        table.undom.push(answer.resolution.solutionsLength);
        probAns.problem = problem;
        probAns.answer = answer;
        probAns.index = cpt;
        probAns.expIndex = cont;
        if(cpt > 0){
          probAns.epsilone = epsilone;
        }
        problemStore.problems.push(probAns);
      });
    });
    /*    console.log('cot = ' + cot);
     console.log('cit = ' + cit);*/
    cit = 0;
    cot = 0;
    change = 0;
    epsilone = epsilones[cpt];
    cpt = cpt + 1;
  }

  /*  for (var i = 0; i < epsilones.length; i++){
   console.log(" epsilone =  ", JSON.stringify(epsilones));
   }
   console.log(" epsilones =  ", JSON.stringify(epsilones));
   console.log(" table.epsilone  ", JSON.stringify(table.undom));*/

  tables[cont] = table.undom;
  eps[cont] = epsilones;
  problemStore.undoTable.push(tables[cont]);
  problemStore.eps = epsilones;
};

function Run(){
  while(exp < 2){
    Singleexperiment(exp);
    expStore.push(problemStore);
    init();
    exp = exp +1;
  }
  /*console.log(" -------------------------  ");
   console.log(" table.undom  ", JSON.stringify(tables));
   console.log(" table.undom  ", JSON.stringify(eps));*/
//console.log(" problemStore  ", JSON.stringify(problemStore[0]))
};

function consoleFeast(){
  var cp = 0;
  while(cp<expStore.length){
    var prbStore = expStore[cp];
    console.log('exp - ' + cp + ' ------------------------------------------------');
    var cpt = 0;
    /*    var hh = prbStore.undoTable;
     while(cpt<prbStore.undoTable.length){
     var record = prbStore[cpt];
     console.log('set - ' + cpt + ' ------------------------------------------------');*/

    var str= 'Undo  |   ';
    for(var i=0;i<prbStore.undoTable[0].length;i++){
      str = str + prbStore.undoTable[0][i] + '  |  '
    }
    console.log(str);
    console.log('.........................................');
    /*      cpt = cpt +1;
     }*/

    cp = cp +1;
  }
}

//main
Run();
consoleFeast();
