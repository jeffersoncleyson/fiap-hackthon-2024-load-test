import http from 'k6/http'
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { check, group, sleep } from 'k6'

// GATEWAY
const baseUrl = 'https://55vc6lpxhd.execute-api.us-east-1.amazonaws.com/dev'
// ENDPOINTS

export const options = {

  stages: [
    { duration: '6m', target: 1000 },
    // { duration: '2m', target: 200 },
    // { duration: '2m', target: 300 },
    // { duration: '2m', target: 0 },
    // { duration: '2m', target: 800 }
  ],

  thresholds: {
    'http_req_duration{name:POST_TOKEN}': ['p(95)<5000'],
    'http_req_duration{name:POST_PONTO}': ['p(95)<5000'],
  },
}

var map_tokens = new Map()

export default function () {
 
  group('Geração de Pontos', () => {

    const randon_num = Math.floor(Math.random() * 800) + 1;

    const body = {
      "username": `USER${randon_num}`,
      "password": `USER${randon_num}`
    }

    var tokenData = map_tokens.get(body["username"])

    if(!tokenData){
      const parametros = {
        headers: {
          'Content-Type': 'application/json',
        },
        tags: {
          name: 'POST_TOKEN',
        },
      }
      const tokenClientResponse = http.post(
        `${baseUrl}/login`,
        JSON.stringify(body),
        parametros,
      )
      check(tokenClientResponse, {
        'is status 200': (r) => {
          if(r.status === 200){
            tokenData = { access_token: tokenClientResponse.json()["access_token"], exp: new Date().valueOf()}
            map_tokens.set(body["username"], tokenData)
            return true;
          }
          return false
        }
      })
    }

    if(tokenData && (new Date().valueOf() >= tokenData["exp"])){
      const parametrosPonto = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '.concat(tokenData["access_token"])
        },
        tags: {
          name: 'POST_PONTO',
        },
      }
      const pontoResponse = http.post(
        `${baseUrl}/ponto/create`,
        JSON.stringify({}),
        parametrosPonto,
      )
      check(pontoResponse, {
        'is status 200': (r) => {
          if(r.status === 200){
            return true;
          }
          return false
        }
      })
    }
    
  })
}

export function handleSummary(data) {
  return {
    "./result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
