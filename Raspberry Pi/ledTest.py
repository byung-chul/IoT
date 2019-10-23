import sys
import RPi.GPIO as gpio

sensor = 21

gpio.setmode(gpio.BCM)
gpio.setup(sensor, gpio.OUT)

try:
    on_flag = sys.argv[1].lower() == 'on'
    off_flag = sys.argv[1].lower() == 'off'

    if on_flag is True:
        gpio.output(sensor, True)
    elif off_flag is True:
        gpio.output(sensor, False)
    else:
        print ("on / off")
except:
    print ("on / off")

