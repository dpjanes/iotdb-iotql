# iotdb-iotql
IoTQL - an SQL-like language for the IoT

<img src="https://github.com/dpjanes/iotdb-homestar/blob/master/docs/HomeStar.png" align="right" />

# What is it?

IoTQL is an SQL-like language for the IoT. 
It allows you to query Things, change their state, and define actions to happen in the future.

There's a command line mode, for "just using it", and there's 

It's written to work with HomeStar / IOTDB but is flexible enough to plug into almost any projects that can present a simple Transporter API.

## Installations


## Command Line
### Connect to local IOTDB

Make sure you've [installed and set up HomeStar](https://homestar.io/about/install), and are in the proper folder.

	$ iotql 
	
### Connect to sample REST / MQTT server

	$ iotql http://homestar.io:20000/
	
### Connect to sample data set

IoTQL ships with a (very small) data set for testing

	$ iotql 
	>>> SELECT id, meta:name;

## Syntax / Examples

### Turn on everything

	SET state:on = true
	
### Sight lights to yellow

	SET state:color = "yellow" WHERE meta:facet & facets.lighting;
	
### Set the temperature in the basement - in Celsius

	SET state:temperature = 20°C WHERE zone & "Basement"

### What's the temperature - in Fahrenheit

	SELECT units(state:sensor.temperature, °F)
	
or (more flexible, but unwieldy)

	SELECT units(state:sensor.temperature,
	             units:temperature.imperial.fahrenheit)
	
		
## Semantics

## 


# Use

## Command Line

## Code

### Connect with IOTDB

    iotql = require('iotql')


## Running

This isn't quite finished yet, but you can do

    $ node RunSamples --all

The samples are in <code>samples</code>. The Things it
runs against are in <code>samples/things</code>. 
How that's structured should be fairly obvious.

## Notes

to compile the grammar, you need to do this

    $ jison grammar.jison


## More Documentation
See [IoTQL.pdf](https://github.com/dpjanes/iotdb-iotql/blob/master/docs/IoTQL.pdf)
See [IoTQL-CREATE.pdf](https://github.com/dpjanes/iotdb-iotql/blob/master/docs/IoTQL-CREATE.pdf)
