from coapthon.server.coap import CoAP
from myExampleResources import AdvancedResource

class CoAPServer(CoAP):
    def __init__(self, host, port, multicast=False):
        CoAP.__init__(self, (host, port), multicast)
        self.add_resource('advanced/', AdvancedResource())

        print ("CoAP Server start on " + host + ":" + str(port))

def main():
    ip = "192.168.137.10"	#Raspberry Pi's ip
    port = 5683		#CoAP port number

    server = CoAPServer(ip, port)

    try:
        server.listen(1)
    except KeyboardInterrupt:
        print ("Server Shutdown")
        server.close()

if __name__ == "__main__":
    main()

