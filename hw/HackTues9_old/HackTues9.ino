#include <Arduino.h>
#include <U8x8lib.h>

#define TIMEOUT 10
 
U8X8_SSD1306_128X64_NONAME_HW_I2C u8x8(U8X8_PIN_NONE);
 
static char recv_buf[512];
static bool is_exist = false;
static bool is_join = false;
static int led = 0;
 
static int at_send_check_response(char *p_ack, int timeout_ms, char *p_cmd, ...){
    int ch;
    int num = 0;
    int index = 0;
    int startMillis = 0;
    va_list args;
    memset(recv_buf, 0, sizeof(recv_buf));
    va_start(args, p_cmd);
    Serial1.printf(p_cmd, args);
    Serial.printf(p_cmd, args);
    va_end(args);
    delay(200);
    startMillis = millis();
 
    if (p_ack == NULL){
        return 0;
    }
 
    do{
        while (Serial1.available() > 0){
            ch = Serial1.read();
            recv_buf[index++] = ch;
            Serial.print((char)ch);
            delay(2);
        }
 
        if (strstr(recv_buf, p_ack) != NULL){
            return 1;
        }
 
    } while (millis() - startMillis < timeout_ms);
    return 0;
}
 
static void recv_prase(char *p_msg){
    if (p_msg == NULL){
        return;
    }
    
    char *p_start = NULL;
    int data = 0;
    int rssi = 0;
    int snr = 0;
 
    p_start = strstr(p_msg, "RX");
    if (p_start && (1 == sscanf(p_start, "RX: \"%d\"\r\n", &data))){
        Serial.println(data);
        u8x8.setCursor(2, 4);
        u8x8.print("led :");
        led = !!data;
        u8x8.print(led);
        if (led){
            digitalWrite(LED_BUILTIN, LOW);
        }
        else{
            digitalWrite(LED_BUILTIN, HIGH);
        }
    }
 
    p_start = strstr(p_msg, "RSSI");
    if (p_start && (1 == sscanf(p_start, "RSSI %d,", &rssi))){
        u8x8.setCursor(0, 6);
        u8x8.print("                ");
        u8x8.setCursor(2, 6);
        u8x8.print("rssi:");
        u8x8.print(rssi);
    }
    p_start = strstr(p_msg, "SNR");
    if (p_start && (1 == sscanf(p_start, "SNR %d", &snr))){
        u8x8.setCursor(0, 7);
        u8x8.print("                ");
        u8x8.setCursor(2, 7);
        u8x8.print("snr :");
        u8x8.print(snr);
    }
}

void set_device_info(){
    at_send_check_response("+ID: DevEui", 1000, "AT+ID=DevEui \"6081F9626C7019DE\"");
    at_send_check_response("+ID: AppEui", 1000, "AT+ID=AppEui \"6081F9882F5DC4D4\"");
    at_send_check_response("+KEY: APPKEY", 1000, "AT+KEY=APPKEY \"505D420C6E10CE1A049C522D6354178A\"");
}

 
void setup(void){
    u8x8.begin();
    u8x8.setFlipMode(1);
    u8x8.setFont(u8x8_font_chroma48medium8_r);
 
    Serial.begin(115200);
    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, HIGH);
 
    Serial1.begin(9600);
    Serial.print("E5 LORAWAN TEST\r\n");
    u8x8.setCursor(0, 0);
 
    if (at_send_check_response("+AT: OK", 1000, "AT\r\n")){
        is_exist = true;
        at_send_check_response("+ID: AppEui", 1000, "AT+ID\r\n");
        at_send_check_response("+MODE: LWOTAA", 1000, "AT+MODE=LWOTAA\r\n");
        at_send_check_response("+DR: EU868", 1000, "AT+DR=EU868\r\n");
        at_send_check_response("+CH: NUM", 1000, "AT+CH=NUM,0-2\r\n");
        at_send_check_response("+KEY: APPKEY", 1000, "AT+KEY=APPKEY,\"F9DECBB3FD5732B8198A76A96490695A\"\r\n");
        at_send_check_response("+CLASS: C", 1000, "AT+CLASS=A\r\n");
        at_send_check_response("+PORT: 8", 1000, "AT+PORT=8\r\n");
        delay(200);
        u8x8.setCursor(5, 0);
        u8x8.print("LoRaWAN");
        is_join = true;
    }else{
        is_exist = false;
        Serial.print("No E5 module found.\r\n");
        u8x8.setCursor(0, 1);
        u8x8.print("unfound E5 !");
    }

    set_device_info();
 
    u8x8.setCursor(0, 2);
    u8x8.setCursor(2, 2);
    u8x8.print("latitude:");
 
    u8x8.setCursor(2, 3);
    u8x8.print("longitude:");
 
    u8x8.setCursor(2, 4);
    u8x8.print("led :");
    u8x8.print(led);
}
 
void loop(void)
{
    int lat = 0;
    int lon = 0;
 
    lat = 42666519 + random(-200, 200);
    lon = 23375355 + random(-200, 200);
 
    Serial.print("Longitude: ");
    Serial.println(lon);
    Serial.print("Latitude: ");
    Serial.println(lat);
 
    u8x8.setCursor(0, 2);
    u8x8.print("      ");
    u8x8.setCursor(2, 2);
    u8x8.print("latitude:");
    u8x8.print(lat);
    u8x8.setCursor(2, 3);
    u8x8.print("longitude:");
    u8x8.print(lon);
 
    if (is_exist){
        int ret = 0;
        if (is_join){
            ret = at_send_check_response("+JOIN: Network joined", 20000, "AT+JOIN\r\n");
            if (ret){
                is_join = false;
            }else{
                at_send_check_response("+ID: AppEui", 1000, "AT+ID\r\n");
                Serial.print("JOIN failed!\r\n\r\n");
                delay(5000);
            }
        }else{
            char cmd[128];
            char temp[128];
//            sprintf(cmd, "AT+CMSGHEX=\"%04X%04X\"\r\n", lat, lon);
            sprintf(temp, "%d,%d", lat, lon);
            Serial.println(temp);
            sprintf(cmd, "AT+CMSG=\"%s\"", temp);
            ret = at_send_check_response("Done", 5000, cmd);
            if (ret){
                recv_prase(recv_buf);
            }else{
                Serial.print("Send failed!\r\n\r\n");
            }
            delay(5000);
        }
    }else{
        delay(1000);
    }
    delay(TIMEOUT*1000);
}