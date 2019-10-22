from coapthon.client.helperclient import HelperClient
import json
import base64
import random

host = "192.168.137.10"
port = 5683
path = "advanced"
payload = {"light": str(random.randint(0,40))}

client = HelperClient(server=(host, port))
print(payload)
put_response = client.put(path, payload=json.dumps(payload))
print(put_response.pretty_print())

get_response = client.get(path)
print("----------------- get.payload = " + get_response.payload + "-------------------")
print(get_response.pretty_print())

data = {}
with open('99b983892094b5c6d2fc3736e15da7d1.png'
          , mode='rb') as file:
    img = file.read()
data['img'] = base64.encodebytes(img).decode("utf-8")
img_put_response = client.put(path, payload=json.dumps(data))
print(img_put_response.pretty_print())
client.stop()