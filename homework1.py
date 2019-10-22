from threading import Thread, Lock
from queue import Queue
import spidev
import RPi.GPIO as gpio
import time

gpio.setmode(gpio.BCM)

control_pins = [6,13,19,26]

spi = spidev.SpiDev()
spi.open(0, 0)
spi.max_speed_hz = 1350000

lock=Lock()

for pin in control_pins:
    gpio.setup(pin, gpio.OUT)
    
def analog_read(channel):
    r = spi.xfer2([1, (8 + channel) << 4, 0])
    adc_out = ((r[1]&3) << 8) + r[2]
    return adc_out
    

step_seq = [
[1,0,0,0],
[1,1,0,0],
[0,1,0,0],
[0,1,1,0],
[0,0,1,0],
[0,0,1,1],
[0,0,0,1],
[1,0,0,1]
]

step_rev = [
[1,0,0,1],
[0,0,0,1],
[0,0,1,1],
[0,0,1,0],
[0,1,1,0],
[0,1,0,0],
[1,1,0,0],
[1,0,0,0]
]

def readLight(output_queue):
    message_adc = 0
    
    while True:        
        
       
        reading = analog_read(0)
        voltage = reading * 3.3 / 1024
        print('reading = %d voltage = %f\n' % (reading, voltage))

        
        if reading >= 200:
            message_adc = 0        
        else:
            message_adc = 1            
        
        
        output_queue.put(message_adc)        
        
    
        time.sleep(5)


def motor(input_queue):
    
    while True:
    
        message_motor = 0

        message_motor = input_queue.get()
        
        if message_motor == 1:
            for i in range(512):
                for half in range(8):       
                    for pin in range(4):
                        gpio.output(control_pins[pin], step_rev[half][pin])
                    time.sleep(0.001)
        else:
            for i in range(512):
                for half in range(8):       
                    for pin in range(4):
                        gpio.output(control_pins[pin], step_seq[half][pin])
                    time.sleep(0.001)
                    
        print("Rotate Done!\n")
        input_queue.task_done()
        
       
q = Queue()
t1 = Thread(target= readLight, args=(q,))
t2 = Thread(target= motor, args=(q,))
t1.start()
t2.start()


