# iotdb-iotql
IoTQL - an SQL-like language for the IoT

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" style="margin-left: 10px; "/>

# What is it?

IoTQL is an SQL-like language for the IoT. 
It allows you to query Things, change their state, and define actions to happen in the future.

It's written to work with HomeStar / IOTDB but is flexible enough to plug into almost any projects that can present a simple [Transporter API](https://github.com/dpjanes/iotdb-transport).

# Command Line Version

IoTQL can be used as a command line tool. 
It will connect to your local [IOTDB / HomeStar](https://homestar.io/about/install) installation, sample data, or to IOTDB instances running on the web.

## Installation

	$ npm install -g iotql
	$ sudo install -g iotql ## if the line above doesn't work
	
## Usage
### With Sample Data

IoTQL ships with a (very small) data set for testing

	$ iotql --samples
	>>> SELECT id, meta:name;

### With IOTDB / HomeStar

Make sure you've [installed and set up HomeStar](https://homestar.io/about/install), and are in the proper folder - usually your home directory. Then just do:

	$ iotql 
	
### With Connect to sample REST / MQTT server

_Not implemented yet_

	$ iotql http://homestar.io:20000/
	
# Library Version

## Installation
To embed IoTQL in your projects, do:

	$ npm install iotql

## Usage

See the [docs](./docs) folder for more documentation. There's also a ton of examples in [samples](./samples).

### In Node.JS
Here's how you use IoTQL in your project

	var iotql = require('iotql')
	var paramd = {};
	iotql.connect(paramd, function(error, db) {
		
	);
	
### With Transporter

_Not implemented yet_

	var transporter = ...;
	transport.list({
		query: "state:sensor.temperature°C > 25",
	}, function(d) {
		if (d.query) {
		}
	});
	
Transporters do not need to support queries. 
Transporters that _do_ support query will always set <code>d.query</code>
to <code>true</code> when a <code>query</code> statement is used.

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
