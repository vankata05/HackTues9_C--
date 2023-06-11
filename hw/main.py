from machine import UART, Pin
from micropyGPS import MicropyGPS
#from pyb import SoftloraSerial
import micropython
import utime

micropython.alloc_emergency_exception_buf(100)
gps = MicropyGPS()

gpsSerial = UART(0, baudrate=9600, rx=Pin(17))
loraSerial = UART(1, baudrate=9600)
#loraSerial = loraSerial(id=0, bits = 8, parity=None, tx=Pin(7), rx=Pin(6), baudrate=9600);

joined = -1
loraSerialtimeout = 10
lat = "0"
lng = "0"

blue = Pin(9, Pin.OUT, Pin.PULL_DOWN, value=1)
green = Pin(10, Pin.OUT, Pin.PULL_DOWN, value=0)
red = Pin(11, Pin.OUT, Pin.PULL_DOWN, value=0)


# Function to send AT command, wait for response, and check against expected output
def send_AT_check(expected_output, command, delay):
    print(command)
    loraSerial.write(command + "\r\n")
    utime.sleep(delay) # Wait for response
    response = ""
    while loraSerial.any():
        response += loraSerial.read(1).decode('utf-8', 'ignore')
    response = response.strip()
    print(response)
    if expected_output not in response:
        return -1 # Return -1 if expected output is not contained in actual output
    return response


# Function to send AT command and wait for response
def send_AT_command(command):
    print(command)
    loraSerial.write(command + "\r\n")
    utime.sleep(0.5) # Wait for response
    response = ""
    while loraSerial.any():
        response += loraSerial.read(1).decode('utf-8')
    print(response)
    return response


# Fucntion to set device keys for the network
def set_device_info():
    send_AT_command("AT+ID=DevEui \"6081F9626C7019DE\"")
    send_AT_command("AT+ID=AppEui \"6081F9882F5DC4D4\"")
    send_AT_command("AT+KEY=APPKEY \"505D420C6E10CE1A049C522D6354178A\"")

# Function to initialize the connection to the nework and apply settings
def init_transmition():
    if send_AT_check("+ID: AppEui", "AT+ID", 0.5) == -1:
        blue.on()
        green.on()
        red.off()
        raise Exception("Error checking AppEui")
    if send_AT_check("+MODE: LWOTAA", "AT+MODE=LWOTAA", 0.5) == -1:
        blue.on()
        green.on()
        red.off()
        raise Exception("Error setting mode")
    if send_AT_check("+DR: EU868", "AT+DR=EU868", 0.5) == -1:
        blue.on()
        green.on()
        red.off()
        raise Exception("Error setting frequency")
    if send_AT_check("+CH: NUM", "AT+CH=NUM,0-2", 0.5) == -1:
        blue.on()
        green.on()
        red.off()
        raise Exception("Error settihg channel")
    if send_AT_check("+CLASS: A", "AT+CLASS=A", 0.5) == -1:
        blue.on()
        green.on()
        red.off()
        raise Exception("Error setting class")
    if send_AT_check("+PORT: 8", "AT+PORT=8", 0.5) == -1:
        blue.on()
        green.on()
        red.off()
        raise Exception("Error setting port")

utime.sleep(1);
if send_AT_check("+AT: OK", "AT", 0.5) != -1:
    set_device_info()
    init_transmition()
else:
    if send_AT_check("+AT: OK", "AT", 2) != -1:
        set_device_info()
        init_transmition()
    else:
        blue.on()
        green.on()
        red.off()
        raise Exception("!!Hardware not communicating!!\nCheck E5 module")
    
while(joined == -1):
    blue.off()
    green.on()
    red.on()
    joined = send_AT_check("+JOIN: Network joined", "AT+JOIN", 10)

blue.on()
green.off()
red.on()
utime.sleep(1);
blue.on()
green.on()
red.on()

while True:
    utime.sleep(0.2)
    while gpsSerial.any():
        sentence = gpsSerial.readline()
        for x in sentence:
            gps.update(chr(x))
        if gps.clean_sentences > 20:
            print("Latitude= ", gps.latitude_string())
            lat = gps._latitude[0] + (gps._latitude[1] / 60.0)
            if gps._latitude[2] == 'S':
                lat = -lat
            print("Longitude= ", gps.longitude_string())
            lng = gps._longitude[0] + (gps._longitude[1] / 60.0)
            if gps._longitude[2] == 'E':
                lng = -lng

            print("Altitude= ", gps.altitude)
    
    if lat != "0" and lng != 0:
        send_AT_command("AT+CMSG=\"" + str(lat) + "," + str(lng) + "\"")
    utime.sleep(loraSerialtimeout)
    
    
