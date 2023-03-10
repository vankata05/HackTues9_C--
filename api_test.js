/*const axios = require('axios');

axios.get('https://api.helium.io/v1/devices/1b870fc2-269b-4760-b038-9c924a585c19/data', {
  headers: {
    'Key': '+4uIsSU6UVEod7Gc0PGT4fY8mawZZrJ6g+5ATGc8x+I'
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.log(error);
});
*/
fetch('https://console.helium.com/api/v1/devices/1b870fc2-269b-4760-b038-9c924a585c19/events', {
   headers: {
      'key': '+4uIsSU6UVEod7Gc0PGT4fY8mawZZrJ6g+5ATGc8x+I'
   }
})
   .then(response => response.text())
   .then(text => console.log(text))