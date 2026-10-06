#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <LiquidCrystal_I2C.h>

const char* SSID = "Wokwi-GUEST"; // Altere se usar hardware real
const char* PASSWORD = "";
const char* MQTT_BROKER = "broker.hivemq.com";
const int MQTT_PORT = 1883;

#define DHTPIN 15
#define DHTTYPE DHT22
#define RELE_PIN 2

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastSend = 0;

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  if (String(topic) == "SMARTWEATHER/S1") {
    if (message == "ON") {
      digitalWrite(RELE_PIN, HIGH);
      lcd.setCursor(0, 1);
      lcd.print("Ar: LIGADO       ");
    } else if (message == "OFF") {
      digitalWrite(RELE_PIN, LOW);
      lcd.setCursor(0, 1);
      lcd.print("Ar: DESLIGADO    ");
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      client.subscribe("SMARTWEATHER/S1");
    } else {
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(RELE_PIN, OUTPUT);
  digitalWrite(RELE_PIN, LOW);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Conectando...");

  dht.begin();
  WiFi.begin(SSID, PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  if (millis() - lastSend > 5000) {
    lastSend = millis();

    float temp = dht.readTemperature();
    float umid = dht.readHumidity();

    if (!isnan(temp) && !isnan(umid)) {
      client.publish("SMARTWEATHER/TEMP", String(temp, 1).c_str());
      client.publish("SMARTWEATHER/UMID", String(umid, 1).c_str());

      lcd.setCursor(0, 0);
      lcd.print("T:" + String(temp, 1) + "C  U:" + String((int)umid) + "%   ");
    }
  }
}