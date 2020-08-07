const environment = require('dotenv').config();
const GitHubHelper = require('../github-helper');
const _ = require('lodash');
const axios = require('axios');

let tester = new GitHubHelper(process.env.token);
let recursive = tester.fetchAllSync('https://api.github.com/repos/hackforla/website/issues/comments')
    .then(function(data){
        return data;
    });

let iterative = fetchAll('https://api.github.com/repos/hackforla/website/issues/comments')
    .then(function(data){
        return data;
    });

Promise.all([iterative, recursive]).then(function(values){
    let [iterative, recursive] = values;
    if(iterative.length != recursive.length) {
        throw 'ERROR: Lengths not equal';
    }
    for(let i = 0; i < iterative.length; i++){
        if(!_.isEqual(iterative[i], recursive[i])) {
            throw 'ERROR: Unequal value';
        }
    }
    console.log('Everything is equal');
});

async function fetchAll(requestUrl, parameters={}) {
    config = {
        headers: {
            Authorization: `token ${process.env.token}`
        }
    }
    let res = await axios.get(_constructRequestUrl(requestUrl, parameters), config);
    if(!res.headers.link){
        return Promise.resolve(res.data);
    }

    let resultData = res.data;
    let hasNext = true;
    while(hasNext) {
        hasNext = false;
        let linkRelations = res.headers.link.split(',').map(function(item) {
            return item.trim();
        });
        for(let linkRel of linkRelations){
            let [link, rel] = linkRel.split(';').map(function(item) {
                return item.trim();
            });
            if(rel == 'rel="next"'){
                hasNext = true;
                link = link.substring(1, link.length - 1);
                res = await axios.get(link, config);
                resultData = resultData.concat(res.data);
            }
        }
    }
    return resultData;
}

function _constructRequestUrl(requestUrl, parameters={}) {
    requestUrl = !(_.isEmpty(parameters)) ? `${requestUrl}?`: requestUrl;
    for(let parameter in parameters){
        requestUrl = requestUrl.concat(`${parameter}=${parameters[parameter]}&`);
    }
    return requestUrl;
}