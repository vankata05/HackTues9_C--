let apiKey = "+4uIsSU6UVEod7Gc0PGT4fY8mawZZrJ6g+5ATGc8x+I"
let response = fetch('https://console.helium.com/api/v1/devices/1b870fc2-269b-4760-b038-9c924a585c19/events', {
    headers: {
        'key': apiKey
    }
})

console.log(response)