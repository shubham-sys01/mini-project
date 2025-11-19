
//for iniating the session to get access token
// const myHeaders = new Headers();
// myHeaders.append("x-api-key", "key_live_fa7135b44e824b37a83a1a510128667c");
// myHeaders.append("x-api-secret", "secret_live_5843da57273945b994de3c37705d1f9c");
// myHeaders.append("x-api-version", "{{version}}");

// const requestOptions = {
//   method: "POST",
//   headers: myHeaders,
//   redirect: "follow"
// };

// const respone = await fetch("https://api.sandbox.co.in/authenticate", requestOptions)
// const data = await respone.json();
// // console.log(data);
// const token = data.access_token
// console.log(token)


//to login using digi locker
const myHeaders = new Headers();
myHeaders.append("Authorization", "eyJ0eXAiOiJKV1MiLCJhbGciOiJSU0FTU0FfUFNTX1NIQV81MTIiLCJraWQiOiIwYzYwMGUzMS01MDAwLTRkYTItYjM3YS01ODdkYTA0ZTk4NTEifQ.eyJyZWZyZXNoX3Rva2VuIjoiZXlKMGVYQWlPaUpLVjFNaUxDSmhiR2NpT2lKU1UwRlRVMEZmVUZOVFgxTklRVjgxTVRJaUxDSnJhV1FpT2lJd1l6WXdNR1V6TVMwMU1EQXdMVFJrWVRJdFlqTTNZUzAxT0Rka1lUQTBaVGs0TlRFaWZRLmV5SnpkV0lpT2lKclpYbGZiR2wyWlY5bVlUY3hNelZpTkRSbE9ESTBZak0zWVRnellURmhOVEV3TVRJNE5qWTNZeUlzSW1Gd2FWOXJaWGtpT2lKclpYbGZiR2wyWlY5bVlUY3hNelZpTkRSbE9ESTBZak0zWVRnellURmhOVEV3TVRJNE5qWTNZeUlzSW5kdmNtdHpjR0ZqWlY5cFpDSTZJakJrTVRVd1pXTmxMVFl3WVdNdE5EQmhaQzA0TWpJMExXVXlNRFE0T0RBeFl6RTFOQ0lzSW1GMVpDSTZJa0ZRU1NJc0ltbHVkR1Z1ZENJNklsSkZSbEpGVTBoZlZFOUxSVTRpTENKcGMzTWlPaUp3Y205a01TMWhjR2t1YzJGdVpHSnZlQzVqYnk1cGJpSXNJbVY0Y0NJNk1UYzVOVEE1TVRJek5Dd2lhV0YwSWpveE56WXpOVFUxTWpNMGZRLmNyYWhPYWROSXdkbUR2VUF5ckxVMHJSTFJJbF9QOUlGWkZGQTAwc1ZGbzU5eUhXeVljUHdrYzFEc1VjZ2lyRjNjbHhubUttbWFLRWEzUDZjQ3FLSzlNZkJ4VWtWckp0bVg1cFBuQ1pPYW1WaTNFTU5zUjdpU3pOd1hRckZRVldTazNHYXAzaVhVOV9XazdGRnNJU19RZk1uQ0RMUmM2MjloeFlEbUQ2cEF1WmtFaDFHREFQMzllQnpTeElrd1ZIWVEtWFg4bFlkZVVucFJ5b2UxUFhtTlNOLWtQUk51OExadS1ZbHV0X3ZFLVVpUl9ydTFXNV96RGFMdVJNQlhUaEZ2YXhKQzh5aUphaG9RNTRqQTJDV3RiNGI3YVROZGU5UlJ4d3BrbEFmUTJDUEJGVy1nVW84OG5ObnFYd1YtSEN2U0QwSF9XWXhXVlc1ZXRwWU40NnZXUSIsIndvcmtzcGFjZV9pZCI6IjBkMTUwZWNlLTYwYWMtNDBhZC04MjI0LWUyMDQ4ODAxYzE1NCIsInN1YiI6ImtleV9saXZlX2ZhNzEzNWI0NGU4MjRiMzdhODNhMWE1MTAxMjg2NjdjIiwiYXBpX2tleSI6ImtleV9saXZlX2ZhNzEzNWI0NGU4MjRiMzdhODNhMWE1MTAxMjg2NjdjIiwiYXVkIjoiQVBJIiwiaW50ZW50IjoiQUNDRVNTX1RPS0VOIiwiaXNzIjoicHJvZDEtYXBpLnNhbmRib3guY28uaW4iLCJpYXQiOjE3NjM1NTUyMzQsImV4cCI6MTc2MzY0MTYzNH0.D7t3_SRhxjJB54Rilcc3yKI-L2EnWRv-Wz2xXbGYqqVBcfSa6Pe-EW2YFEmUBHer0OFiN2YCnxs2vKcyAgRcg2uu1oioyEAaHaQFHDcUOTz0R8iBEfmdMSsYJ9sJfLU-7wRk4umuI_6W4uD3uC6gZGdXBo5KDnGl_PmNFWNHnaexCIeO5AP22bBloVOh7clBT3qThxdj_CjRm1pDjylNKXBvdiVolP2AtQUI2V0wE6EvucgbaIhJfQwA4JpGvjWQjksK5_x5-WgG4vlpQlR9VMBr1Otm7LmuUSo98UD665C--sgzrrqiXBUOE623mk-zEy_v7vw4VYkGKuii9Yhsbw");
myHeaders.append("x-api-key", "key_live_fa7135b44e824b37a83a1a510128667c");
myHeaders.append("x-api-version", "secret_live_5843da57273945b994de3c37705d1f9c");
myHeaders.append("Content-Type", "application/json");

const raw = "{\r\n    \"@entity\": \"in.co.sandbox.kyc.digilocker.session.request\",\r\n    \"flow\": \"signin\",\r\n    \"redirect_url\": \"https://developer.sandbox.co.in/\",\r\n    \"doc_types\": [\r\n        \"aadhaar\"\r\n    ],\r\n    \"options\": { \n        \"verification_method\": [ \n            \"aadhaar\"\r\n        ],\r\n        \"pinless\": true, \n        \"usernameless\": true, \n        \"verified_mobile\": \"9999999999\" \n    },\r\n\r\n}";

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

const data = await fetch("https://api.sandbox.co.in/kyc/digilocker/sessions/init", requestOptions)
const res = await data.json()
console.log(res.data.authorization_url)