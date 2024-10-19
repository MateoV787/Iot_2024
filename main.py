from time import sleep_ms
import network
from mqtt import MQTTClient
from machine import Pin
import time
import json
import random
import dht
from machine import reset
import ssl
   
d = dht.DHT22(Pin(2))
led=Pin(4,Pin.OUT)


def sub_cb(topic, msg): 
    jsonobject=json.loads(msg)
    print(jsonobject["bulb"])
    if jsonobject["bulb"]=="ON":
       led.value(1)
    elif jsonobject["bulb"]=="OFF":
        led.value(0)
        
with open("certs/cert", 'rb') as f:
    certf = f.read()
with open("certs/privkey", 'rb') as f:
    keyf = f.read()

server="a1ztq6e5d2o4a0-ats.iot.us-east-1.amazonaws.com"
client = MQTTClient(client_id="Mateo_dth", server=server, port=8883, ssl=True, ssl_params={"cert":certf, "key":keyf})
 
client.set_callback(sub_cb) 
client.connect()
client.subscribe(topic="esp32/sub")

counter=0;
T=10
Tsend=5000

while True:
  try:  
 
    if counter==0:
        d.measure()
        temp=d.temperature()
        hum=d.humidity()
        print('Temperature %d ' %temp,' Humidity %d ' %hum)    
        print("Sending sensor data") 
        client.publish(topic="esp32/mateo", msg=json.dumps({"temp": int(temp),"hum": int(hum)}))   
        
        
    counter=(counter+1)%(Tsend/T);
    client.check_msg();
    sleep_ms(T)
  except OSError as e:
    print('Failed to read sensor.')
    reset()

